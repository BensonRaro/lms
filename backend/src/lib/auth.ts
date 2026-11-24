import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { env } from "./env.js";

const client = new MongoClient(env.MONGODB_URI!);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  baseURL: "http://localhost:5000/",
  emailAndPassword: { enabled: true },
  trustedOrigins: [env.FRONTEND_URL],
  user: {
    additionalFields: {
      // Platform role. `input: false` keeps it out of sign-up/update-user
      // payloads so a client can never promote itself; only the server writes it.
      role: {
        type: "string",
        required: false,
        defaultValue: "student",
        input: false,
      },
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
});
