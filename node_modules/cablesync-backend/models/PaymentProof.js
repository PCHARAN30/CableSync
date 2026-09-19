const mongoose = require("mongoose");

const paymentProofSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    tenantId: { type: String, default: "TENANT_001", index: true },
    amount: { type: Number, required: true, min: 0.01 },
    transactionId: { type: String, required: true, trim: true, maxlength: 120 },
    paymentDate: { type: Date, required: true },
    paymentMode: { type: String, default: "UPI", trim: true },
    screenshot: {
      data: { type: String, required: true },
      contentType: { type: String, required: true },
      filename: { type: String, required: true },
    },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING", index: true },
    rejectionReason: { type: String, trim: true, maxlength: 500 },
    verifiedAt: { type: Date, default: null },
    verifiedBy: { type: String, default: null },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null },
  },
  { timestamps: true },
);

paymentProofSchema.index({ customerId: 1, createdAt: -1 });

module.exports = mongoose.model("PaymentProof", paymentProofSchema);
