"""
chatbot_service.py

High-performance RAG Scheme Chatbot Service for SchemeSathi.
Leverages documents.pkl (653 government welfare schemes) with semantic & TF-IDF
retrieval, contextual answer synthesis via Gemini / OpenAI, and reliable offline fallback.
"""

import os
import pickle
import re
import csv
from typing import Any, List, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

import logging
logger = logging.getLogger("chatbot_service")

try:
    from src.config.settings import settings
except ImportError:
    class DummySettings:
        AI_PROVIDER_API_KEY = ""
    settings = DummySettings()

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DOCS_PATH = os.path.join(CURRENT_DIR, "documents.pkl")
INDEX_PATH = os.path.join(CURRENT_DIR, "scheme.index")
CSV_PATH = os.path.join(CURRENT_DIR, "myscheme.csv")

CATEGORY_TERMS = {
    "Business Loans": ("business", "entrepreneur", "loan", "credit"),
    "MSME & Industries": ("msme", "industry", "industries"),
    "Startup & Innovation": ("startup", "innovation", "science", "technology"),
    "Education & Skills": ("education", "skill", "training", "scholarship"),
    "Women Entrepreneurs": ("women", "woman", "mahila"),
    "Agriculture & Rural Business": ("agriculture", "farmer", "rural", "environment"),
    "Employment & Livelihood": ("employment", "livelihood", "self employment", "jobs"),
    "Housing & Infrastructure": ("housing", "infrastructure", "transport", "sanitation"),
    "Social Welfare": ("social welfare", "social justice", "empowerment", "welfare"),
    "Financial Assistance": ("financial", "banking", "insurance", "subsidy", "grant"),
    "Digital & Technology": ("digital", "technology", "it & communications", "electronics"),
    "Health & Insurance": ("health", "medical", "insurance"),
}


def _clean_text(text: Any) -> str:
    """Cleans up raw dataset artifacts, encoding quirks, smart quotes, and unneeded formatting."""
    if not text:
        return ""
    s = str(text)
    
    # Common character encoding replacements
    replacements = {
        "\x82": "'",
        "\x91": "'",
        "\x92": "'",
        "\x93": '"',
        "\x94": '"',
        "\xa0": " ",
        "â€™": "'",
        "â€œ": '"',
        "â€\x9d": '"',
        "â€“": "-",
        "â€”": "-",
        "???": "",
    }
    for old, new in replacements.items():
        s = s.replace(old, new)

    # Strip enclosing quotes from scheme titles
    s = s.strip()
    if (s.startswith('"') and s.endswith('"')) or (s.startswith("'") and s.endswith("'")):
        s = s[1:-1].strip()

    # Normalize whitespace
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s.strip()


def _format_bullet_points(text: str) -> str:
    """Converts continuous text or semicolon-separated lists into clean markdown bullet points."""
    cleaned = _clean_text(text)
    if not cleaned:
        return "Information available on the official portal."

    # If it already contains markdown bullets or line breaks, return as is
    if "\n-" in cleaned or "\n*" in cleaned or "\n1." in cleaned:
        return cleaned

    # Split by semicolons or numbered steps if present
    items = [item.strip() for item in re.split(r";|\bStep \d+:", cleaned) if item.strip()]
    if len(items) > 1:
        return "\n".join([f"- {item}" for item in items if len(item) > 2])

    # Split by period for long multi-sentence paragraphs
    sentences = [s.strip() for s in re.split(r"\.(?=\s+[A-Z])", cleaned) if len(s.strip()) > 10]
    if len(sentences) > 2:
        return "\n".join([f"- {sentence}." if not sentence.endswith(".") else f"- {sentence}" for sentence in sentences])

    return cleaned


class SchemeChatbotService:
    def __init__(self):
        self.documents: List[dict] = []
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.tfidf_matrix = None
        self._load_database()

    def _load_database(self):
        try:
            if os.path.exists(DOCS_PATH):
                with open(DOCS_PATH, "rb") as f:
                    raw_docs = pickle.load(f)
                    for d in raw_docs:
                        self.documents.append({
                            "scheme_name": _clean_text(d.get("scheme_name", "")),
                            "level": _clean_text(d.get("level", "Central / State")),
                            "description": _clean_text(d.get("description", "")),
                            "benefits": _clean_text(d.get("benefits", "")),
                            "eligibility": _clean_text(d.get("eligibility", "")),
                            "application_process": _clean_text(d.get("application_process", "")),
                            "documents": _clean_text(d.get("documents", "")),
                            "tags": _clean_text(d.get("tags", "")),
                            "official_url": _clean_text(d.get("official_url", "")),
                        })
                logger.info("chatbot_database_loaded", count=len(self.documents))
            elif os.path.exists(CSV_PATH):
                import pandas as pd
                df = pd.read_csv(CSV_PATH, encoding="latin1").fillna("").astype(str)
                for _, row in df.iterrows():
                    self.documents.append({
                        "scheme_name": _clean_text(row.get("scheme_name", "")),
                        "level": _clean_text(row.get("level", "Central / State")),
                        "description": _clean_text(row.get("description", "")),
                        "benefits": _clean_text(row.get("benefits", "")),
                        "eligibility": _clean_text(row.get("eligibility", "")),
                        "application_process": _clean_text(row.get("application_process", "")),
                        "documents": _clean_text(row.get("documents", "")),
                        "tags": _clean_text(row.get("tags", "")),
                        "official_url": _clean_text(row.get("official_url", "")),
                    })
                logger.info("chatbot_csv_loaded", count=len(self.documents))

            if self.documents:
                corpus = []
                for doc in self.documents:
                    text = f"{doc.get('scheme_name', '')} {doc.get('tags', '')} {doc.get('description', '')} {doc.get('benefits', '')} {doc.get('eligibility', '')}"
                    corpus.append(text)
                
                self.vectorizer = TfidfVectorizer(
                    stop_words="english",
                    ngram_range=(1, 2),
                    max_features=15000
                )
                self.tfidf_matrix = self.vectorizer.fit_transform(corpus)
                logger.info("chatbot_vectorizer_ready")
        except Exception as e:
            logger.error("chatbot_init_failed", error=str(e))

    def category_counts(self) -> dict[str, int]:
        counts = {category: 0 for category in CATEGORY_TERMS}

        with open(CSV_PATH, newline="", encoding="latin1") as csv_file:
            for row in csv.DictReader(csv_file):
                searchable_text = self._category_search_text(row)
                for category, terms in CATEGORY_TERMS.items():
                    if any(term in searchable_text for term in terms):
                        counts[category] += 1

        return counts

    def total_scheme_count(self) -> int:
        with open(CSV_PATH, newline="", encoding="latin1") as csv_file:
            return sum(1 for _ in csv.DictReader(csv_file))

    def dataset_completeness(self) -> float:
        required_fields = (
            "scheme_name",
            "description",
            "benefits",
            "eligibility",
            "application_process",
            "documents",
            "official_url",
        )
        populated_fields = 0
        total_fields = 0

        with open(CSV_PATH, newline="", encoding="latin1") as csv_file:
            for row in csv.DictReader(csv_file):
                for field in required_fields:
                    total_fields += 1
                    if str(row.get(field, "")).strip():
                        populated_fields += 1

        if total_fields == 0:
            return 0.0
        return round((populated_fields / total_fields) * 100, 2)

    @staticmethod
    def _category_search_text(row: dict[str, str]) -> str:
        return " ".join(
            row.get(field, "") for field in ("schemeCategory", "tags", "scheme_name")
        ).lower()

    def category_schemes(self, category: str) -> list[dict[str, str]]:
        terms = CATEGORY_TERMS.get(category)
        if not terms:
            return []

        schemes = []
        with open(CSV_PATH, newline="", encoding="latin1") as csv_file:
            for row in csv.DictReader(csv_file):
                if any(term in self._category_search_text(row) for term in terms):
                    schemes.append({
                        "scheme_name": _clean_text(row.get("scheme_name", "")),
                        "description": _clean_text(row.get("description", "")),
                        "benefits": _clean_text(row.get("benefits", "")),
                        "eligibility": _clean_text(row.get("eligibility", "")),
                        "documents": _clean_text(row.get("documents", "")),
                        "application_process": _clean_text(row.get("application_process", "")),
                        "official_url": _clean_text(row.get("official_url", "")),
                        "level": _clean_text(row.get("level", "")),
                    })
        return schemes

    def search_schemes(self, query: str, top_k: int = 4, user_profile: Optional[dict] = None) -> List[dict]:
        if not self.documents or self.vectorizer is None or self.tfidf_matrix is None:
            return []

        clean_query = query.strip()
        if not clean_query:
            return []

        # Expand search query with semantic synonyms
        search_terms = [clean_query]
        q_lower = clean_query.lower()

        if any(w in q_lower for w in ["women", "female", "girl", "lady", "mahila"]):
            search_terms.append("women female mahila gender")
        if any(w in q_lower for w in ["loan", "credit", "money", "finance", "subsidy", "capital"]):
            search_terms.append("loan subsidy credit financial assistance bank collateral")
        if any(w in q_lower for w in ["farmer", "agriculture", "kisan", "crop", "dairy", "farm"]):
            search_terms.append("agriculture farmer kisan crop farming rural")
        if any(w in q_lower for w in ["artisan", "tailor", "weaver", "craftsman", "vishwakarma", "handicraft"]):
            search_terms.append("artisan craftsman micro business self employed skill")
        if any(w in q_lower for w in ["student", "scholarship", "education", "study", "college"]):
            search_terms.append("scholarship education student study training")

        if user_profile:
            profile_str = " ".join([str(v) for k, v in user_profile.items() if v and isinstance(v, (str, int, float))])
            if profile_str:
                search_terms.append(profile_str)

        combined_query = " ".join(search_terms)

        try:
            q_vec = self.vectorizer.transform([combined_query])
            similarities = cosine_similarity(q_vec, self.tfidf_matrix)[0]

            # Boost exact keyword matches in scheme names and tags
            query_tokens = [t for t in re.split(r"\W+", q_lower) if len(t) > 2]

            for i, doc in enumerate(self.documents):
                name_lower = str(doc.get("scheme_name", "")).lower()
                tags_lower = str(doc.get("tags", "")).lower()
                desc_lower = str(doc.get("description", "")).lower()
                
                # Title match boost
                for tok in query_tokens:
                    if tok in name_lower:
                        similarities[i] += 0.35
                    elif tok in tags_lower:
                        similarities[i] += 0.15
                    elif tok in desc_lower:
                        similarities[i] += 0.05

                # Profile relevance boost if available
                if user_profile:
                    state = str(user_profile.get("state") or "").lower()
                    occupation = str(user_profile.get("occupation") or user_profile.get("business_type") or "").lower()
                    gender = str(user_profile.get("gender") or "").lower()

                    if state and (state in name_lower or state in tags_lower):
                        similarities[i] += 0.1
                    if occupation and (occupation in name_lower or occupation in tags_lower or occupation in desc_lower):
                        similarities[i] += 0.2
                    if gender == "female" and ("women" in name_lower or "female" in name_lower or "mahila" in tags_lower):
                        similarities[i] += 0.2

            top_indices = np.argsort(similarities)[::-1][:top_k]
            results = []
            for idx in top_indices:
                if similarities[idx] > 0.02 or len(results) == 0:
                    item = dict(self.documents[idx])
                    item["relevance_score"] = float(similarities[idx])
                    results.append(item)
            return results
        except Exception as e:
            logger.error("chatbot_search_failed", error=str(e))
            return []

    def format_scheme_context(self, docs: List[dict]) -> str:
        blocks = []
        for i, doc in enumerate(docs, 1):
            block = (
                f"### Scheme {i}: {doc.get('scheme_name', 'Unnamed Scheme')}\n"
                f"- **Level / Authority**: {doc.get('level', 'Central / State')}\n"
                f"- **Description**: {doc.get('description', '')}\n"
                f"- **Benefits**: {doc.get('benefits', '')}\n"
                f"- **Eligibility**: {doc.get('eligibility', '')}\n"
                f"- **Required Documents**: {doc.get('documents', '')}\n"
                f"- **Application Process**: {doc.get('application_process', '')}\n"
                f"- **Official Link**: {doc.get('official_url', '')}\n"
            )
            blocks.append(block)
        return "\n\n".join(blocks)

    def _handle_conversational_query(self, query: str, user_profile: Optional[dict] = None) -> Optional[dict]:
        """Detects greetings, thank-yous, and general help requests to respond conversationally."""
        q = query.strip().lower()

        # Greetings
        if q in ["hi", "hello", "hey", "namaste", "good morning", "good afternoon", "good evening", "greetings"]:
            profile_note = ""
            if user_profile and (user_profile.get("state") or user_profile.get("occupation")):
                occ = user_profile.get("occupation") or user_profile.get("business_type") or "beneficiary"
                st = user_profile.get("state") or "India"
                profile_note = f"\n\nI see your active profile: **{occ}** in **{st}**. Feel free to ask what schemes fit you!"

            reply = (
                "Namaste! 🙏 I am your **SchemeSathi AI Assistant**, here to help you discover and apply for Indian Government welfare schemes, micro-loans, and subsidies."
                f"{profile_note}\n\n"
                "**Here are a few things you can ask me:**\n"
                "- *\"What schemes are available for women entrepreneurs?\"*\n"
                "- *\"Tell me about PMEGP loan subsidy and eligibility\"*\n"
                "- *\"How do I apply for PM MUDRA Yojana?\"*\n"
                "- *\"What documents do I need for Stand-Up India?\"*\n\n"
                "How can I assist you today?"
            )
            return {"reply": reply, "schemes": []}

        # Thanks
        if any(w in q for w in ["thank you", "thanks", "dhanyawad", "thank u", "many thanks"]):
            reply = (
                "You're very welcome! 😊 I'm always here to help you navigate government schemes and benefits.\n\n"
                "If you need details on any other scheme or application process, just ask anytime!"
            )
            return {"reply": reply, "schemes": []}

        # Who are you / Capabilities
        if any(ph in q for ph in ["who are you", "what can you do", "what is schemesathi", "help me"]):
            reply = (
                "I am **SchemeSathi AI Assistant** — an intelligent welfare discovery guide backed by an AI matching model and a database of over **650+ Indian Government welfare schemes**.\n\n"
                "**I can help you with:**\n"
                "1. **Scheme Eligibility**: Checking age, income, category, and state criteria.\n"
                "2. **Subsidies & Loans**: Breakdown of margin money, interest subsidies, and credit limits.\n"
                "3. **Document Checklists**: Exact list of certificates and identity proofs required.\n"
                "4. **Step-by-Step Application**: Direct links and guidance for applying online or at CSC centers.\n\n"
                "What scheme or topic would you like to explore?"
            )
            return {"reply": reply, "schemes": []}

        # Personal profile eligibility check
        if any(ph in q for ph in ["what schemes am i eligible for", "find schemes for me", "my schemes", "schemes for me", "best schemes for me"]):
            if user_profile and (user_profile.get("age") or user_profile.get("occupation") or user_profile.get("state")):
                matched = self.search_schemes("welfare scheme loan subsidy", top_k=4, user_profile=user_profile)
                reply = (
                    "Based on your profile details:\n"
                    f"- **State**: {user_profile.get('state') or 'All India'}\n"
                    f"- **Occupation/Activity**: {user_profile.get('occupation') or user_profile.get('business_type') or 'General'}\n"
                    f"- **Category**: {user_profile.get('social_category') or 'General'}\n"
                    f"- **Gender**: {user_profile.get('gender') or 'All'}\n\n"
                    "Here are top government schemes matched to your profile:"
                )
                return {"reply": reply, "schemes": matched}
            else:
                reply = (
                    "To show schemes tailored specifically to you, please complete your profile wizard first, or tell me details like your **state**, **occupation**, **age**, **gender**, and **income**!"
                )
                return {"reply": reply, "schemes": []}

        return None

    def _local_synthesis(self, query: str, docs: List[dict], user_profile: Optional[dict] = None) -> str:
        """Fallback natural language generator producing clean, beautifully formatted markdown answers."""
        if not docs:
            return (
                "I couldn't find a specific government scheme matching your query in our database. "
                "Try asking with different keywords, such as **PMEGP loan**, **MUDRA Yojana**, "
                "**women entrepreneur schemes**, or **farmer subsidies**!"
            )

        top = docs[0]
        name = top.get("scheme_name", "Government Welfare Scheme")
        level = top.get("level", "Central / State")
        description = top.get("description", "")
        benefits = top.get("benefits", "")
        eligibility = top.get("eligibility", "")
        app_process = top.get("application_process", "")
        documents = top.get("documents", "")
        official_url = top.get("official_url", "")

        reply_parts = []
        reply_parts.append(f"## 🏛️ {name}")
        reply_parts.append(f"**Authority Level**: {level}\n")

        if description:
            reply_parts.append(f"### 📌 Overview\n{description}\n")

        if benefits:
            reply_parts.append(f"### 💰 Benefits & Support\n{_format_bullet_points(benefits)}\n")

        if eligibility:
            reply_parts.append(f"### 🎯 Eligibility Criteria\n{_format_bullet_points(eligibility)}\n")

        if documents:
            reply_parts.append(f"### 📋 Required Documents\n{_format_bullet_points(documents)}\n")

        if app_process:
            reply_parts.append(f"### 📲 How to Apply\n{_format_bullet_points(app_process)}\n")

        if official_url and official_url.startswith("http"):
            reply_parts.append(f"**🔗 Official Website / Application Link**:\n[{official_url}]({official_url})\n")

        if len(docs) > 1:
            reply_parts.append("---\n\n### 💡 Other Related Schemes:")
            for other in docs[1:]:
                other_name = other.get("scheme_name", "")
                other_benefit = _clean_text(other.get("benefits", ""))[:130]
                reply_parts.append(f"- **{other_name}**: {other_benefit}...")

        return "\n".join(reply_parts)

    async def answer_question(
        self,
        query: str,
        history: Optional[List[dict]] = None,
        user_profile: Optional[dict] = None
    ) -> dict:
        # Check conversational intents first
        conv_res = self._handle_conversational_query(query, user_profile)
        if conv_res is not None:
            return conv_res

        # Search matching schemes
        matched_docs = self.search_schemes(query, top_k=4, user_profile=user_profile)
        context = self.format_scheme_context(matched_docs)

        # 1. Try Gemini if CHATBOT_API_KEY or GEMINI_API_KEY is configured
        gemini_key = os.getenv("CHATBOT_API_KEY") or os.getenv("GEMINI_API_KEY")
        if gemini_key:
            try:
                from google import genai
                client = genai.Client(api_key=gemini_key)

                profile_info = ""
                if user_profile:
                    profile_info = f"Citizen Profile Context: {user_profile}\n"

                prompt = (
                    "You are SchemeSathi AI Assistant, an expert advisor on Indian Government welfare schemes. "
                    "Provide a warm, highly informative, clear, and well-structured response in markdown using the retrieved scheme context below. "
                    "Structure your answer with subheadings (### Benefits, ### Eligibility, ### Required Documents, ### How to Apply), "
                    "bullet points, bold highlights, and direct official URLs.\n\n"
                    f"{profile_info}"
                    f"Retrieved Schemes Information:\n{context}\n\n"
                    f"Citizen's Question: {query}"
                )
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                if response and response.text:
                    return {"reply": _clean_text(response.text), "schemes": matched_docs}
            except Exception as e:
                logger.warning("gemini_generation_failed", error=str(e))

        # 2. Try OpenAI / ai_client if configured
        if settings.AI_PROVIDER_API_KEY:
            try:
                from src.integrations import ai_client
                messages = [
                    {
                        "role": "system",
                        "content": (
                            "You are SchemeSathi AI Assistant, an expert advisor on Indian Government welfare schemes. "
                            "Answer citizens clearly and accurately using the provided scheme context. Format with clean markdown headers and bullet points."
                        ),
                    },
                    {
                        "role": "user",
                        "content": f"Context:\n{context}\n\nQuestion: {query}",
                    }
                ]
                reply = await ai_client.chat_completion(messages, max_tokens=700)
                if reply:
                    return {"reply": _clean_text(reply), "schemes": matched_docs}
            except Exception as e:
                logger.warning("ai_client_generation_failed", error=str(e))

        # 3. Intelligent Local Synthesis (Clean & Beautiful Markdown)
        reply = self._local_synthesis(query, matched_docs, user_profile)
        return {"reply": reply, "schemes": matched_docs}


# Singleton instance
scheme_chatbot = SchemeChatbotService()

