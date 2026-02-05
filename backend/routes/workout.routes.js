const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Workout = require("../model/Workout"); // ✅ Correct model
const router = express.Router();

const videoDir = "uploads/videos";
if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, videoDir),
  filename: (_, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// Update to handle multiple files (video + thumbnail)
router.post("/upload", upload.fields([{ name: "video", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]), async (req, res) => {
  try {
    if (!req.files || !req.files.video) return res.status(400).json({ message: "No video uploaded" });

    const { title, description, category, userId } = req.body;

    // Process video (keep as file path)
    const videoUrlPath = `/uploads/videos/${req.files.video[0].filename}`;

    // Process thumbnail (convert to Base64)
    let thumbnailUrl = "";
    if (req.files.thumbnail) {
      const thumbPath = req.files.thumbnail[0].path;
      const thumbData = fs.readFileSync(thumbPath, { encoding: "base64" });
      const mime = req.files.thumbnail[0].mimetype;
      thumbnailUrl = `data:${mime};base64,${thumbData}`;

      // Delete temporary thumbnail file
      try { fs.unlinkSync(thumbPath); } catch (e) { console.warn("Failed to delete temp thumbnail", e); }
    }

    const video = await Workout.create({
      title,
      description,
      category,
      userId,
      videoUrl: videoUrlPath,
      thumbnail: thumbnailUrl
    });

    res.status(201).json({ message: "Video uploaded", video });
  } catch (err) {
    // Cleanup video if DB save fails
    if (req.files?.video) {
      try { fs.unlinkSync(req.files.video[0].path); } catch (e) { }
    }
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

router.get("/", async (_, res) => {
  try {
    const videos = await Workout.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: "Fetch failed", error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const video = await Workout.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });
    res.json(video);
  } catch (err) {
    res.status(500).json({ message: "Fetch failed", error: err.message });
  }
});

// Update video details & files
router.put("/:id", upload.fields([{ name: "video", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const video = await Workout.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    // Update text fields
    if (title) video.title = title;
    if (description) video.description = description;
    if (category) video.category = category;

    // Handle new video file
    if (req.files?.video) {
      // Delete old video if exists
      if (video.videoUrl && fs.existsSync("." + video.videoUrl)) {
        fs.unlinkSync("." + video.videoUrl);
      }
      video.videoUrl = `/uploads/videos/${req.files.video[0].filename}`;
    }

    // Handle new thumbnail file
    if (req.files?.thumbnail) {
      const thumbPath = req.files.thumbnail[0].path;
      const thumbData = fs.readFileSync(thumbPath, { encoding: "base64" });
      const mime = req.files.thumbnail[0].mimetype;
      video.thumbnail = `data:${mime};base64,${thumbData}`;

      try { fs.unlinkSync(thumbPath); } catch (e) { }
    }

    await video.save();
    res.json({ message: "Video updated", video });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const v = await Workout.findById(req.params.id);
    if (!v) return res.status(404).json({ message: "Video not found" });

    const filePath = "." + v.videoUrl;
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // delete file

    await Workout.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

module.exports = router;
