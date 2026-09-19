/**
 * Role-Based Access Control Middleware
 * e.g., authorizeRole("OWNER", "ADMIN")
 */
function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please authenticate first.",
      });
    }

    // OWNER has global permission
    if (req.user.role === "OWNER" || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access forbidden: Role '${req.user.role}' is not authorized for this operation.`,
    });
  };
}

module.exports = authorizeRole;
