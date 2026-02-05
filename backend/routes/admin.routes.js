const express = require("express");
const router = express.Router();
const User = require("../model/User");
const Product = require("../model/Product");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

router.get("/users", async (_, res) => res.json(await User.find()));
router.put("/users/:id", async (req, res) =>
  res.json(await User.findByIdAndUpdate(req.params.id, req.body, { new: true }))
);

router.delete("/users/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  user.isDisabled = !user.isDisabled;
  await user.save();
  res.json(user);
});

router.get("/products", async (_, res) => res.json(await Product.find().populate("category")));

router.put("/products/:id", upload.array("images", 5), async (req, res) => {
  const data = { ...req.body };
  if (req.files?.length) data.images = req.files.map((f) => f.filename);
  if (data.category === "null") data.category = null;
  const updated = await Product.findByIdAndUpdate(req.params.id, data, { new: true }).populate("category");
  if (!updated) return res.status(404).json({ message: "Product not found" });
  res.json(updated);
});

router.delete("/products/:id", async (req, res) => {
  const del = await Product.findByIdAndDelete(req.params.id);
  if (!del) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Product deleted" });
});

module.exports = router;
