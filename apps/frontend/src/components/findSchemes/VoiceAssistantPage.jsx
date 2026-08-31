import React, { useEffect, useRef, useState } from "react";
import Header from "../layout/Header";
import { Footer } from "../layout";


export default function VoiceAssistantPage() {

  /* ============================================================
     STATE
  ============================================================ */

  const [isListening, setIsListening] = useState(false);

  const [transcript, setTranscript] = useState("");

  const [profile, setProfile] = useState({
    businessType: "Dairy Business",
    location: "Rajasthan",
    requirement: "Loan of ₹5 Lakh",
    businessStage: "Existing business",
  });

  const recognitionRef = useRef(null);


  /* ============================================================
     SPEECH RECOGNITION SETUP
  ============================================================ */

  useEffect(() => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {

      const text =
        event.results[0][0].transcript;

      setTranscript(text);

      extractProfile(text);
    };

    recognition.onerror = (event) => {

      console.error(
        "Speech recognition error:",
        event.error
      );

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;


    return () => {

      recognition.stop();

      recognitionRef.current = null;

    };

  }, []);


  /* ============================================================
     START / STOP MICROPHONE
  ============================================================ */

  const handleMicClick = () => {

    const recognition =
      recognitionRef.current;

    if (!recognition) {

      alert(
        "Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge."
      );

      return;
    }

    if (isListening) {

      recognition.stop();

      setIsListening(false);

      return;
    }

    try {

      setTranscript("");

      recognition.start();

    } catch (error) {

      console.error(
        "Unable to start microphone:",
        error
      );

    }
  };


  /* ============================================================
     SIMPLE PROFILE EXTRACTION
  ============================================================ */

  const extractProfile = (text) => {

    const lowerText =
      text.toLowerCase();


    /* ================= BUSINESS TYPE ================= */

    let businessType =
      profile.businessType;

    if (
      lowerText.includes("dairy") ||
      lowerText.includes("milk")
    ) {
      businessType = "Dairy Business";
    }

    else if (
      lowerText.includes("handicraft") ||
      lowerText.includes("handicrafts")
    ) {
      businessType = "Handicraft Business";
    }

    else if (
      lowerText.includes("tailor") ||
      lowerText.includes("tailoring")
    ) {
      businessType = "Tailoring Business";
    }

    else if (
      lowerText.includes("restaurant") ||
      lowerText.includes("food")
    ) {
      businessType = "Food Business";
    }

    else if (
      lowerText.includes("shop") ||
      lowerText.includes("retail")
    ) {
      businessType = "Retail Business";
    }


    /* ================= LOCATION ================= */

    let location =
      profile.location;

    const locations = [
      "Rajasthan",
      "Uttar Pradesh",
      "Delhi",
      "Bihar",
      "Maharashtra",
      "Gujarat",
      "Haryana",
      "Karnataka",
      "Tamil Nadu",
      "West Bengal",
      "Madhya Pradesh",
      "Jharkhand",
      "Andhra Pradesh",
    ];

    const foundLocation =
      locations.find((item) =>
        lowerText.includes(
          item.toLowerCase()
        )
      );

    if (foundLocation) {
      location = foundLocation;
    }


    /* ================= REQUIREMENT ================= */

    let requirement =
      profile.requirement;

    const lakhMatch =
      text.match(
        /(?:₹|rs\.?|rupees?)?\s*(\d+(?:\.\d+)?)\s*(lakh|lakhs)/i
      );

    if (lakhMatch) {

      requirement =
        `Loan of ₹${lakhMatch[1]} Lakh`;

    }

    else if (
      lowerText.includes("loan")
    ) {

      requirement =
        "Business Loan";

    }

    else if (
      lowerText.includes("subsidy")
    ) {

      requirement =
        "Subsidy";

    }

    else if (
      lowerText.includes("grant")
    ) {

      requirement =
        "Grant";

    }


    /* ================= BUSINESS STAGE ================= */

    let businessStage =
      profile.businessStage;

    if (
      lowerText.includes("startup") ||
      lowerText.includes("starting") ||
      lowerText.includes("new business")
    ) {
      businessStage = "Startup";
    }

    else if (
      lowerText.includes("existing") ||
      lowerText.includes("already running")
    ) {
      businessStage = "Existing business";
    }


    /* ================= UPDATE PROFILE ================= */

    setProfile({
      businessType,
      location,
      requirement,
      businessStage,
    });

  };


  /* ============================================================
     EDIT DETAILS
  ============================================================ */

  const handleEditDetails = () => {

    window.location.assign(
      "/find-schemes"
    );

  };


  /* ============================================================
     CONFIRM & FIND
  ============================================================ */

  const handleConfirmAndFind = () => {

    /* Save profile */

    localStorage.setItem(
      "schemeSaathiVoiceProfile",
      JSON.stringify(profile)
    );


    /* Save information in the same
       storage used by your existing pages */

    localStorage.setItem(
      "schemeSaathiBusinessDetails",
      JSON.stringify({
        businessType:
          profile.businessType,
        businessStage:
          profile.businessStage,
      })
    );


    localStorage.setItem(
      "schemeSaathiVoiceRequirement",
      profile.requirement
    );


    /* Go to schemes */

    window.location.assign(
      "/find-schemes/matching-schemes"
    );

  };


  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="min-h-screen bg-white text-[#172b49]">

    <Header/>

      <div
        className="
          min-h-[calc(100vh-132px)]
          bg-[#f7f8fc]
          pb-14
        "
      >

        <div
          className="
            mx-auto
            max-w-287.5
            px-5
            sm:px-8
          "
        >

          {/* ==================================================
              PAGE HEADER
          ================================================== */}

          <div className="pt-10">

            <h1
              className="
                text-[27px]
                font-extrabold
                tracking-[-0.02em]
                text-[#172b49]
                sm:text-[29px]
              "
            >
              Voice Search / Voice Profile Builder
            </h1>

            <p
              className="
                mt-1
                text-[13px]
                text-slate-500
              "
            >
              Tell us about your business in your own
              words. AI will extract the details.
            </p>

          </div>


          {/* ==================================================
              MAIN CONTENT
          ================================================== */}

          <div
            className="
              mt-7
              grid
              gap-7
              lg:grid-cols-[1.6fr_1fr]
            "
          >

            {/* ==================================================
                LEFT MIC CARD
            ================================================== */}

            <section
              className="
                min-h-123.75
                rounded-2xl
                border
                border-[#d7e8df]
                bg-[#effaf5]
                px-8
                py-10
                shadow-sm
                sm:px-12
              "
            >

              <h2
                className="
                  text-[22px]
                  font-extrabold
                  text-[#172b49]
                "
              >
                Speak naturally
              </h2>

              <p
                className="
                  mt-2
                  text-[13px]
                  text-slate-500
                "
              >
                No forms required — just describe your
                business.
              </p>


              {/* ==================================================
                  MICROPHONE
              ================================================== */}

              <div
                className="
                  mt-14
                  flex
                  flex-col
                  items-center
                "
              >

                <button
                  type="button"
                  onClick={handleMicClick}
                  aria-label={
                    isListening
                      ? "Stop listening"
                      : "Start listening"
                  }
                  className="
                    relative
                    flex
                    h-64.5
                    w-64.5
                    items-center
                    justify-center
                    rounded-full
                    border-[3px]
                    border-[#d5aa2c]
                    bg-white
                    transition-all
                    duration-200
                    hover:scale-[1.015]
                    active:scale-[0.98]
                  "
                >

                  {/* Outer pulse when listening */}

                  {isListening && (
                    <span
                      className="
                        absolute
                        -inset-2.5
                        rounded-full
                        border-2
                        border-[#d5aa2c]/40
                        animate-ping
                      "
                    />
                  )}


                  {/* Inner gold circle */}

                  <div
                    className="
                      flex
                      h-40
                      w-40
                      items-center
                      justify-center
                      rounded-full
                      bg-[#d9aa28]
                      shadow-sm
                    "
                  >

                    {/* Microphone icon */}

                    <svg
                      width="58"
                      height="58"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >

                      <rect
                        x="8"
                        y="3"
                        width="8"
                        height="12"
                        rx="4"
                        stroke="#172b49"
                        strokeWidth="1.8"
                      />

                      <path
                        d="
                          M5 11
                          C5 14.866 8.134 18
                          12 18
                          C15.866 18 19 14.866 19 11
                        "
                        stroke="#172b49"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />

                      <path
                        d="M12 18V21"
                        stroke="#172b49"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />

                      <path
                        d="M9 21H15"
                        stroke="#172b49"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />

                    </svg>

                  </div>

                </button>


                {/* ==================================================
                    LISTENING TEXT
                ================================================== */}

                <p
                  className={`
                    mt-5
                    text-[16px]
                    font-bold
                    ${
                      isListening
                        ? "text-[#3b8b70]"
                        : "text-[#3b8b70]"
                    }
                  `}
                >
                  {isListening
                    ? "Listening..."
                    : "Click MIC to speak"}
                </p>


                {/* ==================================================
                    TRANSCRIPT
                ================================================== */}

                {transcript && (
                  <div
                    className="
                      mt-4
                      max-w-117.5
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-4
                      py-3
                      text-center
                      text-[12px]
                      leading-5
                      text-slate-600
                      shadow-sm
                    "
                  >
                    "{transcript}"
                  </div>
                )}

              </div>

            </section>


            {/* ==================================================
                RIGHT PROFILE CARD
            ================================================== */}

            <section
              className="
                min-h-123.75
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-7
                py-9
                shadow-sm
              "
            >

              <h2
                className="
                  text-[22px]
                  font-extrabold
                  text-[#172b49]
                "
              >
                AI Extracted Profile
              </h2>


              {/* BUSINESS TYPE */}

              <ProfileField
                label="Business Type"
                value={profile.businessType}
              />


              {/* LOCATION */}

              <ProfileField
                label="Location"
                value={profile.location}
              />


              {/* REQUIREMENT */}

              <ProfileField
                label="Requirement"
                value={profile.requirement}
              />


              {/* BUSINESS STAGE */}

              <ProfileField
                label="Business Stage"
                value={profile.businessStage}
                last
              />


              {/* ==================================================
                  ACTION BUTTONS
              ================================================== */}

              <div
                className="
                  mt-5
                  flex
                  gap-3
                "
              >

                <button
                  type="button"
                  onClick={handleEditDetails}
                  className="
                    h-11
                    flex-1
                    rounded-lg
                    border-2
                    border-[#d5aa2c]
                    bg-white
                    px-3
                    text-[12px]
                    font-medium
                    text-slate-700
                    transition
                    hover:bg-[#fffaf0]
                    active:scale-[0.99]
                  "
                >
                  Edit Details
                </button>


                <button
                  type="button"
                  onClick={handleConfirmAndFind}
                  className="
                    h-11
                    flex-1
                    rounded-lg
                    bg-[#0d2b55]
                    px-3
                    text-[12px]
                    font-medium
                    text-white
                    shadow-sm
                    transition
                    hover:bg-[#173b70]
                    active:scale-[0.99]
                  "
                >
                  Confirm & Find
                </button>

              </div>

            </section>

          </div>

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   PROFILE FIELD
============================================================ */

function ProfileField({
  label,
  value,
  last = false,
}) {

  return (
    <div
      className={`
        py-5
        ${
          !last
            ? "border-b border-slate-200"
            : ""
        }
      `}
    >

      <p
        className="
          text-[11px]
          font-medium
          text-[#4a957c]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1.5
          text-[15px]
          font-medium
          text-slate-700
        "
      >
        {value}
      </p>
    </div>
  );
}