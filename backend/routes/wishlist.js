const express = require("express");
const router = express.Router();
const {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  checkWishlist,
  toggleWishlist
} = require("../controllers/wishlistController");
const auth = require("../middleware/auth");

// Add / remove / list (kept for backward compat)
router.post("/", auth, addToWishlist);
router.delete("/:productId", auth, removeFromWishlist);
router.get("/", auth, getWishlist);

// New endpoints used by frontend
router.get("/check/:productId", auth, checkWishlist);
router.post("/toggle", auth, toggleWishlist);

module.exports = router;
