const express = require("express");
const {
  getOperatorDetails,
  updateOperatorDetails,
} = require("../controllers/operatorController");

const router = express.Router();

router.get("/", getOperatorDetails);
router.put("/", updateOperatorDetails);

module.exports = router;
