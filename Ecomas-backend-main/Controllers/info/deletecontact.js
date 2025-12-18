const contact = require("../../Models/contactus");

const deletecontact = async (req, res) => {
  try {
    const id = req.params?.id || req.query?.id || req.body?.id;

    if (!id) {
      return res
        .status(400)
        .json({ status: "failed", message: "Contact id is required" });
    }

    const deleted = await contact.findByIdAndDelete(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ status: "failed", message: "Contact record not found" });
    }

    res.json({ status: "successfully", message: "Contact deleted" });
  } catch (err) {
    console.error("Failed to delete contact", err);
    res
      .status(500)
      .json({ status: "failed", message: "Unable to delete contact", error: err.message });
  }
};

module.exports = deletecontact;
