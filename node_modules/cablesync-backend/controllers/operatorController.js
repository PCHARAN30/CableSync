const Tenant = require("../models/Tenant");

const DEFAULT_OPERATOR = {
  name: "CableSync Prime Network",
  supportPhone: "+91 98765 43210",
  supportEmail: "care@cablesync.com",
  officeHours: "9:00 AM - 8:00 PM (All Days)",
  emergencyHelpline: "1800-420-CABLE",
  paymentUpiId: "cablesync@upi",
  paymentDisplayName: "CableSync Network",
};

async function getOperatorDetails(req, res) {
  try {
    const tenant = await Tenant.findOne({ code: "TENANT_001" }).lean();
    res.json({
      success: true,
      data: {
        name: tenant?.name || DEFAULT_OPERATOR.name,
        supportPhone: tenant?.supportPhone || DEFAULT_OPERATOR.supportPhone,
        supportEmail: tenant?.supportEmail || DEFAULT_OPERATOR.supportEmail,
        officeHours: tenant?.officeHours || DEFAULT_OPERATOR.officeHours,
        emergencyHelpline: tenant?.emergencyHelpline || DEFAULT_OPERATOR.emergencyHelpline,
        paymentUpiId: tenant?.paymentUpiId || DEFAULT_OPERATOR.paymentUpiId,
        paymentDisplayName: tenant?.paymentDisplayName || DEFAULT_OPERATOR.paymentDisplayName,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateOperatorDetails(req, res) {
  try {
    const updates = {};
    for (const field of Object.keys(DEFAULT_OPERATOR)) {
      if (req.body[field] !== undefined) {
        const value = String(req.body[field]).trim();
        if (!value) {
          return res.status(400).json({ success: false, message: `${field} is required.` });
        }
        updates[field] = value;
      }
    }

    const tenant = await Tenant.findOneAndUpdate(
      { code: "TENANT_001" },
      { $set: updates },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();

    res.json({
      success: true,
      data: {
        name: tenant.name,
        supportPhone: tenant.supportPhone,
        supportEmail: tenant.supportEmail,
        officeHours: tenant.officeHours,
        emergencyHelpline: tenant.emergencyHelpline,
        paymentUpiId: tenant.paymentUpiId,
        paymentDisplayName: tenant.paymentDisplayName,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getOperatorDetails, updateOperatorDetails };
