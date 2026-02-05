const express = require("express");
const mongoose = require("mongoose");
const Product = require("../model/Product");
const multer = require("multer");

const router = express.Router();

// Multer config (same upload folder)
// Multer config (Memory Storage for Base64)
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* ================= ADD PRODUCT ================= */
router.post("/", upload.array("images", 5), async (req, res) => {
  try {
    const data = { ...req.body };

    // Convert uploaded images to Base64
    if (req.files?.length) {
      data.images = req.files.map((f) =>
        `data:${f.mimetype};base64,${f.buffer.toString("base64")}`
      );
    }

    const product = await Product.create(data);
    res.status(201).json({ message: "Product added", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add product", error: err.message });
  }
});

/* ================= GET ALL PRODUCTS ================= */
router.get("/", async (_, res) => {
  res.json(await Product.find().populate("category").sort({ _id: -1 }));
});

/* ================= GET PRODUCT BY ID ================= */
router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).json({ message: "Invalid product ID" });

  const product = await Product.findById(req.params.id).populate("category");
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

module.exports = router;
