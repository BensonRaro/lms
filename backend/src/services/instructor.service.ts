import type { ClientSession } from "mongoose";
import { mongoose } from "../lib/db.js";
import { writeAuditLog } from "../lib/audit-log.js";
import { AppError } from "../middlewares/error.js";
import {
  InstructorProfile,
  type InstructorProfileDoc,
} from "../models/instructor-profile.model.js";
import type { InstructorOnboardingInput } from "../validators/instructor.validator.js";

export type InstructorProfileDTO = {
  headline: string;
  bio: string;
  expertise: string[];
  experienceYears: number;
  status: "active";
  createdAt: string;
  updatedAt: string;
};

type ProfileDocument = InstructorProfileDoc & {
  createdAt?: Date;
  updatedAt?: Date;
};

function toDTO(doc: ProfileDocument): InstructorProfileDTO {
  return {
    headline: doc.headline,
    bio: doc.bio,
    expertise: doc.expertise,
    experienceYears: doc.experienceYears,
    status: "active",
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
    updatedAt: (doc.updatedAt ?? new Date()).toISOString(),
  };
}

/**
 * better-auth owns the `user` collection, so the role is written through the
 * shared native connection instead of a Mongoose model. `_id` is an ObjectId
 * even though the session exposes it as a hex string.
 */
async function setUserRole(
  userId: string,
  role: "instructor",
  session: ClientSession,
) {
  const { ObjectId } = mongoose.mongo;

  if (!ObjectId.isValid(userId)) {
    throw new AppError(400, "INVALID_USER", "Your account id is invalid.");
  }

  const result = await mongoose.connection
    .getClient()
    .db()
    .collection("user")
    .updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role } },
      { session },
    );

  if (result.matchedCount === 0) {
    throw new AppError(404, "USER_NOT_FOUND", "Your account could not be found.");
  }
}

/**
 * Completes instructor onboarding: stores the profile, upgrades a student to
 * the instructor role, and records the change. Admins keep their role.
 */
export async function onboardInstructor(params: {
  userId: string;
  currentRole: string;
  input: InstructorOnboardingInput;
}): Promise<InstructorProfileDTO> {
  const { userId, currentRole, input } = params;
  const session = await mongoose.startSession();

  try {
    let profile: ProfileDocument | null = null;

    await session.withTransaction(async () => {
      const existing = await InstructorProfile.findOne({ userId })
        .session(session)
        .lean();

      const updated = await InstructorProfile.findOneAndUpdate(
        { userId },
        {
          $set: {
            headline: input.headline,
            bio: input.bio,
            expertise: input.expertise,
            experienceYears: input.experienceYears,
            status: "active",
          },
        },
        { upsert: true, new: true, session, setDefaultsOnInsert: true },
      ).lean();

      if (!updated) {
        throw new AppError(500, "PROFILE_WRITE_FAILED", "Could not save your profile.");
      }

      profile = updated as ProfileDocument;

      if (currentRole !== "instructor") {
        await setUserRole(userId, "instructor", session);
      }

      await writeAuditLog(
        {
          actorId: userId,
          action: existing
            ? "instructor.profile_updated"
            : "instructor.onboarded",
          targetType: "user",
          targetId: userId,
          metadata: {
            expertise: input.expertise,
            experienceYears: input.experienceYears,
            previousRole: currentRole,
          },
        },
        session,
      );
    });

    if (!profile) {
      throw new AppError(500, "PROFILE_WRITE_FAILED", "Could not save your profile.");
    }

    return toDTO(profile);
  } finally {
    await session.endSession();
  }
}

/** Returns the signed-in user's instructor profile, or null before onboarding. */
export async function getInstructorProfile(
  userId: string,
): Promise<InstructorProfileDTO | null> {
  const doc = await InstructorProfile.findOne({ userId }).lean();
  return doc ? toDTO(doc as ProfileDocument) : null;
}
