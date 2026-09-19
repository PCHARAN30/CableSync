const PaymentProof = require("../models/PaymentProof");
const Payment = require("../models/Payment");
const { computeBilling } = require("../utils/billing");
const { createPayment } = require("./paymentController");

function parseDate(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) throw new Error("A valid payment date is required");
  return date;
}

async function submitPaymentProof(req, res) {
  try {
    const { transactionId, paymentDate, screenshot } = req.body;
    const existingPayments = await Payment.find({ customerId: req.customer._id, deletedAt: null }, { amount: 1, paymentDate: 1 }).lean();
    const billing = computeBilling({
      createdAt: req.customer.createdAt,
      monthlyFee: req.customer.monthlyFee,
      payments: existingPayments,
      now: new Date(),
    });
    const numericAmount = Math.max(0, billing.arrears || 0) || req.customer.monthlyFee;
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: "No payable amount is available for this account." });
    }
    if (!transactionId?.trim()) {
      return res.status(400).json({ success: false, message: "Transaction or UTR ID is required." });
    }
    if (!screenshot?.data || !/^data:image\/(png|jpe?g|webp);base64,/i.test(screenshot.data)) {
      return res.status(400).json({ success: false, message: "A PNG, JPEG, or WebP payment screenshot is required." });
    }
    if (screenshot.data.length > 7 * 1024 * 1024) {
      return res.status(413).json({ success: false, message: "Payment screenshot must be smaller than 5 MB." });
    }

    const proof = await PaymentProof.create({
      customerId: req.customer._id,
      tenantId: req.customer.tenantId || "TENANT_001",
      amount: numericAmount,
      transactionId: transactionId.trim(),
      paymentDate: parseDate(paymentDate),
      paymentMode: "UPI",
      screenshot,
    });

    res.status(201).json({
      success: true,
      message: "Payment proof submitted. An operator will verify it before your account is updated.",
      data: { id: proof._id, amount: proof.amount, transactionId: proof.transactionId, status: proof.status, createdAt: proof.createdAt },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function getCustomerPaymentProofs(req, res) {
  const proofs = await PaymentProof.find({ customerId: req.customer._id })
    .select("-screenshot.data")
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: proofs });
}

async function approvePaymentProof(req, res) {
  const proof = await PaymentProof.findById(req.params.id);
  if (!proof) return res.status(404).json({ success: false, message: "Payment proof not found." });
  if (proof.status !== "PENDING") return res.status(409).json({ success: false, message: "Payment proof has already been reviewed." });

  let paymentResponse;
  await createPayment(
    {
      body: {
        customerId: proof.customerId,
        amount: proof.amount,
        paymentDate: proof.paymentDate,
        paymentMode: proof.paymentMode,
        notes: `Approved payment proof ${proof.transactionId}`,
        idempotencyKey: `proof:${proof._id}`,
      },
      headers: {},
      user: { name: req.user?.name || "Operator" },
      tenantId: proof.tenantId,
    },
    {
      status(code) { this.code = code; return this; },
      json(payload) { paymentResponse = payload; return this; },
    },
  );

  if (!paymentResponse?.success) {
    return res.status(paymentResponse?.code || 400).json(paymentResponse || { success: false, message: "Unable to record approved payment." });
  }

  proof.status = "APPROVED";
  proof.verifiedAt = new Date();
  proof.verifiedBy = req.user?.name || "Operator";
  proof.paymentId = paymentResponse.payment?._id;
  await proof.save();
  res.json({ success: true, data: proof, payment: paymentResponse.payment, updatedBilling: paymentResponse.updatedBilling });
}

async function getPaymentProofs(req, res) {
  const filter = req.query.status ? { status: String(req.query.status).toUpperCase() } : {};
  const proofs = await PaymentProof.find(filter)
    .populate("customerId", "name cafNumber phone")
    .select("-screenshot.data")
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: proofs });
}

async function getPaymentProofScreenshot(req, res) {
  const proof = await PaymentProof.findById(req.params.id).select("screenshot");
  if (!proof) return res.status(404).json({ success: false, message: "Payment proof not found." });
  const match = proof.screenshot.data.match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/i);
  if (!match) return res.status(422).json({ success: false, message: "Payment screenshot is invalid." });
  res.type(match[1]).send(Buffer.from(match[2], "base64"));
}

async function rejectPaymentProof(req, res) {
  const proof = await PaymentProof.findById(req.params.id);
  if (!proof) return res.status(404).json({ success: false, message: "Payment proof not found." });
  if (proof.status !== "PENDING") return res.status(409).json({ success: false, message: "Payment proof has already been reviewed." });
  proof.status = "REJECTED";
  proof.rejectionReason = String(req.body.reason || "Payment proof could not be verified").trim();
  proof.verifiedAt = new Date();
  proof.verifiedBy = req.user?.name || "Operator";
  await proof.save();
  res.json({ success: true, data: proof });
}

module.exports = {
  submitPaymentProof,
  getCustomerPaymentProofs,
  getPaymentProofs,
  getPaymentProofScreenshot,
  approvePaymentProof,
  rejectPaymentProof,
};
