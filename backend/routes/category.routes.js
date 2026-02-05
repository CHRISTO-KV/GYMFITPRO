const express = require("express");
const router = express.Router();
const Category = require("../model/Category");

router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Category name is required" });

    const exists = await Category.findOne({ name: name.trim() });
    if (exists) return res.status(400).json({ message: "Category already exists" });

    const category = await Category.create({ name: name.trim(), description });
    res.status(201).json({ message: "Category added", category });
  } catch (err) {
    res.status(500).json({ message: "Failed to add category", error: err.message });
  }
});

router.get("/", async (_, res) => res.json(await Category.find().sort({ name: 1 })));

router.put("/:id", async (req, res) => {
  try {
    const { name } = req.body;
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { ...req.body, name: name?.trim() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category updated", category: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update category", error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const del = await Category.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

module.exports = router;
