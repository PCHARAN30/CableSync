const express = require("express");
const router = express.Router();
const {
  getPaymentProofs,
  getPaymentProofScreenshot,
  approvePaymentProof,
  rejectPaymentProof,
} = require("../controllers/paymentProofController");

router.get("/", getPaymentProofs);
router.get("/:id/screenshot", getPaymentProofScreenshot);
router.post("/:id/approve", approvePaymentProof);
router.post("/:id/reject", rejectPaymentProof);

module.exports = router;
