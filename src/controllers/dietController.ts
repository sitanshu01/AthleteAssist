import { Request, Response } from "express";
import { generateDietWithRag, getOrGenerateDietForUser } from "../services/dietService";
import { generateVoiceFromText } from "../services/voiceService";
import prisma from "../config/db";

interface GenerateDietRequestBody {
  userId: number;
  question?: string;
  includeVoice?: boolean;
}

export const getDietHandler = async (req: Request<{ userId: string }>, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const diet = await getOrGenerateDietForUser(userId);
    res.json({ data: diet });
  } catch (error) {
    console.error("[GET /diets/:userId] error", error);
    res.status(500).json({ error: "Failed to get diet" });
  }
};

export const generateDietHandler = async (
  req: Request<unknown, unknown, GenerateDietRequestBody>,
  res: Response
) => {
  try {
    const { userId, question, includeVoice } = req.body;

    if (typeof userId !== "number") {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const promptQuestion =
      question && question.trim().length > 0
        ? question
        : "Generate a balanced high-protein diet optimized for a basketball athlete's recovery and performance.";

    const diet = await generateDietWithRag(userId, promptQuestion);

    let voiceAudioBase64: string | null = null;
    if (includeVoice) {
      const text =
        `Here is your personalized diet plan summary: ${diet.summary}. ` +
        `Daily calories: ${diet.macros.calories}, protein: ${diet.macros.protein_g} grams, ` +
        `carbs: ${diet.macros.carbs_g} grams, fats: ${diet.macros.fats_g} grams.`;
      const voice = await generateVoiceFromText(text);
      voiceAudioBase64 = voice?.audioBase64 ?? null;
    }

    res.status(201).json({
      data: diet,
      voiceAudioBase64
    });
  } catch (error) {
    console.error("[POST /diets/generate] error", error);
    res.status(500).json({ error: "Failed to generate diet" });
  }
};

