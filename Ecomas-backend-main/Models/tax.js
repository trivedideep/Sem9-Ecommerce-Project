const mongoose = require("mongoose");

const taxSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
    },
    effective_from: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usertable",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usertable",
      default: null,
    },
    activatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usertable",
      default: null,
    },
    deactivatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usertable",
      default: null,
    },
    activatedAt: {
      type: Date,
      default: null,
    },
    deactivatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Fast lookup for latest active tax by date
taxSchema.index({ isActive: 1, effective_from: -1 });

// Prevent multiple active taxes on the same effective date
taxSchema.index(
  { effective_from: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

const Tax = mongoose.model("Tax", taxSchema);
module.exports = Tax;
