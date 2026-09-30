import { NextResponse } from "next/server";
import { ThinkingLevel } from "@google/genai";
import { getAi, GEMINI_MODEL } from "@/lib/ai/client";

export async function GET() {
  try {
    const result = await getAi().models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: "reply with the word ok" }] }],
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    return NextResponse.json({ ok: true, model: GEMINI_MODEL, reply: result.text });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
