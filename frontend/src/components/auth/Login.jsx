import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Stack,
  Paper,
  IconButton,
  InputAdornment
} from "@mui/material";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { motion } from "framer-motion";



export default function Login({ isModal, onClose }) {
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const login = async () => {
    if (!data.email.trim() || !data.password.trim()) {
      alert("⚠ Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", data);
      const user = res.data.user;

      if (!user) throw new Error("Invalid response from server");

      // Update global auth state
      authLogin(user);

      alert("🔥 Login successful!");

      if (isModal && onClose) {
        onClose();
      } else {
        // Route based on user role
        if (res.data.user.role === "admin") {
          navigate("/admin");
        } else if (res.data.user.role === "delivery_boy") {
          navigate("/delivery-dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      console.error("❌ LOGIN ERROR:", err);
      alert(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <Box
      sx={isModal ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1300,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      } : {
        minHeight: "100vh",
        background: (theme) => `linear-gradient(rgba(0,0,0,0.85), ${theme.palette.background.default}), url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Paper
        component={motion.div}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        sx={{
          width: "100%",
          maxWidth: 400,
          p: { xs: 3, md: 4 },
          mx: 2,
          bgcolor: "background.paper",
          backdropFilter: "blur(20px)",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Decorative Glow */}
        <Box sx={{
          position: "absolute", top: -40, right: -40,
          width: 100, height: 100,
          bgcolor: "primary.main", opacity: 0.15,
          filter: "blur(40px)", borderRadius: "50%"
        }} />

        {isModal && (
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', top: 8, right: 8, color: 'text.secondary', "&:hover": { color: "text.primary" } }}
          >
            <CloseIcon />
          </IconButton>
        )}

        <Stack spacing={3}>
          <Box textAlign="center" mb={1}>
            <Typography
              variant="h4"
              fontWeight={900}
              color="text.primary"
              sx={{ textTransform: "uppercase", letterSpacing: 1 }}
            >
              Welcome <Box component="span" sx={{ color: "primary.main" }}>Back</Box>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to continue your fitness journey
            </Typography>
          </Box>

          {/* EMAIL */}
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            value={data.email}
            onChange={e => setData({ ...data, email: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
              sx: { color: "text.primary" }
            }}
            sx={inputStyle}
          />

          {/* PASSWORD */}
          <TextField
            fullWidth
            label="Password"
            type="password"
            name="password"
            value={data.password}
            onChange={e => setData({ ...data, password: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              sx: { color: "text.primary" }
            }}
            sx={inputStyle}
          />

          {/* LOGIN BUTTON */}
          <Button
            fullWidth
            onClick={login}
            disabled={loading}
            component={motion.button}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontWeight: 800,
              py: 1.5,
              borderRadius: 2,
              textTransform: "uppercase",
              letterSpacing: 1,
              boxShadow: (theme) => `0 4px 15px ${theme.palette.primary.main}50`,
              "&:hover": { bgcolor: "primary.light", boxShadow: (theme) => `0 6px 20px ${theme.palette.primary.main}60` }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "LOGIN"}
          </Button>

          {/* LINKS */}
          <Box textAlign="center">
            <Typography color="text.secondary" fontSize={14} mb={1}>
              Don't have an account?{" "}
              <Link
                to="/signup"
                style={{ fontWeight: 700, textDecoration: "none" }}
              >
                <Box component="span" sx={{ color: "primary.main" }}>Sign Up</Box>
              </Link>
            </Typography>

            <Typography color="#888" fontSize={14}>
              Delivery Partner?{" "}
              <Link
                to="/delivery-boy-signup"
                style={{ color: "#4caf50", fontWeight: 700, textDecoration: "none" }}
              >
                Register Here
              </Link>
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

const inputStyle = {
  "& .MuiInputLabel-root": { color: "text.secondary" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "divider" },
    "&:hover fieldset": { borderColor: "text.secondary" },
    "&.Mui-focused fieldset": { borderColor: "primary.main" },
    bgcolor: "action.hover"
  }
};
