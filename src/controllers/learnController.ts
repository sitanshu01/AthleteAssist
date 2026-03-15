import { Request, Response } from "express";
import prisma from "../config/db";
import { getGeminiModel } from "../config/gemini";

interface LearnAskRequestBody {
  userId: number;
  question: string;
}

export const getLearnContentHandler = async (_req: Request, res: Response) => {
  try {
    const content = await prisma.learnContent.findMany({
      where: { sport: "basketball" },
      orderBy: { id: "asc" }
    });
    res.json({ data: content });
  } catch (error) {
    console.error("[GET /learn] error", error);
    res.status(500).json({ error: "Failed to fetch learn content" });
  }
};


export const askLearnHandler = async (
  req: Request<unknown, unknown, LearnAskRequestBody>,
  res: Response
) => {
  try {
    const { userId, question } = req.body;

    if (typeof userId !== "number" || typeof question !== "string") {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const response = await generateLearnResponse(userId, question);

    res.json({ data: { response } });
  } catch (error) {
    console.error("[POST /learn/ask] error", error);
    res.status(500).json({ error: "Failed to process learning question" });
  }
};

async function generateLearnResponse(userId: number, question: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error(`User ${userId} not found`);

  const [learnContent, rules, injuries] = await Promise.all([
    prisma.learnContent.findMany({ where: { sport: user.sport }, orderBy: { id: "asc" } }),
    prisma.rule.findMany({ where: { sport: user.sport }, orderBy: { id: "asc" } }),
    prisma.injury.findMany({ where: { userId, isActive: true }, orderBy: { createdAt: "desc" } }),
  ]);

  const prompt = `
You are AthleteAssist, an expert sports education coach.
Answer the athlete's question using their personal context below.
Be clear, educational, and concise. Keep the response under 200 words.

## Athlete Profile
- Name: ${user.name ?? user.username}
- Sport: ${user.sport ?? "Not specified"}
- Position: ${(user as any).position ?? "Not specified"}

## Active Injuries
${injuries.length > 0
      ? injuries.map((i) => `- ${i.name} (${i.bodyPart}, ${i.severity})`).join("\n")
      : "- None"}

## Available Learning Content for ${user.sport ?? "their sport"}
${learnContent.length > 0
      ? learnContent.map((l) => `- ${l.topic}: ${l.content.substring(0, 120)}...`).join("\n")
      : "- None available"}

## Sport Rules & Guidelines
${rules.length > 0
      ? rules.map((r) => `- ${r.title}: ${r.description.substring(0, 100)}...`).join("\n")
      : "- None available"}

## Athlete's Question
${question}

Respond directly and helpfully based on this athlete's context.
`.trim();

  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  return result.response.text() ?? "I couldn't generate a response. Please try again.";
}
