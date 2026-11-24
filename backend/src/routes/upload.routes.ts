import { Router } from "express";
import { signUpload } from "../controllers/upload.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();

// Only course authors upload media; the service decides where it may land.
router.use(requireAuth, requireRole("instructor", "admin", "superadmin"));

router.post("/sign", signUpload);

export default router;
