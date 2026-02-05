const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        price: Number,
        quantity: Number,
        image: String
      }
    ],

    address: {
      fullName: String,
      buildingName: String,
      mobile: String,
      alternateMobile: String,
      pincode: String,
      postOffice: String, // New field
      city: String,       // New field
      district: String,   // New field
      state: String,      // New field
      email: String,      // New field
      type: { type: String, enum: ['home', 'work'] }
    },

    amount: Number,

    paymentMethod: {
      type: String,
      enum: ["card", "cod", "upi", "test_card", "test_upi"], // Added 'upi', 'test_card', 'test_upi'
      default: "cod"
    },

    paymentData: { type: Object }, // Store Stripe info or UPI ID

    deliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    deliveryOtp: { type: String }, // OTP for delivery verification

    // ✅ SINGLE SOURCE OF TRUTH
    status: {
      type: String,
      enum: [
        "placed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled"
      ],
      default: "placed"
    },

    cancelledAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
