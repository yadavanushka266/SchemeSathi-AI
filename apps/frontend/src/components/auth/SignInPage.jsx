import React, { useState } from "react";
import AuthLayout from "./AuthLayout";
import AuthCard from "./AuthCard";

export default function SignInPage() {

  const [formData, setFormData] = useState({
    email: "",
    mobile: "",
    password: "",
  });


  /* ================= INPUT CHANGE ================= */

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

  };


  /* ================= LOGIN ================= */

  const handleSubmit = (e) => {

    e.preventDefault();


    if (!formData.email || !formData.password) {

      alert("Please enter your email and password.");

      return;
    }


    /*
      DEMO LOGIN

      Replace this with API.
    */

    const savedUser = localStorage.getItem(
      "schemeSaathiUser"
    );


    if (savedUser) {

      const user = JSON.parse(savedUser);


      if (
        (user.email === formData.email || user.mobile === formData.mobile)
        && user.password === formData.password
      ) {

        localStorage.setItem(
          "schemeSaathiLoggedIn",
          "true"
        );

        alert("Login successful!");

        window.location.href = "/";

        return;

      }

    }


    /*
      Demo mode:
      allow login even if no user exists.
    */

    localStorage.setItem(
      "schemeSaathiLoggedIn",
      "true"
    );


    alert("Login successful!");

    window.location.href = "/";

  };


  return (

    <AuthLayout>

      <AuthCard title="Sign In">

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 max-w-129.5"
        >

          {/* ================= EMAIL ================= */}

          <div className="mb-5">

            <label
              htmlFor="email/mobile"
              className="
                mb-2
                block
                text-[13px]
                font-medium
                text-slate-700
              "
            >
              Email /Mobile Number
            </label>


            <input
              id="email/mobile"
              name="email/mobile"
              type="email/tel"
              placeholder="Enter email/number"
              value={formData.email/mobile}
              onChange={handleChange}
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


          {/* ================= PASSWORD ================= */}

          <div className="mb-2">

            <label
              htmlFor="password"
              className="
                mb-2
                block
                text-[13px]
                font-medium
                text-slate-700
              "
            >
              Password
            </label>


            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
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


          {/* ================= FORGOT PASSWORD ================= */}

          <div className="mb-7 flex justify-end">

            <a
              href="/forgot-password"
              className="
                text-xs
                font-medium
                text-[#d6ab35]
                hover:underline
              "
            >
              Forgot password?
            </a>

          </div>


          {/* ================= SIGN IN BUTTON ================= */}

          <button
            type="submit"
            className="
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
            Sign In
          </button>


          {/* ================= SIGN UP ================= */}

          <p
            className="
              mt-7
              text-center
              text-[13px]
              text-slate-500
            "
          >

            Don't have an account?

            <a
              href="/signup"
              className="
                ml-4
                font-medium
                text-[#d6ab35]
                hover:underline
              "
            >
              Create Account
            </a>

          </p>


          {/* ================= HOME ================= */}

          <a
            href="/"
            className="
              mt-8
              block
              text-center
              text-xs
              text-slate-400
              hover:text-[#0d2b55]
            "
          >
            ← Back to Home
          </a>

        </form>

      </AuthCard>

    </AuthLayout>

  );
}