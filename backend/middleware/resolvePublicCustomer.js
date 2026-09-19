const Customer = require("../models/Customer");
const { verifyToken } = require("../utils/jwt");

/**
 * Public customer-portal context.
 *
 * First try the customer JWT from the Authorization header. If there is no
 * token, fall back to the legacy demo mode where the caller selects the
 * customer via x-customer-id, customerId, phone, or cafNumber.
 */
async function resolvePublicCustomer(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const bearerToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;

    if (bearerToken) {
      const decoded = verifyToken(bearerToken);
      if (!decoded || decoded.type !== "CUSTOMER") {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired customer session.",
        });
      }

      const customer = await Customer.findById(
        decoded.customerId || decoded.sub,
      ).exec();

      if (!customer || customer.isActive === false) {
        return res.status(401).json({
          success: false,
          message: "Customer session is no longer active.",
        });
      }

      req.customer = customer;
      req.tenantId = customer.tenantId || "TENANT_001";
      return next();
    }

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
        ? {
            phone: {
              $regex: `${String(phone).replace(/\D/g, "").slice(-10)}$`,
            },
            isActive: { $ne: false },
          }
        : cafNumber
          ? {
              cafNumber: String(cafNumber).trim().toUpperCase(),
              isActive: { $ne: false },
            }
          : { isActive: { $ne: false } };

    const customer = await Customer.findOne(query).sort({ createdAt: 1 });
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found." });
    }

    req.customer = customer;
    req.tenantId = customer.tenantId || "TENANT_001";
    next();
  } catch (err) {
    if (err.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid customer id." });
    }
    next(err);
  }
}

module.exports = resolvePublicCustomer;
