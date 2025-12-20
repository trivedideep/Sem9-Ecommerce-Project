const express = require("express");
const createTax = require("../Controllers/tax/create_tax");
const listTax = require("../Controllers/tax/list_tax");
const updateTax = require("../Controllers/tax/update_tax");
const historyTax = require("../Controllers/tax/history_tax");
const router = express.Router();

// TODO: protect these routes with admin authentication middleware
router.post("/", createTax);
router.get("/", listTax);
router.get("/history", historyTax);
router.patch("/:id", updateTax);

module.exports = router;
