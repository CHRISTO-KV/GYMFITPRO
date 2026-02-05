require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

require("./connection"); // MongoDB connection

const app = express();
const PORT = process.env.PORT || 5000;

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= STATIC FILE SERVING (Images & Videos) ================= */
const uploadRoot = path.join(__dirname, "uploads");
const videoDir = path.join(uploadRoot, "videos");

// Ensure folders exist
if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot, { recursive: true });
if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

// Serve everything inside /uploads statically
app.use("/uploads", express.static(uploadRoot));

/* ================= ROUTES ================= */

// Auth (kept at /api)
app.use("/api/auth", require("./routes/auth.routes"));

// Product & category APIs
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/categories", require("./routes/category.routes"));

// Cart & order APIs
app.use("/api/cart", require("./routes/cart.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/payment", require("./routes/payment.routes"));

// Admin routes
app.use("/api/admin", require("./routes/admin.routes"));

// User routes (delivery boy & approvals)
app.use("/api/users", require("./routes/user"));

// Workout video routes
app.use("/api/workouts", require("./routes/workout.routes"));

// Review routes (🔥 this was missing earlier → now added)
app.use("/api/reviews", require("./routes/reviews"));

// Wishlist routes
app.use("/api/wishlist", require("./routes/wishlist"));

/* ================= HEALTH CHECK ================= */
app.get("/api/health", (_, res) => {
  res.json({ status: "Backend running OK" });
});

/* ================= 404 HANDLER ================= */
app.use((req, res) => {
  console.warn("⚠ 404 →", req.method, req.originalUrl);
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
