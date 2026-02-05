import { Box, Typography, Grid, Stack, Link as MuiLink } from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

export default function Footer() {
  const role = sessionStorage.getItem("role");

  return (
    <Box
      sx={{
        bgcolor: "background.paper", // Darker shade of background
        color: "text.secondary",
        mt: 8,
        pt: 6,
        pb: 3,
        borderTop: "2px solid",
        borderColor: "primary.main"
      }}
    >
      <Grid container spacing={4} px={{ xs: 3, md: 8 }}>

        {/* BRAND */}
        <Grid item xs={12} md={4}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <FitnessCenterIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography
              variant="h5"
              fontWeight={800}
              color="primary"
            >
              GYM FIT PRO
            </Typography>
          </Stack>

          <Typography mt={2} fontSize={14}>
            Premium gym supplements, fitness equipment, and accessories
            for athletes who train hard and live stronger.
          </Typography>
        </Grid>

        {/* SHOP LINKS */}
        {role !== "admin" && (
          <Grid item xs={12} sm={6} md={2}>
            <Typography color="text.primary" fontWeight={700} mb={1}>
              Shop
            </Typography>

            <Stack spacing={0.8}>
              <MuiLink href="/products" underline="none" color="inherit">
                Products
              </MuiLink>
              <MuiLink href="/cart" underline="none" color="inherit">
                Cart
              </MuiLink>
              <MuiLink href="/orders" underline="none" color="inherit">
                My Orders
              </MuiLink>
            </Stack>
          </Grid>
        )}

        {/* ACCOUNT */}
        {role !== "admin" && (
          <Grid item xs={12} sm={6} md={2}>
            <Typography color="text.primary" fontWeight={700} mb={1}>
              Account
            </Typography>

            <Stack spacing={0.8}>
              <MuiLink href="/" underline="none" color="inherit">
                Login
              </MuiLink>
              <MuiLink href="/signup" underline="none" color="inherit">
                Sign Up
              </MuiLink>
            </Stack>
          </Grid>
        )}

        {/* CONTACT */}
        {role !== "admin" && (
          <Grid item xs={12} md={4}>
            <Typography color="text.primary" fontWeight={700} mb={1}>
              Contact
            </Typography>

            <Typography fontSize={14}>
              📍 Gym Fit Pro<br></br>
              Thrissur,Thalore near health center<br></br>
              building no:33<br></br>
              Kerala<br></br>
              India<br></br>

            </Typography>
            <Typography fontSize={14}>
              📧 gymfitpro@gmail.com
            </Typography>
            <Typography fontSize={14}>
              📞 +91 98765 43210
            </Typography>
          </Grid>
        )}
      </Grid>

      {/* COPYRIGHT */}
      <Box
        sx={{
          textAlign: "center",
          mt: 5,
          pt: 2,
          borderTop: "1px solid",
          borderColor: "divider"
        }}
      >
        <Typography fontSize={13}>
          © {new Date().getFullYear()} Gym Fit Pro. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
