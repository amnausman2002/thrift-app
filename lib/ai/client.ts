import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | undefined;

export function getAi(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({
      vertexai: true,
      project: process.env.GOOGLE_CLOUD_PROJECT,
      location: process.env.GOOGLE_CLOUD_LOCATION ?? "global",
    });
  }
  return client;
}

export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.8-flash";
