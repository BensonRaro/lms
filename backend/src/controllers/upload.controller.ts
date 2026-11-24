import type { NextFunction, Request, Response } from "express";
import { getSession } from "../middlewares/auth.js";
import { AppError } from "../middlewares/error.js";
import { createUploadTicket } from "../services/upload.service.js";
import { uploadSignSchema } from "../validators/upload.validator.js";

/** POST /api/uploads/sign — signature for a direct Cloudinary upload. */
export async function signUpload(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = uploadSignSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(
        400,
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message ?? "Unknown upload purpose.",
      );
    }

    const session = getSession(res);
    res.json({ data: createUploadTicket(session.user.id, parsed.data) });
  } catch (error) {
    next(error);
  }
}
