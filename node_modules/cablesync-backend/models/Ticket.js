const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: "TENANT_001",
      index: true,
    },
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        "NO_SIGNAL",
        "SET_TOP_BOX",
        "WIRE_CUT",
        "BILLING_ISSUE",
        "SLOW_SPEED",
        "CHANNEL_ISSUE",
        "OTHER",
      ],
      default: "NO_SIGNAL",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED"],
      default: "OPEN",
      index: true,
    },
    priority: {
      type: String,
      enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
      default: "NORMAL",
    },
    operatorNotes: {
      type: String,
      trim: true,
      default: "",
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

ticketSchema.index({ customerId: 1, createdAt: -1 });

ticketSchema.pre("validate", async function (next) {
  if (!this.ticketNumber) {
    try {
      const Counter = mongoose.model("Counter");
      const seq = await Counter.getNextSequence("ticketNumber");
      this.ticketNumber = `TKT-${String(1000 + Number(seq || 1)).padStart(4, "0")}`;
    } catch (e) {
      this.ticketNumber = `TKT-${Date.now().toString().slice(-6)}`;
    }
  }
  next();
});

const { mockTicket } = require("../config/mockStore");

const RealTicket = mongoose.model("Ticket", ticketSchema);

const TicketProxy = new Proxy(RealTicket, {
  get(target, prop) {
    if (mongoose.connection.readyState !== 1) {
      if (mockTicket && prop in mockTicket) {
        return typeof mockTicket[prop] === "function"
          ? mockTicket[prop].bind(mockTicket)
          : mockTicket[prop];
      }
    }
    return Reflect.get(target, prop);
  },
});

module.exports = TicketProxy;
