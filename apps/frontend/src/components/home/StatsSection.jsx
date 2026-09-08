import React, { useEffect, useState } from "react";
import { fetchDatasetCompleteness, fetchSchemeCount } from "../../lib/api";

export default function StatsSection() {
  const [schemeCount, setSchemeCount] = useState(null);
  const [completeness, setCompleteness] = useState(null);

  useEffect(() => {
    fetchSchemeCount()
      .then(setSchemeCount)
      .catch(() => setSchemeCount(null));
    fetchDatasetCompleteness()
      .then(setCompleteness)
      .catch(() => setCompleteness(null));
  }, []);

  const stats = [
    { value: schemeCount === null ? "-" : schemeCount, label: "Government Schemes" },
    { value: "25+", label: "States & UTs Covered" },
    { value: completeness === null ? "-" : `${completeness}%`, label: "Dataset Completeness" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-8 lg:px-10">
      <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex min-h-24 flex-col items-center justify-center px-5 py-5 text-center"
          >
            <div className="text-[26px] font-extrabold tracking-[-0.02em] text-[#172b49]">
              {stat.value}
            </div>
            <div className="mt-1 text-[12px] font-medium text-slate-500">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
