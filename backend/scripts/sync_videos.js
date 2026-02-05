const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const Workout = require("../model/Workout");

// Load env vars
dotenv.config({ path: path.join(__dirname, "../.env") });

const UPLOADS_DIR = path.join(__dirname, "../uploads/videos");
const MONGO_URI = process.env.MONGODB_URL; // Correct Env Var

const connectDB = async () => {
    try {
        if (!MONGO_URI) throw new Error("MONGODB_URL is missing in .env");
        await mongoose.connect(MONGO_URI);
        console.log("🔥 MongoDB Connected for Video Sync");
    } catch (err) {
        console.error("❌ DB Connection Failed:", err);
        process.exit(1);
    }
};

const syncVideos = async () => {
    await connectDB();

    try {
        if (!fs.existsSync(UPLOADS_DIR)) {
            console.log("No videos folder found at:", UPLOADS_DIR);
            process.exit(0);
        }

        const files = fs.readdirSync(UPLOADS_DIR);
        const videoFiles = files.filter(f => f.endsWith(".mp4"));

        console.log(`Found ${videoFiles.length} video files on disk.`);

        let addedCount = 0;

        for (const file of videoFiles) {
            const videoPath = `/uploads/videos/${file}`;

            // Check if video already exists in DB
            const exists = await Workout.findOne({ videoUrl: videoPath });

            if (!exists) {
                // Try to infer details
                const fileBase = path.parse(file).name; // '1768...-MyVideo'

                // Try to find matching thumbnail
                // Matching rules: same base name with .jpg, .jpeg, .png
                const thumbExts = [".jpg", ".jpeg", ".png", ".webp"];
                const thumbFile = files.find(f => f.startsWith(fileBase) && thumbExts.includes(path.extname(f)));

                let thumbnailUrl = "";
                if (thumbFile) {
                    // In the routes, we read the file and convert to base64. 
                    // But to keep it simple and consistent with how some are saved, 
                    // maybe we can just use the path if the frontend supports it?
                    // Looking at `WorkoutVideos.jsx`: 
                    // poster={v.thumbnail ? `${API_BASE}${v.thumbnail}` : ""}
                    // It expects a URL path or Base64. 
                    // If I use a path, it needs to be served by express static.
                    // backend/index.js serves 'uploads' at '/uploads'.
                    // So I can save it as `/uploads/videos/${thumbFile}`.
                    thumbnailUrl = `/uploads/videos/${thumbFile}`;

                    // However, the `workout.routes.js` converts to base64. 
                    // Let's stick to path for now as it's cleaner for large files, 
                    // but I should check if the frontend handles paths.
                    // Frontend: `${API_BASE}${v.thumbnail}`. 
                    // If v.thumbnail starts with "data:", API_BASE prepended might break it?
                    // Let's check `getImageUrl` in `api.js` or how `WorkoutVideos.jsx` handles it.
                    // `WorkoutVideos.jsx` line 145: `poster={v.thumbnail ? `${API_BASE}${v.thumbnail}` : ""}`.
                    // If thumbnail is "data:image...", then `${API_BASE}data:image...` is WRONG.
                    // But `workout.routes.js` saves as `data:...`.
                    // Let's check `api.js` again. 

                    // Actually, let's just convert it to base64 to be safe and consistent with current upload logic.
                    const thumbFullPath = path.join(UPLOADS_DIR, thumbFile);
                    const thumbData = fs.readFileSync(thumbFullPath, { encoding: "base64" });
                    const mime = thumbFile.endsWith(".png") ? "image/png" : "image/jpeg";
                    thumbnailUrl = `data:${mime};base64,${thumbData}`;
                }

                // Infer Title: Remove timestamp part "123456-"
                // usually format is TIMESTAMP-NAME.mp4 or just TIMESTAMP.mp4
                let title = fileBase;
                if (title.includes("-")) {
                    const parts = title.split("-");
                    if (!isNaN(parts[0]) && parts[0].length > 10) {
                        title = parts.slice(1).join(" "); // Remove timestamp
                    }
                }
                // Clean up title
                title = title.replace(/_/g, " ").replace(/\./g, " ");

                // Pick a random category
                const categories = ["Chest", "Back", "Legs", "Arms", "Core", "Cardio"];
                const category = categories[Math.floor(Math.random() * categories.length)];

                await Workout.create({
                    title: title || "Untitled Workout",
                    description: "Imported from existing files.",
                    category: category,
                    videoUrl: videoPath,
                    thumbnail: thumbnailUrl,
                    userId: null // System imported
                });

                console.log(`✅ Added: ${title}`);
                addedCount++;
            }
        }

        console.log(`\n🎉 Sync Complete! Added ${addedCount} new videos.`);

    } catch (error) {
        console.error("Sync Error:", error);
    } finally {
        mongoose.connection.close();
    }
};

syncVideos();
