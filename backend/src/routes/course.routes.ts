import { Router } from "express";
import {
  createCourse,
  getOne,
  listMine,
  removeCourse,
  submitCourse,
  updateCourse,
} from "../controllers/course.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = Router();

// Every course endpoint is instructor-scoped; ownership is enforced in the
// service by always filtering on the session user id.
router.use(requireAuth, requireRole("instructor", "admin", "superadmin"));

router.get("/mine", listMine);
router.post("/", createCourse);
router.get("/:courseId", getOne);
router.put("/:courseId", updateCourse);
router.post("/:courseId/submit", submitCourse);
router.delete("/:courseId", removeCourse);

export default router;
