/**
 * One-Time Migration Script: Populate Initial Customer Billing Snapshots
 *
 * Traverses all customers, replays their existing non-deleted payment history
 * through the deterministic 30-day billing engine (computeBilling), and stores
 * the authoritative snapshot directly onto Customer.billingSnapshot.
 *
 * This populates the database so that:
 * 1. GET /customers can query and paginate purely in MongoDB using indexes.
 * 2. GET /dashboard/summary can compute metrics via fast database aggregation.
 * 3. GET /reports/pending-dues can fetch overdue accounts directly by indexed status and arrears.
 *
 * Usage:
 *   node backend/scripts/migrateSnapshots.js
 */

const mongoose = require("mongoose");
require("dotenv").config();

const Customer = require("../models/Customer");
const Payment = require("../models/Payment");
const { computeBilling } = require("../utils/billing");

async function migrateSnapshots({ silent = false } = {}) {
  const log = (...args) => {
    if (!silent) console.log(...args);
  };

  const isStandalone = mongoose.connection.readyState === 0;
  if (isStandalone) {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/cablesync";
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      log(`Connected to MongoDB at ${mongoUri}`);
    } catch (err) {
      log(`MongoDB not accessible: ${err.message}. Running against current datastore.`);
    }
  }

  log("Starting billing snapshot migration...");

  const customers = await Customer.find({}).lean();
  log(`Found ${customers.length} total customers.`);

  let migratedCount = 0;
  let paidCount = 0;
  let partialCount = 0;
  let dueCount = 0;
  let totalArrears = 0;

  for (const customer of customers) {
    const customerPayments = await Payment.find(
      { customerId: customer._id, deletedAt: null },
      { amount: 1, paymentDate: 1 }
    ).lean();

    const billing = computeBilling({
      createdAt: customer.createdAt,
      monthlyFee: customer.monthlyFee,
      payments: customerPayments,
      now: new Date(),
    });

    const snapshot = {
      status: billing.status,
      arrears: billing.arrears || 0,
      advanceCredit: billing.advanceCredit || 0,
      carryOverBalance: billing.carryOverBalance || 0,
      paidThroughDate: billing.paidThroughDate,
      nextDueDate: billing.nextDueDate,
      daysOverdue: billing.daysOverdue || 0,
      daysRemaining: billing.daysRemaining || 0,
      monthsAdvance: billing.monthsAdvance || 0,
      totalPaid: billing.totalPaid || 0,
      lastPaymentDate:
        customerPayments.length > 0
          ? customerPayments[customerPayments.length - 1].paymentDate
          : null,
      lastRecalculatedAt: new Date(),
    };

    await Customer.findByIdAndUpdate(customer._id, {
      $set: {
        status: billing.status,
        billingSnapshot: snapshot,
      },
    });

    migratedCount++;
    if (billing.status === "PAID") paidCount++;
    else if (billing.status === "PARTIAL") partialCount++;
    else if (billing.status === "DUE") dueCount++;

    totalArrears += billing.arrears || 0;
  }

  log("==========================================");
  log("Billing Snapshot Migration Completed!");
  log(`Total Customers Migrated: ${migratedCount}`);
  log(`PAID Customers:           ${paidCount}`);
  log(`PARTIAL Customers:        ${partialCount}`);
  log(`DUE Customers:            ${dueCount}`);
  log(`Total Arrears Computed:   ₹${totalArrears.toLocaleString("en-IN")}`);
  log("==========================================");

  if (isStandalone && mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }

  return {
    migratedCount,
    paidCount,
    partialCount,
    dueCount,
    totalArrears,
  };
}

if (require.main === module) {
  migrateSnapshots()
    .then(() => {
      console.log("Migration finished successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}

module.exports = { migrateSnapshots };
