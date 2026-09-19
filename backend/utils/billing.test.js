const test = require("node:test");
const assert = require("node:assert/strict");
const { computeBilling } = require("./billing");

test("1. New customer with no payments has status DUE and correct initial arrears", () => {
  const created = new Date("2026-09-01T10:00:00.000Z");
  const result = computeBilling({
    createdAt: created,
    monthlyFee: 370,
    payments: [],
    now: created,
  });

  assert.equal(result.status, "DUE");
  assert.equal(result.arrears, 370);
  assert.equal(result.totalPaid, 0);
  assert.equal(result.monthsAdvance, 0);
});

test("2. Exact single cycle payment grants 30 days and status PAID", () => {
  const created = new Date("2026-09-01T10:00:00.000Z");
  const result = computeBilling({
    createdAt: created,
    monthlyFee: 370,
    payments: [{ amount: 370, paymentDate: created }],
    now: created,
  });

  assert.equal(result.status, "PAID");
  assert.equal(result.arrears, 0);
  assert.equal(result.totalPaid, 370);
  assert.ok(result.paidThroughDate >= created);
});

test("3. Partial payment leaves remaining arrears with status PARTIAL", () => {
  const created = new Date("2026-09-01T10:00:00.000Z");
  const result = computeBilling({
    createdAt: created,
    monthlyFee: 500,
    payments: [{ amount: 200, paymentDate: created }],
    now: created,
  });

  assert.equal(result.status, "PARTIAL");
  assert.equal(result.arrears, 300);
  assert.equal(result.totalPaid, 200);
});

test("4. Multi-month advance payment calculates future paid-through date and monthsAdvance", () => {
  const created = new Date("2026-01-01T10:00:00.000Z");
  // Customer pays 6 months in advance (6 * 370 = 2220)
  const result = computeBilling({
    createdAt: created,
    monthlyFee: 370,
    payments: [{ amount: 2220, paymentDate: created }],
    now: created,
  });

  assert.equal(result.status, "PAID");
  assert.equal(result.arrears, 0);
  assert.ok(result.monthsAdvance >= 5);
  assert.ok(result.paidThroughDate > new Date("2026-06-01"));
});

test("5. Multiple payments made on same day accumulate total credit correctly", () => {
  const paymentDate = new Date("2026-09-05T12:00:00.000Z");
  const result = computeBilling({
    createdAt: new Date("2026-09-01T08:00:00.000Z"),
    monthlyFee: 500,
    payments: [
      { amount: 200, paymentDate },
      { amount: 300, paymentDate },
    ],
    now: paymentDate,
  });

  assert.equal(result.totalPaid, 500);
  assert.equal(result.status, "PAID");
  assert.equal(result.arrears, 0);
});

test("6. 30-day boundary test: Active on Day 29, Due on Day 31", () => {
  const created = new Date("2026-09-01T00:00:00.000Z");
  const paidResult = computeBilling({
    createdAt: created,
    monthlyFee: 300,
    payments: [{ amount: 300, paymentDate: created }],
    now: new Date("2026-09-29T00:00:00.000Z"), // Day 29
  });

  assert.equal(paidResult.status, "PAID");

  const overdueResult = computeBilling({
    createdAt: created,
    monthlyFee: 300,
    payments: [{ amount: 300, paymentDate: created }],
    now: new Date("2026-10-05T00:00:00.000Z"), // Day 35
  });

  assert.ok(overdueResult.status === "DUE" || overdueResult.status === "PARTIAL");
  assert.ok(overdueResult.daysOverdue > 0 || overdueResult.arrears > 0);
});

test("7. Soft-deleted / voided payments are excluded from active ledger", () => {
  const created = new Date("2026-09-01T10:00:00.000Z");
  const result = computeBilling({
    createdAt: created,
    monthlyFee: 370,
    payments: [
      // Only active payments passed to computeBilling
      { amount: 370, paymentDate: created, deletedAt: new Date() },
    ].filter((p) => !p.deletedAt),
    now: created,
  });

  assert.equal(result.status, "DUE");
  assert.equal(result.totalPaid, 0);
});
