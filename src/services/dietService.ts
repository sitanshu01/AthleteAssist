import prisma from "../config/db";
import { DietPlanJson, generateDiet } from "./aiService";
import { generatePersonalizedResponse } from "./ragService";

export const getOrGenerateDietForUser = async (userId: number): Promise<DietPlanJson> => {
  const existing = await prisma.dietPlan.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  if (existing) {
    return existing.dietJson as DietPlanJson;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error(`User with id ${userId} not found`);
  }

  const injuries = await prisma.injury.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  const diet = await generateDiet({ user, injuries });
  await prisma.dietPlan.create({
    data: {
      userId,
      dietJson: diet
    }
  });

  return diet;
};

export const generateDietWithRag = async (
  userId: number,
  question: string
): Promise<DietPlanJson> => {
  const diet = await generatePersonalizedResponse({ userId }, question);

  await prisma.dietPlan.create({
    data: {
      userId,
      dietJson: diet
    }
  });

  return diet;
};

