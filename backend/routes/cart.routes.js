const express = require("express");
const mongoose = require("mongoose");
const Cart = require("../model/Cart");
const Product = require("../model/Product");

const router = express.Router();

// ✅ LOAD CART (safe)
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) return res.json({ items: [] });

    res.json({ items: cart.items || [] });
  } catch (err) {
    console.error("🔥 CART LOAD ERROR:", err);
    res.status(500).json({ message: "Cart load failed", error: err.message });
  }
});

// ✅ ADD TO CART (safe)
router.post("/add", async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = await Cart.create({ userId, items: [] });

    const exists = cart.items.find(i => i.productId == productId);
    if (!exists) cart.items.push({ productId, quantity: 1 });

    await cart.save();
    res.json({ message: "Added to cart", items: cart.items });
  } catch (err) {
    console.error("🔥 CART ADD ERROR:", err);
    res.status(500).json({ message: "Cart add failed", error: err.message });
  }
});

// ✅ UPDATE CART ITEM QUANTITY (safe)
router.put("/update", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(i => i.productId.toString() === productId);
    if (!item) return res.status(404).json({ message: "Item not in cart" });

    item.quantity = quantity;
    await cart.save();

    res.json({ message: "Quantity updated", items: cart.items });
  } catch (err) {
    console.error("🔥 CART UPDATE ERROR:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

// ✅ DELETE CART ITEM (safe)
router.delete("/item/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ userId: req.body.userId });

    if (!cart) return res.json({ items: [] });

    cart.items = cart.items.filter(i => i.productId != productId);
    await cart.save();

    res.json({ items: cart.items });
  } catch (err) {
    console.error("🔥 CART DELETE ERROR:", err);
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

module.exports = router;
