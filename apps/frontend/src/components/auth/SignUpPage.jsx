import React, { useState } from "react";
import AuthLayout from "./AuthLayout";
import AuthCard from "./AuthCard";

export default function SignUpPage() {

  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    password: "",
    agreed: false,
  });


  /* ================= HANDLE INPUT ================= */

  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,

      [name]: type === "checkbox"
        ? checked
        : value,
    }));

  };


  /* ================= SUBMIT ================= */

  const handleSubmit = (e) => {

    e.preventDefault();


    /* Terms validation */

    if (!formData.agreed) {

      alert(
        "Please agree to the Terms of Service and Privacy Policy."
      );

      return;
    }


    /* Basic validation */

    if (
      !formData.fullName ||
      !formData.mobile ||
      !formData.email ||
      !formData.password
    ) {

      alert("Please fill all the fields.");

      return;
    }


    /*
      DEMO USER STORAGE

      Replace this with your backend API later.
    */

    const user = {
      fullName: formData.fullName,
      mobile: formData.mobile,
      email: formData.email,
    };


    localStorage.setItem(
      "schemeSaathiUser",
      JSON.stringify(user)
    );


    alert("Account created successfully!");


    /* Navigate to Sign In */

    window.location.href = "/signin";

  };


  return (

    <AuthLayout>

      <AuthCard title="Create Account">

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 max-w-129.5"
        >

          {/* ================= FULL NAME ================= */}

          <FormInput
            label="Full Name"
            name="fullName"
            type="text"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
          />


          {/* ================= MOBILE ================= */}

          <FormInput
            label="Mobile Number"
            name="mobile"
            type="tel"
            placeholder="Enter mobile number"
            value={formData.mobile}
            onChange={handleChange}
          />


          {/* ================= EMAIL ================= */}

          <FormInput
            label="Email Address"
            name="email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={handleChange}
          />


          {/* ================= PASSWORD ================= */}

          <FormInput
            label="Password"
            name="password"
            type="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
          />


          {/* ================= TERMS ================= */}

          <label
            className="
              mt-7
              flex
              cursor-pointer
              items-start
              gap-2
              text-[12px]
              text-slate-500
            "
          >

            <input
              type="checkbox"
              name="agreed"
              checked={formData.agreed}
              onChange={handleChange}
              className="
                mt-0.5
                h-3.5
                w-3.5
                accent-[#0d2b55]
              "
            />

            <span>
              I agree to the Terms of Service and Privacy Policy
            </span>

          </label>


          {/* ================= CREATE BUTTON ================= */}

          <button
            type="submit"
            className="
              mt-6
              h-11
              w-full
              rounded-lg
              bg-[#0d2b55]
              text-[13px]
              font-medium
              text-white
              transition
              hover:bg-[#173b70]
              active:scale-[0.99]
            "
          >
            Create Account
          </button>


          {/* ================= SIGN IN ================= */}

          <p
            className="
              mt-7
              text-center
              text-[13px]
              text-slate-500
            "
          >

            Already have an account?

            <a
              href="/signin"
              className="
                ml-4
                font-medium
                text-[#d6ab35]
                hover:underline
              "
            >
              Sign In
            </a>

          </p>

        </form>

      </AuthCard>

    </AuthLayout>

  );
}


/* =====================================================
   REUSABLE INPUT COMPONENT
===================================================== */

function FormInput({
  label,
  name,
  type,
  placeholder,
  value,
  onChange,
}) {

  return (

    <div className="mb-5">

      <label
        htmlFor={name}
        className="
          mb-2
          block
          text-[13px]
          font-medium
          text-slate-700
        "
      >
        {label}
      </label>


      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className="
          h-11
          w-full
          rounded-lg
          border
          border-slate-300
          bg-white
          px-3.5
          text-[13px]
          text-slate-700
          outline-none
          transition

          placeholder:text-slate-400

          focus:border-[#0d2b55]

          focus:ring-2
          focus:ring-[#0d2b55]/10
        "
      />

    </div>

  );
}