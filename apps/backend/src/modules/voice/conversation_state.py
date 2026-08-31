PROFILE_FIELDS_ORDER = ["full_name", "location", "occupation", "business_type", "income_band", "social_category"]

DISALLOWED_FIELDS = {"otp", "pin", "password", "bank_account_number", "upi_pin", "card_number"}


def get_next_question_field(conversation_state: dict) -> str | None:
    collected = conversation_state.get("collected_fields", {})
    for field in PROFILE_FIELDS_ORDER:
        if field not in collected or not collected[field]:
            return field
    return None


def record_answer(conversation_state: dict, field: str, value: str) -> dict:
    if field in DISALLOWED_FIELDS:
        raise ValueError("This system never collects OTPs, PINs, passwords or payment details")
    collected = conversation_state.setdefault("collected_fields", {})
    collected[field] = value
    return conversation_state


def is_profile_complete(conversation_state: dict) -> bool:
    return get_next_question_field(conversation_state) is None
