const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      default: "TENANT_001",
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
    },
    cyclePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paidThroughDate: {
      type: Date,
      default: Date.now,
    },
    nextDueDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "DUE", "SUSPENDED"],
      default: "ACTIVE",
    },
    currentBalance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

subscriptionSchema.index({ customerId: 1 });
subscriptionSchema.index({ tenantId: 1, status: 1 });

module.exports = mongoose.model("Subscription", subscriptionSchema);
