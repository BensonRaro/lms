import { Schema, model, type InferSchemaType } from "mongoose";

/**
 * Instructor profile collected during onboarding. One document per user;
 * `userId` is the better-auth user id (kept as a string).
 */
const instructorProfileSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    headline: { type: String, required: true, trim: true, maxlength: 120 },
    bio: { type: String, required: true, trim: true, maxlength: 1000 },
    expertise: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) => value.length > 0 && value.length <= 5,
        message: "Pick between 1 and 5 expertise topics.",
      },
    },
    experienceYears: { type: Number, required: true, min: 0, max: 60 },
    status: {
      type: String,
      enum: ["active"],
      default: "active",
      required: true,
    },
  },
  { timestamps: true },
);

export type InstructorProfileDoc = InferSchemaType<
  typeof instructorProfileSchema
>;

export const InstructorProfile = model(
  "InstructorProfile",
  instructorProfileSchema,
);
