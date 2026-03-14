import express, { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";

import injuryRoutes from "./routes/injuryRoutes";
import learnRoutes from "./routes/learnRoutes";
import dietRoutes from "./routes/dietRoutes";

dotenv.config();

const app: Application = express();

app.use(helmet());
app.use(
  cors({
    origin: "*"
  })
);
app.use(express.json({ limit: "1mb" }));

app.use("/injuries", injuryRoutes);
app.use("/learn", learnRoutes);
app.use("/diets", dietRoutes);

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "AthleteAssist backend" });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "NotFound",
    message: `Route ${req.method} ${req.path} not found`
  });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[GlobalErrorHandler]", err);
  res.status(500).json({
    error: "InternalServerError",
    message: "Something went wrong"
  });
});

export default app;
