const contact = require("../../Models/contactus");
const contactlist = async (req, res) => {
  try {
    const contactlisting = await contact
      .find()
      .sort({ createdAt: -1 });

    const normalized = contactlisting.map((entry) => {
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

    res.send({ status: "sucessfully", data: normalized })

  } catch (err) {
    console.log(`  here is errror ${err}`);
    res.send({ status: "faild", errors: err })

  }


}

module.exports = contactlist