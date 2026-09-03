import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f6f7fa] text-[#172b49]">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
