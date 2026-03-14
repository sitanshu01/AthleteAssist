import { getGeminiModel } from "../config/gemini";
import prisma from "../config/db";
import {
  buildDietPrompt,
  buildInjuryAdvicePrompt,
  buildLearnPrompt,
  DietPromptContext
} from "../utils/promptBuilder";
import { Injury, User } from "@prisma/client";

interface InjuryAdviceResponse {
  precaution: string;
  recovery: string;
  cure: string;
  recommendedYoutubeLink: string;
}

interface LearnAskResponse {
  recommendedYoutubeQuery: string;
  recommendedYoutubeLink: string;
  careTips: string;
  precautions: string;
}

export interface DietPlanJson {
  summary: string;
  recommendedYoutubeLink: string;
  macros: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fats_g: number;
  };
  micronutrients: {
    vitamin_d_iu: number;
    calcium_mg: number;
    iron_mg: number;
    magnesium_mg: number;
    other: string;
  };
  hydration: {
    water_liters: number;
    electrolytes: string;
  };
  meals: {
    breakfast: {
      description: string;
      protein_g: number;
      carbs_g: number;
      fats_g: number;
    };
    lunch: {
      description: string;
      protein_g: number;
      carbs_g: number;
      fats_g: number;
    };
    snack: {
      description: string;
      protein_g: number;
      carbs_g: number;
      fats_g: number;
    };
    dinner: {
      description: string;
      protein_g: number;
      carbs_g: number;
      fats_g: number;
    };
  };
}

const safeJsonParse = <T>(raw: string): T => {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/```json/gi, "").replace(/```/g, "").trim();
  }
  return JSON.parse(cleaned) as T;
};

export const generateDiet = async (userContext: DietPromptContext): Promise<DietPlanJson> => {
  const model = getGeminiModel();
  const prompt = buildDietPrompt(userContext);

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return safeJsonParse<DietPlanJson>(text);
};

export const generateInjuryAdvice = async (
  injuryName: string,
  bodyPart: string
): Promise<InjuryAdviceResponse> => {
  const model = getGeminiModel();
  const prompt = buildInjuryAdvicePrompt(injuryName, bodyPart);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return safeJsonParse<InjuryAdviceResponse>(text);
};

export const recommendLearningContent = async (
  userId: number,
  question: string
): Promise<LearnAskResponse> => {
  const user: User | null = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error(`User with id ${userId} not found`);
  }

  const learnContent = await prisma.learnContent.findMany({
    where: { sport: "basketball" },
    orderBy: { id: "asc" }
  });

  const contextLines = learnContent.map(
    (c, idx) => `Learn[${idx + 1}] topic=${c.topic} -> ${c.content}`
  );
  const context = contextLines.join("\n");

  const prompt = buildLearnPrompt(user.name, question, context);
  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return safeJsonParse<LearnAskResponse>(text);
};

