"""
Model 5 — Beneficiary Profile Builder, Normalizer & ML Matching Engine
Combines NER entity normalization, rule evaluation, scoring, and explainability.
"""

from typing import Any
import re

STATE_MAPPING = {
    "up": "Uttar Pradesh",
    "u.p.": "Uttar Pradesh",
    "uttar pradesh": "Uttar Pradesh",
    "mp": "Madhya Pradesh",
    "m.p.": "Madhya Pradesh",
    "madhya pradesh": "Madhya Pradesh",
    "bihar": "Bihar",
    "rajasthan": "Rajasthan",
    "delhi": "Delhi",
    "maharashtra": "Maharashtra",
    "gujarat": "Gujarat",
    "tamil nadu": "Tamil Nadu",
    "tn": "Tamil Nadu",
    "karnataka": "Karnataka",
    "west bengal": "West Bengal",
    "wb": "West Bengal",
    "punjab": "Punjab",
    "haryana": "Haryana",
    "kerala": "Kerala",
    "andhra pradesh": "Andhra Pradesh",
    "ap": "Andhra Pradesh",
    "telangana": "Telangana",
    "odisha": "Odisha",
}


def normalize_state(value: str | None) -> str | None:
    if not value:
        return None
    val = value.strip().lower()
    return STATE_MAPPING.get(val, value.strip().title())


def normalize_income(value: Any) -> float | None:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    
    val = str(value).lower().strip()
    val = val.replace("₹", "").replace("rs.", "").replace("rs", "").replace(",", "").strip()

    if "below" in val and "1 lakh" in val:
        return 80000.0
    if "below" in val and "50,000" in val:
        return 40000.0

    match = re.search(r"(\d+(?:\.\d+)?)", val)
    if not match:
        return None
    
    num = float(match.group(1))

    if "lakh" in val or "lac" in val:
        return num * 100000.0
    if "crore" in val or "cr" in val:
        return num * 10000000.0
    
    if num < 100 and "lakh" not in val:
        # e.g., income band "1 - 3 Lakh" -> 200000
        return num * 100000.0

    return num


class BeneficiaryProfileBuilder:
    def __init__(self):
        self.profile = {
            "full_name": None,
            "phone_number": None,
            "age": None,
            "gender": None,
            "state": None,
            "social_category": None,
            "occupation": None,
            "business_type": None,
            "business_stage": None,
            "years_in_business": None,
            "annual_turnover": None,
            "number_of_employees": None,
            "annual_income": None,
            "registered_business": None,
            "funding_required": None,
            "preferred_support": None,
            "interested_scheme_type": None,
        }

    def build_profile(self, raw_input: dict[str, Any]) -> dict[str, Any]:
        p = self.profile.copy()

        p["full_name"] = raw_input.get("full_name") or raw_input.get("fullName")
        p["phone_number"] = raw_input.get("phone_number") or raw_input.get("phoneNumber")
        
        # Age
        age_val = raw_input.get("age")
        if age_val is not None:
            try:
                p["age"] = int(age_val)
            except (ValueError, TypeError):
                p["age"] = None

        # Gender
        gender_val = raw_input.get("gender")
        if gender_val:
            p["gender"] = str(gender_val).strip().lower()

        # State / Location
        loc_val = raw_input.get("location") or raw_input.get("state")
        p["state"] = normalize_state(loc_val)

        # Social Category
        cat_val = raw_input.get("social_category") or raw_input.get("category")
        if cat_val:
            p["social_category"] = str(cat_val).strip().upper()

        # Occupation & Business Type
        p["occupation"] = raw_input.get("occupation") or raw_input.get("businessActivity")
        p["business_type"] = raw_input.get("business_type") or raw_input.get("businessType")
        p["business_stage"] = raw_input.get("business_stage") or raw_input.get("businessStage")
        p["years_in_business"] = raw_input.get("years_in_business") or raw_input.get("yearsInBusiness")
        p["annual_turnover"] = raw_input.get("annual_turnover") or raw_input.get("annualTurnover")
        p["number_of_employees"] = raw_input.get("number_of_employees") or raw_input.get("numberOfEmployees")

        # Income & Funding
        p["annual_income"] = normalize_income(raw_input.get("annual_income") or raw_input.get("annualIncome"))
        p["funding_required"] = normalize_income(raw_input.get("funding_required") or raw_input.get("fundingRequired"))
        
        # Registered Business
        reg_val = raw_input.get("registered_business") or raw_input.get("registeredBusiness")
        if reg_val:
            p["registered_business"] = "Yes" if str(reg_val).strip().lower() in ["yes", "true", "1"] else "No"

        # Preferred Support & Interest
        p["preferred_support"] = raw_input.get("preferred_support") or raw_input.get("preferredSupport")
        p["interested_scheme_type"] = raw_input.get("interested_scheme_type") or raw_input.get("interestedSchemeType")

        return p


# Default Comprehensive Indian Government Schemes Catalog
DEFAULT_SCHEMES_CATALOG = [
    {
        "scheme_id": "scheme-pmegp-001",
        "name": "Prime Minister's Employment Generation Programme (PMEGP)",
        "category": "Business Loan & Subsidy",
        "department": "Ministry of Micro, Small and Medium Enterprises (MSME)",
        "description": "Credit-linked subsidy program to generate self-employment opportunities through establishment of micro-enterprises in non-farm sector.",
        "benefits": "Credit subsidy up to 35% for project costs up to ₹50 Lakh (Manufacturing) & ₹20 Lakh (Services).",
        "official_source_url": "https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp",
        "application_route": "Submit online application through KVIC Portal with project report and identity documents.",
        "required_documents": ["Aadhaar Card", "PAN Card", "Project Report", "Educational Qualification Certificate", "Caste Certificate"],
        "eligibility_criteria": [
            {"field": "age", "operator": "gte", "value": 18},
            {"field": "preferred_support", "operator": "in", "value": ["Loan", "Subsidy", "Grant", "Not sure yet"]},
            {"field": "business_type", "operator": "in", "value": ["Manufacturing", "Services", "Trading", "Handicrafts & Handlooms", "Food Processing"]},
        ],
    },
    {
        "scheme_id": "scheme-mudra-002",
        "name": "PM MUDRA Yojana (PMMY)",
        "category": "Micro Business Loan",
        "department": "Ministry of Finance / MUDRA Bank",
        "description": "Provides collateral-free loans to non-corporate, non-farm small/micro enterprises across Shishu, Kishor, and Tarun categories.",
        "benefits": "Collateral-free loan from ₹50,000 up to ₹10 Lakh with low interest rates.",
        "official_source_url": "https://www.mudra.org.in/",
        "application_route": "Apply at any commercial bank, Regional Rural Bank (RRB), or online via UdyamiMitra portal.",
        "required_documents": ["Identity Proof", "Address Proof", "Business Registration / Plan", "Bank Statement"],
        "eligibility_criteria": [
            {"field": "age", "operator": "gte", "value": 18},
            {"field": "funding_required", "operator": "lte", "value": 1000000},
        ],
    },
    {
        "scheme_id": "scheme-standup-003",
        "name": "Stand Up India Scheme",
        "category": "Credit Support for Women & SC/ST",
        "department": "Department of Financial Services, Ministry of Finance",
        "description": "Facilitates bank loans between ₹10 Lakh and ₹1 Crore to at least one SC/ST borrower and one woman borrower per bank branch.",
        "benefits": "Bank credit from ₹10 Lakh to ₹1 Crore for greenfield enterprises.",
        "official_source_url": "https://www.standupmitra.in/",
        "application_route": "Apply online via Stand Up India portal or directly at bank branches.",
        "required_documents": ["SC/ST Certificate or Proof of Woman Entrepreneurship", "Business Plan", "PAN Card", "Aadhaar Card"],
        "eligibility_criteria": [
            {"field": "age", "operator": "gte", "value": 18},
            {"field": "social_category", "operator": "in", "value": ["SC", "ST", "OBC", "GENERAL"]},
        ],
    },
    {
        "scheme_id": "scheme-vishwakarma-004",
        "name": "PM Vishwakarma Scheme",
        "category": "Artisan & Traditional Craftsman Support",
        "department": "Ministry of Micro, Small and Medium Enterprises (MSME)",
        "description": "Comprehensive end-to-end support to traditional artisans and craftspeople engaged in 18 traditional trades.",
        "benefits": "Collateral-free loan up to ₹3 Lakh at 5% interest rate, skill training stipend, and ₹15,000 toolkit incentive.",
        "official_source_url": "https://pmvishwakarma.gov.in/",
        "application_route": "Biometric registration at Common Service Centers (CSC) followed by verification by Gram Panchayat / ULB.",
        "required_documents": ["Aadhaar Card", "Bank Account Passbook", "Skill/Trade Certificate"],
        "eligibility_criteria": [
            {"field": "age", "operator": "gte", "value": 18},
            {"field": "occupation", "operator": "in", "value": ["Artisan / Weaver", "Self-Employed", "Business Owner", "Handicrafts & Handlooms"]},
        ],
    },
    {
        "scheme_id": "scheme-svanidhi-005",
        "name": "PM SVANidhi Scheme",
        "category": "Micro Credit for Street Vendors",
        "department": "Ministry of Housing and Urban Affairs (MoHUA)",
        "description": "Special micro-credit facility providing affordable working capital loans to urban street vendors.",
        "benefits": "Working capital loan up to ₹50,000 with 7% interest subsidy and cashback on digital transactions.",
        "official_source_url": "https://pmsvanidhi.mohua.gov.in/",
        "application_route": "Apply online on PM SVANidhi portal or through local Urban Local Bodies (ULBs).",
        "required_documents": ["Vending Certificate / Identity Card", "Aadhaar Card", "Bank Account Details"],
        "eligibility_criteria": [
            {"field": "funding_required", "operator": "lte", "value": 100000},
            {"field": "occupation", "operator": "in", "value": ["Self-Employed", "Business Owner", "Unemployed", "Vendor"]},
        ],
    },
    {
        "scheme_id": "scheme-pmkisan-006",
        "name": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
        "category": "Direct Agricultural Income Support",
        "department": "Ministry of Agriculture and Farmers Welfare",
        "description": "Income support to all landholding farmer families across the country to enable them to take care of agricultural expenses.",
        "benefits": "Direct financial benefit of ₹6,000 per year transferred into bank accounts in 3 equal installments.",
        "official_source_url": "https://pmkisan.gov.in/",
        "application_route": "Register on PM-KISAN portal or visit the nearest CSC / Revenue Officer.",
        "required_documents": ["Aadhaar Card", "Land Ownership Documents", "Bank Account Details"],
        "eligibility_criteria": [
            {"field": "occupation", "operator": "in", "value": ["Farmer", "Agriculture", "Agriculture & Allied"]},
            {"field": "annual_income", "operator": "lte", "value": 500000},
        ],
    },
    {
        "scheme_id": "scheme-lakhpati-007",
        "name": "Lakhpati Didi Scheme",
        "category": "Women Empowerment & Self Help Groups",
        "department": "Ministry of Rural Development (MoRD)",
        "description": "Empowers women members of Self Help Groups (SHGs) to earn a sustainable income of at least ₹1 Lakh per year.",
        "benefits": "Micro-enterprise training, interest subvention loans, and market linkage support.",
        "official_source_url": "https://aajeevika.gov.in/",
        "application_route": "Connect with local Self Help Group (SHG) or Block Development Office under NRLM.",
        "required_documents": ["SHG Passbook", "Aadhaar Card", "Bank Account Details"],
        "eligibility_criteria": [
            {"field": "gender", "operator": "eq", "value": "female"},
            {"field": "annual_income", "operator": "lte", "value": 500000},
        ],
    },
    {
        "scheme_id": "scheme-pmkvy-008",
        "name": "PM Kaushal Vikas Yojana (PMKVY 4.0)",
        "category": "Skill Development & Training",
        "department": "Ministry of Skill Development and Entrepreneurship (MSDE)",
        "description": "Skill certification scheme that enables youth to take up industry-relevant skill training.",
        "benefits": "Free skill training, NSQF Certification, and placement assistance with industry partners.",
        "official_source_url": "https://www.pmkvyofficial.org/",
        "application_route": "Register online at Skill India Digital Hub or visit an accredited PMKVY Training Center.",
        "required_documents": ["Aadhaar Card", "Educational Qualification Document"],
        "eligibility_criteria": [
            {"field": "age", "operator": "gte", "value": 15},
            {"field": "interested_scheme_type", "operator": "in", "value": ["Training", "Skill Development", "Financial Assistance", "Subsidy", "Grant", "Business Loan"]},
        ],
    },
]
