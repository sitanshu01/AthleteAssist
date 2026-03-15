import { Request, Response } from "express";
import {
  getBasketballInjuries,
  registerInjury,
  trackInjury,
  RegisterInjuryBody,
  TrackInjuryBody
} from "../services/injuryService";
import { getGeminiModel } from "../config/gemini";
import prisma from "../config/db";

interface RegisterInjuryRequestBody extends RegisterInjuryBody {
  classification?: number;
}

interface TrackInjuryRequestBody extends TrackInjuryBody { }

interface InjuryChatRequestBody {
  userId: number;
  question: string;
}


export const getInjuriesHandler = async (_req: Request, res: Response) => {
  try {
    const injuries = await getBasketballInjuries();
    res.json({ data: injuries });
  } catch (error) {
    console.error("[GET /injuries] error", error);
    res.status(500).json({ error: "Failed to fetch injuries" });
  }
};

export const registerInjuryHandler = async (
  req: Request<unknown, unknown, RegisterInjuryRequestBody>,
  res: Response
) => {
  try {
    const { userId, name, bodyPart, severity, classification } = req.body;

    if (
      typeof userId !== "number" ||
      typeof name !== "string" ||
      typeof bodyPart !== "string" ||
      typeof severity !== "string"
    ) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    let aiClassification = classification;
    if (!aiClassification) {
      if (severity.toLowerCase() === "moderate") aiClassification = 2;
      else if (severity.toLowerCase() === "severe") aiClassification = 3;
      else if (severity.toLowerCase() === "critical") aiClassification = 4;
      else aiClassification = 1;
    }

    const injury = await registerInjury({ userId, name, bodyPart, severity, classification: aiClassification });

    res.status(201).json({ data: injury });
  } catch (error) {
    console.error("[POST /injuries/register] error", error);
    res.status(500).json({ error: "Failed to register injury" });
  }
};

export const trackInjuryHandler = async (
  req: Request<unknown, unknown, TrackInjuryRequestBody>,
  res: Response
) => {
  try {
    const { injuryId, isActive } = req.body;

    if (typeof injuryId !== "number" || typeof isActive !== "boolean") {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const updated = await trackInjury({ injuryId, isActive });
    res.json({ data: updated });
  } catch (error) {
    console.error("[PUT /injuries/track] error", error);
    res.status(500).json({ error: "Failed to update injury status" });
  }
};


export const injuryChatHandler = async (
  req: Request<unknown, unknown, InjuryChatRequestBody>,
  res: Response
) => {
  try {
    const { userId, question } = req.body;

    if (typeof userId !== "number" || typeof question !== "string") {
      return res.status(400).json({ error: "userId and question are required" });
    }

    const response = await generateInjuryResponse(userId, question);
    res.json({ data: { response } });
  } catch (error) {
    console.error("[POST /injuries/chat] error", error);
    res.status(500).json({ error: "Failed to process injury question" });
  }
};

async function generateInjuryResponse(userId: number, question: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error(`User ${userId} not found`);

  const [allInjuries, exercises, warmups] = await Promise.all([
    prisma.injury.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.exercise.findMany({
      where: { sports: { has: user.sport } },
      take: 5,
    }),
    prisma.warmup.findMany({
      where: { sports: { has: user.sport } },
      take: 5,
    }),
  ]);

  const active = allInjuries.filter((i) => i.isActive);
  const recovered = allInjuries.filter((i) => !i.isActive);

  const prompt = `
You are AthleteAssist, an expert sports medicine and injury rehabilitation coach.
Answer the athlete's question using their personal injury history and context.
Be concise, practical, and always recommend consulting a medical professional for serious injuries.
Keep your response under 200 words.

## Athlete Profile
- Name: ${user.name ?? user.username}
- Sport: ${user.sport ?? "Not specified"}
- Position: ${(user as any).position ?? "Not specified"}

## Active Injuries (${active.length})
${active.length > 0
      ? active.map((i) => `- ${i.name} on ${i.bodyPart} (${i.severity})${i.aiPrecaution ? `\n  Precaution: ${i.aiPrecaution}` : ""}`).join("\n")
      : "- None currently active"}

## Past / Recovered Injuries (${recovered.length})
${recovered.length > 0
      ? recovered.map((i) => `- ${i.name} on ${i.bodyPart} (${i.severity})`).join("\n")
      : "- None on record"}

## Available Sport-Specific Exercises
${exercises.length > 0
      ? exercises.map((e) => `- ${e.name}: ${e.description.substring(0, 80)}...`).join("\n")
      : "- None found"}

## Available Warmup Routines
${warmups.length > 0
      ? warmups.map((w) => `- ${w.name} (${w.type})`).join("\n")
      : "- None found"}

## Athlete's Question
${question}

Respond directly using the athlete's injury history. If they have active injuries, factor those into your answer.
`.trim();

  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  return result.response.text() ?? "I couldn't generate a response. Please try again.";
}
