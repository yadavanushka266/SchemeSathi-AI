from typing import Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.database import get_db
from src.integrations import ai_client
from src.modules.matching.explainer import build_explanation
from src.modules.matching.rules_engine import evaluate_eligibility
from src.modules.schemes.models import Scheme
from src.modules.schemes.repository import list_all_current_versions

router = APIRouter(prefix="/public", tags=["Public"])


class AssistantChatRequest(BaseModel):
    message: str
    history: list[dict[str, Any]] = []
    phone_number: str | None = None


@router.post("/self-service/schemes-match")
async def self_service_schemes_match(profile: dict[str, Any], db: AsyncSession = Depends(get_db)):
    """Matches self-service user profile against all active schemes in the system."""
    versions = await list_all_current_versions(db)
    matches = []

    for version in versions:
        scheme = (await db.execute(select(Scheme).where(Scheme.id == version.scheme_id))).scalar_one_or_none()
        if not scheme or not scheme.is_active:
            continue
        score, matched, unmatched = evaluate_eligibility(profile, version.eligibility_criteria or [])
        if score >= 0.3:
            explanation = build_explanation(scheme.name, matched, unmatched)
            matches.append({
                "scheme_id": str(scheme.id),
                "scheme_name": scheme.name,
                "category": scheme.category,
                "description": scheme.description,
                "score": score,
                "explanation": explanation,
                "matched_conditions": matched,
                "unmatched_conditions": unmatched,
            })

    matches.sort(key=lambda x: x["score"], reverse=True)
    return {"matches": matches, "total": len(matches)}


@router.post("/self-service/assistant-chat")
async def self_service_assistant_chat(payload: AssistantChatRequest):
    """Processes user message with SchemeSathi AI Assistant."""
    messages = [
        {
            "role": "system",
            "content": (
                "You are SchemeSathi AI Assistant, a helpful, polite, and knowledgeable assistant "
                "guidance system for government welfare schemes in India. Help citizens understand "
                "schemes, eligibility requirements, application processes, and required documents. "
                "Keep responses concise, clear, and easy to understand."
            ),
        }
    ]

    for item in payload.history:
        if isinstance(item, dict) and "role" in item and "content" in item:
            messages.append({"role": item["role"], "content": item["content"]})

    messages.append({"role": "user", "content": payload.message})

    reply = await ai_client.chat_completion(messages, max_tokens=500)
    if not reply:
        reply = (
            "I'm sorry, I am currently having trouble reaching the AI service. "
            "Please check back shortly or explore the scheme finder directly!"
        )

    return {"reply": reply}
