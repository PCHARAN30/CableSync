const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    serialNumber: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    tenantId: {
      type: String,
      default: "TENANT_001",
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    cafNumber: {
      required: true,
      type: String,
      trim: true,
      unique: true,
      index: true,
    },
    address: {
      type: String,
      trim: true,
    },
    area: {
      type: String,
      trim: true,
      index: true,
    },
    pon: {
      type: String,
      trim: true,
    },
    monthlyFee: {
      type: Number,
      required: true,
      min: 0,
    },
    // Kept as a stored field for fast list/dashboard queries, but the
    // source of truth is computed from Payment records (see paymentController
    // due-logic notes). Recompute this whenever a payment is added/removed.
    status: {
      type: String,
      enum: ["PAID", "PARTIAL", "DUE", "INACTIVE"],
      default: "DUE",
    },
    // Authoritative live billing snapshot.
    // Maintained atomically when payments are created or voided.
    // Enables indexed, paginated queries without in-memory full-ledger hydration.
    billingSnapshot: {
      status: {
        type: String,
        enum: ["PAID", "PARTIAL", "DUE"],
        default: "DUE",
        index: true,
      },
      arrears: { type: Number, default: 0, min: 0 },
      advanceCredit: { type: Number, default: 0, min: 0 },
      carryOverBalance: { type: Number, default: 0, min: 0 },
      paidThroughDate: { type: Date, default: null },
      nextDueDate: { type: Date, default: null, index: true },
      daysOverdue: { type: Number, default: 0, min: 0 },
      daysRemaining: { type: Number, default: 0, min: 0 },
      monthsAdvance: { type: Number, default: 0, min: 0 },
      totalPaid: { type: Number, default: 0, min: 0 },
      lastPaymentDate: { type: Date, default: null },
      lastRecalculatedAt: { type: Date, default: Date.now },
    },
    // Soft-delete flag instead of hard delete - customers can be
    // disconnected without losing their payment history.
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }, // gives createdAt + updatedAt automatically
);

// Compound indexes to support fast, paginated, indexed queries
customerSchema.index({ isActive: 1, "billingSnapshot.status": 1, name: 1 });
customerSchema.index({ isActive: 1, "billingSnapshot.nextDueDate": 1 });
customerSchema.index({ isActive: 1, "billingSnapshot.arrears": -1 });
customerSchema.index({ isActive: 1, area: 1, name: 1 });

// Text index to support the /search endpoint across multiple fields
// Text index to support the /search endpoint across multiple fields
customerSchema.index({
  name: "text",
  phone: "text",
  cafNumber: "text",
  address: "text",
  pon: "text",
});

const { mockCustomer } = require("../config/mockStore");

const RealCustomer = mongoose.model("Customer", customerSchema);

const CustomerProxy = new Proxy(RealCustomer, {
  get(target, prop) {
    if (mongoose.connection.readyState !== 1) {
      if (prop in mockCustomer) {
        return typeof mockCustomer[prop] === "function"
          ? mockCustomer[prop].bind(mockCustomer)
          : mockCustomer[prop];
      }
    }
    return Reflect.get(target, prop);
  },
});

module.exports = CustomerProxy;
