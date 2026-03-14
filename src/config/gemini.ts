import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn(
    "[Gemini] GEMINI_API_KEY is not set. AI features will not work until this is configured."
  );
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const getGeminiModel = () => {
  if (!genAI) {
    throw new Error("Gemini API not initialized. Set GEMINI_API_KEY in your environment.");
  }
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

