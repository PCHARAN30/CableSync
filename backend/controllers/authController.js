const User = require("../models/User");
const Tenant = require("../models/Tenant");
const { signOperatorToken } = require("../utils/jwt");

const isProduction = process.env.NODE_ENV === "production";

/**
 * Ensure default tenant and owner exist in DB.
 *
 * In production this NEVER creates an owner with a hardcoded password —
 * that would mean every production deployment ships with the same
 * publicly-known "admin123" credential until someone remembers to change it.
 * Instead, production owners must be created explicitly via
 * `node scripts/createOwner.js` with a real password supplied by the operator.
 */
async function ensureDefaultOwner() {
  let tenant = await Tenant.findOne({ code: "TENANT_001" });
  if (!tenant) {
    if (isProduction) return { tenant: null, owner: null };
    tenant = await Tenant.create({
      code: "TENANT_001",
      name: "CableSync Network",
      phone: "9876543210",
      email: "admin@cablesync.local",
    });
  }

  let owner = await User.findOne({ tenantId: "TENANT_001", role: "OWNER" });
  if (!owner && !isProduction) {
    const passwordHash = await User.hashPassword("admin123");
    owner = await User.create({
      tenantId: "TENANT_001",
      name: "CableSync Admin",
      phone: "9876543210",
      email: "admin@cablesync.local",
      passwordHash,
      role: "OWNER",
      assignedAreas: ["BCPALLI", "Kothapeta", "Gajulapeta", "Maruthi Nagar", "Santhapet"],
    });
  }
  return { tenant, owner };
}

/**
 * POST /api/v1/auth/operator/login
 * Standard username/email/phone + password authentication
 */
async function login(req, res) {
  try {
    const { identifier, password, tenantCode = "TENANT_001" } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide your phone/email and password.",
      });
    }

    const { owner } = await ensureDefaultOwner();
    if (isProduction && !owner) {
      const ownerExists = await User.exists({ tenantId: tenantCode, role: "OWNER" });
      if (!ownerExists) {
        return res.status(503).json({
          success: false,
          message:
            "No operator account exists yet. Run `node scripts/createOwner.js` on the server to create one.",
        });
      }
    }

    const user = await User.findOne({
      tenantId: tenantCode,
      $or: [
        { phone: identifier.trim() },
        { email: identifier.trim().toLowerCase() },
      ],
      isActive: true,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. User not found.",
      });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Incorrect password.",
      });
    }

    const token = signOperatorToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        assignedAreas: user.assignedAreas,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/v1/auth/operator/pin-login
 * Operator PIN authentication (for quick mobile entry)
 */
async function pinLogin(req, res) {
  try {
    if (isProduction) {
      return res.status(403).json({
        success: false,
        message: "PIN login is disabled in production. Use phone/email + password.",
      });
    }

    const { pin } = req.body;
    const expectedPin = process.env.OPERATOR_PIN || "1234";

    if (!pin || String(pin).trim() !== String(expectedPin).trim()) {
      return res.status(401).json({
        success: false,
        message: "Invalid operator PIN. Please try again.",
      });
    }

    const { owner } = await ensureDefaultOwner();
    const token = signOperatorToken(owner);

    return res.status(200).json({
      success: true,
      message: "PIN verified successfully",
      token,
      user: {
        id: owner._id,
        name: owner.name,
        phone: owner.phone,
        role: owner.role,
        tenantId: owner.tenantId,
        assignedAreas: owner.assignedAreas,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/v1/auth/operator/me
 * Fetch authenticated operator profile
 */
async function getMe(req, res) {
  try {
    const user = req.user
      ? await User.findById(req.user.userId || req.user.sub).select("-passwordHash")
      : null;
    if (!user) {
      return res.status(200).json({
        success: true,
        data: {
          name: "CableSync Operator",
          role: "OWNER",
          tenantId: "TENANT_001",
        },
      });
    }
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  login,
  pinLogin,
  getMe,
  ensureDefaultOwner,
};
