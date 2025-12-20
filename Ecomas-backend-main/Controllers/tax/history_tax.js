const Tax = require("../../Models/tax");

// Admin-only read-only history of all tax records
const historyTax = async (_req, res) => {
  try {
    const taxes = await Tax.find({}).sort({ effective_from: -1, createdAt: -1 });
    res.send({ status: "success", data: taxes });
  } catch (err) {
    console.error("Error fetching tax history", err);
    res.status(500).send({ status: "failed", errors: "Unable to fetch tax history" });
  }
};

module.exports = historyTax;
