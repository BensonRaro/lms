import { Schema, model, type InferSchemaType } from "mongoose";

/**
 * Append-only record of sensitive changes (role upgrades, course review
 * decisions). Written in the same transaction as the change it describes.
 */
const auditLogSchema = new Schema(
  {
    actorId: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    targetType: { type: String, required: true },
    targetId: { type: String, required: true, index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ createdAt: -1 });

export type AuditLogDoc = InferSchemaType<typeof auditLogSchema>;

export const AuditLog = model("AuditLog", auditLogSchema);
