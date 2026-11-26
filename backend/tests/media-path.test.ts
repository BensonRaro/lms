import { describe, expect, test } from "bun:test";
import {
  mediaPublicId,
  parseMediaPublicId,
} from "../src/lib/cloudinary/media-path.js";

describe("parseMediaPublicId", () => {
  test("reads kind and owner back from ids the app generated", () => {
    expect(
      parseMediaPublicId(
        mediaPublicId("thumbnail", "user-1", "6f0b1c9e-3a4d-4e5f-8a90"),
      ),
    ).toEqual({ kind: "thumbnail", userId: "user-1" });

    expect(
      parseMediaPublicId(
        mediaPublicId("video", "user-1", "6f0b1c9e-3a4d-4e5f-8a90"),
      ),
    ).toEqual({ kind: "video", userId: "user-1" });
  });

  test("rejects ids outside the app's own folders", () => {
    expect(parseMediaPublicId("other/lesson-videos/user-1/file")).toBeNull();
    expect(parseMediaPublicId("lms/avatars/user-1/file")).toBeNull();
  });

  test("rejects ids without an owner or a file name", () => {
    expect(parseMediaPublicId("lms/lesson-videos//file")).toBeNull();
    expect(parseMediaPublicId("lms/lesson-videos/user-1/")).toBeNull();
    expect(parseMediaPublicId("lms/lesson-videos/user-1")).toBeNull();
  });
});
