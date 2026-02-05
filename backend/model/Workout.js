const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  videoUrl: String,
  thumbnail: String,
  userId: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model("Workout", workoutSchema);
