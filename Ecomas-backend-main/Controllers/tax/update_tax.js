const Tax = require("../../Models/tax");

const updateTax = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, name, percentage, effective_from } = req.body;

    const existing = await Tax.findById(id);
    if (!existing) {
      return res.status(404).send({ status: "failed", errors: "Tax record not found" });
    }

    const nextEffective = effective_from !== undefined ? effective_from : existing.effective_from;
    const nextIsActive = isActive !== undefined ? isActive : existing.isActive;

    // Prevent duplicate active tax on same effective date when activating
    if (nextIsActive) {
      const conflict = await Tax.findOne({
        _id: { $ne: id },
        isActive: true,
        effective_from: nextEffective,
      });
      if (conflict) {
        return res.status(409).send({ status: "failed", errors: "An active tax already exists for this effective date." });
      }
    }

    const actorId = req.user?.id || null;
    const update = {
      updatedBy: actorId,
    };
    if (name !== undefined) update.name = name;
    if (percentage !== undefined) update.percentage = percentage;
    if (effective_from !== undefined) update.effective_from = effective_from;

    // Track activation/deactivation events
    if (isActive !== undefined && isActive !== existing.isActive) {
      if (isActive) {
        update.isActive = true;
        update.activatedBy = actorId;
        update.activatedAt = new Date();
        update.deactivatedBy = null;
        update.deactivatedAt = null;
      } else {
        update.isActive = false;
        update.deactivatedBy = actorId;
        update.deactivatedAt = new Date();
      }
    } else if (isActive !== undefined) {
      update.isActive = isActive;
    }

    const updated = await Tax.findByIdAndUpdate(id, update, { new: true });
    res.send({ status: "success", data: updated });
  } catch (err) {
    console.error("Error updating tax record", err);
    if (err?.code === 11000) {
      return res.status(409).send({ status: "failed", errors: "An active tax already exists for this effective date." });
    }
    res.status(500).send({ status: "failed", errors: "Unable to update tax record" });
  }
};

module.exports = updateTax;
