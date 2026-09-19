const express = require("express");
const router = express.Router();
const { getPendingDues, getMonthlyCollection, getAreaCollection, getTopDefaulters, getCollectionTrend } = require("../controllers/reportController");
const { getAllPayments } = require("../controllers/paymentController");

// GET /reports/pending-dues - Report of all customers with outstanding dues
router.get("/pending-dues", getPendingDues);
router.get("/collection-history", getAllPayments);
router.get("/monthly-collection", getMonthlyCollection);
router.get("/area-collection", getAreaCollection);
router.get("/top-defaulters", getTopDefaulters);
router.get("/collection-trend", getCollectionTrend);

module.exports = router;
