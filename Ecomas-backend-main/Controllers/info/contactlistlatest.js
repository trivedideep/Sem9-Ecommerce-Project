const contactus = require("../../Models/contactus");

const contactlistlatest = async (req, res) => {
  try {
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const raw = await contactus
      .find({ createdAt: { $gte: cutoffDate } })
      .sort({ createdAt: -1 })
      .limit(10);

    const data = raw.map((entry) => {
      const obj = entry.toObject({ getters: true, virtuals: false });
      let createdAtValue = obj.createdAt;

      if (!createdAtValue && obj._id && typeof obj._id.getTimestamp === "function") {
        createdAtValue = obj._id.getTimestamp();
      }

      if (createdAtValue) {
        obj.createdAt = createdAtValue;
        obj.createdAtISO = new Date(createdAtValue).toISOString();
      }

      if (!obj.updatedAt && createdAtValue) {
        obj.updatedAt = createdAtValue;
      }
      return obj;
    });

    res.send({ status: "successfully", data });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "An error occurred while fetching latest contact list" });
  }
};

module.exports = contactlistlatest;
