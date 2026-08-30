import React, { useMemo, useState } from "react";
import { MainLayout } from "../layout";

/* ============================================================
   CATEGORY DATA
============================================================ */

const categories = [
  {
    id: 1,
    name: "Business Loans",
    icon: "💰",
    count: 12,
    description:
      "Financial support and credit facilities to start, expand or manage your business.",
    tags: ["Loans", "Credit", "Finance"],
  },
  {
    id: 2,
    name: "MSME & Industries",
    icon: "🏭",
    count: 18,
    description:
      "Government schemes designed to support micro, small and medium enterprises.",
    tags: ["MSME", "Industry", "Business"],
  },
  {
    id: 3,
    name: "Startup & Innovation",
    icon: "🚀",
    count: 10,
    description:
      "Funding, incubation and other support for startups and innovative businesses.",
    tags: ["Startup", "Innovation", "Funding"],
  },
  {
    id: 4,
    name: "Education & Skills",
    icon: "🎓",
    count: 15,
    description:
      "Scholarships, training and skill development opportunities for individuals.",
    tags: ["Education", "Skills", "Training"],
  },
  {
    id: 5,
    name: "Women Entrepreneurs",
    icon: "👩‍💼",
    count: 9,
    description:
      "Special financial and business support programs for women entrepreneurs.",
    tags: ["Women", "Business", "Finance"],
  },
  {
    id: 6,
    name: "Agriculture & Rural Business",
    icon: "🌾",
    count: 14,
    description:
      "Support for farmers, rural entrepreneurs and agriculture-based businesses.",
    tags: ["Agriculture", "Rural", "Farming"],
  },
  {
    id: 7,
    name: "Employment & Livelihood",
    icon: "💼",
    count: 11,
    description:
      "Schemes supporting employment, self-employment and sustainable livelihoods.",
    tags: ["Employment", "Jobs", "Livelihood"],
  },
  {
    id: 8,
    name: "Housing & Infrastructure",
    icon: "🏠",
    count: 8,
    description:
      "Government assistance related to housing, infrastructure and basic facilities.",
    tags: ["Housing", "Infrastructure", "Development"],
  },
  {
    id: 9,
    name: "Social Welfare",
    icon: "🤝",
    count: 16,
    description:
      "Welfare programs providing assistance and support to eligible citizens.",
    tags: ["Welfare", "Support", "Social"],
  },
  {
    id: 10,
    name: "Financial Assistance",
    icon: "💳",
    count: 13,
    description:
      "Direct financial assistance, subsidies and other monetary benefits.",
    tags: ["Subsidy", "Grant", "Finance"],
  },
  {
    id: 11,
    name: "Digital & Technology",
    icon: "💻",
    count: 7,
    description:
      "Programs helping businesses adopt digital tools, technology and innovation.",
    tags: ["Technology", "Digital", "Innovation"],
  },
  {
    id: 12,
    name: "Health & Insurance",
    icon: "🏥",
    count: 10,
    description:
      "Government programs supporting healthcare, insurance and medical assistance.",
    tags: ["Health", "Insurance", "Healthcare"],
  },
];

/* ============================================================
   PAGE
============================================================ */

export default function CategoriesPage() {
  const [search, setSearch] = useState("");

  /* ==========================================================
     FILTER CATEGORIES
  ========================================================== */

  const filteredCategories = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return categories;
    }

    return categories.filter((category) => {
      return (
        category.name.toLowerCase().includes(searchText) ||
        category.description
          .toLowerCase()
          .includes(searchText) ||
        category.tags.some((tag) =>
          tag.toLowerCase().includes(searchText)
        )
      );
    });
  }, [search]);

  /* ==========================================================
     EXPLORE CATEGORY
  ========================================================== */

  const handleExplore = (category) => {
    /*
     * Save selected category so the Matching Schemes page
     * can use it later if required.
     */

    localStorage.setItem(
      "schemeSaathiSelectedCategory",
      category.name
    );

    /*
     * Go to scheme results.
     */

    window.location.assign(
      "/find-schemes/matching-schemes"
    );
  };

  return (
    <MainLayout>

      <div className="min-h-[calc(100vh-132px)] bg-[#f7f8fc] pb-20">

        {/* ==================================================
            HERO SECTION
        ================================================== */}

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
                Government Scheme Categories
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
                Explore schemes by category
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
                Discover government schemes across business,
                finance, education, employment, agriculture and
                other areas of support.
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
                  placeholder="Search categories..."
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


        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <main className="mx-auto max-w-300 px-5 sm:px-8">

          {/* ================= SUMMARY ================= */}

          <div className="flex flex-col gap-2 py-7 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-[17px] font-bold text-[#172b49]">
                Browse Categories
              </h2>

              <p className="mt-1 text-[12px] text-slate-500">
                Find government support based on your needs.
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
              {filteredCategories.length} Categories
            </div>

          </div>


          {/* ==================================================
              CATEGORY GRID
          ================================================== */}

          {filteredCategories.length === 0 ? (

            <EmptyCategories
              onReset={() => setSearch("")}
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

              {filteredCategories.map((category) => (

                <CategoryCard
                  key={category.id}
                  category={category}
                  onExplore={() =>
                    handleExplore(category)
                  }
                />

              ))}

            </div>

          )}

        </main>

      </div>

    </MainLayout>
  );
}


/* ============================================================
   CATEGORY CARD
============================================================ */

function CategoryCard({
  category,
  onExplore,
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

      <div className="flex items-start justify-between">

        <div
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            bg-[#0d2b55]
            text-2xl
          "
        >
          {category.icon}
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
          {category.count} Schemes
        </span>

      </div>


      {/* ================= TITLE ================= */}

      <h3
        className="
          mt-5
          text-[17px]
          font-bold
          text-[#172b49]
          transition-colors
          group-hover:text-[#0d2b55]
        "
      >
        {category.name}
      </h3>


      {/* ================= DESCRIPTION ================= */}

      <p
        className="
          mt-2
          min-h-15
          text-[12px]
          leading-5
          text-slate-500
        "
      >
        {category.description}
      </p>


      {/* ================= TAGS ================= */}

      <div className="mt-4 flex flex-wrap gap-2">

        {category.tags.map((tag) => (

          <span
            key={tag}
            className="
              rounded-md
              bg-slate-100
              px-2
              py-1
              text-[10px]
              font-medium
              text-slate-600
            "
          >
            {tag}
          </span>

        ))}

      </div>


      {/* ================= BUTTON ================= */}

      <button
        type="button"
        onClick={onExplore}
        className="
          mt-5
          flex
          h-10
          w-full
          items-center
          justify-center
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
        Explore Schemes →
      </button>

    </article>
  );
}


/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyCategories({ onReset }) {
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
        No categories found
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
        We couldn't find a category matching your
        search. Try another keyword.
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
        Clear Search
      </button>

    </div>
  );
}