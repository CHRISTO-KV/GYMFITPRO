const Wishlist = require("../models/Wishlist");

// ADD TO WISHLIST
exports.addToWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.create({
      userId: req.user._id,
      productId: req.body.productId
    });

    res.status(201).json(wishlist);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Already in wishlist" });
    }
    res.status(500).json({ message: error.message });
  }
};

// REMOVE FROM WISHLIST
exports.removeFromWishlist = async (req, res) => {
  await Wishlist.findOneAndDelete({
    userId: req.user._id,
    productId: req.params.productId
  });

  res.json({ message: "Removed from wishlist" });
};

// GET USER WISHLIST
exports.getWishlist = async (req, res) => {
  const wishlist = await Wishlist
    .find({ userId: req.user._id })
    .populate("productId");

  res.json(wishlist);
};

// CHECK IF PRODUCT IN WISHLIST
exports.checkWishlist = async (req, res) => {
  const found = await Wishlist.findOne({
    userId: req.user._id,
    productId: req.params.productId
  });

  res.json({ wished: !!found });
};

// TOGGLE WISHLIST
exports.toggleWishlist = async (req, res) => {
  const userId = req.user._id;
  const productId = req.body.productId;

  const existing = await Wishlist.findOne({ userId, productId });
  if (existing) {
    await Wishlist.deleteOne({ _id: existing._id });
    return res.json({ wished: false, message: "Removed from wishlist" });
  }

  await Wishlist.create({ userId, productId });
  return res.json({ wished: true, message: "Added to wishlist" });
};
