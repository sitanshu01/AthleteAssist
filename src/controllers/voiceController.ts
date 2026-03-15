import { Request, Response } from "express";
import { generateVoiceFromText } from "../services/voiceService";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface VoiceRequest {
  query?: string;
  includeVoice?: boolean;
}

export const voiceAIHandler = async (
  req: Request<unknown, unknown, VoiceRequest>,
  res: Response
) => {
  try {
    const { query, includeVoice = false } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query is required and must be a string" });
    }

    const aiResponse = await generateVoiceResponse(query);

    let voiceAudioBase64: string | null = null;
    if (includeVoice && aiResponse) {
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
    console.error("[POST /voice-ai] error", error);
    res.status(500).json({ error: "Failed to process voice request" });
  }
};

async function generateVoiceResponse(query: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `You are AthleteAssist, an expert AI coach specialising in sports performance, 
training, nutrition, injury prevention, and recovery. 
Give concise, practical, evidence-based answers. 
Keep responses under 150 words unless the question requires more detail.`,
  });

  const result = await model.generateContent(query);
  return result.response.text() ?? "I couldn't generate a response. Please try again.";
}
