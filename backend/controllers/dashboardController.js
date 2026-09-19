const Customer = require("../models/Customer");
const Payment = require("../models/Payment");
const { startOfDay, endOfDay } = require("../utils/date");
const { enrichCustomersWithBilling } = require("../services/billingService");

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// GET /dashboard/summary
// Powers the dashboard cards (Total, Paid, Partial, Due, Today's Amount),
// the "expiring soon" list (customers whose paid-through date falls within
// the next 7 days), and the recent-payments feed. All status classification
// uses the ledger model in utils/billing.js, not the cached Customer.status
// field, so the dashboard can never drift from what Customer Details shows.
async function getSummary(req, res) {
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  try {
    // 1. Aggregation over indexed customer snapshot data
    const [stats] = await Customer.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          paidCount: {
            $sum: { $cond: [{ $eq: ["$billingSnapshot.status", "PAID"] }, 1, 0] },
          },
          partialCount: {
            $sum: { $cond: [{ $eq: ["$billingSnapshot.status", "PARTIAL"] }, 1, 0] },
          },
          dueCount: {
            $sum: { $cond: [{ $eq: ["$billingSnapshot.status", "DUE"] }, 1, 0] },
          },
          totalArrears: {
            $sum: {
              $cond: [
                { $eq: ["$billingSnapshot.status", "DUE"] },
                { $ifNull: ["$billingSnapshot.arrears", 0] },
                0,
              ],
            },
          },
        },
      },
    ]);

    const totalCustomers = stats?.totalCustomers || 0;
    const paidCount = stats?.paidCount || 0;
    const partialCount = stats?.partialCount || 0;
    const dueCount = stats?.dueCount || 0;
    const totalArrears = stats?.totalArrears || 0;

    // 2. Query expiring soon directly from indexed paidThroughDate
    const expiringSoonDocs = await Customer.find({
      isActive: true,
      "billingSnapshot.paidThroughDate": {
        $gte: todayStart,
        $lte: new Date(todayStart.getTime() + SEVEN_DAYS_MS),
      },
    })
      .select("_id name billingSnapshot.paidThroughDate")
      .sort({ "billingSnapshot.paidThroughDate": 1 })
      .limit(15)
      .lean();

    const expiringSoon = expiringSoonDocs.map((c) => ({
      customerId: c._id,
      name: c.name,
      paidThroughDate: c.billingSnapshot?.paidThroughDate,
    }));

    // 3. Customers whose cycle expired yesterday (due today)
    const yesterdayStart = startOfDay(new Date(todayStart.getTime() - 86400000));
    const yesterdayEnd = endOfDay(yesterdayStart);
    const todaysDueCount = await Customer.countDocuments({
      isActive: true,
      "billingSnapshot.status": "DUE",
      "billingSnapshot.paidThroughDate": { $gte: yesterdayStart, $lte: yesterdayEnd },
    });

    // 4. Today's collection total using indexed Payment query
    const todaysPayments = await Payment.find({
      paymentDate: { $gte: todayStart, $lte: todayEnd },
      deletedAt: null,
    }).select("amount").lean();

    const todaysCollection = todaysPayments.reduce(
      (sum, p) => sum + p.amount,
      0,
    );

    // 5. New customers added today
    const newCustomersToday = await Customer.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
      isActive: true,
    });

    const expectedCollection = todaysCollection + totalArrears;
    const collectionPercentage =
      expectedCollection > 0
        ? Math.round((todaysCollection / expectedCollection) * 100)
        : 100;

    // 6. Last 10 payments across all customers for "Recent Payments" feed
    const recentPayments = await Payment.find({ deletedAt: null })
      .populate("customerId", "name")
      .sort({ paymentDate: -1, createdAt: -1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        paidCount,
        partialCount,
        dueCount,
        remainingDue: totalArrears,
        todaysDueCount,
        todaysCollection,
        newCustomersToday,
        expectedCollection,
        collectionPercentage,
        expiringSoon,
        recentPayments,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getSummary };
