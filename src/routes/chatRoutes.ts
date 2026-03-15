import { Router } from "express";
import { chatHandler } from "../controllers/chatController";
import { authenticate } from "../middleware/auth"; // adjust path if different

const router = Router();

// POST /chat
router.post("/", authenticate, chatHandler);

export default router;
