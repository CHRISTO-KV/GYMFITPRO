const express = require("express");
const router = express.Router();
const Order = require("../model/Order");
const Cart = require("../model/Cart");

/* ================= CREATE ORDER ================= */
router.post("/", async (req, res) => {
  try {
    const { userId, address, amount, paymentMethod, paymentData } = req.body;

    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart empty" });
    }

    // Filter out items with null productId
    cart.items = cart.items.filter(i => i.productId);

    const items = cart.items.map(i => {
      let img = i.productId.images?.[0] || null;
      if (img) img = img.replace(/^\/?uploads\//, ""); // clean filename
      return {
        productId: i.productId._id,
        name: i.productId.name,
        price: i.productId.price,
        quantity: i.quantity,
        image: img // ✔ clean filename stored
      };
    });

    const order = await Order.create({
      userId,
      items,
      address,
      amount,
      paymentMethod,
      paymentData, // Save payment details (Stripe/UPI)
      status: "placed",
      deliveryOtp: Math.floor(1000 + Math.random() * 9000).toString() // Generate 4-digit OTP
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ message: "Order created", order });
  } catch (err) {
    console.error("❌ ORDER CREATE ERROR:", err);
    res.status(500).json({ message: "Order failed", error: err.message });
  }
});

/* ================= GET USER ORDERS (Fixed for images) ================= */
router.get("/user/:id", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.id }).sort({ createdAt: -1 });

    const formatted = await Promise.all(orders.map(async o => {
      // Self-healing: Generate OTP if missing
      if (!o.deliveryOtp) {
        o.deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
        await o.save();
        console.log(`🔧 Generated missing OTP for order ${o._id}: ${o.deliveryOtp}`);
      }

      return {
        _id: o._id,
        userId: o.userId,
        amount: o.amount,
        status: o.status || o.orderStatus || "placed",
        address: o.address,
        deliveryOtp: o.deliveryOtp, // Now guaranteed to exist
        createdAt: o.createdAt,
        items: o.items.map(i => {
          const cleanImage = i.image ? i.image.replace(/^\/?uploads\//, "") : null;
          return {
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: cleanImage,
            imageUrl: cleanImage ? `/uploads/${cleanImage}` : null
          };
        })
      };
    }));

    console.log("📤 Sending formatted user orders:", formatted);
    res.json(formatted);
  } catch (err) {
    console.error("❌ USER ORDER FETCH ERROR:", err);
    res.status(500).json({ message: "Failed to fetch user orders", error: err.message });
  }
});

/* ================= CHECK IF USER HAS BOUGHT A PRODUCT ================= */
router.get("/has-bought/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const order = await Order.findOne({
      userId,
      "items.productId": productId,
      status: "delivered"
    });

    res.json({ hasBought: !!order });
  } catch (err) {
    console.error("❌ HAS-BOUGHT ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ================= UPDATE ORDER ADDRESS ================= */
router.put("/:id/address", async (req, res) => {
  try {
    const { id } = req.params;
    const { address } = req.body;

    if (!address || !address.fullName || !address.buildingName || !address.mobile || !address.pincode) {
      return res.status(400).json({ message: "Invalid address data" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only allow update if not out for delivery or later
    if (["out_for_delivery", "delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({ message: "Cannot update address at this stage" });
    }

    order.address = address;
    await order.save();

    res.json({ message: "Address updated", order });
  } catch (err) {
    console.error("❌ ORDER UPDATE ERROR:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

/* ================= CANCEL ORDER ================= */
router.put("/cancel/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "placed") {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }

    order.status = "cancelled";
    order.cancelledAt = new Date();
    await order.save();

    res.json({ message: "Order cancelled", order });
  } catch (err) {
    console.error("❌ CANCEL ERROR:", err);
    res.status(500).json({ message: "Cancel failed", error: err.message });
  }
});

/* ================= ADMIN FETCH ALL ORDERS ================= */
router.get("/admin", async (_, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "email")
      .populate("deliveryBoy", "fname lname mobile") // Populate delivery boy
      .sort({ createdAt: -1 });

    const formatted = orders.map(o => ({
      _id: o._id,
      userId: o.userId,
      amount: o.amount,
      status: o.status || o.orderStatus || "placed",
      paymentMethod: o.paymentMethod,
      paymentData: o.paymentData,
      address: o.address,
      deliveryBoy: o.deliveryBoy, // Include delivery boy in response
      createdAt: o.createdAt,
      items: o.items.map(i => {
        const cleanImage = i.image ? i.image.replace(/^\/?uploads\//, "") : null;
        return {
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: cleanImage,
          imageUrl: cleanImage ? `/uploads/${cleanImage}` : null
        };
      })
    }));

    console.log("📤 Sending formatted admin orders:", formatted);
    res.json(formatted);
  } catch (err) {
    console.error("❌ ADMIN ORDER FETCH ERROR:", err);
    res.status(500).json({ message: "Admin fetch crashed", error: err.message });
  }
});

/* ================= ADMIN UPDATE ORDER STATUS ================= */
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Status updated", order });
  } catch (err) {
    console.error("❌ ADMIN UPDATE ERROR:", err);
    res.status(500).json({ message: "Status update failed", error: err.message });
  }
});

/* ================= ADMIN ASSIGN DELIVERY BOY ================= */
router.put("/:id/assign", async (req, res) => {
  try {
    const { deliveryBoyId } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { deliveryBoy: deliveryBoyId },
      { new: true }
    ).populate("deliveryBoy", "fname lname");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Delivery boy assigned", order });
  } catch (err) {
    console.error("❌ ASSIGN ERROR:", err);
    res.status(500).json({ message: "Assignment failed", error: err.message });
  }
});

/* ================= GET ORDERS FOR DELIVERY BOY ================= */
router.get("/delivery-boy/:id", async (req, res) => {
  try {
    const orders = await Order.find({ deliveryBoy: req.params.id })
      .populate("userId", "fname lname email mobile")
      .sort({ createdAt: -1 });

    const formatted = orders.map(o => ({
      _id: o._id,
      amount: o.amount,
      status: o.status || o.orderStatus || "placed", // normalize
      paymentMethod: o.paymentMethod,
      paymentData: o.paymentData,
      address: o.address, // Full address object
      items: o.items.map(i => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        image: i.image ? i.image.replace(/^\/?uploads\//, "") : null
      })),
      createdAt: o.createdAt
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ DB ORDER FETCH ERROR:", err);
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
});

/* ================= VERIFY DELIVERY OTP ================= */
router.post("/:id/verify-delivery-otp", async (req, res) => {
  try {
    const { otp } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.deliveryOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    order.status = "delivered";
    await order.save();

    res.json({ message: "Delivery verified and completed", order });
  } catch (err) {
    console.error("❌ OTP VERIFY ERROR:", err);
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
});

module.exports = router;
