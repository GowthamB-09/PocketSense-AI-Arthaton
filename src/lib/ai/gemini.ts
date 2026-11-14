import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Check for Google Gemini API Key
export const geminiApiKey =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  "";

export const isGeminiConfigured = Boolean(
  geminiApiKey &&
  geminiApiKey.length > 5 &&
  !geminiApiKey.includes("your_gemini_api_key_here")
);

// Create Google Generative AI Provider instance
export const google = createGoogleGenerativeAI({
  apiKey: geminiApiKey,
});

// Default to the fast and responsive gemini-2.5-flash or gemini-1.5-flash
export const geminiModel = google("gemini-1.5-flash");

