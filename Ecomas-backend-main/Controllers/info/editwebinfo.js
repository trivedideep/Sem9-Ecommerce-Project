const website_info = require("../../Models/website_info");

const editwebinfo = async (req, res) => {
  try {
    const {
      website_name,
      mobile_no,
      address,
      email,
      facebook,
      instagram,
      youtube,
      twitter,
      pinterest,
      gstno,
    } = req.body;

    const updatePayload = {
      website_name,
      mobile_no,
      address,
      email,
      facebook,
      instagram,
      youtube,
      twitter,
      pinterest,
      gstno,
    };

    Object.keys(updatePayload).forEach((key) => {
      if (updatePayload[key] === undefined) {
        delete updatePayload[key];
      }
    });

    const hasLogoUpload = req.files && Array.isArray(req.files.logo) && req.files.logo.length > 0;
    if (hasLogoUpload) {
      updatePayload.logo = req.files.logo[0].filename;
    }

    const existingInfo = await website_info.findOne();

    if (!existingInfo) {
      if (!updatePayload.logo) {
        return res
          .status(400)
          .json({ status: "failed", message: "Logo is required when creating website info." });
      }

      const newInfo = new website_info(updatePayload);
      const created = await newInfo.save();
      return res.status(201).json({ status: "successfully created", data: created });
    }

    const updated = await website_info.findByIdAndUpdate(existingInfo._id, updatePayload, {
      new: true,
    });

    res.json({ status: "successfully update", data: updated });
  } catch (err) {
    console.error("Failed to update website info", err);
    res.status(500).json({ status: "failed", error: err?.message || err });
  }
};

module.exports = editwebinfo;
