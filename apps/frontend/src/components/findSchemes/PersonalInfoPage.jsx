import React, { useState } from "react";
import ProgressSteps from "./ProgressSteps";
import WhyAskCard from "./WhyAskCard";
import { MainLayout } from "../layout";

/* ============================================================
   INITIAL FORM
============================================================ */

const initialForm = {
  fullName: "",
  age: "",
  gender: "",
  category: "",
  state: "",
  district: "",
};

/* ============================================================
   OPTIONS
============================================================ */

const genders = [
  "Male",
  "Female",
  "Other",
  "Prefer not to say",
];

const categories = [
  "SC/ST",
  "OBC",
  "PwD",
  "Minority",
  "General",
  "Other",
];

const states = [
  "Andhra Pradesh",
  "Bihar",
  "Delhi",
  "Gujarat",
  "Haryana",
  "Jharkhand",
  "Karnataka",
  "Madhya Pradesh",
  "Maharashtra",
  "Rajasthan",
  "Tamil Nadu",
  "Uttar Pradesh",
  "West Bengal",
];

const districts = [
  "Agra",
  "Ghaziabad",
  "Gautam Buddha Nagar",
  "Kanpur Nagar",
  "Lucknow",
  "Meerut",
  "Varanasi",
];

/* ============================================================
   LOCAL STORAGE KEY
============================================================ */

const PERSONAL_STORAGE_KEY = "schemeSaathiPersonalDetails";

/* ============================================================
   LOAD SAVED PERSONAL INFORMATION
============================================================ */

function getSavedPersonalInfo() {
  try {
    const saved = localStorage.getItem(PERSONAL_STORAGE_KEY);

    if (!saved) {
      return { ...initialForm };
    }

    const parsed = JSON.parse(saved);

    return {
      ...initialForm,
      ...parsed,
    };
  } catch (error) {
    console.error(
      "Unable to load personal information:",
      error
    );

    return { ...initialForm };
  }
}

/* ============================================================
   PAGE
============================================================ */

export default function PersonalInfoPage() {
  const editMode = sessionStorage.getItem(
    "schemeSaathiEditMode"
  );

  const isEditMode = editMode === "personal";

  /* ==========================================================
     FORM STATE
  ========================================================== */

  const [form, setForm] = useState(() => {
    if (isEditMode) {
      return getSavedPersonalInfo();
    }

    return {
      ...initialForm,
    };
  });

  /* ==========================================================
     HANDLE CHANGE
  ========================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* ==========================================================
     VALIDATION
  ========================================================== */

  const validateForm = () => {
    if (!form.fullName.trim()) {
      alert("Please enter your full name.");
      return false;
    }

    if (!form.age) {
      alert("Please enter your age.");
      return false;
    }

    const age = Number(form.age);

    if (!Number.isInteger(age) || age < 1 || age > 120) {
      alert("Please enter a valid age between 1 and 120.");
      return false;
    }

    if (!form.gender) {
      alert("Please select your gender.");
      return false;
    }

    if (!form.category) {
      alert("Please select your social category.");
      return false;
    }

    if (!form.state) {
      alert("Please select your state.");
      return false;
    }

    if (!form.district) {
      alert("Please select your district.");
      return false;
    }

    return true;
  };

  /* ==========================================================
     CONTINUE
  ========================================================== */

  const handleContinue = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

  const isEditing =
    sessionStorage.getItem("schemeSaathiEditMode") ===
    "personal";

    localStorage.setItem(
      PERSONAL_STORAGE_KEY,
      JSON.stringify(form)
    );

    sessionStorage.removeItem("schemeSaathiEditMode");

    if (isEditing) {
    window.location.assign("/find-schemes/review");
    return;
  }


    window.location.assign(
      "/find-schemes/business-details"
    );
  };

  const handleBack = () => {
    sessionStorage.removeItem("schemeSaathiEditMode");

    window.location.assign("/");
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-132px)] bg-[#f7f8fc] pb-20">

        {/* PROGRESS */}

        <ProgressSteps currentStep={1} />

        {/* CONTENT */}

        <div className="mx-auto max-w-287.5 px-5 sm:px-8">

          {/* HEADING */}

          <div className="mt-9">
            <h1 className="text-[27px] font-extrabold tracking-[-0.02em] text-[#172b49]">
              {isEditMode
                ? "Update your personal information"
                : "Let’s start with some basic information"}
            </h1>

            <p className="mt-2 text-[13px] text-slate-500">
              {isEditMode
                ? "Update your information and continue."
                : "Please provide your basic information to find suitable government schemes."}
            </p>
          </div>

          {/* MAIN GRID */}

          <div className="mt-6 grid gap-7 lg:grid-cols-[1fr_330px]">

            {/* FORM CARD */}

            <section className="rounded-2xl border border-slate-200 bg-white px-5 py-7 shadow-sm sm:px-6">

              <form
                id="personal-info-form"
                onSubmit={handleContinue}
              >

                <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">

                  {/* FULL NAME */}

                  <FormInput
                    label="Full Name"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={form.fullName}
                    onChange={handleChange}
                  />

                  {/* AGE */}

                  <FormInput
                    label="Age"
                    name="age"
                    type="number"
                    placeholder="Enter age"
                    value={form.age}
                    onChange={handleChange}
                    min="1"
                    max="120"
                  />

                  {/* GENDER */}

                  <FormSelect
                    label="Gender"
                    name="gender"
                    placeholder="Select Gender"
                    value={form.gender}
                    onChange={handleChange}
                    options={genders}
                  />

                  {/* CATEGORY */}

                  <FormSelect
                    label="Social Category"
                    name="category"
                    placeholder="Select Category"
                    value={form.category}
                    onChange={handleChange}
                    options={categories}
                  />

                  {/* STATE */}

                  <FormSelect
                    label="State"
                    name="state"
                    placeholder="Select State"
                    value={form.state}
                    onChange={handleChange}
                    options={states}
                  />

                  {/* DISTRICT */}

                  <FormSelect
                    label="District"
                    name="district"
                    placeholder="Select District"
                    value={form.district}
                    onChange={handleChange}
                    options={districts}
                  />

                </div>
              </form>

            </section>

            {/* WHY ASK */}

            <WhyAskCard />

          </div>

          {/* BUTTONS */}

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            {/* BACK */}

            <button
              type="button"
              onClick={handleBack}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-8 text-[13px] font-medium text-[#0d2b55] transition hover:bg-slate-50 sm:w-37.5"
            >
              ← Back
            </button>

            {/* CONTINUE */}

            <button
              type="submit"
              form="personal-info-form"
              className="h-11 w-full rounded-lg bg-[#0d2b55] px-8 text-[13px] font-medium text-white shadow-sm transition hover:bg-[#173b70] active:scale-[0.99] sm:w-58"
            >
              Continue →
            </button>

          </div>

        </div>
      </div>
    </MainLayout>
  );
}

/* ============================================================
   INPUT COMPONENT
============================================================ */

function FormInput({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  min,
  max,
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-[13px] font-medium text-slate-700">
        {label}
      </span>

      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        required
        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-[13px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0d2b55] focus:ring-2 focus:ring-[#0d2b55]/10"
      />

    </label>
  );
}

/* ============================================================
   SELECT COMPONENT
============================================================ */

function FormSelect({
  label,
  name,
  placeholder,
  value,
  onChange,
  options,
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-[13px] font-medium text-slate-700">
        {label}
      </span>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required
        className={`h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-[13px] outline-none transition focus:border-[#0d2b55] focus:ring-2 focus:ring-[#0d2b55]/10 ${
          value
            ? "text-slate-700"
            : "text-slate-400"
        }`}
      >

        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}

      </select>

    </label>
  );
}