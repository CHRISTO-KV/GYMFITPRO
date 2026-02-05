const express = require("express");
const mongoose = require("mongoose");
const Review = require("../model/Review");

const router = express.Router();

/* ================= GET REVIEWS FOR A PRODUCT ================= */
router.get("/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const reviews = await Review.find({ productId })
      .populate("userId", "fname")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error("❌ REVIEW FETCH ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ================= ADD A REVIEW ================= */
router.post("/", async (req, res) => {
  try {
    const { userId, productId, rating, comment } = req.body;

    // 🛑 Validation
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "Comment is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid user or product ID" });
    }

    const review = await Review.create({
      userId,
      productId,
      rating,
      comment
    });

    res.status(201).json({
      message: "Review created",
      review
    });
  } catch (err) {
    console.error("❌ REVIEW CREATE ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ================= DELETE A REVIEW ================= */
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    await Review.findByIdAndDelete(id);
    res.json({ message: "Review deleted" });
  } catch (err) {
    console.error("❌ REVIEW DELETE ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
