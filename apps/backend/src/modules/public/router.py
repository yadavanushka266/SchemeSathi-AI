from typing import Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.database import get_db_optional
from src.integrations import ai_client
from src.ml.model5_engine import BeneficiaryProfileBuilder, DEFAULT_SCHEMES_CATALOG
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
async def self_service_schemes_match(profile: dict[str, Any], db: AsyncSession | None = Depends(get_db_optional)):
    """Matches self-service user profile against all active schemes using Model 5 ML Engine."""
    builder = BeneficiaryProfileBuilder()
    normalized_profile = builder.build_profile(profile)

    schemes_to_evaluate = []

    # 1. Attempt fetching active schemes & versions from database if available
    if db is not None:
        try:
            versions = await list_all_current_versions(db)
            for version in versions:
                scheme = (await db.execute(select(Scheme).where(Scheme.id == version.scheme_id))).scalar_one_or_none()
                if scheme and scheme.is_active:
                    schemes_to_evaluate.append({
                        "scheme_id": str(scheme.id),
                        "name": scheme.name,
                        "scheme_name": scheme.name,
                        "category": scheme.category,
                        "department": getattr(scheme, "department", "Government of India"),
                        "description": scheme.description,
                        "benefits": getattr(scheme, "benefits", "Financial assistance and support."),
                        "official_source_url": getattr(scheme, "official_source_url", None),
                        "application_route": getattr(scheme, "application_route", "Apply through official portal."),
                        "required_documents": getattr(scheme, "required_documents", []),
                        "eligibility_criteria": version.eligibility_criteria or [],
                    })
        except Exception:
            pass

    # 2. Fallback to Model 5 default government schemes catalog if DB is empty/unavailable
    if not schemes_to_evaluate:
        schemes_to_evaluate = DEFAULT_SCHEMES_CATALOG

    matches = []
    for item in schemes_to_evaluate:
        criteria = item.get("eligibility_criteria") or []
        score, matched, unmatched = evaluate_eligibility(normalized_profile, criteria)
        
        # If no criteria specified or score >= 0.3, include match
        if not criteria or score >= 0.3:
            final_score = score if criteria else 0.8
            explanation = build_explanation(item["name"], matched, unmatched)
            
            matches.append({
                "scheme_id": str(item.get("scheme_id")),
                "name": item["name"],
                "scheme_name": item["name"],
                "category": item.get("category", "Government Scheme"),
                "department": item.get("department", "Government of India"),
                "description": item.get("description", ""),
                "benefits": item.get("benefits", "Financial Assistance"),
                "score": final_score,
                "explanation": explanation,
                "matched_conditions": matched,
                "unmatched_conditions": unmatched,
                "official_source_url": item.get("official_source_url"),
                "application_route": item.get("application_route", "Apply via official portal."),
                "required_documents": item.get("required_documents", []),
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
