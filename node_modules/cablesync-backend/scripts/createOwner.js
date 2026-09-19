const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const connectDB = require("../config/db");
const Tenant = require("../models/Tenant");
const User = require("../models/User");

/**
 * Create (or reset the password of) the OWNER account for a tenant.
 *
 * This replaces the old behavior where the server auto-created an owner
 * with a hardcoded "admin123" password the first time /auth/login ran.
 * That's fine for a laptop demo; it's not fine for anything with a public
 * URL, because the password is sitting in the source code.
 *
 * Usage:
 *   ADMIN_PASSWORD="a real password" node scripts/createOwner.js \
 *     --name "Your Name" --phone 9876543210 --email you@example.com \
 *     [--tenant TENANT_001] [--reset]
 *
 * --reset overwrites the password of an existing owner instead of failing.
 */

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { tenant: "TENANT_001", reset: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--reset") out.reset = true;
    else if (a === "--name") out.name = args[++i];
    else if (a === "--phone") out.phone = args[++i];
    else if (a === "--email") out.email = args[++i];
    else if (a === "--tenant") out.tenant = args[++i];
  }
  return out;
}

async function main() {
  const { tenant: tenantCode, reset, name, phone, email } = parseArgs();
  const password = process.env.ADMIN_PASSWORD;

  if (!password || password.length < 10) {
    console.error(
      "Set ADMIN_PASSWORD (10+ characters) in the environment before running this script.\n" +
        'Example: ADMIN_PASSWORD="correct horse battery staple 42" node scripts/createOwner.js --name "..." --phone ... --email ...',
    );
    process.exit(1);
  }
  if (!name || !phone) {
    console.error("Usage: node scripts/createOwner.js --name \"Your Name\" --phone 9876543210 [--email you@example.com] [--reset]");
    process.exit(1);
  }

  await connectDB();

  let tenant = await Tenant.findOne({ code: tenantCode });
  if (!tenant) {
    tenant = await Tenant.create({ code: tenantCode, name: `${name}'s CableSync` });
    console.log(`Created tenant ${tenantCode}`);
  }

  const existing = await User.findOne({ tenantId: tenantCode, role: "OWNER" });
  const passwordHash = await User.hashPassword(password);

  if (existing) {
    if (!reset) {
      console.error(
        `An OWNER already exists for tenant ${tenantCode} (${existing.phone}). Re-run with --reset to overwrite the password.`,
      );
      process.exit(1);
    }
    existing.passwordHash = passwordHash;
    existing.name = name;
    existing.phone = phone;
    if (email) existing.email = email;
    await existing.save();
    console.log(`Password reset for existing owner ${existing.phone} on ${tenantCode}.`);
  } else {
    await User.create({
      tenantId: tenantCode,
      name,
      phone,
      email: email || "",
      passwordHash,
      role: "OWNER",
    });
    console.log(`Created owner ${phone} on ${tenantCode}.`);
  }

  await require("mongoose").disconnect();
}

main().catch((err) => {
  console.error("createOwner failed:", err);
  process.exit(1);
});
