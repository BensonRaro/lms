import { Schema, model, type InferSchemaType } from "mongoose";

/**
 * A Cloudinary asset reference. Only the id and version are stored: delivery
 * URLs are built on the server, so a client can never supply one.
 */
const mediaAssetSchema = new Schema(
  {
    publicId: { type: String, required: true },
    version: { type: Number, required: true },
  },
  { _id: false },
);

/**
 * A lesson inside a section. Arrays are embedded because a course is always
 * read and written as one document by the builder; caps in the validator keep
 * them bounded. `video` stays null until an authenticated upload is attached.
 */
const lessonSchema = new Schema(
  {
    // Drafts may be saved before every title is written; submit enforces them.
    title: { type: String, trim: true, maxlength: 120, default: "" },
    summary: { type: String, trim: true, maxlength: 300, default: "" },
    /** Written tutorial shown beneath the video. */
    content: { type: String, trim: true, maxlength: 20000, default: "" },
    video: { type: mediaAssetSchema, default: null },
  },
  { _id: true },
);

const sectionSchema = new Schema(
  {
    title: { type: String, trim: true, maxlength: 120, default: "" },
    lessons: { type: [lessonSchema], default: [] },
  },
  { _id: true },
);

const courseSchema = new Schema(
  {
    /** better-auth user id of the author. Never taken from the request body. */
    instructorId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    subtitle: { type: String, trim: true, maxlength: 200, default: "" },
    description: { type: String, trim: true, maxlength: 5000, default: "" },
    category: { type: String, required: true },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    thumbnail: { type: mediaAssetSchema, default: null },
    status: {
      type: String,
      enum: ["draft", "in_review", "published", "rejected"],
      default: "draft",
      required: true,
      index: true,
    },
    submittedAt: { type: Date, default: null },
    sections: { type: [sectionSchema], default: [] },
  },
  { timestamps: true },
);

// Instructor dashboard lists newest first.
courseSchema.index({ instructorId: 1, updatedAt: -1 });

export type CourseDoc = InferSchemaType<typeof courseSchema>;
export type SectionDoc = InferSchemaType<typeof sectionSchema>;
export type LessonDoc = InferSchemaType<typeof lessonSchema>;

export const Course = model("Course", courseSchema);
