const Tax = require("../../Models/tax");

// Returns tax records ordered by effective_from descending
const listTax = async (req, res) => {
  try {
    const { all } = req.query;
    const query = all ? {} : { isActive: true };
    const taxes = await Tax.find(query).sort({ effective_from: -1, createdAt: -1 });
    res.send({ status: "success", data: taxes });
  } catch (err) {
    console.error("Error fetching tax records", err);
    res.status(500).send({ status: "failed", errors: "Unable to fetch tax records" });
  }
};

module.exports = listTax;
