const express = require("express");
const router = express.Router();
const {
  getOperatorTickets,
  updateOperatorTicket,
} = require("../controllers/customerPortalController");

router.get("/", getOperatorTickets);
router.patch("/:id", updateOperatorTicket);

module.exports = router;
