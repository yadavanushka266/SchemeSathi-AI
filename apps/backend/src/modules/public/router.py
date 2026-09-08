from typing import Any
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
import asyncio

from src.config.database import get_db_optional
from src.config.logging import get_logger
from src.ml.chatbot.chatbot_service import scheme_chatbot
from src.modules.eligibility.service import eligibility_service
from src.modules.voice.stt_client import speech_to_text

logger = get_logger("public_router")

router = APIRouter(prefix="/public", tags=["Public"])


class AssistantChatRequest(BaseModel):
    message: str
    history: list[dict[str, Any]] = []
    phone_number: str | None = None
    profile: dict[str, Any] | None = None


class VoiceTranscriptionRequest(BaseModel):
    audio_base64: str
    language: str = "hi"
    audio_format: str = "webm"


@router.post("/self-service/transcribe")
async def self_service_transcribe(payload: VoiceTranscriptionRequest):
    """Transcribes browser-recorded audio through the configured Bhashini pipeline."""
    try:
        result = await speech_to_text(payload.audio_base64, payload.language, payload.audio_format)
        return {"text": result.get("text", ""), "confidence": result.get("confidence")}
    except Exception as e:
        logger.error("self_service_transcription_error", error=str(e))
        return {"text": "", "error": "Voice transcription failed"}


@router.post("/self-service/schemes-match")
async def self_service_schemes_match(profile: dict[str, Any], db: AsyncSession | None = Depends(get_db_optional)):
    """Matches self-service user profile against schemes using the Eligibility Engine.
    Filters strictly to return ONLY schemes that match the user's specific inputs and requirements.
    """
    try:
        # Evaluate eligibility across all schemes
        raw_matches = eligibility_service.match_schemes(profile, top_n=100, eligible_only=True)
        
        # Filter strictly for schemes where user meets 100% of required conditions (0 failed conditions)
        eligible_matches = [
            m for m in raw_matches 
            if m.get("eligible") and len(m.get("failed_conditions", [])) == 0
        ]
        
        pref_support = str(profile.get("preferred_support") or profile.get("interested_scheme_type") or "").lower()
        bus_type = str(profile.get("business_type") or profile.get("occupation") or "").lower()
        user_location = str(profile.get("location") or profile.get("state") or "").lower()

        # Score relevance based on explicit user requirements (Location > Business Type > Support Type)
        def _relevance_score(scheme):
            score = scheme.get("score", 0.5)
            text = f"{scheme.get('name', '')} {scheme.get('description', '')} {scheme.get('benefits', '')}".lower()
            
            if user_location and any(loc in text for loc in user_location.split(",")):
                score += 0.25
            if bus_type and bus_type in text:
                score += 0.15
            if pref_support and pref_support in text:
                score += 0.10
            return score

        eligible_matches.sort(key=_relevance_score, reverse=True)

        # Return only the top relevant qualifying schemes (max 15 high-confidence matches)
        final_matches = eligible_matches[:15]

        return {"matches": final_matches, "total": len(final_matches)}
    except Exception as e:
        logger.error("self_service_schemes_match_error", error=str(e))
        return {"matches": [], "total": 0, "error": str(e)}


@router.post("/self-service/assistant-chat")
async def self_service_assistant_chat(payload: AssistantChatRequest):
    """Processes citizen query with SchemeSathi AI Chatbot (FAISS semantic retrieval + Gemini RAG)."""
    try:
        result = await scheme_chatbot.answer_question(
            query=payload.message,
            history=payload.history,
            user_profile=payload.profile,
        )
        return {
            "reply": result.get("reply", ""),
            "retrieved_schemes": result.get("schemes", result.get("retrieved_schemes", [])),
        }
    except Exception as e:
        logger.error("self_service_assistant_chat_error", error=str(e))
        return {
            "reply": (
                "I'm sorry, I encountered a temporary issue while retrieving scheme details. "
                "Please try asking your question again."
            ),
            "retrieved_schemes": []
        }


@router.get("/self-service/category-counts")
async def self_service_category_counts():
    """Returns category totals calculated from the scheme dataset."""
    try:
        return {"counts": scheme_chatbot.category_counts()}
    except Exception as e:
        logger.error("self_service_category_counts_error", error=str(e))
        return {"counts": {}}


@router.get("/self-service/scheme-count")
async def self_service_scheme_count():
    """Returns the exact number of records in the scheme dataset."""
    try:
        return {"count": scheme_chatbot.total_scheme_count()}
    except Exception as e:
        logger.error("self_service_scheme_count_error", error=str(e))
        return {"count": 0}


@router.get("/self-service/dataset-completeness")
async def self_service_dataset_completeness():
    """Returns completeness of the required scheme information fields."""
    try:
        return {"completeness": scheme_chatbot.dataset_completeness()}
    except Exception as e:
        logger.error("self_service_dataset_completeness_error", error=str(e))
        return {"completeness": 0}


@router.get("/self-service/category-schemes")
async def self_service_category_schemes(category: str = Query(..., min_length=1)):
    """Returns all dataset schemes related to a category."""
    try:
        schemes = scheme_chatbot.category_schemes(category)
        return {"category": category, "schemes": schemes, "total": len(schemes)}
    except Exception as e:
        logger.error("self_service_category_schemes_error", error=str(e))
        return {"category": category, "schemes": [], "total": 0}
