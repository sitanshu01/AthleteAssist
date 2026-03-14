import { Request, Response } from "express";
import prisma from "../config/db";
import { WarmupType } from "@prisma/client";

export const getWarmupsHandler = async (req: Request, res: Response) => {
  try {
    const type = req.query.type as string | undefined;

    const whereClause: {
      sports: { has: string };
      type?: WarmupType;
    } = {
      sports: { has: "basketball" }
    };

    if (type) {
      const upper = type.toUpperCase();
      if (upper === "PRE" || upper === "POST") {
        whereClause.type = upper as WarmupType;
      }
    }

    const warmups = await prisma.warmup.findMany({
      where: whereClause,
      orderBy: { id: "asc" }
    });

    res.json({ data: warmups });
  } catch (error) {
    console.error("[GET /warmups] error", error);
    res.status(500).json({ error: "Failed to fetch warmups" });
  }
};

