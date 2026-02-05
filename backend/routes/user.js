const express = require("express");
const User = require("../model/User");
const auth = require("../middleware/auth");

const router = express.Router();

/* ================= GET ALL USERS (ADMIN) ================= */
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* ================= GET ALL PENDING DELIVERY BOYS (ADMIN) ================= */
router.get("/pending-delivery-boys", async (req, res) => {
  try {
    const deliveryBoys = await User.find({
      role: "delivery_boy",
      isVerified: true,
      deliveryBoyApproved: false
    }).select("-otp -otpExpires");

    res.json(deliveryBoys);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending delivery boys" });
  }
});

/* ================= GET ALL APPROVED DELIVERY BOYS (ADMIN) ================= */
router.get("/approved-delivery-boys", async (req, res) => {
  try {
    const deliveryBoys = await User.find({
      role: "delivery_boy",
      deliveryBoyApproved: true
    }).select("-otp -otpExpires");

    res.json(deliveryBoys);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch approved delivery boys" });
  }
});

/* ================= APPROVE DELIVERY BOY (ADMIN) ================= */
router.put("/approve-delivery-boy/:id", async (req, res) => {
  try {
    const { adminId } = req.body;

    if (!adminId) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    // Verify admin exists
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Only admins can approve delivery boys" });
    }

    // Update delivery boy
    const deliveryBoy = await User.findByIdAndUpdate(
      req.params.id,
      {
        deliveryBoyApproved: true,
        deliveryBoyApprovedBy: adminId,
        deliveryBoyApprovedAt: new Date()
      },
      { new: true }
    ).select("-password -otp -otpExpires");

    if (!deliveryBoy) {
      return res.status(404).json({ message: "Delivery boy not found" });
    }

    res.json({
      message: "Delivery boy approved successfully",
      deliveryBoy
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to approve delivery boy", error: err.message });
  }
});

/* ================= REJECT DELIVERY BOY (ADMIN) ================= */
router.put("/reject-delivery-boy/:id", async (req, res) => {
  try {
    const { adminId, reason } = req.body;

    if (!adminId) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    // Verify admin exists
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Only admins can reject delivery boys" });
    }

    // Delete the delivery boy or mark as disabled
    const deliveryBoy = await User.findByIdAndUpdate(
      req.params.id,
      {
        isDisabled: true
      },
      { new: true }
    ).select("-password -otp -otpExpires");

    if (!deliveryBoy) {
      return res.status(404).json({ message: "Delivery boy not found" });
    }

    res.json({
      message: "Delivery boy rejected",
      deliveryBoy
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to reject delivery boy", error: err.message });
  }
});

/* ================= UPDATE USER (ADMIN) ================= */
router.put("/users/:id", async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

/* ================= ENABLE / DISABLE USER ================= */
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isDisabled = !user.isDisabled;
    await user.save();

    res.json({
      message: user.isDisabled ? "User disabled" : "User enabled",
      isDisabled: user.isDisabled
    });
  } catch (err) {
    res.status(500).json({ message: "Action failed" });
  }
});

module.exports = router;
