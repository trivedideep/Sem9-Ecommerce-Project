const mongoose = require("mongoose");
const moment = require("moment-timezone");
// const indianTimestampPlugin = require("../middlewares/indianTimestampPlugin");
const userSchema = mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is Required"],
      unique: [true, "already in database"],
    },
    mobile: {
      type: String,
      default: null,
      index: true,
    },
    dob: {
      type: Date, // Assuming the date of birth is a Date type
      default: null,
    },
    status: {
      type: String,
      default: "Active"
    },
    password: {
      type: String,
      default: null,
    },
    isAdmin: {
      type: String,
      default: "Inactive",
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
      default: null,
    },
    // Enforce unique googleId only when provided (skip null/undefined)
    
    avatar: {
      type: String,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique mobile numbers only when provided (skip null/undefined)
userSchema.index(
  { mobile: 1 },
  { unique: true, sparse: true, partialFilterExpression: { mobile: { $type: "string" } } }
);
userSchema.index(
      { googleId: 1 },
      { unique: true, partialFilterExpression: { googleId: { $type: "string" } } }
    );

// userSchema.pre('save', function (next) {
//   this.createdAt = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
//   this.updatedAt = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
//   next();
// });
// userSchema.plugin(indianTimestampPlugin);


userSchema.pre('save', function (next) {
  this.createdAt = moment().format('YYYY-MM-DD');
  this.updatedAt = moment().format('YYYY-MM-DD');
  next();
});

const Usertable = mongoose.model("Usertable", userSchema);
module.exports = Usertable;
