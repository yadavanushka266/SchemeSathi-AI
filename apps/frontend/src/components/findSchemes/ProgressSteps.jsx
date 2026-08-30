import React from "react";

const steps = [
  { number: 1, label: "Personal Info" },
  { number: 2, label: "Business Details" },
  { number: 3, label: "Other Details" },
  { number: 4, label: "Review" },
];

export default function ProgressSteps({ currentStep = 1 }) {

  const openAssistant = () => {
    window.location.assign("/ai-assistant");
  };

  return (
    <div className="mx-auto w-full max-w-212.5 px-4 pt-5 sm:px-8">

      {/* ================= PROGRESS STEPS ================= */}

      <div className="relative">

        {/* Connecting line */}

        <div className="
          absolute
          left-[9%]
          right-[9%]
          top-4.5
          h-0.5
          bg-slate-200
        " />

        <div className="relative grid grid-cols-4">

          {steps.map((step) => {

            const active =
              step.number <= currentStep;

            return (
              <div
                key={step.number}
                className="flex flex-col items-center text-center"
              >

                <div
                  className={`
                    relative
                    z-10
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    border
                    text-[13px]
                    font-medium
                    ${
                      active
                        ? "border-[#d7aa2d] bg-[#e4b32e] text-white"
                        : "border-[#d7aa2d] bg-white text-slate-600"
                    }
                  `}
                >
                  {step.number}
                </div>

                <span
                  className={`
                    mt-2
                    text-[11px]
                    ${
                      active
                        ? "font-medium text-slate-700"
                        : "text-slate-500"
                    }
                  `}
                >
                  {step.label}
                </span>

              </div>
            );
          })}

        </div>

      </div>


      {/* ================= AI MIC ================= */}

      <div className="mt-5 flex justify-center">

        <button
          type="button"
          onClick={openAssistant}
          title="Open AI Scheme Assistant"
          className="
            group
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            border
            border-[#d7aa2d]
            bg-white
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

          {/* Microphone SVG */}

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <rect
              x="9"
              y="2"
              width="6"
              height="12"
              rx="3"
            />

            <path d="M5 10a7 7 0 0 0 14 0" />

            <line
              x1="12"
              y1="19"
              x2="12"
              y2="22"
            />

            <line
              x1="8"
              y1="22"
              x2="16"
              y2="22"
            />

          </svg>

        </button>

      </div>

      <p className="
        mt-1.5
        text-center
        text-[10px]
        text-slate-400
      ">
        Ask AI Assistant
      </p>

    </div>
  );
}