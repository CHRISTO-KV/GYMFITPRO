import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  Paper,
  CircularProgress,
  InputAdornment
} from "@mui/material";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/api";
import { motion } from "framer-motion";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";



export default function Signup() {
  const [data, setData] = useState({
    fname: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!data.fname || !data.email || !data.password) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/signup", {
        fname: data.fname,
        email: data.email,
        password: data.password
      });

      alert("Signup successful! You can now login.");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  return (
    <Box
      sx={{
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
          maxWidth: 420,
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
          position: "absolute", top: -50, left: -50,
          width: 150, height: 150,
          bgcolor: "primary.main", opacity: 0.1,
          filter: "blur(50px)", borderRadius: "50%"
        }} />

        <Typography
          variant="h4"
          color="text.primary"
          fontWeight={900}
          textAlign="center"
          mb={1}
          sx={{ textTransform: "uppercase", letterSpacing: 1 }}
        >
          Join The <Box component="span" sx={{ color: "primary.main" }}>Club</Box>
        </Typography>

        <Typography variant="body2" color="text.secondary" textAlign="center" mb={4}>
          Start your fitness journey today
        </Typography>

        <Stack spacing={2} component={motion.div} variants={containerVariants}>
          <TextField
            label="Full Name"
            fullWidth
            value={data.fname}
            onChange={(e) => setData({ ...data, fname: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
              sx: { color: "text.primary" }
            }}
            sx={inputStyle}
          />

          <TextField
            label="Email Address"
            fullWidth
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
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

          <TextField
            label="Password"
            type="password"
            fullWidth
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
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

          <Button
            fullWidth
            onClick={handleSignup}
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
              mt: 2,
              fontSize: "1rem",
              boxShadow: (theme) => `0 4px 15px ${theme.palette.primary.main}50`,
              "&:hover": { bgcolor: "primary.light" }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Sign Up"}
          </Button>
        </Stack>

        <Box mt={4} textAlign="center">
          <Typography color="text.secondary" fontSize={14}>
            Already have an account?{" "}
            <Link to="/" style={{ fontWeight: 700, textDecoration: "none" }}>
              <Box component="span" sx={{ color: "primary.main" }}>Login Here</Box>
            </Link>
          </Typography>
        </Box>
      </Paper>
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
