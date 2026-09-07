import axios from "axios";

/* Base URL comes from the Vite env so each environment (dev/staging/prod)
   can point at its own backend without touching this file. */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/* Submits the wizard's collected profile and returns explainable scheme
   matches from the real matching engine (no more local fake data). */
export async function fetchMatchingSchemes(profilePayload) {
  const response = await api.post("/public/self-service/schemes-match", profilePayload);
  return response.data;
}

/* Sends one message (plus recent history) to the AI Scheme Assistant and
   returns its reply. phone_number is optional -- if the visitor has already
   completed the wizard, the assistant can reference their real matches. */
export async function sendAssistantMessage(message, history, phoneNumber) {
  const response = await api.post("/public/self-service/assistant-chat", {
    message,
    history,
    phone_number: phoneNumber || null,
  });
  return response.data;
}
