import os
import pickle
import asyncio
from pathlib import Path
from typing import Any, Optional
import numpy as np

from src.config.logging import get_logger
from src.config.settings import settings

logger = get_logger("chatbot_service")

BASE_DIR = Path(__file__).resolve().parents[2]
INDEX_PATH = BASE_DIR / "ml" / "chatbot" / "scheme.index"
DOCS_PATH = BASE_DIR / "ml" / "chatbot" / "documents.pkl"


class ChatbotService:
    _instance: Optional["ChatbotService"] = None

    def __init__(self):
        self.embedder = None
        self.index = None
        self.documents: list[dict] = []
        self._genai_client = None
        self._is_initialized = False

    @classmethod
    def get_instance(cls) -> "ChatbotService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _ensure_initialized(self):
        if self._is_initialized:
            return

        logger.info("initializing_chatbot_resources")
        try:
            import faiss
            from sentence_transformers import SentenceTransformer

            if not INDEX_PATH.exists():
                raise FileNotFoundError(f"FAISS index not found at {INDEX_PATH}")
            if not DOCS_PATH.exists():
                raise FileNotFoundError(f"Documents pickle not found at {DOCS_PATH}")

            self.index = faiss.read_index(str(INDEX_PATH))
            with open(DOCS_PATH, "rb") as f:
                self.documents = pickle.load(f)

            self.embedder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
            logger.info("chatbot_resources_initialized", total_schemes=len(self.documents))
        except Exception as e:
            logger.error("chatbot_initialization_failed", error=str(e))
            raise

        self._init_genai_client()
        self._is_initialized = True

    def _init_genai_client(self):
        api_key = (
            settings.CHATBOT_API_KEY
            or settings.GEMINI_API_KEY
            or os.getenv("CHATBOT_API_KEY")
            or os.getenv("GEMINI_API_KEY")
            or settings.AI_PROVIDER_API_KEY
        )

        # Gemini API keys must start with 'AIzaSy' to be valid Google API keys
        if api_key and isinstance(api_key, str) and api_key.strip().startswith("AIzaSy"):
            try:
                from google import genai
                self._genai_client = genai.Client(api_key=api_key.strip())
                logger.info("gemini_client_ready")
            except Exception as e:
                logger.warning("gemini_init_failed", error=str(e))
                self._genai_client = None
        else:
            if api_key:
                logger.info("gemini_key_invalid_format_using_local_rag", key_prefix=str(api_key)[:6])
            self._genai_client = None

    def search(self, query: str, top_k: int = 4) -> list[dict]:
        """Performs FAISS vector search across government scheme documents (CPU synchronous)."""
        self._ensure_initialized()
        if not query or not query.strip():
            return []

        embedding = self.embedder.encode([query]).astype("float32")
        distances, indices = self.index.search(embedding, top_k)

        results = []
        for idx in indices[0]:
            if 0 <= idx < len(self.documents):
                results.append(self.documents[idx])

        return results

    async def search_async(self, query: str, top_k: int = 4) -> list[dict]:
        """Non-blocking async wrapper for FAISS search."""
        return await asyncio.to_thread(self.search, query, top_k)

    def _format_scheme_context(self, doc: dict) -> str:
        return f"""
Scheme Name: {doc.get('scheme_name', 'N/A')}
Level: {doc.get('level', 'Central/State')}
Description: {doc.get('description', '')}
Benefits: {doc.get('benefits', '')}
Eligibility: {doc.get('eligibility', '')}
Required Documents: {doc.get('documents', '')}
Application Process: {doc.get('application_process', '')}
Official Website: {doc.get('official_url', '')}
--------------------------------------------------
"""

    def _fallback_summary(self, query: str, docs: list[dict]) -> str:
        """Generates a structured, helpful scheme response when an LLM key is not configured."""
        if not docs:
            return (
                "I couldn't find specific government schemes matching your search. "
                "You can try searching for terms like 'tailoring', 'agriculture loan', "
                "'women entrepreneurship', or 'MSME subsidy'."
            )

        top = docs[0]
        s_name = top.get('scheme_name', 'Government Scheme')
        benefits = top.get('benefits', 'Financial assistance and subsidy')
        eligibility = top.get('eligibility', 'Check official guidelines')
        documents = top.get('documents', 'Aadhaar card, Bank passbook, Passport size photo')
        app_proc = top.get('application_process', 'Apply online at official portal')
        url = top.get('official_url', 'https://www.myscheme.gov.in')

        other_schemes = [d.get('scheme_name') for d in docs[1:4] if d.get('scheme_name')]
        other_list_str = ""
        if other_schemes:
            other_list_str = "\n\n**Other Matching Schemes:**\n" + "\n".join(f"- {name}" for name in other_schemes)

        return (
            f"Here is the most relevant scheme for **\"{query}\"**:\n\n"
            f"### {s_name}\n"
            f"- **Benefits:** {benefits}\n"
            f"- **Eligibility:** {eligibility}\n"
            f"- **Required Documents:** {documents}\n"
            f"- **How to Apply:** {app_proc}\n"
            f"- **Official Link:** [{s_name}]({url})\n"
            f"{other_list_str}\n\n"
            f"Would you like more details on how to apply or what documents to prepare?"
        )

    async def chat(
        self,
        message: str,
        history: list[dict[str, Any]] = [],
        phone_number: Optional[str] = None,
    ) -> dict[str, Any]:
        """Main non-blocking RAG pipeline: vector search + Gemini generation."""
        await asyncio.to_thread(self._ensure_initialized)

        retrieved_docs = await self.search_async(message, top_k=4)
        schemes_context = "\n".join(self._format_scheme_context(d) for d in retrieved_docs)

        # Try generating response with Gemini if client is ready
        if self._genai_client:
            history_context = ""
            for turn in history[-4:]:
                r = turn.get("role", "user")
                c = turn.get("content", "")
                history_context += f"{r.capitalize()}: {c}\n"

            system_instruction = (
                "You are SchemeSathi AI, an expert Indian Government Welfare Schemes Assistant. "
                "Your mission is to help Indian citizens discover, understand, and apply for government schemes. "
                "Use the provided official scheme information as your primary ground truth.\n"
                "Formatting Guidelines:\n"
                "- Keep explanations clear, empathetic, and structured with bullet points.\n"
                "- Highlight key benefits, who is eligible, and documents required.\n"
                "- Provide official application instructions and portal URLs.\n"
                "- If comparing multiple schemes, clearly contrast their targets and benefits."
            )

            prompt = f"""{system_instruction}

OFFICIAL GOVERNMENT SCHEMES DATA:
{schemes_context}

RECENT CONVERSATION HISTORY:
{history_context}

CITIZEN QUESTION:
{message}

Please provide a helpful, accurate, and easy-to-understand response for the citizen:"""

            models_to_try = [settings.CHATBOT_MODEL, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
            for model_name in models_to_try:
                try:
                    def _call_gemini():
                        return self._genai_client.models.generate_content(
                            model=model_name,
                            contents=prompt
                        )
                    response = await asyncio.to_thread(_call_gemini)
                    if response and response.text:
                        return {
                            "reply": response.text.strip(),
                            "retrieved_schemes": retrieved_docs
                        }
                except Exception as ex:
                    logger.warning("gemini_generation_attempt_failed", model=model_name, error=str(ex))
                    continue

        # Fallback if Gemini not available or calls failed
        reply = self._fallback_summary(message, retrieved_docs)
        return {
            "reply": reply,
            "retrieved_schemes": retrieved_docs
        }


chatbot_service = ChatbotService.get_instance()

