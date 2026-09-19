const Customer = require("../models/Customer");

/**
 * Public customer-portal context.
 *
 * Authentication is intentionally disabled for the open-source/demo build.
 * The caller selects the customer through x-customer-id, customerId, phone,
 * or cafNumber. This is not an access-control boundary.
 */
async function resolvePublicCustomer(req, res, next) {
  try {
    const customerId =
      req.headers["x-customer-id"] ||
      req.query.customerId ||
      req.body?.customerId;
    const phone = req.query.phone || req.body?.phone;
    const cafNumber = req.query.cafNumber || req.body?.cafNumber;

    if (!customerId && !phone && !cafNumber) {
      return res.status(401).json({
        success: false,
        message: "Select a customer using an id, phone number, or CAF number.",
      });
    }

    const query = customerId
      ? { _id: customerId, isActive: { $ne: false } }
      : phone
        ? { phone: { $regex: `${String(phone).replace(/\D/g, "").slice(-10)}$` }, isActive: { $ne: false } }
        : cafNumber
          ? {
              cafNumber: String(cafNumber).trim().toUpperCase(),
              isActive: { $ne: false },
            }
          : { isActive: { $ne: false } };

    const customer = await Customer.findOne(query).sort({ createdAt: 1 });
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found." });
    }

    req.customer = customer;
    req.tenantId = customer.tenantId || "TENANT_001";
    next();
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid customer id." });
    }
    next(err);
  }
}

module.exports = resolvePublicCustomer;
