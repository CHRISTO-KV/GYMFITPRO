const express = require("express");
const router = express.Router();
const User = require("../model/User");
const upload = require("../middleware/multer");
const auth = require("../middleware/auth");
const nodemailer = require("nodemailer");

// --- MAIL CONFIG ---
// Use environment variables for real email usage
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // e.g. "yourname@gmail.com"
    pass: process.env.EMAIL_PASS  // e.g. "app-password"
  }
});

// Helper to send email (or log if no env vars)
const sendEmail = async (to, subject, text) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("==========================================");
    console.log(`[MOCK EMAIL] To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text}`);
    console.log("==========================================");
    return;
  }
  await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
};

// --- SEND OTP ---
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Check if user already exists and is verified
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "User already registered. Please login." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (existingUser) {
      // Update existing unverified user
      existingUser.otp = otp;
      existingUser.otpExpires = otpExpires;
      await existingUser.save();
    } else {
      // Temporarily create user without other fields (schema might require them, check below)
      // Actually, better to just store OTP based on email or create partial user if schema allows.
      // But User schema requires 'fname' and 'password'. 
      // We'll trust frontend sends fname/password later or we accept them here.
      // Let's expect Frontend to send ALL data here or we just store OTP in a separate collection?
      // Simpler approach: Create the user here with temp data or upsert if we change flow?
      // Wait, current flow plan: Signup -> Fill Form -> Click "Send OTP" -> User enters OTP -> Signup.

      // We CANNOT create the user yet if they haven't sent name/password.
      // IF the user sends name/password to /send-otp, we can create the temporary user.
      // OR we just assume this endpoint is called FIRST.
      // Let's assume the frontend sends { email, fname, password } or at least email.

      // PROPER FLOW FOR "FREE":
      // 1. User fills form.
      // 2. /send-otp receives { email }. Checks if email taken.
      //    We can't store OTP in User doc if user doc doesn't exist.
      //    We could create a separate OTP model. Or we create the User doc with "isVerified: false".

      // Let's create/update User doc. Requires name/password.
      // So /send-otp should receive at least email.
      // If we create a user without password, it might fail validation.
      // Let's adjust /send-otp to receive { fname, email, password } OR 
      // simple hack: create a separate OTP collection? No, let's keep it in User.

      // REVISED: /signup endpoint creates user with isVerified: false and sends OTP.
      // /verify-otp endpoint sets isVerified: true.

      // BUT current User.js has required fields.
      // So:
      // Step 1: User fills form, clicks "Sign Up".
      // Step 2: Backend creates User (isVerified: false), generates OTP, sends it.
      // Step 3: Frontend asks for OTP.
      // Step 4: User enters OTP -> /verify-otp -> sets isVerified: true.

      // Let's stick to this flow. It's standard.

      // Wait, if I change /signup, I break existing flow immediately.
      // So I will make /signup trigger the OTP flow.

      return res.status(400).json({ message: "Use /auth/signup to initiate registration" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error sending OTP", error: err.message });
  }
});

// --- NEW SIGNUP (INITIATE) ---
router.post("/signup", async (req, res) => {
  try {
    const { fname, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ message: "User already exists" });
      }
      // User exists but not verified? Resend OTP logic below.
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (!user) {
      user = new User({ fname, email, password, otp, otpExpires, isVerified: false });
    } else {
      // Update unverified user with new details/OTP
      user.fname = fname;
      user.password = password;
      user.otp = otp;
      user.otpExpires = otpExpires;
    }

    await user.save();

    console.log("==========================================");
    console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
    console.log("==========================================");

    // Attempt to send email but don't fail if it fails (just log error)
    try {
      await sendEmail(email, "Your OTP Code", `Your verification code is: ${otp}`);
    } catch (emailErr) {
      console.error("Email send failed (ignored for dev):", emailErr.message);
    }

    res.status(200).json({ message: "OTP sent (check console)", userId: user._id });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(400).json({ message: "Signup failed", error: err.message });
  }
});

// --- VERIFY OTP ---
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "User already verified" });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Verification successful", user });
  } catch (err) {
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Account not verified. Please verify OTP." });
    }

    if (user.isDisabled) {
      return res.status(403).json({ message: "This account is disabled. Contact admin." });
    }

    // Check if delivery boy is approved
    if (user.role === "delivery_boy" && !user.deliveryBoyApproved) {
      return res.status(403).json({ message: "Your application is pending admin approval. Please try again later." });
    }

    if (user.password !== req.body.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.status(200).json({ message: "Login success", user });
  } catch (err) {
    res.status(500).json({ message: "Server error during login", error: err.message });
  }
});

// --- UPDATE PROFILE ---
router.put("/profile", auth, upload.single("profileImage"), async (req, res) => {
  try {
    const {
      fname, lname, mobile, email, password,
      vehicleType, vehicleNumber, aadharNumber,
      state, district, city, localArea
    } = req.body;

    let updateData = { fname, lname, mobile };

    // Allow updating extended fields if provided
    if (email) updateData.email = email;
    if (password) updateData.password = password; // Note: Storing plain text as per existing pattern
    if (vehicleType) updateData.vehicleType = vehicleType;
    if (vehicleNumber) updateData.vehicleNumber = vehicleNumber;
    if (aadharNumber) updateData.aadharNumber = aadharNumber;
    if (state) updateData.state = state;
    if (district) updateData.district = district;
    if (city) updateData.city = city;
    if (localArea) updateData.localArea = localArea;

    if (req.file) {
      updateData.profileImage = req.file.filename;
    } else if (req.body.deleteImage === "true") {
      updateData.profileImage = ""; // Clear image
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select("-otp -otpExpires"); // Return user with password if updated, or exclude it? Front end might need it for session? safely exclude OTP.

    res.json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    console.error("Profile Update Error:", err);
    res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
});

// --- DELIVERY BOY SIGNUP ---
router.post("/delivery-boy-signup", async (req, res) => {
  try {
    const { fname, lname, email, password, mobile, vehicleType, vehicleNumber, aadharNumber, state, district, city, localArea } = req.body;

    // Validate required fields
    if (!fname || !email || !password || !mobile || !vehicleType || !vehicleNumber || !aadharNumber || !state || !district || !city || !localArea) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ message: "Email already registered" });
      }
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (!user) {
      user = new User({
        fname,
        lname,
        email,
        password,
        mobile,
        vehicleType,
        vehicleNumber,
        aadharNumber,
        state,
        district,
        city,
        localArea,
        role: "delivery_boy",
        otp,
        otpExpires,
        isVerified: false,
        deliveryBoyApproved: false
      });
    } else {
      user.fname = fname;
      user.lname = lname;
      user.password = password;
      user.mobile = mobile;
      user.vehicleType = vehicleType;
      user.vehicleNumber = vehicleNumber;
      user.aadharNumber = aadharNumber;
      user.state = state;
      user.district = district;
      user.city = city;
      user.localArea = localArea;
      user.role = "delivery_boy";
      user.otp = otp;
      user.otpExpires = otpExpires;
    }

    await user.save();

    console.log("==========================================");
    console.log(`[DEV MODE] Delivery Boy OTP for ${email}: ${otp}`);
    console.log("==========================================");

    // Attempt to send email
    try {
      await sendEmail(email, "Your OTP Code - Delivery Boy Registration", `Your verification code is: ${otp}`);
    } catch (emailErr) {
      console.error("Email send failed (ignored for dev):", emailErr.message);
    }

    res.status(200).json({ message: "OTP sent. Please verify your email", userId: user._id });
  } catch (err) {
    console.error("Delivery Boy Signup Error:", err);
    res.status(400).json({ message: "Signup failed", error: err.message });
  }
});

// --- GET ALL DELIVERY BOYS (ADMIN) ---
router.get("/delivery-boys", async (req, res) => {
  try {
    const deliveryBoys = await User.find({ role: "delivery_boy", deliveryBoyApproved: true });
    res.json(deliveryBoys);
  } catch (err) {
    console.error("Fetch Delivery Boys Error:", err);
    res.status(500).json({ message: "Failed to fetch delivery boys" });
  }
});

module.exports = router;
