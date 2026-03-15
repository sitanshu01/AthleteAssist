import { Router } from "express";
import { voiceAIHandler } from "../controllers/voiceController";

const router = Router();

// POST /voice-ai - Process voice queries and generate AI responses
router.post("/", voiceAIHandler);

export default router;
