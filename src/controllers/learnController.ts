import { Request, Response } from "express";
import prisma from "../config/db";
import { recommendLearningContent } from "../services/aiService";
import { generateVoiceFromText } from "../services/voiceService";

interface LearnAskRequestBody {
  userId: number;
  question: string;
  includeVoice?: boolean;
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
    const { userId, question, includeVoice } = req.body;

    if (typeof userId !== "number" || typeof question !== "string") {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const aiResponse = await recommendLearningContent(userId, question);

    let voiceAudioBase64: string | null = null;
    if (includeVoice) {
      const text =
        `Here is your learning recommendation. ` +
        `Recommended YouTube search: ${aiResponse.recommendedYoutubeQuery}. ` +
        `Recommended video link: ${aiResponse.recommendedYoutubeLink}. ` +
        `Care tips: ${aiResponse.careTips}. ` +
        `Precautions: ${aiResponse.precautions}.`;
      const voice = await generateVoiceFromText(text);
      voiceAudioBase64 = voice?.audioBase64 ?? null;
    }

    res.json({
      data: aiResponse,
      voiceAudioBase64
    });
  } catch (error) {
    console.error("[POST /learn/ask] error", error);
    res.status(500).json({ error: "Failed to process learning question" });
  }
};

