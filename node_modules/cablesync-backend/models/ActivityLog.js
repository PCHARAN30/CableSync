const mongoose = require('mongoose');

// Automatic audit trail. Never written to directly by an operator - only
// ever created by the backend itself when a payment or customer record
// changes, via utils/activityLog.js. This is what "auto system note"
// means here: the system narrates its own changes, the operator doesn't
// have to.
const activityLogSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: [
        'CUSTOMER_CREATED',
        'CUSTOMER_UPDATED',
        'CUSTOMER_DEACTIVATED',
        'CUSTOMER_RESTORED',
        'PAYMENT_ADDED',
        'PAYMENT_DELETED',
        'TICKET_CREATED',
        'TICKET_UPDATED',
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

activityLogSchema.index({ customerId: 1, createdAt: -1 });

const { mockActivityLog } = require("../config/mockStore");

const RealActivityLog = mongoose.model('ActivityLog', activityLogSchema);

const ActivityLogProxy = new Proxy(RealActivityLog, {
  get(target, prop) {
    if (mongoose.connection.readyState !== 1) {
      if (prop in mockActivityLog) {
        return typeof mockActivityLog[prop] === "function"
          ? mockActivityLog[prop].bind(mockActivityLog)
          : mockActivityLog[prop];
      }
    }
    return Reflect.get(target, prop);
  },
});

module.exports = ActivityLogProxy;
