import { Request, Response } from "express";
import prisma from "../config/db";

export const getRulesHandler = async (_req: Request, res: Response) => {
  try {
    const rules = await prisma.rule.findMany({
      where: { sport: "basketball" },
      orderBy: { id: "asc" }
    });
    res.json({ data: rules });
  } catch (error) {
    console.error("[GET /rules] error", error);
    res.status(500).json({ error: "Failed to fetch rules" });
  }
};

