import { Request, Response } from "express";
import prisma from "../config/db";

export const getExercisesHandler = async (_req: Request, res: Response) => {
  try {
    const exercises = await prisma.exercise.findMany({
      where: {
        sports: {
          has: "basketball"
        }
      },
      orderBy: { id: "asc" }
    });
    res.json({ data: exercises });
  } catch (error) {
    console.error("[GET /exercises] error", error);
    res.status(500).json({ error: "Failed to fetch exercises" });
  }
};

