const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const fs = require("fs");
const Product = require("../model/Product");
const User = require("../model/User");
const Workout = require("../model/Workout");

// Connect to DB
mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log("✅ MongoDB Connected");
        migrateImages();
    })
    .catch(err => {
        console.error("❌ DB Connection Error:", err);
        process.exit(1);
    });

const uploadDir = path.join(__dirname, "../uploads");
const videoDir = path.join(uploadDir, "videos");

// Helper to file -> base64
const fileToBase64 = (filename, dir = uploadDir) => {
    if (!filename) return null;
    if (filename.startsWith("data:") || filename.startsWith("http")) return filename; // Already migrated or external

    const filePath = path.join(dir, filename);
    if (fs.existsSync(filePath)) {
        const ext = path.extname(filename).toLowerCase().replace(".", "");
        const mime = ext === "jpg" ? "jpeg" : ext;
        const data = fs.readFileSync(filePath, { encoding: "base64" });
        return `data:image/${mime};base64,${data}`;
    } else {
        // Try checking subfolders if simple path check failed? 
        // Sometimes path includes "uploads/" or "videos/" prefix in DB
        const cleanName = filename.replace(/^uploads[\\/]/, "").replace(/^videos[\\/]/, "");

        // Try standard upload dir
        let tryPath = path.join(uploadDir, cleanName);
        if (fs.existsSync(tryPath)) {
            const ext = path.extname(cleanName).toLowerCase().replace(".", "");
            const mime = ext === "jpg" ? "jpeg" : ext;
            const data = fs.readFileSync(tryPath, { encoding: "base64" });
            return `data:image/${mime};base64,${data}`;
        }

        // Try video dir
        tryPath = path.join(videoDir, cleanName);
        if (fs.existsSync(tryPath)) {
            const ext = path.extname(cleanName).toLowerCase().replace(".", "");
            const mime = ext === "jpg" ? "jpeg" : ext;
            const data = fs.readFileSync(tryPath, { encoding: "base64" });
            return `data:image/${mime};base64,${data}`;
        }

        console.warn(`⚠️ File not found: ${filename}`);
        return null;
    }
};

const migrateImages = async () => {
    try {
        console.log("🚀 Starting Migration...");

        // 1. PRODUCTS
        const products = await Product.find();
        console.log(`📦 Found ${products.length} products to check.`);

        for (const p of products) {
            if (p.images && p.images.length > 0) {
                let modified = false;
                const newImages = p.images.map(img => {
                    const b64 = fileToBase64(img);
                    if (b64) {
                        modified = true;
                        return b64;
                    }
                    return img; // Keep original if fail
                });

                if (modified) {
                    p.images = newImages;
                    await p.save();
                    console.log(`✅ Migrated Product: ${p.name}`);
                }
            }
        }

        // 2. USERS
        const users = await User.find({ profileImage: { $ne: "" } });
        console.log(`👤 Found ${users.length} users with images.`);

        for (const u of users) {
            if (u.profileImage) {
                const b64 = fileToBase64(u.profileImage);
                if (b64) {
                    u.profileImage = b64;
                    await u.save();
                    console.log(`✅ Migrated User: ${u.fname}`);
                }
            }
        }

        // 3. WORKOUTS (Thumbnails Only)
        const workouts = await Workout.find({ thumbnail: { $ne: "" } });
        console.log(`💪 Found ${workouts.length} workouts with thumbnails.`);

        for (const w of workouts) {
            if (w.thumbnail) {
                // Thumbnail path usually contains /uploads/videos/ prefix
                // We need to handle that in fileToBase64 helper
                const b64 = fileToBase64(w.thumbnail);
                if (b64) {
                    w.thumbnail = b64;
                    await w.save();
                    console.log(`✅ Migrated Workout Thumbnail: ${w.title}`);
                }
            }
        }

        console.log("🎉 Migration Complete!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration Failed:", err);
        process.exit(1);
    }
};
