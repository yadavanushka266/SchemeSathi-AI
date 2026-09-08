import React, { useEffect, useRef, useState } from "react";
import FormattedText from "./FormattedText";
import Header from "../layout/Header";
import { Footer } from "../layout";
import { sendAssistantMessage } from "../../lib/api";
import { useLanguage } from "../../lib/i18n.jsx";

import { FaMicrophone } from "react-icons/fa";

const STORAGE_KEY = "schemeSaathiAssistantHistory";

function loadHistory() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function getPhoneNumber() {
  try {
    const saved = localStorage.getItem("schemeSaathiPersonalDetails");
    return saved ? JSON.parse(saved)?.phoneNumber : null;
  } catch {
    return null;
  }
}

const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "Hi! I'm the AI Scheme Assistant. Ask me about any government scheme, what documents you need, or how to apply -- in your own words.",
};

const suggestedQuestions = [
  "Tell me about PMEGP",
  "How to apply for Stand-Up India?",
  "More schemes for handicrafts",
];

export default function AIAssistantPage() {
  const { t } = useLanguage();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(() => {
    const saved = loadHistory();
    return saved.length > 0 ? saved : [WELCOME_MESSAGE];
  });
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openVoiceAssistant = () => {
    window.location.assign("/voice-assistant");
  };

  const handleNewChat = () => {
    setMessages([WELCOME_MESSAGE]);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const handleSend = async () => {
    const text = message.trim();
    if (!text || isSending) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setMessage("");
    setIsSending(true);

    try {
      const history = nextMessages
        .filter((m) => m !== WELCOME_MESSAGE && !m.content.startsWith("Sorry, I couldn't reach"))
        .map((m) => ({ role: m.role, content: m.content }));

      const result = await sendAssistantMessage(text, history, getPhoneNumber());

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: result.reply,
          schemes: result.retrieved_schemes || [],
        },
      ]);
    } catch (error) {
      console.error("Assistant request failed:", error);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "Sorry, I couldn't reach the assistant right now. Please check your connection and try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
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
              onClick={handleNewChat}
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


          {/* ================= SUGGESTED QUESTIONS ================= */}

          <div className="px-7 pt-8">

            <p
              className="
                text-[12px]
                font-medium
                tracking-wide
                text-[#e4b32e]
              "
            >
              Try asking
            </p>


            <div className="mt-5 space-y-5">

              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestion(question)}
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
                  {question}
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
              {t("assistant_title")}
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


          {/* ============= CHAT MESSAGES ============= */}

          <div
            className="
              flex
              flex-1
              flex-col
              overflow-y-auto
              px-7
              pt-4
              sm:px-9
            "
          >

            {messages.map((entry, index) =>
              entry.role === "user" ? (
                <div key={index} className="flex justify-end">
                  <div
                    className="
                      mb-5
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
                    {entry.content}
                  </div>
                </div>
              ) : (
                <div key={index} className="mb-5">
                  <div
                    className="
                      max-w-[85%]
                      rounded-2xl
                      border
                      border-slate-200
                      bg-[#f8f9fc]
                      px-6
                      py-5
                      shadow-sm
                    "
                  >
                    <FormattedText content={entry.content} />

                    {/* ATTACHED SCHEME CARDS */}
                    {entry.schemes?.length > 0 && (
                      <div className="mt-4 border-t border-slate-200 pt-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#0d2b55]">
                          Official Schemes Referenced ({entry.schemes.length})
                        </p>
                        <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
                          {entry.schemes.map((s, sIdx) => (
                            <div
                              key={sIdx}
                              className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs transition hover:border-[#d7aa2d]"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-[11px] font-bold text-[#172b49] line-clamp-2">
                                  {s.scheme_name}
                                </h4>
                                {s.level && (
                                  <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600">
                                    {s.level}
                                  </span>
                                )}
                              </div>
                              {s.benefits && (
                                <p className="mt-1.5 text-[10px] text-slate-500 line-clamp-2">
                                  {s.benefits}
                                </p>
                              )}
                              <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                                {s.official_url ? (
                                  <a
                                    href={s.official_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] font-semibold text-[#0d2b55] hover:underline"
                                  >
                                    Official Portal ↗
                                  </a>
                                ) : (
                                  <span className="text-[10px] text-slate-400">Government Portal</span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleSuggestion(`Tell me eligibility and documents for ${s.scheme_name}`)}
                                  className="text-[9px] font-medium text-[#9b7815] hover:underline"
                                >
                                  Ask Eligibility →
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}

            {isSending && (
              <div className="mb-5">
                <div className="inline-block max-w-[72%] rounded-2xl border border-slate-200 bg-[#f8f9fc] px-6 py-4 shadow-sm">
                  <p className="text-[11px] leading-5 text-slate-400">Thinking...</p>
                </div>
              </div>
            )}

            <div ref={scrollRef} />

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
                placeholder={t("assistant_placeholder")}
                disabled={isSending}
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
                  disabled:bg-slate-50
                "
              />

              <button
                type="button"
                onClick={openVoiceAssistant}
                title="Open Voice Assistant"
                className="
                  flex
                  h-11.25
                  w-11.25
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-[#d7aa2d]
                  bg-white
                  text-[12px]
                  font-semibold
                  text-[#0d2b55]
                "
              >
                <FaMicrophone />
              </button>

              {/* SEND BUTTON */}

              <button
                type="button"
                onClick={handleSend}
                disabled={isSending || !message.trim()}
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
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
                aria-label="Send message"
              >
                ➤
              </button>

            </div>

          </div>

        </main>

      </div>

      <Footer />

    </div>
  );
}
