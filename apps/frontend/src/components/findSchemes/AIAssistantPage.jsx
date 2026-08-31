import React, { useState } from "react";
import Header from "../layout/Header";
import { Footer } from "../layout";

export default function AIAssistantPage() {
  const [message, setMessage] = useState("");

  const [conversations] = useState([
    "Best loans for women entrepreneurs",
    "Subsidies for rural manufacturing units",
    "Schemes for SC category startups",
    "Training programs in UP",
  ]);

  const suggestedQuestions = [
    "Tell me about PMEGP",
    "How to apply for Stand-Up India?",
    "More schemes for handicrafts",
  ];

  const openVoiceAssistant = () => {
    window.location.assign("/voice-assistant");
  };

  const handleSend = () => {
    if (!message.trim()) return;

    console.log("User message:", message);

    // Later you can connect this with your AI/backend API
    setMessage("");
  };

  const handleSuggestion = (question) => {
    setMessage(question);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#172b49]">

      {/* ======== MAIN NAVBAR ====== */}

      <Header />


      {/* ============= AI ASSISTANT AREA ============= */}

      <div
        className="
          flex
          h-[calc(100vh-70px)]
          min-h-150
          w-full
          overflow-hidden
          bg-white
        "
      >

        {/* ======== LEFT SIDEBAR ====== */}

        <aside
          className="
            hidden
            w-58
            shrink-0
            flex-col
            bg-[#0d2b55]
            text-white
            md:flex
          "
        >

          {/* ================= NEW CHAT ================= */}

          <div className="px-7 pt-12">

            <button
              type="button"
              onClick={() => setMessage("")}
              className="
                flex
                h-10.5
                w-full
                items-center
                justify-center
                rounded-lg
                border
                border-[#d7aa2d]
                bg-[#0d2b55]
                text-[12px]
                font-medium
                text-white
                transition
                hover:bg-[#173b70]
              "
            >
              + New Chat
            </button>

          </div>


          {/* ================= RECENT CONVERSATIONS ================= */}

          <div className="px-7 pt-8">

            <p
              className="
                text-[12px]
                font-medium
                tracking-wide
                text-[#e4b32e]
              "
            >
              Recent Conversations
            </p>


            <div className="mt-5 space-y-5">

              {conversations.map((conversation, index) => (
                <button
                  key={index}
                  type="button"
                  className="
                    block
                    w-full
                    text-left
                    text-[11px]
                    leading-5
                    text-white/90
                    transition
                    hover:text-[#e4b32e]
                  "
                >
                  {conversation}
                </button>
              ))}

            </div>

          </div>




        </aside>


        {/* ============= MAIN CHAT AREA ============= */}

        <main className="flex min-w-0 flex-1 flex-col">

          {/* ============ CHAT HEADER =========== */}

          <div className="px-7 pt-5 sm:px-9">

            <h1
              className="
                text-[20px]
                font-extrabold
                tracking-[-0.02em]
                text-[#172b49]
              "
            >
              AI Scheme Assistant
            </h1>

            <p
              className="
                mt-0.5
                text-[10px]
                text-slate-400
              "
            >
              Ask in your own words — text or voice
            </p>

          </div>


          {/* ============= CHAT CONTENT ============= */}

          <div
            className="
              flex
              flex-1
              flex-col
              overflow-hidden
            "
          />

            <div
              className="
                flex
                flex-1
                flex-col
                px-7
                pt-4
                sm:px-9
              "
            >

              {/* ============ USER MESSAGE =========== */}

              <div className="flex justify-end">

                <div
                  className="
                    max-w-[65%]
                    rounded-2xl
                    bg-[#0d2b55]
                    px-6
                    py-3
                    text-[11px]
                    leading-5
                    text-white
                    shadow-sm
                  "
                >
                  I am a woman entrepreneur from Lucknow,
                  running a handicraft business. What schemes
                  can help me?
                </div>

              </div>


              {/* ============ AI RESPONSE =========== */}

              <div className="mt-5">

                <div
                  className="
                    max-w-[72%]
                    rounded-2xl
                    border
                    border-slate-200
                    bg-[#f8f9fc]
                    px-6
                    py-5
                    shadow-sm
                  "
                >

                  <p
                    className="
                      text-[11px]
                      leading-5
                      text-slate-700
                    "
                  >
                    Based on your profile, here are the top
                    schemes you may be eligible for:
                  </p>


                  <div className="mt-4 space-y-2.5">

                    <p className="text-[11px] text-slate-700">
                      <span className="font-medium">1.</span>{" "}
                      Mahila Udyam Nidhi Scheme — Loan up to
                      ₹10 Lakh
                    </p>

                    <p className="text-[11px] text-slate-700">
                      <span className="font-medium">2.</span>{" "}
                      PMEGP — Subsidy up to 35% for
                      manufacturing & service units
                    </p>

                    <p className="text-[11px] text-slate-700">
                      <span className="font-medium">3.</span>{" "}
                      Stand-Up India — Loan between ₹10 Lakh
                      to ₹1 Crore
                    </p>

                    <p className="text-[11px] text-slate-700">
                      <span className="font-medium">4.</span>{" "}
                      Udyam Registration Benefits — Access to
                      multiple government benefits
                    </p>

                  </div>

                </div>

              </div>


              {/* ============= SUGGESTED QUESTIONS ============= */}

              <div
                className="
                  mt-5
                  flex
                  flex-wrap
                  gap-3
                "
              >

                {suggestedQuestions.map((question) => (

                  <button
                    key={question}
                    type="button"
                    onClick={() => handleSuggestion(question)}
                    className="
                      rounded-lg
                      border
                      border-[#d7aa2d]
                      bg-white
                      px-5
                      py-2
                      text-[10px]
                      font-medium
                      text-slate-700
                      transition
                      hover:bg-[#fff9df]
                    "
                  >
                    {question}
                  </button>

                ))}

              </div>

            </div>


            {/* ======= MESSAGE INPUT ======= */}

            <div
              className="
                px-7
                pb-3
                sm:px-9
              "
            >

              <div className="flex items-center gap-5">

                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="
                    h-11.25
                    min-w-0
                    flex-1
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-5
                    text-[11px]
                    text-slate-700
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-[#0d2b55]
                    focus:ring-2
                    focus:ring-[#0d2b55]/10
                  "
                />

                <div className="mt-5 flex justify-center">

        <button
          type="button"
          onClick={openVoiceAssistant}
          title="Open Voice Assistant"
          className="
             rounded-border-lg
            border-[#d7aa2d]
            bg-white
            px-5
            py-2
            text-[12px]
            font-semibold
            text-[#0d2b55]
            shadow-sm
            transition-all
            duration-200
            hover:bg-[#0d2b55]
            hover:text-white
            hover:shadow-md
            active:scale-95
          "
        >
          🎤
        </button>

                {/* SEND BUTTON */}

                <button
                  type="button"
                  onClick={handleSend}
                  className="
                    flex
                    h-11.25
                    w-11.25
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#e4b32e]
                    text-[#0d2b55]
                    shadow-sm
                    transition
                    hover:bg-[#d7aa2d]
                    active:scale-95
                  "
                  aria-label="Send message"
                >
                  ➤
                </button>

              </div>

            </div>

          </div>




        </main>

      </div>

      <Footer />

    </div>
  );
}