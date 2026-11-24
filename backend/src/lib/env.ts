import { z } from "zod";
import "dotenv/config";

/**
 * Validates environment variables at startup to ensure the server
 * doesn't start with missing critical configuration.
 */
const envSchema = z.object({
  PORT: z.preprocess(
    (val) => (val === undefined ? "5000" : String(val)),
    z.string().transform(Number),
  ),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  MONGODB_URI: z.string().url(),
  GEMINI_API_KEY: z.string().min(1),
  INNGEST_EVENT_KEY: z.string().min(1),
  INNGEST_SIGNING_KEY: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  FRONTEND_URL: z.string().url(),
});

const _env = envSchema.safeParse(process.env as Record<string, string>);

if (!_env.success) {
  console.error("❌ Invalid environment variables:");
  console.error(JSON.stringify(_env.error.format(), null, 2));
  process.exit(1);
}

export const env = _env.data;
