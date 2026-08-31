import React, { useState } from "react";
import logo from "../logo.jpg";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Find Schemes", href: "/find-schemes" },
  { label: "Categories", href: "/categories" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Get current URL
  const currentPath =
    window.location.pathname.replace(/\/+$/, "") || "/";

  // Check active navigation item
  const isActive = (href) => {
    // Home
    if (href === "/") {
      return currentPath === "/";
    }

    // Find Schemes and all its pages
    if (href === "/find-schemes") {
      return (
        currentPath === "/find-schemes" ||
        currentPath.startsWith("/find-schemes/")
      );
    }

    // Other pages
    return (
      currentPath === href ||
      currentPath.startsWith(`${href}/`)
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">

      <div className="mx-auto flex h-17.5 max-w-7xl items-center px-4 sm:px-6 lg:px-10">

        {/* ============= LEFT SIDE =========== */}

        <div className="flex min-w-0 items-center">

          {/* ================= MOBILE MENU ================= */}

          <div className="mr-3 lg:hidden">

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-lg
                border
                border-slate-200
                bg-white
                text-[#0d2b55]
                transition
                hover:bg-slate-50
              "
            >

              {menuOpen ? (
                <span className="text-xl font-semibold">
                  ×
                </span>
              ) : (
                <div className="flex flex-col gap-1">
                  <span className="block h-0.5 w-5 bg-[#0d2b55]" />
                  <span className="block h-0.5 w-5 bg-[#0d2b55]" />
                  <span className="block h-0.5 w-5 bg-[#0d2b55]" />
                </div>
              )}

            </button>

          </div>


          {/* ================= LOGO ================= */}

          <img src={logo} alt="Logo" className="h-10 w-auto" />

        </div>


        {/* ====== DESKTOP NAVIGATION ====== */}

        <nav className="ml-auto hidden items-center gap-7 lg:flex xl:gap-10">

          {navItems.map((item) => {

            const active = isActive(item.href);

            return (
              <a
                key={item.label}
                href={item.href}
                className={`
                  whitespace-nowrap
                  text-[14px]
                  font-medium
                  transition-colors

                  ${
                    active
                      ? "text-[#d8aa2d]"
                      : "text-slate-700 hover:text-[#0d2b55]"
                  }
                `}
              >
                {item.label}
              </a>
            );

          })}

        </nav>


        {/* ====== RIGHT SIDE ACTIONS ====== */}

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3 lg:ml-7">

          {/* ================= LANGUAGE ================= */}

          <button
            type="button"
            className="
              hidden
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              px-4
              py-2.5
              text-sm
              font-medium
              text-slate-700
              xl:block
            "
          >
            English
          </button>


          {/* ================= SIGN IN ================= */}

          <a
            href="/signin"
            className="
              rounded-xl
              bg-[#0d2b55]
              px-4
              py-2.5
              text-sm
              font-medium
              text-white
              transition
              hover:bg-[#173b70]
              sm:px-5
            "
          >
            Sign in
          </a>

        </div>

      </div>


      {/* ====== MOBILE / TABLET DROPDOWN MENU ====== */}

      {menuOpen && (
        <div
          className="
            border-t
            border-slate-200
            bg-white
            shadow-md
            lg:hidden
          "
        >

          <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-6">

            <div className="flex flex-col">

              {navItems.map((item) => {

                const active = isActive(item.href);

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`
                      rounded-lg
                      px-4
                      py-3
                      text-[14px]
                      font-medium
                      transition

                      ${
                        active
                          ? "bg-[#f7f8fc] text-[#d8aa2d]"
                          : "text-slate-700 hover:bg-slate-50 hover:text-[#0d2b55]"
                      }
                    `}
                  >
                    {item.label}
                  </a>
                );

              })}

            </div>

          </nav>

        </div>
      )}

    </header>
  );
}