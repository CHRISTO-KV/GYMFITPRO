const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    lname: {
      type: String,
      trim: true,
      default: ""
    },

    mobile: {
      type: String,
      trim: true,
      default: ""
    },

    state: {
      type: String,
      trim: true,
      default: ""
    },

    district: {
      type: String,
      trim: true,
      default: ""
    },

    city: {
      type: String,
      trim: true,
      default: ""
    },

    localArea: {
      type: String,
      trim: true,
      default: ""
    },

    profileImage: {
      type: String,
      default: ""
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["admin", "user", "delivery_boy"],
      default: "user"
    },

    isDisabled: {
      type: Boolean,
      default: false
    },

    // Delivery Boy specific fields
    deliveryBoyApproved: {
      type: Boolean,
      default: false
    },

    deliveryBoyApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    deliveryBoyApprovedAt: {
      type: Date,
      default: null
    },

    vehicleType: {
      type: String,
      enum: ["bike", "scooter", "car"],
      default: null
    },

    vehicleNumber: {
      type: String,
      default: ""
    },

    aadharNumber: {
      type: String,
      default: ""
    },

    otp: {
      type: String
    },

    otpExpires: {
      type: Date
    },

    isVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
