import React, { useEffect, useMemo, useState } from "react";
import { MainLayout } from "../layout";
import { fetchCategorySchemes } from "../../lib/api";

export default function CategorySchemesPage({ category }) {
  const [search, setSearch] = useState("");
  const [schemes, setSchemes] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    setStatus("loading");
    fetchCategorySchemes(category)
      .then((result) => {
        setSchemes(result.schemes || []);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [category]);

  const filteredSchemes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return schemes;

    return schemes.filter((scheme) =>
      [scheme.scheme_name, scheme.description, scheme.benefits, scheme.level]
        .some((value) => String(value || "").toLowerCase().includes(query))
    );
  }, [schemes, search]);

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-132px)] bg-[#f7f8fc] pb-20">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-300 px-5 py-10 sm:px-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <span className="inline-flex rounded-full bg-[#fff4c7] px-3 py-1 text-[11px] font-semibold text-[#9b7815]">
                  Government Schemes
                </span>
                <h1 className="mt-3 text-[28px] font-extrabold tracking-tight text-[#172b49] sm:text-[34px]">
                  {category}
                </h1>
                <p className="mt-2 max-w-170 text-[14px] leading-6 text-slate-500">
                  Browse all schemes related to this category from the SchemeSathi dataset.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
                <p className="text-[11px] font-medium text-slate-400">SCHEMES FOUND</p>
                <p className="mt-1 text-2xl font-extrabold text-[#0d2b55]">
                  {status === "ready" ? filteredSchemes.length : "-"}
                </p>
              </div>
            </div>

            <div className="relative mt-7 max-w-162.5">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search schemes..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-[13px] text-slate-700 outline-none transition focus:border-[#0d2b55] focus:ring-2 focus:ring-[#0d2b55]/10"
              />
            </div>
          </div>
        </section>

        <main className="mx-auto max-w-300 px-5 pt-8 sm:px-8">
          {status === "loading" && <StatusMessage title="Loading schemes..." body="Getting the latest schemes in this category." />}
          {status === "error" && <StatusMessage title="Couldn't load schemes" body="Please try again in a moment." />}
          {status === "ready" && filteredSchemes.length === 0 && (
            <StatusMessage title="No schemes found" body="Try a different search term in this category." />
          )}
          {status === "ready" && filteredSchemes.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2">
              {filteredSchemes.map((scheme, index) => (
                <SchemeCard key={`${scheme.scheme_name}-${index}`} scheme={scheme} />
              ))}
            </div>
          )}
        </main>
      </div>
    </MainLayout>
  );
}

function SchemeCard({ scheme }) {
  const openOfficialPage = () => {
    if (scheme.official_url) {
      window.open(scheme.official_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0d2b55] text-lg font-bold text-[#f4c63d]">₹</div>
          <div>
            <h2 className="text-[16px] font-bold leading-5 text-[#172b49]">{scheme.scheme_name}</h2>
            <p className="mt-1 text-[11px] text-slate-400">{scheme.level || "Government scheme"}</p>
          </div>
        </div>
        <span className="rounded-full bg-[#fff5c9] px-2.5 py-1 text-[10px] font-semibold text-[#8c6b00]">Scheme</span>
      </div>

      <p className="mt-4 text-[12px] leading-5 text-slate-500">{scheme.description || "Government support scheme."}</p>
      <div className="mt-4 rounded-xl bg-slate-50 p-3">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Benefits</p>
        <p className="mt-1 text-[13px] leading-5 font-bold text-[#172b49]">{scheme.benefits || "See the official scheme guidelines."}</p>
      </div>
      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="text-[11px] font-semibold text-[#172b49]">Eligibility</p>
        <p className="mt-1 text-[11px] leading-5 text-slate-500">{scheme.eligibility || "Check the official eligibility requirements."}</p>
      </div>
      <button type="button" onClick={openOfficialPage} className="mt-5 h-10 w-full rounded-lg bg-[#0d2b55] text-[12px] font-semibold text-white transition hover:bg-[#173b70] active:scale-[0.99]">
        Visit Official Scheme Page ↗
      </button>
    </article>
  );
}

function StatusMessage({ title, body }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <h2 className="text-lg font-bold text-[#172b49]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-[13px] leading-5 text-slate-500">{body}</p>
    </div>
  );
}
