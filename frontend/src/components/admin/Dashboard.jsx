import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Stack,
  Chip
} from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory2";
import AddBoxIcon from "@mui/icons-material/AddBox";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PeopleIcon from "@mui/icons-material/People";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";



const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function Dashboard() {
  const navigate = useNavigate();

  const cardStyle = {
    p: 4,
    bgcolor: "background.paper", // Fallback or theme value
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    color: "text.primary",
    borderRadius: 4,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: 280,
    width: "100%",
    border: "1px solid",
    borderColor: "divider",
    boxShadow: (theme) => `0 8px 32px 0 ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.37)' : 'rgba(0, 0, 0, 0.1)'}`,
    overflow: "hidden",
    position: "relative",
    transition: "all 0.3s ease-in-out",
    "&:hover": {
      transform: "translateY(-8px)",
      boxShadow: (theme) => `0 12px 40px 0 ${theme.palette.primary.main}40`,
      borderColor: "primary.main",
      "& .icon-box": {
        transform: "scale(1.1) rotate(5deg)",
        color: "primary.main"
      }
    }
  };

  const IconWrapper = ({ children }) => (
    <Box className="icon-box" sx={{ transition: "0.4s ease-out" }}>
      {children}
    </Box>
  );

  return (
    <Box
      sx={{
        p: 4,
        background: (theme) => `linear-gradient(rgba(0,0,0,0.85), ${theme.palette.background.default}), url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        minHeight: "100vh"
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Typography
          variant="h3"
          sx={{
            color: "text.primary",
            fontWeight: 900,
            mb: 1,
            mt: 4,
            textTransform: "uppercase",
            letterSpacing: "2px",
            textShadow: "2px 2px 10px rgba(0,0,0,0.5)" // Keep shadow for readability on image
          }}
        >
          Admin <Box component="span" sx={{ color: "primary.main" }}>Dashboard</Box>
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={6} sx={{ maxWidth: 600 }}>
          Manage your products, orders, users, and content efficiently from one central hub.
        </Typography>
      </motion.div>

      <Grid
        container
        spacing={4}
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ADD PRODUCT */}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} display="flex" component={motion.div} variants={itemVariants}>
          <Paper sx={cardStyle} onClick={() => navigate("/admin/add-product")}>
            <Stack spacing={2}>
              <IconWrapper>
                <AddBoxIcon sx={{ fontSize: 50, color: "text.secondary" }} />
              </IconWrapper>
              <Typography variant="h5" fontWeight={800} letterSpacing="0.5px">Add Product</Typography>
              <Typography variant="body2" color="text.secondary">Register new inventory items with details & images</Typography>
            </Stack>
            <Button
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontWeight: 800,
                "&:hover": { bgcolor: "primary.light" }
              }}
            >
              Create New
            </Button>
          </Paper>
        </Grid>

        {/* MANAGE PRODUCTS */}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} display="flex" component={motion.div} variants={itemVariants}>
          <Paper sx={cardStyle} onClick={() => navigate("/admin/products")}>
            <Stack spacing={2}>
              <IconWrapper>
                <InventoryIcon sx={{ fontSize: 48, color: "text.secondary" }} />
              </IconWrapper>
              <Typography variant="h5" fontWeight={800} letterSpacing="0.5px">Products</Typography>
              <Typography variant="body2" color="text.secondary">Edit, delete, and manage existing inventory</Typography>
            </Stack>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                mt: 2,
                borderColor: "primary.main",
                color: "primary.main",
                fontWeight: 800,
                "&:hover": { bgcolor: "primary.main", color: "primary.contrastText", borderColor: "primary.main" }
              }}
            >
              Manage Catalog
            </Button>
          </Paper>
        </Grid>

        {/* ORDERS */}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} display="flex" component={motion.div} variants={itemVariants}>
          <Paper sx={cardStyle} onClick={() => navigate("/admin/orders")}>
            <Stack spacing={2}>
              <IconWrapper>
                <LocalShippingIcon sx={{ fontSize: 48, color: "text.secondary" }} />
              </IconWrapper>
              <Typography variant="h5" fontWeight={800} letterSpacing="0.5px">Orders</Typography>
              <Typography variant="body2" color="text.secondary">Track shipments and update order statuses</Typography>
            </Stack>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                mt: 2,
                borderColor: "primary.main",
                color: "primary.main",
                fontWeight: 800,
                "&:hover": { bgcolor: "primary.main", color: "primary.contrastText", borderColor: "primary.main" }
              }}
            >
              View Orders
            </Button>
          </Paper>
        </Grid>

        {/* USERS */}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} display="flex" component={motion.div} variants={itemVariants}>
          <Paper sx={cardStyle} onClick={() => navigate("/admin/users")}>
            <Stack spacing={2}>
              <IconWrapper>
                <PeopleIcon sx={{ fontSize: 48, color: "text.secondary" }} />
              </IconWrapper>
              <Typography variant="h5" fontWeight={800} letterSpacing="0.5px">Users</Typography>
              <Typography variant="body2" color="text.secondary">Manage registered customers and admin roles</Typography>
            </Stack>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                mt: 2,
                borderColor: "primary.main",
                color: "primary.main",
                fontWeight: 800,
                "&:hover": { bgcolor: "primary.main", color: "primary.contrastText", borderColor: "primary.main" }
              }}
            >
              Manage Users
            </Button>
          </Paper>
        </Grid>

        {/* WORKOUT VIDEOS UPLOAD */}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} display="flex" component={motion.div} variants={itemVariants}>
          <Paper sx={cardStyle} onClick={() => navigate("/admin/upload-workout-video")}>
            <Stack spacing={2}>
              <IconWrapper>
                <FitnessCenterIcon sx={{ fontSize: 48, color: "text.secondary" }} />
              </IconWrapper>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h5" fontWeight={800} letterSpacing="0.5px">Upload</Typography>
                <Chip label="New" size="small" sx={{ bgcolor: "primary.main", color: "primary.contrastText", fontWeight: 800 }} />
              </Box>
              <Typography variant="body2" color="text.secondary">Share new workout training videos</Typography>
            </Stack>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/api/workouts/upload");
              }}
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                bgcolor: "background.paper",
                color: "text.primary",
                fontWeight: 800,
                "&:hover": { bgcolor: "primary.main", color: "primary.contrastText" }
              }}
            >
              Upload Video
            </Button>
          </Paper>
        </Grid>

        {/* WORKOUT VIDEOS LIST */}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} display="flex" component={motion.div} variants={itemVariants}>
          <Paper sx={cardStyle} onClick={() => navigate("/admin/workout-videos")}>
            <Stack spacing={2}>
              <IconWrapper>
                <VideoLibraryIcon sx={{ fontSize: 48, color: "text.secondary" }} />
              </IconWrapper>
              <Typography variant="h5" fontWeight={800} letterSpacing="0.5px">Library</Typography>
              <Typography variant="body2" color="text.secondary">Browse and manage uploaded workout content</Typography>
            </Stack>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                mt: 2,
                borderColor: "primary.main",
                color: "primary.main",
                fontWeight: 800,
                "&:hover": { bgcolor: "primary.main", color: "primary.contrastText", borderColor: "primary.main" }
              }}
            >
              View Library
            </Button>
          </Paper>
        </Grid>

        {/* MANAGE DELIVERY BOYS */}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} display="flex" component={motion.div} variants={itemVariants}>
          <Paper sx={cardStyle} onClick={() => navigate("/admin/manage-delivery-boys")}>
            <Stack spacing={2}>
              <IconWrapper>
                <TwoWheelerIcon sx={{ fontSize: 48, color: "text.secondary" }} />
              </IconWrapper>
              <Typography variant="h5" fontWeight={800} letterSpacing="0.5px">Delivery</Typography>
              <Typography variant="body2" color="text.secondary">Manage delivery personnel and fleet</Typography>
            </Stack>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                mt: 2,
                borderColor: "primary.main",
                color: "primary.main",
                fontWeight: 800,
                "&:hover": { bgcolor: "primary.main", color: "primary.contrastText", borderColor: "primary.main" }
              }}
            >
              Manage Fleet
            </Button>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}
