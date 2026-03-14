import { Router } from "express";
import {
  getInjuriesHandler,
  registerInjuryHandler,
  trackInjuryHandler
} from "../controllers/injuryController";

const router = Router();

router.get("/", getInjuriesHandler);
router.post("/register", registerInjuryHandler);
router.put("/track", trackInjuryHandler);

export default router;

