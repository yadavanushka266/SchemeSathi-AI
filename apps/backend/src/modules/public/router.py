from typing import Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
import asyncio

from src.config.database import get_db_optional
from src.config.logging import get_logger
from src.modules.chatbot.service import chatbot_service
from src.modules.eligibility.service import eligibility_service

logger = get_logger("public_router")

router = APIRouter(prefix="/public", tags=["Public"])


class AssistantChatRequest(BaseModel):
    message: str
    history: list[dict[str, Any]] = []
    phone_number: str | None = None
    profile: dict[str, Any] | None = None


@router.post("/self-service/schemes-match")
async def self_service_schemes_match(profile: dict[str, Any], db: AsyncSession | None = Depends(get_db_optional)):
    """Matches self-service user profile against schemes using the Eligibility Engine.
    Filters and ranks schemes that match the user's specific profile inputs and requirements.
    """
    try:
        # Evaluate 100% eligible schemes first
        eligible_matches = eligibility_service.match_schemes(profile, top_n=100, eligible_only=True)
        
        # Filter for schemes with 0 failed conditions if available
        perfect_matches = [
            m for m in eligible_matches 
            if m.get("eligible") and len(m.get("failed_conditions", [])) == 0
        ]
        
        # If perfect matches are scarce, fallback to overall top-scored recommended schemes
        matches_to_rank = perfect_matches if len(perfect_matches) >= 5 else eligible_matches
        if not matches_to_rank:
            matches_to_rank = eligibility_service.match_schemes(profile, top_n=30, eligible_only=False)

        pref_support = str(profile.get("preferred_support") or profile.get("interested_scheme_type") or "").lower()
        bus_type = str(profile.get("business_type") or profile.get("occupation") or "").lower()
        user_location = str(profile.get("location") or profile.get("state") or profile.get("district") or "").lower()

        location_tokens = [loc.strip() for loc in user_location.split(",") if loc.strip() and len(loc.strip()) > 2]
        bus_tokens = [b.strip() for b in bus_type.split() if b.strip() and len(b.strip()) > 2]
        support_tokens = [s.strip() for s in pref_support.split() if s.strip() and len(s.strip()) > 2]

        def _relevance_score(scheme):
            score = scheme.get("score", 0.5)
            text = f"{scheme.get('name', '')} {scheme.get('description', '')} {scheme.get('benefits', '')} {scheme.get('category', '')}".lower()

            if location_tokens and any(loc in text for loc in location_tokens):
                score += 0.25
            if bus_tokens and any(b in text for b in bus_tokens):
                score += 0.20
            if support_tokens and any(s in text for s in support_tokens):
                score += 0.10
            return score

        # Remove duplicates while preserving order
        seen_ids = set()
        unique_matches = []
        for m in matches_to_rank:
            sid = m.get("scheme_id") or m.get("name")
            if sid not in seen_ids:
                seen_ids.add(sid)
                unique_matches.append(m)

        unique_matches.sort(key=_relevance_score, reverse=True)
        final_matches = unique_matches[:20]

        return {"matches": final_matches, "total": len(final_matches)}
    except Exception as e:
        logger.error("self_service_schemes_match_error", error=str(e))
        return {"matches": [], "total": 0, "error": str(e)}


@router.post("/self-service/assistant-chat")
async def self_service_assistant_chat(payload: AssistantChatRequest):
    """Processes citizen query with SchemeSathi AI Chatbot (FAISS semantic retrieval + Gemini RAG)."""
    try:
        result = await chatbot_service.chat(
            message=payload.message,
            history=payload.history,
            phone_number=payload.phone_number,
            profile=payload.profile,
        )
        return result
    except Exception as e:
        logger.error("self_service_assistant_chat_error", error=str(e))
        return {
            "reply": (
                "I'm sorry, I encountered a temporary issue while retrieving scheme details. "
                "Please try asking your question again."
            ),
            "retrieved_schemes": []
        }
