const AuditLog = require("../models/AuditLog");

/**
 * Log a structured audit event
 */
async function logAuditEvent({
  tenantId = "TENANT_001",
  actorId = "system",
  actorType = "SYSTEM",
  actorName = "System",
  action,
  entityType,
  entityId,
  beforeState = null,
  afterState = null,
  ipAddress = "",
  userAgent = "",
  requestId = "",
  session = null,
}) {
  try {
    const doc = {
      tenantId,
      actorId: String(actorId),
      actorType,
      actorName,
      action,
      entityType,
      entityId: String(entityId),
      beforeState,
      afterState,
      ipAddress,
      userAgent,
      requestId,
    };

    if (session) {
      await AuditLog.create([doc], { session });
    } else {
      await AuditLog.create(doc);
    }
  } catch (err) {
    console.warn("Failed to write audit log event:", err.message);
  }
}

module.exports = {
  logAuditEvent,
};
