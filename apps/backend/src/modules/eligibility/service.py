import os
import re
import pickle
from pathlib import Path
from typing import Any, Optional

from src.config.logging import get_logger
from src.ml.eligibility_engine import EligibilityEngine

logger = get_logger("eligibility_service")

BASE_DIR = Path(__file__).resolve().parents[2]
CSV_PATH = BASE_DIR / "ml" / "eligibility_engine" / "all_schemes_eligibility_table.csv"
DOCS_PATH = BASE_DIR / "ml" / "chatbot" / "documents.pkl"


def _normalize_key(text: str) -> str:
    """Normalizes text for fuzzy dictionary matching."""
    if not text:
        return ""
    return re.sub(r"[^a-zA-Z0-9]", "", str(text)).lower()


def _parse_income(val: Any) -> float:
    """Parses various income formats (numeric or human-readable ranges)."""
    if val is None or val == "":
        return 200000.0
    if isinstance(val, (int, float)):
        return float(val)

    text = str(val).lower()
    if "below" in text or "under" in text:
        if "50" in text:
            return 40000.0
        return 80000.0
    if "1" in text and "3" in text:
        return 200000.0
    if "3" in text and "5" in text:
        return 400000.0
    if "5" in text and "10" in text:
        return 750000.0
    if "10" in text and "25" in text:
        return 1500000.0
    if "above" in text or "more" in text or "crore" in text:
        return 3000000.0

    numbers = re.findall(r"\d+", text.replace(",", ""))
    if numbers:
        parsed = float(numbers[0])
        if "lakh" in text and parsed < 1000:
            parsed *= 100000
        return parsed

    return 200000.0


def _parse_documents_list(docs_str: Any) -> list[str]:
    """Splits a document requirements string into clean list items."""
    if not docs_str or not isinstance(docs_str, str):
        return ["Aadhaar Card", "Bank Account Details"]

    cleaned = docs_str.strip()
    if not cleaned or cleaned.lower() in ["nan", "none", "not specified"]:
        return ["Aadhaar Card", "Bank Account Details"]

    # Split by common delimiters: commas, bullets, numbered lists, newlines
    items = re.split(r"[\n\r;•\-\*]|\d+\.\s*", cleaned)
    results = []
    for item in items:
        token = item.strip().strip(",")
        if len(token) > 2 and token.lower() not in ["and", "or"]:
            results.append(token)

    return results[:8] if results else [cleaned[:100]]


class EligibilityService:
    _instance: Optional["EligibilityService"] = None

    def __init__(self):
        if not CSV_PATH.exists():
            raise FileNotFoundError(f"Eligibility CSV not found at {CSV_PATH}")

        logger.info("loading_eligibility_engine", path=str(CSV_PATH))
        self.engine = EligibilityEngine(str(CSV_PATH))

        self.scheme_catalog: dict[str, dict] = {}
        if DOCS_PATH.exists():
            try:
                with open(DOCS_PATH, "rb") as f:
                    docs = pickle.load(f)
                for d in docs:
                    s_name = d.get("scheme_name", "")
                    norm_key = _normalize_key(s_name)
                    self.scheme_catalog[norm_key] = d
                logger.info("loaded_scheme_catalog", total=len(docs))
            except Exception as e:
                logger.warning("failed_loading_scheme_docs", error=str(e))

    @classmethod
    def get_instance(cls) -> "EligibilityService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def normalize_profile(self, profile: dict[str, Any]) -> dict[str, Any]:
        """Maps diverse frontend profile fields into the schema expected by EligibilityEngine."""
        # Age
        age = profile.get("age") or profile.get("Age") or 30
        try:
            age = int(age)
        except (ValueError, TypeError):
            age = 30

        # Gender
        gender = profile.get("gender") or profile.get("Gender") or "Male"
        if gender in ["Prefer not to say", "Other"]:
            gender = "Any"

        # Category
        cat = profile.get("social_category") or profile.get("category") or profile.get("Category") or "General"
        if "sc" in cat.lower() or "st" in cat.lower():
            cat = "SC"
        elif "obc" in cat.lower():
            cat = "OBC"
        elif "pwd" in cat.lower() or "disability" in cat.lower():
            cat = "PwD"
        elif "minority" in cat.lower():
            cat = "Minority"

        # Disability
        disability = bool(profile.get("disability") or profile.get("Disability") or cat == "PwD")

        # Location / State / District
        state = profile.get("state") or profile.get("State") or ""
        district = profile.get("district") or profile.get("District") or ""
        location_raw = profile.get("location") or ""
        if not state and location_raw:
            parts = [p.strip() for p in location_raw.split(",") if p.strip()]
            if len(parts) >= 2:
                district = parts[0]
                state = parts[1]
            elif len(parts) == 1:
                state = parts[0]

        # Rural
        rural_raw = profile.get("rural") or profile.get("Rural")
        if rural_raw is not None:
            rural = bool(rural_raw)
        else:
            rural = "rural" in location_raw.lower() or "village" in location_raw.lower()

        # Business / Activity
        business_type = (
            profile.get("business_type")
            or profile.get("Business_Type")
            or profile.get("occupation")
            or profile.get("businessActivity")
            or "MSME"
        )

        income = _parse_income(
            profile.get("annual_income")
            or profile.get("income")
            or profile.get("Income")
            or profile.get("annualTurnover")
        )

        return {
            "Age": age,
            "Gender": gender,
            "Category": cat,
            "Income": income,
            "Disability": disability,
            "Rural": rural,
            "Business_Type": business_type,
            "State": state,
            "District": district,
        }

    def _enrich_match(self, item: dict[str, Any]) -> dict[str, Any]:
        """Merges engine evaluation with rich catalog details."""
        scheme_name = item.get("Scheme Name", "")
        norm_key = _normalize_key(scheme_name)
        doc = self.scheme_catalog.get(norm_key, {})

        matched_conditions = [c for c in item.get("Matched Conditions", []) if c != "Disability"]
        failed_conditions = [c for c in item.get("Failed Conditions", []) if c != "Disability"]
        match_score = item.get("Match Score", 0.0)
        confidence = item.get("Confidence", "Medium")
        is_eligible = item.get("Eligible", False)

        # Build natural explanation
        matched_str = ", ".join(matched_conditions) if matched_conditions else "General criteria"
        explanation = f"Matched on {matched_str}. Overall confidence: {confidence}."
        if failed_conditions:
            explanation += f" Did not meet: {', '.join(failed_conditions)}."

        # Required docs
        raw_docs = doc.get("documents", "")
        parsed_docs = _parse_documents_list(raw_docs)

        # Fallback values
        description = doc.get("description") or f"Government assistance scheme supporting {scheme_name}."
        benefits = doc.get("benefits") or "Financial subsidies, loans, and institutional support."
        app_process = doc.get("application_process") or "Apply online through the official department portal."
        official_url = doc.get("official_url") or "https://www.myscheme.gov.in"
        department = doc.get("level") or "Government of India"

        scheme_id = norm_key[:40] if norm_key else re.sub(r"[^a-zA-Z0-9]", "_", scheme_name.lower())[:40]

        return {
            "scheme_id": scheme_id,
            "name": scheme_name,
            "scheme_name": scheme_name,
            "department": department,
            "category": doc.get("tags") or "Government Scheme",
            "description": description,
            "benefits": benefits,
            "score": round(match_score / 100.0, 2),
            "match_score_pct": match_score,
            "confidence": confidence,
            "eligible": is_eligible,
            "is_eligible": is_eligible,
            "matched_conditions": matched_conditions,
            "unmatched_conditions": failed_conditions,
            "failed_conditions": failed_conditions,
            "explanation": explanation,
            "detailed_explanation": item.get("Explanation", {}),
            "official_source_url": official_url,
            "application_route": app_process,
            "required_documents": parsed_docs,
            "notes": item.get("Notes", ""),
        }

    def match_schemes(self, raw_profile: dict[str, Any], top_n: int = 50, eligible_only: bool = False) -> list[dict[str, Any]]:
        """Main entry point: normalizes profile, executes engine, enriches output."""
        normalized = self.normalize_profile(raw_profile)
        logger.info("evaluating_eligibility", profile=normalized)

        if eligible_only:
            results = self.engine.eligible_schemes(normalized)
        else:
            results = self.engine.recommend(normalized, top_n=top_n)

        enriched = [self._enrich_match(r) for r in results]
        return enriched


eligibility_service = EligibilityService.get_instance()
