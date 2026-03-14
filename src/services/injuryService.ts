import prisma from "../config/db";
import { generateInjuryAdvice } from "./aiService";

export interface RegisterInjuryBody {
  userId: number;
  name: string;
  bodyPart: string;
  severity: string;
  includeVoice?: boolean;
}

export interface TrackInjuryBody {
  injuryId: number;
  isActive: boolean;
}

export const getBasketballInjuries = async () => {
  const injuries = await prisma.injury.findMany({
    orderBy: { createdAt: "desc" },
    take: 50
  });
  return injuries;
};

export const registerInjury = async (data: RegisterInjuryBody) => {
  const injury = await prisma.injury.create({
    data: {
      userId: data.userId,
      name: data.name,
      bodyPart: data.bodyPart,
      severity: data.severity,
      isActive: true
    }
  });

  const advice = await generateInjuryAdvice(data.name, data.bodyPart);

  const updatedInjury = await prisma.injury.update({
    where: { id: injury.id },
    data: {
      aiPrecaution: advice.precaution,
      aiRecovery: advice.recovery,
      aiCure: advice.cure
    }
  });

  return updatedInjury;
};

export const trackInjury = async (data: TrackInjuryBody) => {
  const updated = await prisma.injury.update({
    where: { id: data.injuryId },
    data: {
      isActive: data.isActive
    }
  });
  return updated;
};

