const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  description: String,
  stock: Number,
  images: [String],
  isAvailable: { type: Boolean, default: true }
  
});

module.exports = mongoose.model("Product", productSchema);
