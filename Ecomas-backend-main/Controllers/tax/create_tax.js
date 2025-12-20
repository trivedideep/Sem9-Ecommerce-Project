const Tax = require("../../Models/tax");

const createTax = async (req, res) => {
  try {
    const { name = "GST", percentage, effective_from, isActive = true } = req.body;

    if (percentage === undefined || percentage === null || Number.isNaN(Number(percentage))) {
      return res.status(400).send({ status: "failed", errors: "percentage is required" });
    }

    if (!effective_from) {
      return res.status(400).send({ status: "failed", errors: "effective_from date is required" });
    }

    // Prevent duplicate active tax on same effective date
    if (isActive) {
      const conflict = await Tax.findOne({ isActive: true, effective_from });
      if (conflict) {
        return res.status(409).send({ status: "failed", errors: "An active tax already exists for this effective date." });
      }
    }

    const actorId = req.user?.id || null;
    const taxRecord = await Tax.create({
      name,
      percentage,
      effective_from,
      isActive,
      createdBy: actorId,
      updatedBy: actorId,
      activatedBy: isActive ? actorId : null,
      activatedAt: isActive ? new Date() : null,
    });

    res.send({ status: "success", data: taxRecord });
  } catch (err) {
    console.error("Error creating tax record", err);
    if (err?.code === 11000) {
      return res.status(409).send({ status: "failed", errors: "An active tax already exists for this effective date." });
    }
    res.status(500).send({ status: "failed", errors: "Unable to create tax record" });
  }
};

module.exports = createTax;
