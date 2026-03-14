import dotenv from "dotenv";

dotenv.config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID =
  process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL";

if (!ELEVENLABS_API_KEY) {
  console.warn(
    "[ElevenLabs] ELEVENLABS_API_KEY is not set. Voice features will not work until configured."
  );
}

export interface VoiceResponse {
  audioBase64: string;
}

export const generateVoiceFromText = async (
  text: string
): Promise<VoiceResponse | null> => {
  if (!ELEVENLABS_API_KEY) {
    return null;
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
      Accept: "audio/mpeg"
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8
      }
    })
  });

  if (!response.ok) {
    console.error(
      "[ElevenLabs] Error response:",
      response.status,
      await response.text()
    );
    throw new Error("Failed to generate voice audio");
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");

  return {
    audioBase64: base64
  };
};

