import React, { useMemo, useState } from "react";
import ProgressSteps from "./ProgressSteps";
import { MainLayout } from "../layout";

/* ====== SAMPLE SCHEME DATA ====== */

const schemes = [
  {
    id: 1,
    name: "Pradhan Mantri Mudra Yojana",
    category: "Business Loan",
    support: "Loan",
    amount: "Up to ₹10 Lakh",
    ministry: "Ministry of Finance",
    description:
      "Provides loans to small businesses and entrepreneurs for starting or expanding their business.",
    eligibility:
      "Small businesses, startups and micro enterprises.",
    tags: ["Loan", "Business", "MSME"],
  },

  {
    id: 2,
    name: "Prime Minister's Employment Generation Programme",
    category: "Financial Assistance",
    support: "Subsidy",
    amount: "Up to ₹25 Lakh",
    ministry: "Ministry of MSME",
    description:
      "Supports entrepreneurs in setting up new micro-enterprises through financial assistance.",
    eligibility:
      "New entrepreneurs and eligible micro enterprises.",
    tags: ["Subsidy", "MSME", "Entrepreneur"],
  },

  {
    id: 3,
    name: "Credit Guarantee Scheme for MSMEs",
    category: "Business Loan",
    support: "Loan",
    amount: "Credit Support",
    ministry: "Ministry of MSME",
    description:
      "Provides credit guarantee support to eligible micro and small enterprises.",
    eligibility:
      "Micro and small enterprises seeking institutional credit.",
    tags: ["Loan", "MSME", "Credit"],
  },

  {
    id: 4,
    name: "Stand-Up India",
    category: "Business Loan",
    support: "Loan",
    amount: "₹10 Lakh - ₹1 Crore",
    ministry: "Ministry of Finance",
    description:
      "Facilitates bank loans for setting up greenfield enterprises.",
    eligibility:
      "Eligible entrepreneurs establishing new enterprises.",
    tags: ["Loan", "Startup", "Business"],
  },

  {
    id: 5,
    name: "Startup India Seed Fund Scheme",
    category: "Grant",
    support: "Grant",
    amount: "Up to ₹50 Lakh",
    ministry: "DPIIT",
    description:
      "Provides financial assistance to startups for proof of concept, prototype development and product trials.",
    eligibility:
      "Eligible startups recognised under Startup India.",
    tags: ["Grant", "Startup", "Innovation"],
  },

  {
    id: 6,
    name: "Skill Development Support Scheme",
    category: "Skill Development",
    support: "Training",
    amount: "Training Support",
    ministry: "Government of India",
    description:
      "Provides training and skill development opportunities for entrepreneurs and workers.",
    eligibility:
      "Eligible individuals and businesses seeking skill development.",
    tags: ["Training", "Skills", "Development"],
  },
];

/* ====== COMPONENT ====== */

export default function MatchingSchemesPage() {
  const [search, setSearch] = useState("");

  /* ===== LOAD SAVED USER INFORMATION ======= */

  const personalDetails = getLocalStorageData(
    "schemeSaathiPersonalInfo"
  );

  const businessDetails = getLocalStorageData(
    "schemeSaathiBusinessDetails"
  );

  const otherDetails = getLocalStorageData(
    "schemeSaathiOtherDetails"
  );

  /* ======= PROFILE MATCHING ======= */

  const matchedSchemes = useMemo(() => {
    const interestedType =
      otherDetails?.interestedSchemeType || "";

    const preferredSupport =
      otherDetails?.preferredSupport || "";

    const businessType =
      businessDetails?.businessType || "";

    const businessStage =
      businessDetails?.businessStage || "";

    return schemes
      .map((scheme) => {
        let score = 0;

        /* -------- INTERESTED SCHEME TYPE ------- */

        if (interestedType) {
          const interestedText =
            interestedType.toLowerCase();

          if (
            scheme.category
              .toLowerCase()
              .includes(interestedText) ||
            scheme.tags.some((tag) =>
              tag
                .toLowerCase()
                .includes(interestedText)
            )
          ) {
            score += 5;
          }
        }

        /* ------ PREFERRED SUPPORT ------ */

        if (preferredSupport) {
          const supportText =
            preferredSupport.toLowerCase();

          if (
            scheme.support
              .toLowerCase()
              .includes(supportText) ||
            scheme.tags.some((tag) =>
              tag
                .toLowerCase()
                .includes(supportText)
            )
          ) {
            score += 4;
          }
        }

        /* --------- BUSINESS TYPE -------- */

        if (businessType) {
          const businessText =
            businessType.toLowerCase();

          if (
            scheme.tags.some((tag) =>
              tag
                .toLowerCase()
                .includes(businessText)
            ) ||
            scheme.category
              .toLowerCase()
              .includes(businessText)
          ) {
            score += 2;
          }
        }

        /* ---- BUSINESS STAGE ------- */

        if (businessStage) {
          const stageText =
            businessStage.toLowerCase();

          if (
            scheme.tags.some((tag) =>
              tag
                .toLowerCase()
                .includes(stageText)
            ) ||
            scheme.description
              .toLowerCase()
              .includes(stageText)
          ) {
            score += 2;
          }
        }

        return {
          ...scheme,
          matchScore: score,
        };
      })
      .sort(
        (a, b) =>
          b.matchScore - a.matchScore
      );
  }, [businessDetails, otherDetails]);

  /* ====== SEARCH ======== */

  const filteredSchemes = useMemo(() => {
    const searchText =
      search.trim().toLowerCase();

    if (!searchText) {
      return matchedSchemes;
    }

    return matchedSchemes.filter((scheme) => {
      return (
        scheme.name
          .toLowerCase()
          .includes(searchText) ||

        scheme.category
          .toLowerCase()
          .includes(searchText) ||

        scheme.description
          .toLowerCase()
          .includes(searchText) ||

        scheme.ministry
          .toLowerCase()
          .includes(searchText) ||

        scheme.support
          .toLowerCase()
          .includes(searchText) ||

        scheme.tags.some((tag) =>
          tag
            .toLowerCase()
            .includes(searchText)
        )
      );
    });
  }, [matchedSchemes, search]);

  /* ======= VIEW SCHEME ========= */

  const handleViewScheme = (scheme) => {
    localStorage.setItem(
      "schemeSaathiSelectedScheme",
      JSON.stringify(scheme)
    );

    window.location.href =
      `/find-schemes/scheme/${scheme.id}`;
  };

  /* ======== EDIT PROFILE ====== */

  const handleEdit = (section) => {
    sessionStorage.setItem(
      "schemeSaathiEditMode",
      section
    );

    if (section === "personal") {
      window.location.href =
        "/find-schemes/personal-info";
      return;
    }

    if (section === "business") {
      window.location.href =
        "/find-schemes/business-details";
      return;
    }

    if (section === "other") {
      window.location.href =
        "/find-schemes/other-details";
    }
  };

  /* ======== RENDER ======= */

  return (
    <MainLayout>

      <div className="min-h-[calc(100vh-132px)] bg-[#f7f8fc] pb-20">

        {/* ====== PROGRESS ======= */}

        <ProgressSteps currentStep={5} />

        <div className="mx-auto max-w-300 px-5 sm:px-8">

          {/* ====== HEADER ========= */}

          <div className="pt-9">

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

              <div>

                <div className="mb-2 inline-flex items-center rounded-full bg-[#fff4c7] px-3 py-1 text-[11px] font-semibold text-[#9b7815]">
                  Step 5 • Results
                </div>

                <h1 className="text-[28px] font-extrabold tracking-[-0.02em] text-[#172b49]">
                  Schemes matched for you
                </h1>

                <p className="mt-2 max-w-170 text-[14px] leading-6 text-slate-500">
                  Based on the information you provided,
                  we found government schemes that may
                  be relevant to your needs.
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">

                <p className="text-[11px] font-medium text-slate-400">
                  MATCHED SCHEMES
                </p>

                <p className="mt-1 text-2xl font-extrabold text-[#0d2b55]">
                  {filteredSchemes.length}
                </p>

              </div>

            </div>

          </div>

          {/* ====== PROFILE SUMMARY ======== */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <h2 className="text-[15px] font-bold text-[#172b49]">
                  Your application profile
                </h2>

                <div className="mt-3 flex flex-wrap gap-2">

                  {personalDetails?.state && (
                    <ProfileTag>
                      {personalDetails.state}
                    </ProfileTag>
                  )}

                  {personalDetails?.category && (
                    <ProfileTag>
                      {personalDetails.category}
                    </ProfileTag>
                  )}

                  {businessDetails?.businessType && (
                    <ProfileTag>
                      {businessDetails.businessType}
                    </ProfileTag>
                  )}

                  {businessDetails?.businessStage && (
                    <ProfileTag>
                      {businessDetails.businessStage}
                    </ProfileTag>
                  )}

                  {otherDetails?.preferredSupport && (
                    <ProfileTag>
                      {otherDetails.preferredSupport}
                    </ProfileTag>
                  )}

                  {otherDetails?.interestedSchemeType && (
                    <ProfileTag>
                      {otherDetails.interestedSchemeType}
                    </ProfileTag>
                  )}

                  {!personalDetails &&
                    !businessDetails &&
                    !otherDetails && (
                      <span className="text-[12px] text-slate-400">
                        Profile information is not available.
                      </span>
                    )}

                </div>

              </div>

              {/* EDIT BUTTONS */}

              <div className="flex flex-wrap gap-2">

                <button
                  type="button"
                  onClick={() =>
                    handleEdit("personal")
                  }
                  className="rounded-lg border border-slate-200 px-4 py-2 text-[12px] font-medium text-[#0d2b55] transition hover:bg-slate-50"
                >
                  Personal
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleEdit("business")
                  }
                  className="rounded-lg border border-slate-200 px-4 py-2 text-[12px] font-medium text-[#0d2b55] transition hover:bg-slate-50"
                >
                  Business
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleEdit("other")
                  }
                  className="rounded-lg border border-slate-200 px-4 py-2 text-[12px] font-medium text-[#0d2b55] transition hover:bg-slate-50"
                >
                  Other
                </button>

              </div>

            </div>

          </section>

          {/* ====== SEARCH ONLY ======== */}

          <section className="mt-6">

            <div className="relative w-full">

              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search schemes..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  pl-10
                  pr-4
                  text-[13px]
                  text-slate-700
                  outline-none
                  transition
                  focus:border-[#0d2b55]
                  focus:ring-2
                  focus:ring-[#0d2b55]/10
                "
              />

            </div>

          </section>

          {/* ====== RESULTS ======== */}

          <div className="mt-6">

            {filteredSchemes.length === 0 ? (

              <EmptyResults
                onReset={() => {
                  setSearch("");
                }}
              />

            ) : (

              <div className="grid gap-5 md:grid-cols-2">

                {filteredSchemes.map((scheme) => (

                  <SchemeCard
                    key={scheme.id}
                    scheme={scheme}
                    onView={() =>
                      handleViewScheme(scheme)
                    }
                  />

                ))}

              </div>

            )}

          </div>

        </div>

      </div>

    </MainLayout>
  );
}

/* ====== SCHEME CARD ====== */

function SchemeCard({ scheme, onView }) {

  return (
    <article
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        transition
        hover:-translate-y-0.5
        hover:shadow-md
      "
    >

      {/* TOP */}

      <div className="flex items-start justify-between gap-4">

        <div className="flex items-start gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0d2b55] text-lg font-bold text-[#f4c63d]">
            ₹
          </div>

          <div>

            <h2 className="text-[16px] font-bold leading-5 text-[#172b49]">
              {scheme.name}
            </h2>

            <p className="mt-1 text-[11px] text-slate-400">
              {scheme.ministry}
            </p>

          </div>

        </div>

        <span className="rounded-full bg-[#fff5c9] px-2.5 py-1 text-[10px] font-semibold text-[#8c6b00]">
          {scheme.support}
        </span>

      </div>

      {/* DESCRIPTION */}

      <p className="mt-4 text-[12px] leading-5 text-slate-500">
        {scheme.description}
      </p>

      {/* AMOUNT */}

      <div className="mt-4 rounded-xl bg-slate-50 p-3">

        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
          Financial Support
        </p>

        <p className="mt-1 text-[14px] font-bold text-[#172b49]">
          {scheme.amount}
        </p>

      </div>

      {/* TAGS */}

      <div className="mt-4 flex flex-wrap gap-2">

        {scheme.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600"
          >
            {tag}
          </span>
        ))}

      </div>

      {/* MATCH */}

      {scheme.matchScore > 0 && (

        <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2">

          <p className="text-[11px] font-semibold text-emerald-700">
            ✓ Matches your profile
          </p>

        </div>

      )}

      {/* ELIGIBILITY */}

      <div className="mt-4 border-t border-slate-100 pt-4">

        <p className="text-[11px] font-semibold text-[#172b49]">
          Eligibility
        </p>

        <p className="mt-1 text-[11px] leading-5 text-slate-500">
          {scheme.eligibility}
        </p>

      </div>

      {/* BUTTON */}

      <button
        type="button"
        onClick={onView}
        className="
          mt-5
          h-10
          w-full
          rounded-lg
          bg-[#0d2b55]
          text-[12px]
          font-semibold
          text-white
          transition
          hover:bg-[#173b70]
          active:scale-[0.99]
        "
      >
        View Scheme Details →
      </button>

    </article>
  );
}

/* ====== PROFILE TAG ====== */

function ProfileTag({ children }) {

  return (
    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-600">
      {children}
    </span>
  );
}

/* ====== EMPTY RESULTS ====== */

function EmptyResults({ onReset }) {

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
        🔎
      </div>

      <h2 className="mt-4 text-lg font-bold text-[#172b49]">
        No schemes found
      </h2>

      <p className="mx-auto mt-2 max-w-md text-[13px] leading-5 text-slate-500">
        We couldn't find schemes matching your
        search. Try another scheme name or keyword.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="mt-5 rounded-lg bg-[#0d2b55] px-5 py-2.5 text-[12px] font-medium text-white hover:bg-[#173b70]"
      >
        Clear Search
      </button>

    </div>
  );
}

/* ====== LOCAL STORAGE HELPER ====== */

function getLocalStorageData(key) {

  try {

    const saved =
      localStorage.getItem(key);

    return saved
      ? JSON.parse(saved)
      : null;

  } catch (error) {

    console.error(
      `Unable to read ${key}:`,
      error
    );

    return null;
  }
}