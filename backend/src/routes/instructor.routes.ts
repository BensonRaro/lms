import { Router } from "express";
import {
  getMyProfile,
  postOnboarding,
} from "../controllers/instructor.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.post("/onboarding", requireAuth, postOnboarding);
router.get("/me", requireAuth, getMyProfile);

export default router;
