import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  Button,
  Stack,
  IconButton,
  Container,
  CircularProgress,
  Chip
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import api, { IMG_BASE_URL, getImageUrl } from "../../api/api";
import { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const BASE_UPLOAD_URL = IMG_BASE_URL;

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } }
};

export default function Wishlist() {
  const { wishlist, loadWishlist, loadCart } = useCart();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    loadWishlist().finally(() => setLoading(false));
  }, []);

  const remove = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      loadWishlist(); // Refresh list
    } catch (err) {
      console.error("Remove failed", err);
    }
  };

  const addToCart = async (productId) => {
    if (!userId) return navigate("/");
    try {
      await api.post("/cart/add", {
        userId,
        productId,
        quantity: 1
      });
      loadCart();
      alert("Added to cart 🛒");
    } catch (err) {
      console.error("Add to cart failed", err);
      // Optional: show error toast
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary", overflowX: "hidden" }}>

      {/* Background Image */}
      <Box sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "60vh",
        background: (theme) => `linear-gradient(to bottom, transparent, ${theme.palette.background.default}), url(https://images.unsplash.com/photo-1574680096141-98774044c34a?q=80&w=2062&auto=format&fit=crop)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.15,
        zIndex: 0,
        pointerEvents: "none"
      }} />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, pt: 12, pb: 8 }}>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Typography variant="h3" fontWeight={900} textAlign="center" mb={1} textTransform="uppercase">
            My <Box component="span" sx={{ color: "primary.main" }}>Wishlist</Box>
          </Typography>
          <Typography textAlign="center" color="text.secondary" mb={6}>
            Save your favorite gear for later
          </Typography>
        </motion.div>

        {wishlist.length === 0 ? (
          <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} textAlign="center" py={10} bgcolor="action.hover" borderRadius={4}>
            <FavoriteIcon sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
            <Typography variant="h5" color="text.secondary" fontWeight={700}>Your wishlist is empty</Typography>
            <Button
              variant="outlined"
              color="primary"
              sx={{ mt: 3 }}
              onClick={() => navigate('/products')}
            >
              Explore Products
            </Button>
          </Box>
        ) : (
          <Grid container spacing={4} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
            <AnimatePresence>
              {wishlist.map(item => {
                const product = item.productId;
                if (!product) return null; // Safety check

                return (
                  <Grid  size={{xs:12, sm:6, md:4, lg:3}} key={product._id} component={motion.div} variants={itemVariants} layout>
                    <Card
                      sx={{
                        bgcolor: "background.paper",
                        backdropFilter: "blur(12px)",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 4,
                        overflow: "hidden",
                        position: "relative",
                        transition: "all 0.4s ease",
                        cursor: "pointer",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow: (theme) => `0 12px 40px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.1)'}`,
                          bgcolor: "action.hover",
                          "& .product-image": { transform: "scale(1.08)" }
                        }
                      }}
                      onClick={() => navigate(`/products/${product._id}`)}
                    >
                      {/* Image Area */}
                      <Box sx={{ position: "relative", overflow: "hidden", bgcolor: "background.default" }}>
                        <CardMedia
                          component="img"
                          className="product-image"
                          height="250"
                          image={product.images?.[0] ? getImageUrl(product.images[0]) : ""}
                          alt={product.name}
                          sx={{
                            objectFit: "cover",
                            transition: "transform 0.5s ease"
                          }}
                        />
                        {/* Remove Button (Top Right) */}
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            remove(product._id);
                          }}
                          sx={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            bgcolor: "rgba(0,0,0,0.6)",
                            color: "error.main",
                            "&:hover": { bgcolor: "background.paper", color: "error.dark" }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>

                      {/* Content Area */}
                      <Stack p={2.5} spacing={1}>
                        <Typography variant="body2" color="text.secondary" textTransform="uppercase" fontWeight={700} fontSize={10} letterSpacing={1}>
                          {product.category?.name || "Equipment"}
                        </Typography>

                        <Typography variant="h6" fontWeight={800} color="text.primary" noWrap title={product.name}>
                          {product.name}
                        </Typography>

                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography variant="h6" color="primary.main" fontWeight={800}>
                            ₹{product.price}
                          </Typography>
                          {(product.stock ?? 0) > 0 ? (
                            <Chip label="In Stock" size="small" color="success" variant="outlined" sx={{ fontWeight: 700, fontSize: 10, height: 20 }} />
                          ) : (
                            <Chip label="Out of Stock" size="small" color="error" variant="outlined" sx={{ fontWeight: 700, fontSize: 10, height: 20 }} />
                          )}
                        </Stack>

                        {/* Add to Cart Button */}
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<ShoppingBagIcon />}
                          disabled={(product.stock ?? 0) <= 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product._id);
                          }}
                          sx={{
                            mt: 2,
                            bgcolor: "text.primary",
                            color: "background.paper",
                            fontWeight: 800,
                            py: 1,
                            "&:hover": { bgcolor: "primary.main", color: "primary.contrastText" }
                          }}
                        >
                          Add to Cart
                        </Button>
                      </Stack>
                    </Card>
                  </Grid>
                );
              })}
            </AnimatePresence>
          </Grid>
        )}
      </Container>
    </Box>
  );
}
