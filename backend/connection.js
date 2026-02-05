const mongoose = require("mongoose");

const mongoUrl = process.env.MONGODB_URL;

if (!mongoUrl) {
  console.error("❌ FATAL ERROR: MONGODB_URL is not defined.");
  console.error("👉 Please go to Render Dashboard > Environment and add 'MONGODB_URL'.");
}

mongoose
  .connect(mongoUrl)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ Mongo Error:", err));
