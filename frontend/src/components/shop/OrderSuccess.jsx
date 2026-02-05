import { Box, Typography, Button, Container, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Fallback icon or use custom svg

import { useTheme } from "@mui/material";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const checkmarkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1, ease: "easeInOut" }
  }
};

export default function OrderSuccess() {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Background Image */}
      <Box sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url(https://images.unsplash.com/photo-1552674605-5d226a5cd93b?q=80&w=2070&auto=format&fit=crop)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        zIndex: 0,
        opacity: theme.palette.mode === 'dark' ? 0.6 : 0.2 // Adjust opacity for light mode
      }} />

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>

        <motion.div variants={containerVariants} initial="hidden" animate="visible">

          {/* Animated Checkmark SVG */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              width="120"
              height="120"
              viewBox="0 0 52 52"
            >
              <motion.circle
                cx="26" cy="26" r="25"
                fill="none"
                stroke={theme.palette.primary.main}
                strokeWidth="2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
              <motion.path
                fill="none"
                stroke={theme.palette.primary.main}
                strokeWidth="3"
                d="M14.1 27.2l7.1 7.2 16.7-16.8"
                variants={checkmarkVariants}
              />
            </motion.svg>
          </Box>

          <Box component={motion.div} variants={itemVariants}>
            <Typography variant="h3" color="text.primary" fontWeight={900} textTransform="uppercase" letterSpacing={1} gutterBottom>
              Order Placed!
            </Typography>
            <Typography variant="h6" color="text.secondary" fontWeight={400} mb={6}>
              Thank you for trusting GymFit Pro. Your gear is on its way.
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            component={motion.div}
            variants={itemVariants}
          >
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontWeight: 800,
                px: 5,
                py: 1.5,
                borderRadius: 50,
                fontSize: "1rem",
                "&:hover": { bgcolor: "primary.light", transform: "translateY(-3px)" },
                transition: "all 0.3s"
              }}
              onClick={() => navigate("/orders")}
            >
              View My Orders
            </Button>

            <Button
              variant="outlined"
              size="large"
              sx={{
                color: "text.primary",
                borderColor: "divider",
                fontWeight: 800,
                px: 5,
                py: 1.5,
                borderRadius: 50,
                fontSize: "1rem",
                "&:hover": { borderColor: "text.primary", bgcolor: "action.hover" }
              }}
              onClick={() => navigate("/products")}
            >
              Continue Shopping
            </Button>
          </Stack>

        </motion.div>
      </Container>
    </Box>
  );
}
