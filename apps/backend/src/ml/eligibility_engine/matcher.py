"""
==========================================================
matcher.py

Performs all eligibility matching for a user profile
against a scheme.

==========================================================
"""

from parser import (
    parse_age,
    parse_income,
    parse_categories,
    parse_gender,
    parse_business,
    parse_state,
    parse_bool
)

from utils import normalize


class EligibilityMatcher:

    def __init__(self):
        pass

    # -------------------------------------------------------
    # AGE
    # -------------------------------------------------------

    def match_age(self, age, rule):

        minimum, maximum = parse_age(rule)

        if minimum <= age <= maximum:
            return True

        return False

    # -------------------------------------------------------
    # INCOME
    # -------------------------------------------------------

    def match_income(self, income, rule):

        minimum, maximum = parse_income(rule)

        if minimum <= income <= maximum:
            return True

        return False

    # -------------------------------------------------------
    # GENDER
    # -------------------------------------------------------

    def match_gender(self, gender, rule):

        genders = parse_gender(rule)

        if "any" in genders:
            return True

        return normalize(gender) in genders

    # -------------------------------------------------------
    # CATEGORY
    # -------------------------------------------------------

    def match_category(self, category, rule):

        categories = parse_categories(rule)

        if "any" in categories:
            return True

        return normalize(category) in categories

    # -------------------------------------------------------
    # BUSINESS
    # -------------------------------------------------------

    def match_business(self, business, rule):

        businesses = parse_business(rule)

        if "any" in businesses:
            return True

        business = normalize(business)

        for b in businesses:

            if b in business:
                return True

        return False

    # -------------------------------------------------------
    # STATE
    # -------------------------------------------------------

    def match_state(self, state, rule):

        states = parse_state(rule)

        if len(states) == 0:
            return True

        if "Any" in states:
            return True

        for s in states:

            if normalize(state) == normalize(s):
                return True

        return False

    # -------------------------------------------------------
    # DISABILITY
    # -------------------------------------------------------

    def match_disability(self, disability, rule):

        required = parse_bool(rule)

        if not required:
            return True

        return disability

    # -------------------------------------------------------
    # RURAL
    # -------------------------------------------------------

    def match_rural(self, rural, rule):

        required = parse_bool(rule)

        if not required:
            return True

        return rural

    # -------------------------------------------------------
    # COMPLETE MATCH
    # -------------------------------------------------------

    def match_scheme(self, user, scheme):

        matched = []

        failed = []

        # AGE
        if self.match_age(
                user["Age"],
                scheme["Age Range"]):

            matched.append("Age")

        else:

            failed.append("Age")

        # INCOME
        if self.match_income(
                user["Income"],
                scheme["Max Income"]):

            matched.append("Income")

        else:

            failed.append("Income")

        # GENDER
        if self.match_gender(
                user["Gender"],
                scheme["Eligible Genders"]):

            matched.append("Gender")

        else:

            failed.append("Gender")

        # CATEGORY
        if self.match_category(
                user["Category"],
                scheme["Eligible Categories"]):

            matched.append("Category")

        else:

            failed.append("Category")

        # DISABILITY
        if self.match_disability(
                user["Disability"],
                scheme["Disability Required"]):

            matched.append("Disability")

        else:

            failed.append("Disability")

        # RURAL
        if self.match_rural(
                user["Rural"],
                scheme["Rural Only"]):

            matched.append("Rural")

        else:

            failed.append("Rural")

        # BUSINESS
        if self.match_business(
                user["Business_Type"],
                scheme["Business Types"]):

            matched.append("Business")

        else:

            failed.append("Business")

        # STATE (only if column exists)
        if "State" in scheme.index:

            if self.match_state(
                    user["State"],
                    scheme["State"]):

                matched.append("State")

            else:

                failed.append("State")

        return {

            "matched": matched,

            "failed": failed,

            "eligible": len(failed) == 0,

            "matched_count": len(matched),

            "failed_count": len(failed)

        }

    # -------------------------------------------------------
    # MULTIPLE SCHEMES
    # -------------------------------------------------------

    def recommend(self, user, dataframe):

        results = []

        for _, scheme in dataframe.iterrows():

            result = self.match_scheme(
                user,
                scheme
            )

            result["Scheme Name"] = scheme["Scheme Name"]

            result["Notes"] = scheme.get("Notes", "")

            results.append(result)

        results.sort(

            key=lambda x: x["matched_count"],

            reverse=True

        )

        return results


# ==========================================================
# Example
# ==========================================================

if __name__ == "__main__":

    import pandas as pd

    df = pd.read_csv(
        "all_schemes_eligibility_table.csv"
    )

    matcher = EligibilityMatcher()

    user = {

        "Age": 27,

        "Gender": "Female",

        "Category": "SC",

        "Income": 180000,

        "Disability": False,

        "Rural": True,

        "Business_Type": "Tailoring",

        "State": "Uttar Pradesh"

    }

    results = matcher.recommend(user, df)

    for r in results[:10]:

        print("-" * 60)

        print("Scheme :", r["Scheme Name"])

        print("Eligible :", r["eligible"])

        print("Matched :", r["matched"])

        print("Failed :", r["failed"])