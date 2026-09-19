const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      default: "TENANT_001",
    },
    name: {
      type: String,
      required: true,
      default: "CableSync Network",
    },
    phone: {
      type: String,
      default: "9876543210",
    },
    email: {
      type: String,
      default: "admin@cablesync.local",
    },
    supportPhone: {
      type: String,
      default: "+91 98765 43210",
      trim: true,
    },
    supportEmail: {
      type: String,
      default: "care@cablesync.com",
      trim: true,
    },
    officeHours: {
      type: String,
      default: "9:00 AM - 8:00 PM (All Days)",
      trim: true,
    },
    emergencyHelpline: {
      type: String,
      default: "1800-420-CABLE",
      trim: true,
    },
    paymentUpiId: {
      type: String,
      default: "cablesync@upi",
      trim: true,
    },
    paymentDisplayName: {
      type: String,
      default: "CableSync Network",
      trim: true,
    },
    billingSettings: {
      cycleDays: { type: Number, default: 30 },
      gracePeriodDays: { type: Number, default: 3 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tenant", tenantSchema);
