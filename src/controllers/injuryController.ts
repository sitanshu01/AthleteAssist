import { Request, Response } from "express";
import {
  getBasketballInjuries,
  registerInjury,
  trackInjury,
  RegisterInjuryBody,
  TrackInjuryBody
} from "../services/injuryService";
import { generateVoiceFromText } from "../services/voiceService";

interface RegisterInjuryRequestBody extends RegisterInjuryBody {
  includeVoice?: boolean;
}

interface TrackInjuryRequestBody extends TrackInjuryBody {}

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
    const { userId, name, bodyPart, severity, includeVoice } = req.body;

    if (
      typeof userId !== "number" ||
      typeof name !== "string" ||
      typeof bodyPart !== "string" ||
      typeof severity !== "string"
    ) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const injury = await registerInjury({ userId, name, bodyPart, severity, includeVoice });

    let voiceAudioBase64: string | null = null;
    if (includeVoice) {
      const text =
        `Here is your injury advice for ${name} on your ${bodyPart}. ` +
        `Precautions: ${injury.aiPrecaution}. ` +
        `Recovery: ${injury.aiRecovery}. ` +
        `Cure: ${injury.aiCure}.`;
      const voice = await generateVoiceFromText(text);
      voiceAudioBase64 = voice?.audioBase64 ?? null;
    }

    res.status(201).json({
      data: injury,
      voiceAudioBase64
    });
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

