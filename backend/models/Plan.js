const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      default: "TENANT_001",
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    cycleDays: {
      type: Number,
      default: 30,
    },
    category: {
      type: String,
      enum: ["CABLE_TV", "BROADBAND", "COMBO"],
      default: "CABLE_TV",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

planSchema.index({ tenantId: 1, name: 1 });

module.exports = mongoose.model("Plan", planSchema);
