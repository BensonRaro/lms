import mongoose from "mongoose";
import { env } from "./env.js";

/**
 * Single Mongoose connection instance used throughout the application.
 * Managed in a singleton pattern to prevent multiple connection attempts.
 */
let connection: mongoose.Connection | null = null;

// Register connection event listeners before connecting.
mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB connected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("🔌 MongoDB disconnected");
});

export async function connectDB() {
  if (connection) {
    return connection;
  }

  try {
    console.log("Connecting to MongoDB...");

    const conn = await mongoose.connect(env.MONGODB_URI, {
      // Disable automatic index creation in production.
      autoIndex: env.NODE_ENV !== "production",
    });

    connection = conn.connection;

    return connection;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
}

export async function disconnectDB() {
  if (connection) {
    await mongoose.disconnect();
    connection = null;
  }
}

export { mongoose };
