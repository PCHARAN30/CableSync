const crypto = require("crypto");
const { computeBilling } = require("../utils/billing");

function newId() {
  return crypto.randomBytes(12).toString("hex");
}

const initialCustomers = [
  {
    _id: "660000000000000000000001",
    serialNumber: 1,
    name: "Aadhya Kumar",
    phone: "9123456789",
    cafNumber: "CAF100101",
    address: "12 Green Street, Santhapet",
    area: "Santhapet",
    pon: "PN1001",
    monthlyFee: 370,
    isActive: true,
    status: "PAID",
    createdAt: new Date("2026-01-10T08:00:00.000Z"),
    updatedAt: new Date(),
  },
  {
    _id: "660000000000000000000002",
    serialNumber: 2,
    name: "Bhavya Rao",
    phone: "9876543210",
    cafNumber: "CAF100102",
    address: "83 Lotus Avenue, Maruthi Nagar",
    area: "Maruthi Nagar",
    pon: "PN1002",
    monthlyFee: 500,
    isActive: true,
    status: "DUE",
    createdAt: new Date("2026-02-15T08:00:00.000Z"),
    updatedAt: new Date(),
  },
  {
    _id: "660000000000000000000003",
    serialNumber: 3,
    name: "Chaitanya Reddy",
    phone: "9012345678",
    cafNumber: "CAF100103",
    address: "47 Sunrise Road, BCPALLI",
    area: "BCPALLI",
    pon: "PN1003",
    monthlyFee: 270,
    isActive: true,
    status: "PAID",
    createdAt: new Date("2026-01-20T08:00:00.000Z"),
    updatedAt: new Date(),
  },
  {
    _id: "660000000000000000000004",
    serialNumber: 4,
    name: "Divya Sharma",
    phone: "9988776655",
    cafNumber: "CAF100104",
    address: "21 Pearl Lane, Kothapeta",
    area: "Kothapeta",
    pon: "PN1004",
    monthlyFee: 370,
    isActive: true,
    status: "DUE",
    createdAt: new Date("2026-03-10T08:00:00.000Z"),
    updatedAt: new Date(),
  },
  {
    _id: "660000000000000000000005",
    serialNumber: 5,
    name: "Eesha Patel",
    phone: "9898989898",
    cafNumber: "CAF100105",
    address: "56 Ocean View, Santhapet",
    area: "Santhapet",
    pon: "PN1005",
    monthlyFee: 500,
    isActive: true,
    status: "PARTIAL",
    createdAt: new Date("2026-04-01T08:00:00.000Z"),
    updatedAt: new Date(),
  },
  {
    _id: "660000000000000000000006",
    serialNumber: 6,
    name: "Farhan Ali",
    phone: "9845123456",
    cafNumber: "CAF100106",
    address: "9 Bazaar Main Road, Gajulapeta",
    area: "Gajulapeta",
    pon: "PN1006",
    monthlyFee: 270,
    isActive: true,
    status: "PAID",
    createdAt: new Date("2026-02-01T08:00:00.000Z"),
    updatedAt: new Date(),
  },
  {
    _id: "660000000000000000000007",
    serialNumber: 7,
    name: "Gayatri Devi",
    phone: "9765432109",
    cafNumber: "CAF100107",
    address: "104 Temple Street, BCPALLI",
    area: "BCPALLI",
    pon: "PN1007",
    monthlyFee: 370,
    isActive: true,
    status: "DUE",
    createdAt: new Date("2026-03-01T08:00:00.000Z"),
    updatedAt: new Date(),
  },
  {
    _id: "660000000000000000000008",
    serialNumber: 8,
    name: "Harish Varma",
    phone: "9654321098",
    cafNumber: "CAF100108",
    address: "78 Gandhi Nagar, Maruthi Nagar",
    area: "Maruthi Nagar",
    pon: "PN1008",
    monthlyFee: 500,
    isActive: true,
    status: "PAID",
    createdAt: new Date("2026-01-05T08:00:00.000Z"),
    updatedAt: new Date(),
  },
  {
    _id: "660000000000000000000009",
    serialNumber: 9,
    name: "Charan Pallapothula",
    phone: "9391529371",
    cafNumber: "CAF100109",
    address: "Plot 42, Raghavendra Colony, Santhapet",
    area: "Santhapet",
    pon: "PN1009",
    monthlyFee: 370,
    isActive: true,
    status: "PAID",
    createdAt: new Date("2026-01-01T08:00:00.000Z"),
    updatedAt: new Date(),
  },
];

const now = new Date();
const initialPayments = [
  {
    _id: "770000000000000000000001",
    customerId: "660000000000000000000001",
    amount: 370,
    paidMonth: now.getMonth() + 1,
    paidYear: now.getFullYear(),
    paymentDate: new Date(now.getTime() - 2 * 3600 * 1000),
    receiptNumber: 1001,
    paymentMode: "UPI",
    notes: "Monthly fee - current month",
    deletedAt: null,
    createdAt: new Date(now.getTime() - 2 * 3600 * 1000),
  },
  {
    _id: "770000000000000000000002",
    customerId: "660000000000000000000006",
    amount: 270,
    paidMonth: now.getMonth() + 1,
    paidYear: now.getFullYear(),
    paymentDate: new Date(now.getTime() - 4 * 3600 * 1000),
    receiptNumber: 1002,
    paymentMode: "Cash",
    notes: "Collected at door",
    deletedAt: null,
    createdAt: new Date(now.getTime() - 4 * 3600 * 1000),
  },
  {
    _id: "770000000000000000000003",
    customerId: "660000000000000000000003",
    amount: 810,
    paidMonth: now.getMonth() + 1,
    paidYear: now.getFullYear(),
    paymentDate: new Date(now.getTime() - 24 * 3600 * 1000),
    receiptNumber: 1003,
    paymentMode: "Cash",
    notes: "3 months in advance",
    deletedAt: null,
    createdAt: new Date(now.getTime() - 24 * 3600 * 1000),
  },
  {
    _id: "770000000000000000000004",
    customerId: "660000000000000000000008",
    amount: 1500,
    paidMonth: now.getMonth() + 1,
    paidYear: now.getFullYear(),
    paymentDate: new Date(now.getTime() - 48 * 3600 * 1000),
    receiptNumber: 1004,
    paymentMode: "Bank Transfer",
    notes: "Quarterly payment",
    deletedAt: null,
    createdAt: new Date(now.getTime() - 48 * 3600 * 1000),
  },
  {
    _id: "770000000000000000000005",
    customerId: "660000000000000000000005",
    amount: 300,
    paidMonth: now.getMonth() + 1,
    paidYear: now.getFullYear(),
    paymentDate: new Date(now.getTime() - 72 * 3600 * 1000),
    receiptNumber: 1005,
    paymentMode: "Cash",
    notes: "Partial payment",
    deletedAt: null,
    createdAt: new Date(now.getTime() - 72 * 3600 * 1000),
  },
  {
    _id: "770000000000000000000009",
    customerId: "660000000000000000000009",
    amount: 370,
    paidMonth: now.getMonth() + 1,
    paidYear: now.getFullYear(),
    paymentDate: new Date(now.getTime() - 24 * 3600 * 1000),
    receiptNumber: 1009,
    paymentMode: "UPI",
    notes: "Monthly subscription - Gold HD Pack",
    deletedAt: null,
    createdAt: new Date(now.getTime() - 24 * 3600 * 1000),
  },
];

const initialActivities = [
  {
    _id: newId(),
    customerId: "660000000000000000000001",
    action: "PAYMENT_ADDED",
    message: "Payment of ₹370 recorded (UPI)",
    createdAt: new Date(now.getTime() - 2 * 3600 * 1000),
  },
  {
    _id: newId(),
    customerId: "660000000000000000000006",
    action: "PAYMENT_ADDED",
    message: "Payment of ₹270 recorded (Cash)",
    createdAt: new Date(now.getTime() - 4 * 3600 * 1000),
  },
  {
    _id: newId(),
    customerId: "660000000000000000000009",
    action: "PAYMENT_ADDED",
    message: "Payment of ₹370 recorded (UPI)",
    createdAt: new Date(now.getTime() - 24 * 3600 * 1000),
  },
];

// Precompute billingSnapshot for initial customers to simulate authoritative snapshot state
initialCustomers.forEach((cust) => {
  const custPayments = initialPayments.filter((p) => p.customerId === cust._id && !p.deletedAt);
  const b = computeBilling({
    createdAt: cust.createdAt,
    monthlyFee: cust.monthlyFee,
    payments: custPayments,
    now: new Date(),
  });
  cust.status = b.status;
  cust.billingSnapshot = {
    status: b.status,
    arrears: b.arrears || 0,
    advanceCredit: b.advanceCredit || 0,
    carryOverBalance: b.carryOverBalance || 0,
    paidThroughDate: b.paidThroughDate,
    nextDueDate: b.nextDueDate,
    daysOverdue: b.daysOverdue || 0,
    daysRemaining: b.daysRemaining || 0,
    monthsAdvance: b.monthsAdvance || 0,
    totalPaid: b.totalPaid || 0,
    lastPaymentDate: custPayments.length ? custPayments[custPayments.length - 1].paymentDate : null,
    lastRecalculatedAt: new Date(),
  };
});

const initialTickets = [
  {
    _id: "880000000000000000000001",
    ticketNumber: "TKT-1001",
    tenantId: "TENANT_001",
    customerId: "660000000000000000000002",
    category: "SET_TOP_BOX",
    title: "Set-top box showing Error E016",
    description: "Channel authorization failed after morning power cut. Kindly reactivate.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    operatorNotes: "Technician assigned to check smart card authorization.",
    createdAt: new Date(now.getTime() - 12 * 3600 * 1000),
    updatedAt: new Date(now.getTime() - 6 * 3600 * 1000),
  },
  {
    _id: "880000000000000000000002",
    ticketNumber: "TKT-1002",
    tenantId: "TENANT_001",
    customerId: "660000000000000000000004",
    category: "WIRE_CUT",
    title: "Loose cable wire near balcony",
    description: "Wind caused wire to sag on the main street. Signal dropping intermittently.",
    status: "OPEN",
    priority: "NORMAL",
    operatorNotes: "",
    createdAt: new Date(now.getTime() - 24 * 3600 * 1000),
    updatedAt: new Date(now.getTime() - 24 * 3600 * 1000),
  },
];

const store = {
  customers: [...initialCustomers],
  payments: [...initialPayments],
  activities: [...initialActivities],
  tickets: [...initialTickets],
  counters: {
    customerSerialNumber: 9,
    receiptNumber: 1009,
    ticketNumber: 1002,
  },
};

function resolveField(doc, path) {
  if (!doc || !path) return undefined;
  if (path in doc) return doc[path];
  const parts = path.split(".");
  let cur = doc;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function matchDoc(doc, query) {
  if (!query || Object.keys(query).length === 0) return true;
  for (const [key, val] of Object.entries(query)) {
    if (key === "$or" && Array.isArray(val)) {
      const orMatched = val.some((subQuery) => matchDoc(doc, subQuery));
      if (!orMatched) return false;
      continue;
    }
    if (key === "_id") {
      if (typeof val === "object" && val !== null && val.$in) {
        const strList = val.$in.map(String);
        if (!strList.includes(String(doc._id))) return false;
        continue;
      }
      const docId = String(doc._id);
      const targetId = typeof val === "object" && val !== null && val._id ? String(val._id) : String(val);
      if (docId !== targetId) return false;
      continue;
    }
    if (key === "customerId") {
      if (typeof val === "object" && val !== null && val.$in) {
        const strList = val.$in.map(String);
        if (!strList.includes(String(doc.customerId))) return false;
        continue;
      }
      if (String(doc.customerId) !== String(val)) return false;
      continue;
    }

    const docVal = resolveField(doc, key);

    if (val instanceof RegExp) {
      if (!val.test(docVal || "")) return false;
      continue;
    }

    if (val && typeof val === "object" && !(val instanceof Date)) {
      if (val.$regex !== undefined) {
        const pattern = typeof val.$regex === "string" ? val.$regex : (val.$regex.source || String(val.$regex));
        const options = val.$options || (val.$regex.flags || "");
        const reg = new RegExp(pattern, options);
        if (!reg.test(String(docVal != null ? docVal : ""))) return false;
        continue;
      }
      if (val.$in && Array.isArray(val.$in)) {
        if (!val.$in.includes(docVal)) return false;
        continue;
      }
      if (val.$nin && Array.isArray(val.$nin)) {
        if (val.$nin.includes(docVal)) return false;
        continue;
      }
      if (val.$ne !== undefined) {
        if (docVal === val.$ne) return false;
        continue;
      }
      if (val.$gte !== undefined || val.$lte !== undefined || val.$gt !== undefined || val.$lt !== undefined) {
        const dVal = docVal instanceof Date ? docVal.getTime() : typeof docVal === "string" && !isNaN(Date.parse(docVal)) ? new Date(docVal).getTime() : docVal;
        if (val.$gte !== undefined) {
          const target = val.$gte instanceof Date ? val.$gte.getTime() : val.$gte;
          if (dVal < target) return false;
        }
        if (val.$gt !== undefined) {
          const target = val.$gt instanceof Date ? val.$gt.getTime() : val.$gt;
          if (dVal <= target) return false;
        }
        if (val.$lte !== undefined) {
          const target = val.$lte instanceof Date ? val.$lte.getTime() : val.$lte;
          if (dVal > target) return false;
        }
        if (val.$lt !== undefined) {
          const target = val.$lt instanceof Date ? val.$lt.getTime() : val.$lt;
          if (dVal >= target) return false;
        }
        continue;
      }
    }

    if (docVal !== val) return false;
  }
  return true;
}

class QueryChain {
  constructor(docs, populateField = null, populateSelect = null) {
    this.docs = docs;
    this._sort = null;
    this._limit = null;
    this._skip = null;
    this._populateField = populateField;
    this._populateSelect = populateSelect;
  }

  sort(criteria) {
    this._sort = criteria;
    return this;
  }

  limit(n) {
    this._limit = n;
    return this;
  }

  skip(n) {
    this._skip = n;
    return this;
  }

  select(fields) {
    return this;
  }

  lean() {
    return this;
  }

  populate(field, select) {
    this._populateField = field;
    this._populateSelect = select;
    return this;
  }

  async exec() {
    let result = this.docs.map((d) => ({ ...d }));
    if (this._sort) {
      result.sort((a, b) => {
        for (const [key, dir] of Object.entries(this._sort)) {
          let aVal = resolveField(a, key);
          let bVal = resolveField(b, key);
          if (
            aVal instanceof Date ||
            (typeof aVal === "string" && !isNaN(Date.parse(aVal)) && (key.toLowerCase().includes("date") || key.toLowerCase().includes("at")))
          ) {
            aVal = new Date(aVal).getTime();
          }
          if (
            bVal instanceof Date ||
            (typeof bVal === "string" && !isNaN(Date.parse(bVal)) && (key.toLowerCase().includes("date") || key.toLowerCase().includes("at")))
          ) {
            bVal = new Date(bVal).getTime();
          }
          if (aVal === bVal) continue;
          const order = dir === -1 || dir === "desc" ? -1 : 1;
          if (aVal > bVal) return order;
          if (aVal < bVal) return -order;
        }
        return 0;
      });
    }
    if (this._skip) {
      result = result.slice(this._skip);
    }
    if (this._limit) {
      result = result.slice(0, this._limit);
    }
    if (this._populateField === "customerId") {
      result = result.map((p) => {
        const cust = store.customers.find((c) => String(c._id) === String(p.customerId));
        return {
          ...p,
          customerId: cust ? { _id: cust._id, name: cust.name } : p.customerId,
        };
      });
    }
    return result;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

class SingleDocQuery {
  constructor(candidates, collectionName = "customers") {
    if (Array.isArray(candidates)) {
      this._candidates = [...candidates];
      this._doc = candidates.length > 0 ? candidates[0] : null;
    } else {
      this._candidates = candidates ? [candidates] : [];
      this._doc = candidates || null;
    }
    this._collectionName = collectionName;
    this._populateField = null;
    this._populateSelect = null;
  }

  sort(criteria) {
    if (this._candidates.length > 0 && criteria && typeof criteria === "object") {
      const entries = Object.entries(criteria);
      this._candidates.sort((a, b) => {
        for (const [key, dir] of entries) {
          const valA = a[key];
          const valB = b[key];
          const order = dir === -1 || dir === "desc" || dir === "descending" ? -1 : 1;
          if (valA instanceof Date && valB instanceof Date) {
            const diff = valA.getTime() - valB.getTime();
            if (diff !== 0) return diff * order;
          } else if (typeof valA === "number" && typeof valB === "number") {
            const diff = valA - valB;
            if (diff !== 0) return diff * order;
          } else {
            const strA = String(valA ?? "");
            const strB = String(valB ?? "");
            const cmp = strA.localeCompare(strB);
            if (cmp !== 0) return cmp * order;
          }
        }
        return 0;
      });
      this._doc = this._candidates[0];
    }
    return this;
  }

  lean() {
    return this;
  }

  select(fields) {
    return this;
  }

  limit(n) {
    return this;
  }

  skip(n) {
    return this;
  }

  populate(field, select) {
    this._populateField = field;
    this._populateSelect = select;
    return this;
  }

  async exec() {
    if (!this._doc) return null;
    let res = { ...this._doc };
    if (this._populateField === "customerId") {
      const cust = store.customers.find((c) => String(c._id) === String(res.customerId));
      res.customerId = cust ? { _id: cust._id, name: cust.name } : res.customerId;
    }
    const collectionName = this._collectionName;
    res.save = async function () {
      if (collectionName === "customers") {
        const idx = store.customers.findIndex((c) => String(c._id) === String(this._id));
        if (idx !== -1) {
          const copy = { ...this, updatedAt: new Date() };
          delete copy.save;
          store.customers[idx] = copy;
        }
      } else if (collectionName === "payments") {
        const idx = store.payments.findIndex((p) => String(p._id) === String(this._id));
        if (idx !== -1) {
          const copy = { ...this, updatedAt: new Date() };
          delete copy.save;
          store.payments[idx] = copy;
        }
      }
      return this;
    };
    return res;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

const mockCustomer = {
  find(query) {
    const matched = store.customers.filter((c) => matchDoc(c, query));
    return new QueryChain(matched);
  },
  findById(id) {
    const found = store.customers.find((c) => String(c._id) === String(id));
    return new SingleDocQuery(found || null);
  },
  findOne(query) {
    const matched = store.customers.filter((c) => matchDoc(c, query));
    return new SingleDocQuery(matched);
  },
  async countDocuments(query) {
    return store.customers.filter((c) => matchDoc(c, query)).length;
  },
  async create(data) {
    const createdAt = data.createdAt || new Date();
    const monthlyFee = Number(data.monthlyFee) || 0;
    const initialSnapshot = data.billingSnapshot || {
      status: "DUE",
      arrears: monthlyFee,
      advanceCredit: 0,
      carryOverBalance: 0,
      paidThroughDate: new Date(new Date(createdAt).getTime() - 86400000),
      nextDueDate: new Date(createdAt),
      daysOverdue: 0,
      daysRemaining: 0,
      monthsAdvance: 0,
      totalPaid: 0,
      lastPaymentDate: null,
      lastRecalculatedAt: new Date(),
    };
    const newDoc = {
      _id: newId(),
      isActive: true,
      status: initialSnapshot.status,
      billingSnapshot: initialSnapshot,
      createdAt,
      updatedAt: new Date(),
      ...data,
    };
    store.customers.push(newDoc);
    return { ...newDoc };
  },
  async insertMany(docs) {
    const created = docs.map((d) => {
      const createdAt = d.createdAt || new Date();
      const monthlyFee = Number(d.monthlyFee) || 0;
      const initialSnapshot = d.billingSnapshot || {
        status: d.status || "DUE",
        arrears: monthlyFee,
        advanceCredit: 0,
        carryOverBalance: 0,
        paidThroughDate: new Date(new Date(createdAt).getTime() - 86400000),
        nextDueDate: new Date(createdAt),
        daysOverdue: 0,
        daysRemaining: 0,
        monthsAdvance: 0,
        totalPaid: 0,
        lastPaymentDate: null,
        lastRecalculatedAt: new Date(),
      };
      return {
        _id: d._id || newId(),
        isActive: d.isActive !== undefined ? d.isActive : true,
        status: initialSnapshot.status,
        billingSnapshot: initialSnapshot,
        createdAt,
        updatedAt: d.updatedAt || new Date(),
        ...d,
      };
    });
    store.customers.push(...created);
    return created;
  },
  findByIdAndUpdate(id, update, options) {
    const idx = store.customers.findIndex((c) => String(c._id) === String(id));
    if (idx === -1) return new SingleDocQuery(null);
    const fieldsToUpdate = update.$set ? { ...update.$set } : { ...update };
    store.customers[idx] = {
      ...store.customers[idx],
      ...fieldsToUpdate,
      updatedAt: new Date(),
    };
    return new SingleDocQuery(store.customers[idx]);
  },
  async findByIdAndDelete(id) {
    const idx = store.customers.findIndex((c) => String(c._id) === String(id));
    if (idx === -1) return null;
    const removed = store.customers.splice(idx, 1)[0];
    return removed;
  },
  async deleteMany(query) {
    if (!query || Object.keys(query).length === 0) {
      const count = store.customers.length;
      store.customers = [];
      return { deletedCount: count };
    }
    const before = store.customers.length;
    store.customers = store.customers.filter((c) => !matchDoc(c, query));
    return { deletedCount: before - store.customers.length };
  },
  async aggregate(pipeline) {
    let result = store.customers.filter((c) => c.isActive);

    const matchStep = pipeline.find((s) => s.$match);
    if (matchStep) {
      result = result.filter((c) => matchDoc(c, matchStep.$match));
    }

    const groupStep = pipeline.find((s) => s.$group);
    if (!groupStep) return result;

    const groupDef = groupStep.$group;
    if (groupDef._id === null) {
      let paidCount = 0;
      let partialCount = 0;
      let dueCount = 0;
      let totalArrears = 0;
      let todaysDueCount = 0;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const yesterday = new Date(todayStart.getTime() - 86400000);

      for (const c of result) {
        const snap = c.billingSnapshot || {};
        const st = snap.status || c.status;
        if (st === "PAID") paidCount++;
        else if (st === "PARTIAL") partialCount++;
        else if (st === "DUE") dueCount++;

        totalArrears += snap.arrears || 0;

        if (st === "DUE" && snap.paidThroughDate) {
          const pt = new Date(snap.paidThroughDate);
          pt.setHours(0, 0, 0, 0);
          if (pt.getTime() === yesterday.getTime()) {
            todaysDueCount++;
          }
        }
      }

      return [
        {
          _id: null,
          totalCustomers: result.length,
          paidCount,
          partialCount,
          dueCount,
          totalArrears,
          todaysDueCount,
        },
      ];
    }

    const areas = new Map();
    for (const c of result) {
      const area = c.area || "Unassigned";
      const prev = areas.get(area) || { _id: area, customers: 0, billed: 0 };
      prev.customers += 1;
      prev.billed += (c.monthlyFee || 0);
      areas.set(area, prev);
    }
    return Array.from(areas.values());
  },
};

const mockPayment = {
  find(query) {
    const matched = store.payments.filter((p) => matchDoc(p, query));
    return new QueryChain(matched);
  },
  findById(id) {
    const found = store.payments.find((p) => String(p._id) === String(id));
    return new SingleDocQuery(found || null, "payments");
  },
  findOne(query) {
    const matched = store.payments.filter((p) => matchDoc(p, query));
    return new SingleDocQuery(matched, "payments");
  },
  async countDocuments(query) {
    return store.payments.filter((p) => matchDoc(p, query)).length;
  },
  async create(data) {
    const newDoc = {
      _id: newId(),
      deletedAt: null,
      paymentDate: new Date(),
      createdAt: new Date(),
      ...data,
    };
    store.payments.push(newDoc);
    const res = { ...newDoc };
    res.save = async function () {
      const idx = store.payments.findIndex((p) => String(p._id) === String(this._id));
      if (idx !== -1) {
        const copy = { ...this, updatedAt: new Date() };
        delete copy.save;
        store.payments[idx] = copy;
      }
      return this;
    };
    return res;
  },
  async insertMany(docs) {
    const created = docs.map((d) => ({
      _id: d._id || newId(),
      deletedAt: null,
      paymentDate: d.paymentDate || new Date(),
      createdAt: d.createdAt || new Date(),
      ...d,
    }));
    store.payments.push(...created);
    return created;
  },
  findByIdAndUpdate(id, update, options) {
    const idx = store.payments.findIndex((p) => String(p._id) === String(id));
    if (idx === -1) return new SingleDocQuery(null, "payments");
    store.payments[idx] = { ...store.payments[idx], ...update, updatedAt: new Date() };
    return new SingleDocQuery(store.payments[idx], "payments");
  },
  async deleteMany(query) {
    if (!query || Object.keys(query).length === 0) {
      const count = store.payments.length;
      store.payments = [];
      return { deletedCount: count };
    }
    const before = store.payments.length;
    store.payments = store.payments.filter((p) => !matchDoc(p, query));
    return { deletedCount: before - store.payments.length };
  },
  async aggregate(pipeline) {
    let result = store.payments.filter((p) => p.deletedAt === null);

    const matchStep = pipeline.find((s) => s.$match);
    if (matchStep) {
      result = result.filter((p) => {
        const m = matchStep.$match;
        if (m.paidYear && p.paidYear !== m.paidYear) return false;
        if (m.paidMonth && p.paidMonth !== m.paidMonth) return false;
        if (m.paymentDate && m.paymentDate.$gte) {
          if (new Date(p.paymentDate).getTime() < new Date(m.paymentDate.$gte).getTime()) return false;
        }
        return true;
      });
    }

    const groupStep = pipeline.find((s) => s.$group);
    if (!groupStep) return result;

    const groupDef = groupStep.$group;
    if (groupDef._id === null) {
      const collected = result.reduce((sum, p) => sum + p.amount, 0);
      return [{ _id: null, collected, payments: result.length }];
    }

    if (groupDef._id && groupDef._id.year) {
      const groups = new Map();
      for (const p of result) {
        const key = `${p.paidYear}-${p.paidMonth}`;
        const prev = groups.get(key) || {
          _id: { year: p.paidYear, month: p.paidMonth },
          collected: 0,
          payments: 0,
        };
        prev.collected += p.amount;
        prev.payments += 1;
        groups.set(key, prev);
      }
      return Array.from(groups.values());
    }

    if (pipeline.some((s) => s.$lookup)) {
      const groups = new Map();
      for (const p of result) {
        const cust = store.customers.find((c) => String(c._id) === String(p.customerId));
        const area = cust?.area || "Unassigned";
        const prev = groups.get(area) || { _id: area, collected: 0 };
        prev.collected += p.amount;
        groups.set(area, prev);
      }
      return Array.from(groups.values());
    }

    const groups = new Map();
    for (const p of result) {
      const key = String(p.customerId);
      const prev = groups.get(key) || { _id: p.customerId, totalPaid: 0 };
      prev.totalPaid += p.amount;
      groups.set(key, prev);
    }
    return Array.from(groups.values());
  },
};

const mockCounter = {
  async getNextSequence(name) {
    store.counters[name] = (store.counters[name] || 0) + 1;
    return store.counters[name];
  },
  async findByIdAndUpdate(id, update, options) {
    if (update.$inc && update.$inc.seq) {
      store.counters[id] = (store.counters[id] || 0) + update.$inc.seq;
    } else if (typeof update.seq === "number") {
      store.counters[id] = update.seq;
    }
    return { seq: store.counters[id] };
  },
  async deleteMany() {
    store.counters = { customerSerialNumber: 0, receiptNumber: 0 };
    return { deletedCount: 2 };
  },
};

const mockActivityLog = {
  async create(data) {
    const newDoc = {
      _id: newId(),
      createdAt: new Date(),
      ...data,
    };
    store.activities.push(newDoc);
    return { ...newDoc };
  },
  find(query) {
    const matched = store.activities.filter((a) => matchDoc(a, query));
    return new QueryChain(matched);
  },
  async insertMany(docs) {
    const created = docs.map((d) => ({
      _id: d._id || newId(),
      createdAt: d.createdAt || new Date(),
      ...d,
    }));
    store.activities.push(...created);
    return created;
  },
  async deleteMany(query) {
    if (!query || Object.keys(query).length === 0) {
      const count = store.activities.length;
      store.activities = [];
      return { deletedCount: count };
    }
    const before = store.activities.length;
    store.activities = store.activities.filter((a) => !matchDoc(a, query));
    return { deletedCount: before - store.activities.length };
  },
};

const mockTicket = {
  async create(data) {
    store.counters.ticketNumber = (store.counters.ticketNumber || 1000) + 1;
    const ticketNumber = data.ticketNumber || `TKT-${store.counters.ticketNumber}`;
    const newDoc = {
      _id: newId(),
      ticketNumber,
      tenantId: data.tenantId || "TENANT_001",
      status: data.status || "OPEN",
      priority: data.priority || "NORMAL",
      operatorNotes: data.operatorNotes || "",
      resolvedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    store.tickets.unshift(newDoc);
    return { ...newDoc };
  },
  find(query = {}) {
    const matched = store.tickets.filter((t) => matchDoc(t, query));
    return new QueryChain(matched);
  },
  findOne(query = {}) {
    const matched = store.tickets.find((t) => matchDoc(t, query));
    return new QueryChain(matched ? [matched] : []);
  },
  async findById(id) {
    const doc = store.tickets.find((t) => String(t._id) === String(id));
    return doc ? { ...doc } : null;
  },
  async countDocuments(query = {}) {
    return store.tickets.filter((t) => matchDoc(t, query)).length;
  },
  async findByIdAndUpdate(id, update, options = {}) {
    const idx = store.tickets.findIndex((t) => String(t._id) === String(id));
    if (idx === -1) return null;
    const updated = { ...store.tickets[idx], ...update, updatedAt: new Date() };
    store.tickets[idx] = updated;
    return { ...updated };
  },
};

module.exports = {
  store,
  mockCustomer,
  mockPayment,
  mockCounter,
  mockActivityLog,
  mockTicket,
};
