const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      default: "TENANT_001",
      index: true,
    },
    actorId: {
      type: String,
      required: true,
    },
    actorType: {
      type: String,
      enum: ["OPERATOR", "CUSTOMER", "SYSTEM", "GATEWAY_WEBHOOK"],
      default: "OPERATOR",
    },
    actorName: {
      type: String,
      default: "System",
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      required: true,
      enum: ["Customer", "Payment", "Ticket", "User", "Plan", "Subscription"],
    },
    entityId: {
      type: String,
      required: true,
    },
    beforeState: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    afterState: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    requestId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ tenantId: 1, createdAt: -1 });
auditLogSchema.index({ tenantId: 1, entityType: 1, entityId: 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
