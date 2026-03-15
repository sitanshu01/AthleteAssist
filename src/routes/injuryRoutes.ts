import { Router } from "express";
import {
  getInjuriesHandler,
  registerInjuryHandler,
  trackInjuryHandler,
  injuryChatHandler,
} from "../controllers/injuryController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.get("/", authenticateToken, getInjuriesHandler);

router.post("/register", authenticateToken, registerInjuryHandler);

router.put("/track", authenticateToken, trackInjuryHandler);

router.post("/chat", authenticateToken, injuryChatHandler);

export default router;
