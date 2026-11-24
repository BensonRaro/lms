import { z } from "zod";
import { EXPERTISE_TOPICS } from "./instructor.validator.js";

/**
 * Mongo ObjectId as a string. The editor sends back the ids it received so
 * lesson ids stay stable across saves (notes and Q&A will reference them).
 */
const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid id.")
  .optional();

/**
 * A Cloudinary public id chosen by the upload endpoint. The service verifies
 * it belongs to the caller and exists before storing it.
 */
const mediaId = z.string().trim().min(1).max(255).nullable().default(null);

const lessonInput = z
  .object({
    id: objectId,
    title: z.string().trim().max(120).default(""),
    summary: z.string().trim().max(300).default(""),
    content: z.string().trim().max(20000).default(""),
    videoPublicId: mediaId,
  })
  .strict();

const sectionInput = z
  .object({
    id: objectId,
    title: z.string().trim().max(120).default(""),
    lessons: z.array(lessonInput).max(40).default([]),
  })
  .strict();

/**
 * Lenient enough to save an unfinished draft: only a title, category and
 * level are required. Completeness is enforced separately on submit.
 */
export const courseDraftSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Give your course a title of at least 3 characters.")
      .max(120),
    subtitle: z.string().trim().max(200).default(""),
    description: z.string().trim().max(5000).default(""),
    category: z.enum(EXPERTISE_TOPICS),
    level: z.enum(["beginner", "intermediate", "advanced"]),
    thumbnailPublicId: mediaId,
    sections: z.array(sectionInput).max(15).default([]),
  })
  .strict()
  .superRefine((input, ctx) => {
    // Ids are echoed back by the editor, so they must be unique within a course.
    const ids = [
      ...input.sections.flatMap((section) => [
        section.id,
        ...section.lessons.map((lesson) => lesson.id),
      ]),
    ].filter((id): id is string => Boolean(id));

    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: "custom",
        message: "Duplicate section or lesson ids.",
      });
    }
  });

export type CourseDraftInput = z.infer<typeof courseDraftSchema>;
