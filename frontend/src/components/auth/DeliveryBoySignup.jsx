import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Stack,
  Paper,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  InputAdornment
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { motion, AnimatePresence } from "framer-motion";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PhoneIcon from "@mui/icons-material/Phone";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import BadgeIcon from "@mui/icons-material/Badge";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import HomeIcon from "@mui/icons-material/Home";
import VpnKeyIcon from "@mui/icons-material/VpnKey";

import allIndianStateDistricts from "../../data/indianStateDistricts";



const INDIAN_STATES = Object.keys(allIndianStateDistricts || {});

export default function DeliveryBoySignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: SignUp, 2: OTP Verification
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
    mobile: "",
    vehicleType: "bike",
    vehicleNumber: "",
    aadharNumber: "",
    state: "",
    district: "",
    city: "",
    localArea: ""
  });

  const [otp, setOtp] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // If state changes, reset district
    if (name === "state") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        district: ""
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Step 1: Submit signup form
  const handleSignup = async () => {
    if (
      !formData.fname.trim() ||
      !formData.email.trim() ||
      !formData.password.trim() ||
      !formData.mobile.trim() ||
      !formData.vehicleNumber.trim() ||
      !formData.aadharNumber.trim() ||
      !formData.vehicleNumber.trim() ||
      !formData.aadharNumber.trim() ||
      !formData.state.trim() ||
      !formData.district.trim() ||
      !formData.city.trim() ||
      !formData.localArea.trim()
    ) {
      alert("⚠ Please fill all required fields");
      return;
    }

    if (!/^\d{10}$/.test(formData.mobile)) {
      alert("⚠ Mobile number must be 10 digits");
      return;
    }

    if (formData.password.length < 6) {
      alert("⚠ Password must be at least 6 characters");
      return;
    }

    if (!/^\d{12}$/.test(formData.aadharNumber)) {
      alert("⚠ Aadhar number must be 12 digits");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/delivery-boy-signup", formData);
      setUserId(res.data.userId);
      setStep(2);
      alert("✅ OTP sent to your email! Check console for OTP in dev mode.");
    } catch (err) {
      console.error("❌ SIGNUP ERROR:", err);
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      alert("⚠ Please enter OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", {
        email: formData.email,
        otp: otp
      });

      alert("✅ Email verified! Waiting for admin approval.");
      setOpenDialog(true);
    } catch (err) {
      console.error("❌ OTP VERIFICATION ERROR:", err);
      alert(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    navigate("/login");
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "background.default",
        padding: "20px"
      }}
    >

      <Paper
        component={motion.div}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        elevation={10}
        sx={{
          padding: "40px",
          maxWidth: "800px", // Wider for 2-column layout
          width: "100%",
          bgcolor: "background.paper",
          color: "text.primary",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Decorative Glow */}
        <Box sx={{
          position: "absolute", top: -60, right: -60,
          width: 200, height: 200,
          bgcolor: "primary.main", opacity: 0.08,
          filter: "blur(60px)", borderRadius: "50%"
        }} />

        <Typography
          variant="h4"
          sx={{ mb: 1, fontWeight: 900, color: "text.primary", textTransform: "uppercase", textAlign: "center" }}
        >
          {step === 1 ? "Become a" : "Verify"} <Box component="span" sx={{ color: "primary.main" }}>{step === 1 ? "Partner" : "Email"}</Box>
        </Typography>
        <Typography variant="body2" sx={{ mb: 4, color: "text.secondary", textAlign: "center" }}>
          {step === 1 ? "Join our elite delivery team and start earning today" : `Enter the code sent to ${formData.email}`}
        </Typography>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <Stack spacing={3} key="step1" component={motion.div} variants={containerVariants} initial="hidden" animate="visible" exit="exit">
              <Grid container spacing={2}>
                {/* Personal Info */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="First Name"
                    name="fname"
                    value={formData.fname}
                    onChange={handleInputChange}
                    fullWidth
                    InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment>, style: { color: "inherit" } }}
                    sx={inputStyle}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Last Name"
                    name="lname"
                    value={formData.lname}
                    onChange={handleInputChange}
                    fullWidth
                    InputProps={{ style: { color: "inherit" } }}
                    sx={inputStyle}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    fullWidth
                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment>, style: { color: "inherit" } }}
                    sx={inputStyle}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    fullWidth
                    InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>, style: { color: "inherit" } }}
                    sx={inputStyle}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Mobile (10 digits)"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    fullWidth
                    placeholder="9876543210"
                    InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon color="action" /></InputAdornment>, style: { color: "inherit" } }}
                    sx={inputStyle}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Aadhar (12 digits)"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleInputChange}
                    fullWidth
                    placeholder="123456789012"
                    InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon color="action" /></InputAdornment>, style: { color: "inherit" } }}
                    sx={inputStyle}
                  />
                </Grid>

                {/* Vehicle Info */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Vehicle Type"
                    name="vehicleType"
                    select
                    value={formData.vehicleType}
                    onChange={handleInputChange}
                    fullWidth
                    sx={{ ...inputStyle, "& .MuiSvgIcon-root": { color: "#aaa" } }}
                  >
                    <MenuItem value="bike">Bike</MenuItem>
                    <MenuItem value="scooter">Scooter</MenuItem>
                    <MenuItem value="car">Car</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Vehicle Number"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleInputChange}
                    fullWidth
                    placeholder="MH01AB1234"
                    InputProps={{ startAdornment: <InputAdornment position="start"><TwoWheelerIcon color="action" /></InputAdornment>, style: { color: "inherit" } }}
                    sx={inputStyle}
                  />
                </Grid>

                {/* Address Info */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="State"
                    name="state"
                    select
                    value={formData.state}
                    onChange={handleInputChange}
                    fullWidth
                    sx={{ ...inputStyle, "& .MuiSvgIcon-root": { color: "#aaa" } }}
                  >
                    {INDIAN_STATES.map((state) => (
                      <MenuItem key={state} value={state}>
                        {state}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="District"
                    name="district"
                    select
                    value={formData.district}
                    onChange={handleInputChange}
                    fullWidth
                    disabled={!formData.state}
                    sx={{ ...inputStyle, "& .MuiSvgIcon-root": { color: "#aaa" } }}
                  >
                    {formData.state ? allIndianStateDistricts[formData.state]?.map((district) => (
                      <MenuItem key={district} value={district}>
                        {district}
                      </MenuItem>
                    )) : <MenuItem value="">Select State First</MenuItem>}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    fullWidth
                    InputProps={{ startAdornment: <InputAdornment position="start"><LocationCityIcon color="action" /></InputAdornment>, style: { color: "inherit" } }}
                    sx={inputStyle}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Local Area / Address"
                    name="localArea"
                    value={formData.localArea}
                    onChange={handleInputChange}
                    fullWidth
                    InputProps={{ startAdornment: <InputAdornment position="start"><HomeIcon color="action" /></InputAdornment>, style: { color: "inherit" } }}
                    sx={inputStyle}
                  />
                </Grid>
              </Grid>

              <Button
                onClick={handleSignup}
                fullWidth
                disabled={loading}
                component={motion.button}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  fontSize: "1rem",
                  fontWeight: 800,
                  py: 1.5,
                  mt: 2,
                  borderRadius: 2,
                  boxShadow: 3,
                  "&:hover": { bgcolor: "primary.dark" },
                  "&:disabled": { bgcolor: "action.disabledBackground", color: "text.disabled" }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Submit Application"}
              </Button>

              <Typography
                variant="body2"
                sx={{
                  textAlign: "center",
                  mt: 2,
                  cursor: "pointer",
                  color: "text.secondary",
                  "& span": { color: "primary.main", fontWeight: "bold" }
                }}
                onClick={() => navigate("/login")}
              >
                Already have an account? <span>Login</span>
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={3} key="step2" component={motion.div} variants={containerVariants} initial="hidden" animate="visible" exit="exit" sx={{ maxWidth: 400, mx: "auto" }}>
              <TextField
                label="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                fullWidth
                placeholder="123456"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VpnKeyIcon color="action" />
                    </InputAdornment>
                  ),
                  style: { color: "inherit", letterSpacing: 5, fontSize: "1.2rem", fontWeight: "bold" }
                }}
                sx={inputStyle}
              />

              <Button
                onClick={handleVerifyOtp}
                fullWidth
                disabled={loading}
                component={motion.button}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  padding: "12px",
                  fontSize: "1rem",
                  fontWeight: 800,
                  borderRadius: 2,
                  "&:hover": { bgcolor: "primary.dark" },
                  "&:disabled": { bgcolor: "action.disabledBackground", color: "text.disabled" }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Verify OTP"}
              </Button>

              <Button
                onClick={() => {
                  setStep(1);
                  setOtp("");
                }}
                fullWidth
                sx={{
                  color: "text.secondary",
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": { color: "text.primary" }
                }}
              >
                ← Back to details
              </Button>
            </Stack>
          )}
        </AnimatePresence>
      </Paper>

      {/* Approval Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            borderRadius: 3,
            color: "text.primary"
          }
        }}
      >
        <DialogTitle sx={{ backgroundColor: "rgba(76, 175, 80, 0.1)", color: "success.main", fontWeight: "bold", borderBottom: "1px solid", borderColor: "divider" }}>
          ✅ Application Submitted
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" fontWeight={500}>
            Your email has been verified!
          </Typography>
          <Typography variant="body2" sx={{ marginTop: "10px", color: "text.secondary" }}>
            Your account is now pending admin approval. Once approved, you'll be able to login and start making deliveries.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleDialogClose} variant="contained" sx={{ bgcolor: "primary.main", color: "primary.contrastText", fontWeight: "bold", "&:hover": { bgcolor: "primary.dark" } }}>
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const inputStyle = {
  "& .MuiInputLabel-root": { color: "text.secondary" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "divider" },
    "&:hover fieldset": { borderColor: "text.primary" },
    "&.Mui-focused fieldset": { borderColor: "primary.main" },
    bgcolor: "action.hover"
  }
};
