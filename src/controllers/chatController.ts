import { Request, Response } from "express";
import { generateVoiceFromText } from "../services/voiceService";
import { getGeminiModel } from "../config/gemini";
import prisma from "../config/db";

interface ChatRequest {
  userId?: number;
  query: string;
  context?: "diet" | "injuries" | "exercises" | "rules" | "learn" | "general";
  includeVoice?: boolean;
}

// Fetch RAG context for the user (same pattern as ragService)
async function buildChatContext(userId: number, context: string, query: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return query;

  const [injuries, exercises, warmups, rules, learnContent] = await Promise.all([
    prisma.injury.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.exercise.findMany({ where: { sports: { has: user.sport } }, take: 5 }),
    prisma.warmup.findMany({ where: { sports: { has: user.sport } }, take: 5 }),
    prisma.rule.findMany({ where: { sport: user.sport }, take: 5 }),
    prisma.learnContent.findMany({ where: { sport: user.sport }, take: 3 }),
  ]);

  const activeInjuries = injuries.filter((i) => i.isActive);

  return `
You are AthleteAssist, an expert AI coach. Answer the user's question using their personal context below.
Be concise, practical, and supportive. Keep responses under 200 words unless more detail is needed.

## Athlete Profile
- Name: ${user.name ?? user.username}
- Sport: ${user.sport ?? "Not specified"}
- Position: ${user.position ?? "Not specified"}
- Age: ${(user as any).age ?? "Not specified"}
- Weight: ${(user as any).weight ?? "Not specified"} kg
- Height: ${(user as any).height ?? "Not specified"} cm

## Active Injuries (${activeInjuries.length})
${activeInjuries.length > 0
      ? activeInjuries.map((i) => `- ${i.name} (${i.bodyPart}, ${i.severity})`).join("\n")
      : "- None"}

## Sport-Specific Exercises Available
${exercises.length > 0
      ? exercises.map((e) => `- ${e.name}: ${e.description.substring(0, 80)}...`).join("\n")
      : "- None found"}

## Warmup Routines
${warmups.length > 0
      ? warmups.map((w) => `- ${w.name} (${w.type})`).join("\n")
      : "- None found"}

## Sport Rules & Guidelines
${rules.length > 0
      ? rules.map((r) => `- ${r.title}: ${r.description.substring(0, 80)}...`).join("\n")
      : "- None found"}

## Learning Content
${learnContent.length > 0
      ? learnContent.map((l) => `- ${l.topic} (${l.sport})`).join("\n")
      : "- None found"}

## Focus Area
${context}

## User Question
${query}

Respond directly and helpfully based on this athlete's specific context.
`.trim();
}

export const chatHandler = async (
  req: Request<unknown, unknown, ChatRequest>,
  res: Response
) => {
  try {
    const { userId, query, context = "general", includeVoice = false } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query is required" });
    }

    const model = getGeminiModel();
    let prompt: string;

    if (userId) {
      prompt = await buildChatContext(userId, context, query);
    } else {
      // No userId — still useful, just no personalisation
      prompt = `You are AthleteAssist, an expert AI coach for sports performance, 
training, nutrition, injury prevention, and recovery.
Be concise and practical. Keep responses under 200 words.

User question: ${query}`;
    }

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text() ?? "I couldn't generate a response. Please try again.";

    let voiceAudioBase64: string | null = null;
    if (includeVoice) {
      const voice = await generateVoiceFromText(aiResponse);
      voiceAudioBase64 = voice?.audioBase64 ?? null;
    }

    res.json({
      data: {
        response: aiResponse,
        timestamp: new Date().toISOString(),
        query,
      },
      voiceAudioBase64,
    });
  } catch (error) {
    console.error("[POST /chat] error", error);
    res.status(500).json({ error: "Failed to process chat request" });
  }
};
