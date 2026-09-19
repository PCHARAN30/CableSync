const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    // Calendar fields are kept for reporting/history only. Billing itself is
    // calculated from paymentDate + the customer ledger.
    paidMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    paidYear: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    receiptNumber: {
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
    idempotencyKey: {
      type: String,
      sparse: true,
      index: true,
    },
    collectedBy: {
      type: String,
      default: "OPERATOR",
    },
    status: {
      type: String,
      enum: ["COMPLETED", "VOIDED"],
      default: "COMPLETED",
    },
    paymentMode: {
      type: String,
      enum: ["Cash", "UPI", "Bank Transfer", "Card", "Net Banking", "Other"],
      default: "Cash",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    // Immutable allocation snapshot. These values explain exactly how this
    // collection affected the ledger at the moment it was recorded.
    previousDue: { type: Number, min: 0, default: 0 },
    allocatedToArrears: { type: Number, min: 0, default: 0 },
    allocatedToAdvance: { type: Number, min: 0, default: 0 },
    remainingDue: { type: Number, min: 0, default: 0 },
    previousPaidThrough: { type: Date, default: null },
    resultingPaidThrough: { type: Date, default: null },
    // Financial records are soft-deleted for auditability.
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

paymentSchema.index({ customerId: 1, paymentDate: 1 });
paymentSchema.index({ customerId: 1, paidYear: 1, paidMonth: 1 });
paymentSchema.index({ tenantId: 1, idempotencyKey: 1 }, { sparse: true });

const { mockPayment } = require("../config/mockStore");

const RealPayment = mongoose.model("Payment", paymentSchema);

const PaymentProxy = new Proxy(RealPayment, {
  get(target, prop) {
    if (mongoose.connection.readyState !== 1) {
      if (prop in mockPayment) {
        return typeof mockPayment[prop] === "function"
          ? mockPayment[prop].bind(mockPayment)
          : mockPayment[prop];
      }
    }
    return Reflect.get(target, prop);
  },
});

module.exports = PaymentProxy;
