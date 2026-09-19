const Payment = require("../models/Payment");
const Customer = require("../models/Customer");
const Counter = require("../models/Counter");
const { computeBilling } = require("../services/billingService");
const { logActivity, monthName } = require("../utils/activityLog");
const { logAuditEvent } = require("../services/auditService");
const { startOfDay, endOfDay } = require("../utils/date");

function parsePaymentDate(value) {
  if (!value) return startOfDay(new Date());

  // HTML <input type="date"> sends YYYY-MM-DD. Construct at noon so the
  // calendar date remains stable across UTC/local timezone conversions.
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    const [year, month, day] = String(value).split("-").map(Number);
    const parsed = new Date(year, month - 1, day, 12, 0, 0, 0);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid payment date");
  }
  return parsed;
}

function validateAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Payment amount must be greater than zero");
  }
  return amount;
}

// POST /payments
async function createPayment(req, res) {
  try {
    const { customerId, paymentMode, notes } = req.body;
    const amount = validateAmount(req.body.amount);
    const paymentTimestamp = parsePaymentDate(req.body.paymentDate);
    const tenantId = req.tenantId || req.body.tenantId || "TENANT_001";
    const idempotencyKey = req.body.idempotencyKey || req.headers["x-idempotency-key"];

    const customer = await Customer.findOne({ _id: customerId });
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Check Idempotency Key
    if (idempotencyKey) {
      const existingKeyPayment = await Payment.findOne({
        tenantId,
        idempotencyKey,
        deletedAt: null,
      });
      if (existingKeyPayment) {
        const existingPayments = await Payment.find(
          { customerId: customer._id, deletedAt: null },
          { amount: 1, paymentDate: 1 },
        ).lean();
        const currentBilling = computeBilling({
          createdAt: customer.createdAt,
          monthlyFee: customer.monthlyFee,
          payments: existingPayments,
          now: new Date(),
        });
        return res.status(200).json({
          success: true,
          data: existingKeyPayment,
          payment: existingKeyPayment,
          idempotentReplay: true,
          updatedBilling: currentBilling,
        });
      }
    }

    // Do not allow future collections. Backdated entries remain supported.
    if (startOfDay(paymentTimestamp) > startOfDay(new Date())) {
      return res.status(400).json({ error: "Payment date cannot be in the future" });
    }

    // Prevent accidental duplicate submissions within a short time frame unless explicitly confirmed for advance/future months
    const isExplicitFutureOrAdvance = Boolean(
      req.body.allowDuplicate || req.body.isAdvance || req.body.isFuturePayment
    );

    const tenSecondsAgo = new Date(Date.now() - 10000);
    const recentDuplicate = await Payment.findOne({
      customerId,
      amount,
      paymentMode,
      createdAt: { $gte: tenSecondsAgo },
      deletedAt: null,
    });

    if (recentDuplicate && !isExplicitFutureOrAdvance) {
      const existingPayments = await Payment.find(
        { customerId: customer._id, deletedAt: null },
        { amount: 1, paymentDate: 1 },
      ).lean();
      const currentBilling = computeBilling({
        createdAt: customer.createdAt,
        monthlyFee: customer.monthlyFee,
        payments: existingPayments,
        now: new Date(),
      });

      return res.status(409).json({
        success: false,
        error: "Duplicate payment detected. A similar payment was recorded just now.",
        isDuplicate: true,
        recentPayment: recentDuplicate,
        updatedBilling: currentBilling,
        message: `Payment of ₹${amount.toLocaleString("en-IN")} was already recorded just now.`,
      });
    }

    const nextReceiptNumber = await Counter.getNextSequence("receiptNumber");

    // Snapshot the state before this payment. A recorded payment never needs
    // to be reverse-engineered later to explain partial or advance amounts.
    const existingPayments = await Payment.find(
      { customerId: customer._id, deletedAt: null },
      { amount: 1, paymentDate: 1 },
    ).lean();
    const previousBilling = computeBilling({
      createdAt: customer.createdAt,
      monthlyFee: customer.monthlyFee,
      payments: existingPayments,
      now: paymentTimestamp,
    });
    const previousDue = Math.max(0, previousBilling.arrears || 0);
    const allocatedToArrears = Math.min(amount, previousDue);
    const allocatedToAdvance = Math.max(0, amount - allocatedToArrears);

    const simulatedBilling = computeBilling({
      createdAt: customer.createdAt,
      monthlyFee: customer.monthlyFee,
      payments: [...existingPayments, { amount, paymentDate: paymentTimestamp }],
      now: new Date(),
    });

    const payment = await Payment.create({
      tenantId,
      customerId,
      amount,
      paidMonth: paymentTimestamp.getMonth() + 1,
      paidYear: paymentTimestamp.getFullYear(),
      paymentDate: paymentTimestamp,
      paymentMode: paymentMode || "Cash",
      notes,
      idempotencyKey,
      collectedBy: req.user?.name || "Operator",
      status: "COMPLETED",
      receiptNumber: nextReceiptNumber,
      previousDue,
      allocatedToArrears,
      allocatedToAdvance,
      remainingDue: Math.max(0, simulatedBilling.arrears || 0),
      previousPaidThrough: previousBilling.paidThroughDate,
      resultingPaidThrough: simulatedBilling.paidThroughDate,
    });

    // Recalculate from the complete ledger. This is the single source of
    // truth for arrears, paid-through date and advance months.
    const updatedBilling = simulatedBilling;

    // Keep the cached status and billingSnapshot synchronized atomically
    customer.status = updatedBilling.status;
    customer.billingSnapshot = {
      status: updatedBilling.status,
      arrears: updatedBilling.arrears || 0,
      advanceCredit: updatedBilling.advanceCredit || 0,
      carryOverBalance: updatedBilling.carryOverBalance || 0,
      paidThroughDate: updatedBilling.paidThroughDate,
      nextDueDate: updatedBilling.nextDueDate,
      daysOverdue: updatedBilling.daysOverdue || 0,
      daysRemaining: updatedBilling.daysRemaining || 0,
      monthsAdvance: updatedBilling.monthsAdvance || 0,
      totalPaid: updatedBilling.totalPaid || 0,
      lastPaymentDate: payment.paymentDate,
      lastRecalculatedAt: new Date(),
    };
    if (typeof customer.save === "function") {
      await customer.save();
    } else {
      await Customer.findByIdAndUpdate(customer._id, {
        status: customer.status,
        billingSnapshot: customer.billingSnapshot,
      });
    }

    const isPartialPayment = (payment.remainingDue || 0) > 0;
    await logActivity(
      customer._id,
      "PAYMENT_ADDED",
      isPartialPayment
        ? `Partial payment of ₹${payment.amount.toLocaleString("en-IN")} recorded for ${monthName(payment.paidMonth)} ${payment.paidYear} (${payment.paymentMode}) — ₹${payment.remainingDue.toLocaleString("en-IN")} due remaining`
        : `Payment of ₹${payment.amount.toLocaleString("en-IN")} recorded for ${monthName(payment.paidMonth)} ${payment.paidYear} (${payment.paymentMode})`,
    );

    await logAuditEvent({
      tenantId,
      actorId: req.user?.userId || req.user?.sub || "operator",
      actorType: "OPERATOR",
      actorName: req.user?.name || "Operator",
      action: "PAYMENT_RECORDED",
      entityType: "Payment",
      entityId: payment._id,
      afterState: {
        amount: payment.amount,
        receiptNumber: payment.receiptNumber,
        paymentMode: payment.paymentMode,
        customerId: payment.customerId,
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(201).json({
      payment,
      updatedBilling,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// GET /payments/customer/:id
// Optional ?year=2026 to filter to one year for the history view.
async function getPaymentsByCustomer(req, res) {
  try {
    const filter = { customerId: req.params.id, deletedAt: null };
    if (req.query.year) filter.paidYear = Number(req.query.year);

    const payments = await Payment.find(filter).sort({
      createdAt: -1,
      paymentDate: -1,
    });
    res.json(payments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// DELETE /payments/:id
// Soft delete - sets deletedAt instead of removing the document.
async function deletePayment(req, res) {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true },
    );
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    const customer = await Customer.findById(payment.customerId);
    let updatedBilling = null;

    if (customer) {
      const allPayments = await Payment.find(
        { customerId: customer._id, deletedAt: null },
        { amount: 1, paymentDate: 1 },
      ).lean();

      updatedBilling = computeBilling({
        createdAt: customer.createdAt,
        monthlyFee: customer.monthlyFee,
        payments: allPayments,
        now: new Date(),
      });

      customer.status = updatedBilling.status;
      customer.billingSnapshot = {
        status: updatedBilling.status,
        arrears: updatedBilling.arrears || 0,
        advanceCredit: updatedBilling.advanceCredit || 0,
        carryOverBalance: updatedBilling.carryOverBalance || 0,
        paidThroughDate: updatedBilling.paidThroughDate,
        nextDueDate: updatedBilling.nextDueDate,
        daysOverdue: updatedBilling.daysOverdue || 0,
        daysRemaining: updatedBilling.daysRemaining || 0,
        monthsAdvance: updatedBilling.monthsAdvance || 0,
        totalPaid: updatedBilling.totalPaid || 0,
        lastPaymentDate: allPayments.length ? allPayments[allPayments.length - 1].paymentDate : null,
        lastRecalculatedAt: new Date(),
      };
      if (typeof customer.save === "function") {
        await customer.save();
      } else {
        await Customer.findByIdAndUpdate(customer._id, {
          status: customer.status,
          billingSnapshot: customer.billingSnapshot,
        });
      }
    }

    await logActivity(
      payment.customerId,
      "PAYMENT_DELETED",
      `Payment of ₹${payment.amount.toLocaleString("en-IN")} for ${monthName(payment.paidMonth)} ${payment.paidYear} deleted`,
    );

    res.json({ message: "Payment deleted", payment, updatedBilling });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// GET /payments/today
async function getTodaysCollection(req, res) {
  try {
    const today = new Date();
    const payments = await Payment.find({
      paymentDate: { $gte: startOfDay(today), $lte: endOfDay(today) },
      deletedAt: null,
    })
      .populate("customerId", "name phone serialNumber")
      .sort({ paymentDate: -1 });

    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    res.json({ count: payments.length, total, payments });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// POST /payments/preview
// Simulates a payment without saving it.
async function previewPayment(req, res) {
  try {
    const { customerId } = req.body;
    const amount = validateAmount(req.body.amount);
    const paymentTimestamp = parsePaymentDate(req.body.paymentDate);

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const existingPayments = await Payment.find(
      { customerId: customer._id, deletedAt: null },
      { amount: 1, paymentDate: 1 },
    ).lean();

    const simulatedPayments = [
      ...existingPayments,
      { amount, paymentDate: paymentTimestamp },
    ];

    const previewBilling = computeBilling({
      createdAt: customer.createdAt,
      monthlyFee: customer.monthlyFee,
      payments: simulatedPayments,
      now: new Date(),
    });

    res.json({
      ...previewBilling,
      paymentDate: paymentTimestamp,
      paymentAmount: amount,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// GET /payments or GET /payments/collection-history
async function getAllPayments(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const { mode, search, startDate, endDate, preset } = req.query;

    const filter = { deletedAt: null };

    // Mode filter
    if (mode && mode !== "all") {
      filter.paymentMode = new RegExp(`^${mode}$`, "i");
    }

    // Date filtering (preset or custom startDate/endDate)
    const now = new Date();
    if (preset === "today") {
      filter.paymentDate = { $gte: startOfDay(now), $lte: endOfDay(now) };
    } else if (preset === "yesterday") {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      filter.paymentDate = { $gte: startOfDay(yesterday), $lte: endOfDay(yesterday) };
    } else if (preset === "thisWeek") {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - 7);
      filter.paymentDate = { $gte: startOfDay(weekStart), $lte: endOfDay(now) };
    } else if (preset === "thisMonth") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      filter.paymentDate = { $gte: startOfDay(monthStart), $lte: endOfDay(now) };
    } else if (preset === "lastMonth") {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      filter.paymentDate = { $gte: lastMonthStart, $lte: lastMonthEnd };
    } else if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = startOfDay(new Date(startDate));
      if (endDate) filter.paymentDate.$lte = endOfDay(new Date(endDate));
    }

    // Search filter across customer name, phone, cafNumber, area, receiptNumber, notes
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      const numSearch = Number(search.trim());

      const matchingCustomers = await Customer.find({
        $or: [
          { name: searchRegex },
          { phone: searchRegex },
          { cafNumber: searchRegex },
          { area: searchRegex },
        ],
      }).select("_id");

      const matchingCustomerIds = matchingCustomers.map((c) => c._id);

      const searchConditions = [
        { customerId: { $in: matchingCustomerIds } },
        { notes: searchRegex },
      ];
      if (!isNaN(numSearch)) {
        searchConditions.push({ receiptNumber: numSearch });
      }
      filter.$or = searchConditions;
    }

    const [totalCount, payments, allFilteredPayments] = await Promise.all([
      Payment.countDocuments(filter),
      Payment.find(filter)
        .populate("customerId", "serialNumber name phone cafNumber area monthlyFee status pon")
        .sort({ paymentDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            cashTotal: { $sum: { $cond: [{ $eq: ["$paymentMode", "Cash"] }, "$amount", 0] } },
            upiTotal: { $sum: { $cond: [{ $eq: ["$paymentMode", "UPI"] }, "$amount", 0] } },
            otherTotal: {
              $sum: {
                $cond: [
                  { $not: [{ $in: ["$paymentMode", ["Cash", "UPI"]] }] },
                  "$amount",
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    const stats = allFilteredPayments[0] || {
      totalAmount: 0,
      cashTotal: 0,
      upiTotal: 0,
      otherTotal: 0,
    };

    // Calculate today's stats for header cards
    const today = new Date();
    const todayPayments = await Payment.aggregate([
      {
        $match: {
          deletedAt: null,
          paymentDate: { $gte: startOfDay(today), $lte: endOfDay(today) },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit) || 1,
          totalPayments: totalCount,
          limit,
        },
        summary: {
          totalAmount: stats.totalAmount,
          cashTotal: stats.cashTotal,
          upiTotal: stats.upiTotal,
          otherTotal: stats.otherTotal,
          filteredCount: totalCount,
          todayTotal: todayPayments[0]?.totalAmount || 0,
          todayCount: todayPayments[0]?.count || 0,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch collection history: " + err.message });
  }
}

module.exports = {
  createPayment,
  getPaymentsByCustomer,
  deletePayment,
  getTodaysCollection,
  previewPayment,
  getAllPayments,
};
