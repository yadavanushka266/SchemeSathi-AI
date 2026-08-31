def build_explanation(scheme_name: str, matched_conditions: list[dict], unmatched_conditions: list[dict]) -> str:
    if not matched_conditions and not unmatched_conditions:
        return f"{scheme_name} has no configured eligibility rules yet."
    matched_summary = ", ".join(_describe_condition(c) for c in matched_conditions) or "no conditions"
    explanation = f"You may be eligible for {scheme_name} because: {matched_summary}."
    if unmatched_conditions:
        gap_summary = ", ".join(_describe_condition(c) for c in unmatched_conditions)
        explanation += f" The following criteria could not be confirmed yet: {gap_summary}."
    return explanation


def _describe_condition(condition: dict) -> str:
    field = condition["field"].replace("_", " ")
    operator = condition["operator"]
    value = condition["value"]
    phrase_map = {
        "eq": f"{field} is {value}",
        "neq": f"{field} is not {value}",
        "in": f"{field} is one of {value}",
        "gte": f"{field} is at least {value}",
        "lte": f"{field} is at most {value}",
        "gt": f"{field} is greater than {value}",
        "lt": f"{field} is less than {value}",
        "contains": f"{field} includes {value}",
        "between": f"{field} is between {value[0]} and {value[1]}",
    }
    return phrase_map.get(operator, f"{field} {operator} {value}")
