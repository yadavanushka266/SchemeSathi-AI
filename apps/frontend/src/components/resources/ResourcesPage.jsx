import React, { useMemo, useState } from "react";
import { MainLayout } from "../layout";

/* ====== RESOURCE DATA ====== */

const resources = [
  {
    id: 1,
    title: "How to Find the Right Government Scheme",
    url: "https://www.myscheme.gov.in/",
    category: "Guides",
    icon: "📚",
    description:
      "Learn how to identify government schemes based on your business, income, location and support requirements.",
    type: "Guide",
  },

  {
    id: 2,
    title: "How to Apply for a Government Scheme",
    url: "https://www.myscheme.gov.in/",
    category: "Application",
    icon: "📝",
    description:
      "A simple step-by-step guide explaining the general process of applying for government schemes.",
    type: "Guide",
  },

  {
    id: 3,
    title: "Documents Required for Scheme Applications",
    url: "https://www.digilocker.gov.in/",
    category: "Documents",
    icon: "📄",
    description:
      "Understand the commonly required documents such as identity proof, address proof and business documents.",
    type: "Checklist",
  },

  {
    id: 4,
    title: "Frequently Asked Questions",
    url: "https://www.myscheme.gov.in/",
    category: "FAQs",
    icon: "❓",
    description:
      "Find answers to common questions about eligibility, applications, benefits and government schemes.",
    type: "FAQ",
  },

  {
    id: 5,
    title: "Tips to Improve Scheme Eligibility",
    url: "https://www.myscheme.gov.in/",
    category: "Tips",
    icon: "💡",
    description:
      "Useful tips to understand eligibility requirements and prepare better before applying.",
    type: "Tips",
  },

  {
    id: 6,
    title: "Understanding Business Loans & Subsidies",
    url: "https://www.jansamarth.in/",
    category: "Guides",
    icon: "💰",
    description:
      "Understand the difference between government loans, subsidies, grants and other forms of financial support.",
    type: "Article",
  },

  {
    id: 7,
    title: "MSME Registration Guide",
    url: "https://udyamregistration.gov.in/",
    category: "Application",
    icon: "🏭",
    description:
      "Learn about MSME registration and why registration can be useful for eligible businesses.",
    type: "Guide",
  },

  {
    id: 8,
    title: "Startup Support Resources",
    url: "https://www.startupindia.gov.in/",
    category: "Guides",
    icon: "🚀",
    description:
      "Explore useful information about startup funding, innovation support and government programs.",
    type: "Guide",
  },

  {
    id: 9,
    title: "Government Scheme Application Checklist",
    url: "https://www.myscheme.gov.in/",
    category: "Documents",
    icon: "✅",
    description:
      "Use this checklist to prepare important information and documents before starting an application.",
    type: "Checklist",
  },

  {
    id: 10,
    title: "Avoid Common Application Mistakes",
    url: "https://www.myscheme.gov.in/",
    category: "Tips",
    icon: "⚠️",
    description:
      "Learn about common mistakes applicants make and how to avoid delays or incomplete applications.",
    type: "Tips",
  },

  {
    id: 11,
    title: "Scheme Eligibility Explained",
    url: "https://www.myscheme.gov.in/",
    category: "FAQs",
    icon: "🔍",
    description:
      "Understand how eligibility conditions such as age, income, category and business type can affect applications.",
    type: "FAQ",
  },

  {
    id: 12,
    title: "Financial Assistance Explained",
    url: "https://www.jansamarth.in/",
    category: "Guides",
    icon: "💳",
    description:
      "Learn how different forms of government financial assistance can support individuals and businesses.",
    type: "Article",
  },
];

/* ====== RESOURCE CATEGORIES ====== */

const resourceCategories = [
  "All",
  "Guides",
  "Application",
  "Documents",
  "FAQs",
  "Tips",
];

/* ====== PAGE ====== */

export default function ResourcesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedResource, setSelectedResource] = useState(null);

  /* ====== FILTER RESOURCES ====== */

  const filteredResources = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesCategory =
        category === "All" ||
        resource.category === category;

      const matchesSearch =
        !searchText ||
        resource.title
          .toLowerCase()
          .includes(searchText) ||
        resource.description
          .toLowerCase()
          .includes(searchText) ||
        resource.category
          .toLowerCase()
          .includes(searchText) ||
        resource.type
          .toLowerCase()
          .includes(searchText);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  /* ====== OPEN RESOURCE ====== */

  const handleOpenResource = (resource) => {
    localStorage.setItem(
      "schemeSaathiSelectedResource",
      JSON.stringify(resource)
    );
    setSelectedResource(resource);
  };

  return (
    <MainLayout>

      <div className="min-h-[calc(100vh-132px)] bg-[#f7f8fc] pb-20">

        {/*==== HERO ===== */}

        <section className="border-b border-slate-200 bg-white">

          <div className="mx-auto max-w-300 px-5 py-12 sm:px-8">

            <div className="mx-auto max-w-190 text-center">

              <div
                className="
                  mx-auto
                  mb-3
                  inline-flex
                  items-center
                  rounded-full
                  bg-[#fff4c7]
                  px-3
                  py-1
                  text-[11px]
                  font-semibold
                  text-[#9b7815]
                "
              >
                SchemeSaathi Resource Centre
              </div>

              <h1
                className="
                  text-[30px]
                  font-extrabold
                  tracking-tight
                  text-[#172b49]
                  sm:text-[34px]
                "
              >
                Learn before you apply
              </h1>

              <p
                className="
                  mx-auto
                  mt-3
                  max-w-170
                  text-[14px]
                  leading-6
                  text-slate-500
                "
              >
                Helpful guides, application information,
                document checklists and answers to common
                questions about government schemes.
              </p>

            </div>

            {/* ================= SEARCH ================= */}

            <div className="mx-auto mt-8 max-w-162.5">

              <div className="relative">

                <span
                  className="
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                >
                  ⌕
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search resources..."
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    pl-10
                    pr-4
                    text-[13px]
                    text-slate-700
                    shadow-sm
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-[#0d2b55]
                    focus:ring-2
                    focus:ring-[#0d2b55]/10
                  "
                />

              </div>

            </div>

          </div>

        </section>

        {/* ====== MAIN CONTENT ====== */}

        <main className="mx-auto max-w-300 px-5 sm:px-8">

          {/* ================= HEADER ================= */}

          <div
            className="
              flex
              flex-col
              gap-4
              py-7
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div>

              <h2 className="text-[17px] font-bold text-[#172b49]">
                Resources
              </h2>

              <p className="mt-1 text-[12px] text-slate-500">
                Explore useful information before applying.
              </p>

            </div>

            <div
              className="
                rounded-lg
                border
                border-slate-200
                bg-white
                px-4
                py-2
                text-[12px]
                font-medium
                text-slate-500
              "
            >
              {filteredResources.length} Resources
            </div>

          </div>

          {/* ====== CATEGORY FILTER ====== */}

          <div className="mb-6 flex flex-wrap gap-2">

            {resourceCategories.map((item) => {

              const active = category === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`
                    rounded-full
                    px-4
                    py-2
                    text-[11px]
                    font-medium
                    transition

                    ${
                      active
                        ? "bg-[#0d2b55] text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }
                  `}
                >
                  {item}
                </button>
              );

            })}

          </div>

          {/* ====== RESOURCE GRID ====== */}

          {filteredResources.length === 0 ? (

            <EmptyResources
              onReset={() => {
                setSearch("");
                setCategory("All");
              }}
            />

          ) : (

            <div
              className="
                grid
                gap-5
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >

              {filteredResources.map((resource) => (

                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onOpen={() =>
                    handleOpenResource(resource)
                  }
                />

              ))}

            </div>

          )}

          {/* ====== QUICK HELP SECTION ====== */}

          <section
            className="
              mt-10
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-6
              shadow-sm
            "
          >

            <div
              className="
                flex
                flex-col
                gap-5
                md:flex-row
                md:items-center
                md:justify-between
              "
            >

              <div>

                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#0d2b55]
                      text-lg
                    "
                  >
                    💡
                  </div>

                  <h2 className="text-[16px] font-bold text-[#172b49]">
                    Not sure where to start?
                  </h2>

                </div>

                <p
                  className="
                    mt-2
                    max-w-162.5
                    text-[12px]
                    leading-5
                    text-slate-500
                  "
                >
                  Use SchemeSaathi AI to provide your
                  details and discover government schemes
                  that may match your profile.
                </p>

              </div>

              <a
                href="/find-schemes"
                className="
                  flex
                  h-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-[#0d2b55]
                  px-5
                  text-[12px]
                  font-semibold
                  text-white
                  transition
                  hover:bg-[#173b70]
                "
              >
                Find Matching Schemes →
              </a>

            </div>

          </section>

        </main>

      </div>

      {selectedResource && (
        <ResourceDetailsModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
        />
      )}

    </MainLayout>
  );
}

/* ====== RESOURCE CARD ====== */

function ResourceCard({
  resource,
  onOpen,
}) {
  return (
    <article
      className="
        group
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.75
        hover:border-slate-300
        hover:shadow-md
      "
    >

      {/* ================= TOP ================= */}

      <div className="flex items-start justify-between gap-3">

        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-[#0d2b55]
            text-xl
          "
        >
          {resource.icon}
        </div>

        <span
          className="
            rounded-full
            bg-[#fff5c9]
            px-2.5
            py-1
            text-[10px]
            font-semibold
            text-[#8c6b00]
          "
        >
          {resource.type}
        </span>

      </div>

      {/* ================= TITLE ================= */}

      <h3
        className="
          mt-5
          text-[16px]
          font-bold
          leading-5
          text-[#172b49]
          transition-colors
          group-hover:text-[#0d2b55]
        "
      >
        {resource.title}
      </h3>

      {/* ================= CATEGORY ================= */}

      <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-[#d8aa2d]">
        {resource.category}
      </p>

      {/* ================= DESCRIPTION ================= */}

      <p
        className="
          mt-3
          min-h-15
          text-[12px]
          leading-5
          text-slate-500
        "
      >
        {resource.description}
      </p>

      {/* ================= BUTTON ================= */}

      <button
        type="button"
        onClick={onOpen}
        className="
          mt-5
          flex
          h-10
          w-full
          items-center
          justify-center
          rounded-lg
          border
          border-slate-200
          bg-white
          text-[12px]
          font-semibold
          text-[#0d2b55]
          transition
          hover:bg-slate-50
        "
      >
        Read Resource →
      </button>

    </article>
  );
}

/* ====== EMPTY STATE ====== */

function EmptyResources({ onReset }) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        px-6
        py-16
        text-center
        shadow-sm
      "
    >

      <div
        className="
          mx-auto
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-full
          bg-slate-100
          text-2xl
        "
      >
        🔎
      </div>

      <h2 className="mt-4 text-lg font-bold text-[#172b49]">
        No resources found
      </h2>

      <p
        className="
          mx-auto
          mt-2
          max-w-md
          text-[13px]
          leading-5
          text-slate-500
        "
      >
        We couldn't find any resource matching your
        search or selected category.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="
          mt-5
          rounded-lg
          bg-[#0d2b55]
          px-5
          py-2.5
          text-[12px]
          font-medium
          text-white
          transition
          hover:bg-[#173b70]
        "
      >
        Clear Filters
      </button>

    </div>
  );
}

function ResourceDetailsModal({ resource, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#172b49]/45 px-5 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resource-dialog-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0d2b55] text-xl">
              {resource.icon}
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#d8aa2d]">
                {resource.category} · {resource.type}
              </p>
              <h2 id="resource-dialog-title" className="mt-1 text-xl font-bold text-[#172b49]">
                {resource.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close resource details"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xl text-slate-500 transition hover:bg-slate-100 hover:text-[#172b49]"
          >
            ×
          </button>
        </div>

        <p className="mt-6 text-[13px] leading-6 text-slate-600">{resource.description}</p>

        <div className="mt-5 rounded-xl bg-[#f7f8fc] p-4">
          <h3 className="text-[13px] font-bold text-[#172b49]">{resourceContent[resource.id].sectionTitle}</h3>
          <p className="mt-2 text-[12px] leading-5 text-slate-600">
            {resourceContent[resource.id].summary}
          </p>
          <ul className="mt-3 space-y-2">
            {resourceContent[resource.id].items.map((item) => (
              <li key={item} className="flex gap-2 text-[12px] leading-5 text-slate-600">
                <span className="font-bold text-[#d8aa2d]">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-slate-200 px-5 text-[12px] font-semibold text-[#0d2b55] transition hover:bg-slate-50"
          >
            Close
          </button>
          <a
            href={resource.url}
            target="_blank"
            rel="noreferrer"
            className="flex h-10 items-center justify-center rounded-lg bg-[#0d2b55] px-5 text-[12px] font-semibold text-white transition hover:bg-[#173b70]"
          >
            Open Official Source ↗
          </a>
        </div>
      </div>
    </div>
  );
}

const resourceContent = {
  1: {
    sectionTitle: "Find a suitable scheme",
    summary: "Start with your needs, then narrow the search using the details that government schemes use for eligibility.",
    items: ["Choose a category such as business, education, agriculture or welfare.", "Check your state, district, age, income and social category requirements.", "Compare benefits, documents and the official application route before deciding."],
  },
  2: {
    sectionTitle: "Application steps",
    summary: "A complete application is easier to process when you prepare before opening the official form.",
    items: ["Read the scheme eligibility rules and application deadline.", "Create an account or sign in on the official portal.", "Upload clear documents, submit the form and save the acknowledgement number."],
  },
  3: {
    sectionTitle: "Document checklist",
    summary: "The exact checklist changes by scheme, but these document groups are commonly requested.",
    items: ["Identity and address proof, such as Aadhaar or another accepted document.", "Bank account details, photograph and income, caste or disability certificate where applicable.", "Business registration, quotation, project report or licence for business-related support."],
  },
  4: {
    sectionTitle: "Common questions",
    summary: "Use these answers as a starting point, then confirm scheme-specific rules on the official portal.",
    items: ["Eligibility depends on the scheme, applicant profile and location.", "Benefits may be financial support, training, insurance, subsidy or a service.", "Only the official department or portal can confirm application status and approval."],
  },
  5: {
    sectionTitle: "Improve your eligibility",
    summary: "Good preparation cannot change a scheme's rules, but it can help you avoid preventable rejection or delay.",
    items: ["Keep personal, bank and business information consistent across documents.", "Apply only when your income, location and activity match the scheme conditions.", "Submit complete, readable documents before the stated deadline."],
  },
  6: {
    sectionTitle: "Loans, subsidies and grants",
    summary: "These forms of support work differently, so compare the financial responsibility before applying.",
    items: ["Loans usually require repayment and may include interest or a beneficiary contribution.", "Subsidies reduce an approved cost or loan burden under defined conditions.", "Grants generally support an approved purpose and may require progress reporting."],
  },
  7: {
    sectionTitle: "MSME registration",
    summary: "Udyam registration gives eligible enterprises an official MSME identity and can support access to selected programs.",
    items: ["Keep Aadhaar, PAN and business or GST details ready as applicable.", "Use only the official Udyam Registration portal.", "Save the registration certificate and update details when required."],
  },
  8: {
    sectionTitle: "Startup support",
    summary: "Startup support can combine funding, incubation, mentoring, innovation programs and market access.",
    items: ["Review whether your venture meets the startup recognition conditions.", "Look for incubators, challenges, funding programs and mentor networks.", "Prepare a concise business plan, problem statement and growth information."],
  },
  9: {
    sectionTitle: "Before you apply",
    summary: "Use this final check to reduce avoidable errors in a government scheme application.",
    items: ["Confirm eligibility and the application deadline.", "Rename and check every document before uploading it.", "Save the submitted form, acknowledgement and any reference number."],
  },
  10: {
    sectionTitle: "Avoid application mistakes",
    summary: "Small inconsistencies can cause delays, clarification requests or rejection.",
    items: ["Do not enter names, dates, income or bank details differently from your documents.", "Do not upload blurred, password-protected or incomplete files.", "Do not pay unofficial agents or use links that are not from a verified government domain."],
  },
  11: {
    sectionTitle: "Eligibility factors",
    summary: "Eligibility is usually a combination of personal, financial, geographic and activity-based conditions.",
    items: ["Personal factors can include age, gender, social category and disability.", "Financial factors can include annual income, assets or business turnover.", "Activity and location factors can include occupation, business stage, state and district."],
  },
  12: {
    sectionTitle: "Types of financial assistance",
    summary: "Understand what kind of support a scheme provides before committing to its application conditions.",
    items: ["Direct benefits may be paid to an eligible beneficiary's bank account.", "Interest support or subsidies may reduce the cost of an approved loan.", "Grants and reimbursements may require invoices, milestones or post-approval reporting."],
  },
};