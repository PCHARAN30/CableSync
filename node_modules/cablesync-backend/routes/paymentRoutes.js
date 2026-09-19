const express = require("express");
const router = express.Router();
const {
  createPayment,
  getPaymentsByCustomer,
  deletePayment,
  getTodaysCollection,
  previewPayment,
  getAllPayments,
} = require("../controllers/paymentController");

router.get("/", getAllPayments);
router.get("/collection-history", getAllPayments);
router.post("/", createPayment);
router.get("/today", getTodaysCollection);
router.get("/customer/:id", getPaymentsByCustomer);
router.delete("/:id", deletePayment);
router.post("/preview", previewPayment);

module.exports = router;
