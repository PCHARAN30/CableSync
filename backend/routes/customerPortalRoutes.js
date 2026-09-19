const express = require("express");
const router = express.Router();
const resolvePublicCustomer = require("../middleware/resolvePublicCustomer");
const {
  getMe,
  getDashboard,
  getBilling,
  getPayments,
  getReceipt,
  createPaymentIntent,
  getService,
  getSupportTickets,
  createSupportTicket,
} = require("../controllers/customerPortalController");
const { submitPaymentProof, getCustomerPaymentProofs } = require("../controllers/paymentProofController");
const Tenant = require("../models/Tenant");

router.get("/payment-settings", async (req, res) => {
  const tenant = await Tenant.findOne({ code: "TENANT_001" }).lean();
  res.json({
    success: true,
    data: {
      upiId: tenant?.paymentUpiId || "cablesync@upi",
      displayName: tenant?.paymentDisplayName || tenant?.name || "CableSync Network",
    },
  });
});

// Public Customer Portal Endpoints
router.get("/me", resolvePublicCustomer, getMe);
router.get("/dashboard", resolvePublicCustomer, getDashboard);
router.get("/billing", resolvePublicCustomer, getBilling);
router.get("/payments", resolvePublicCustomer, getPayments);
router.get("/receipts/:id", resolvePublicCustomer, getReceipt);
router.get("/payment-proofs", resolvePublicCustomer, getCustomerPaymentProofs);
router.post("/payment-proofs", resolvePublicCustomer, submitPaymentProof);
router.get("/service", resolvePublicCustomer, getService);
router.get("/support", resolvePublicCustomer, getSupportTickets);
router.post("/support", resolvePublicCustomer, createSupportTicket);

module.exports = router;
