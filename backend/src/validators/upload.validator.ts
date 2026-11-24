import { z } from "zod";

/**
 * The browser may only request signatures for the two upload kinds the course
 * editor needs. Resource type, delivery type, folder and naming are decided on
 * the server so a client can never write outside its own upload area.
 */
export const uploadSignSchema = z
  .object({
    purpose: z.enum(["course-thumbnail", "lesson-video"]),
  })
  .strict();

export type UploadSignInput = z.infer<typeof uploadSignSchema>;
