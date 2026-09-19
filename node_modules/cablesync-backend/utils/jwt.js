const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const isProduction = process.env.NODE_ENV === "production";

function resolveSecret() {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.trim().length >= 32) {
    return process.env.JWT_SECRET.trim();
  }

  if (isProduction) {
    // Never fall back to a guessable/shared default in production — a hardcoded
    // secret means anyone who reads the source code can forge valid operator
    // and customer tokens. Fail loudly at startup instead of serving traffic
    // with a broken auth system.
    throw new Error(
      "JWT_SECRET is missing (or shorter than 32 characters). Set a strong, " +
        "random JWT_SECRET in the production environment before starting the server. " +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\"",
    );
  }

  // Local/dev convenience only: generate a random per-process secret so tokens
  // still work for local testing, but nothing persists across restarts and
  // nothing is shared/guessable. Set JWT_SECRET in backend/.env to avoid this
  // and to keep tokens valid across restarts during development.
  console.warn(
    "[dev] JWT_SECRET not set — using a random, ephemeral secret for this run only. " +
      "Set JWT_SECRET in backend/.env for stable local tokens.",
  );
  return crypto.randomBytes(48).toString("hex");
}

const JWT_SECRET = resolveSecret();
const OPERATOR_TOKEN_EXPIRY = process.env.OPERATOR_TOKEN_EXPIRY || "7d";
const CUSTOMER_TOKEN_EXPIRY = process.env.CUSTOMER_TOKEN_EXPIRY || "30d";

/**
 * Sign an operator JWT
 */
function signOperatorToken(user) {
  const payload = {
    sub: String(user._id),
    userId: String(user._id),
    tenantId: user.tenantId || "TENANT_001",
    role: user.role || "OWNER",
    name: user.name,
    phone: user.phone,
    type: "OPERATOR",
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: OPERATOR_TOKEN_EXPIRY });
}

/**
 * Sign a customer subscriber JWT
 */
function signCustomerToken(customer) {
  const payload = {
    sub: String(customer._id),
    customerId: String(customer._id),
    tenantId: customer.tenantId || "TENANT_001",
    phone: customer.phone,
    name: customer.name,
    cafNumber: customer.cafNumber,
    type: "CUSTOMER",
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: CUSTOMER_TOKEN_EXPIRY });
}

/**
 * Verify any CableSync JWT
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = {
  signOperatorToken,
  signCustomerToken,
  verifyToken,
  JWT_SECRET,
};
