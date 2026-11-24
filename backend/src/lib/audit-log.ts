import type { ClientSession } from "mongoose";
import { AuditLog } from "../models/audit-log.model.js";

type AuditEntry = {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
};

/**
 * Records a sensitive change. Callers must pass the transaction session so the
 * audit row and the change commit (or roll back) together.
 */
export async function writeAuditLog(entry: AuditEntry, session: ClientSession) {
  await AuditLog.create([entry], { session });
}
