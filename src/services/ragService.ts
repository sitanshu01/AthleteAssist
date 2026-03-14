import prisma from "../config/db";
import { buildRagDietPrompt, RagDietContext } from "../utils/promptBuilder";
import { getGeminiModel } from "../config/gemini";
import { DietPlanJson } from "./aiService";

export interface RagContextInput {
  userId: number;
  sport?: string;
}

export const generatePersonalizedResponse = async (
  context: RagContextInput,
  question: string
): Promise<DietPlanJson> => {
  const user = await prisma.user.findUnique({
    where: { id: context.userId }
  });

  if (!user) {
    throw new Error(`User with id ${context.userId} not found`);
  }

  const injuries = await prisma.injury.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });

  const exercises = await prisma.exercise.findMany({
    where: {
      sports: {
        has: user.sport
      }
    },
    orderBy: { id: "asc" }
  });

  const warmups = await prisma.warmup.findMany({
    where: {
      sports: {
        has: user.sport
      }
    },
    orderBy: { id: "asc" }
  });

  const rules = await prisma.rule.findMany({
    where: { sport: user.sport },
    orderBy: { id: "asc" }
  });

  const learnContent = await prisma.learnContent.findMany({
    where: { sport: user.sport },
    orderBy: { id: "asc" }
  });

  const ragContext: RagDietContext = {
    user,
    injuries,
    exercises,
    warmups,
    rules,
    learnContent
  };

  const prompt = buildRagDietPrompt(ragContext, question);

  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const safeJsonParse = (raw: string): DietPlanJson => {
    let cleaned = raw.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/```json/gi, "").replace(/```/g, "").trim();
    }
    return JSON.parse(cleaned) as DietPlanJson;
  };

  return safeJsonParse(text);
};

