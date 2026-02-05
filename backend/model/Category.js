const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, unique: true },
  description: String
});

module.exports = mongoose.model("Category", categorySchema);
