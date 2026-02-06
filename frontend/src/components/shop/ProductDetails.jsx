import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  Stack,
  Rating,
  TextField,
  Divider,
  IconButton,
  CircularProgress,
  Chip,
  Paper,
  Container,
  Avatar
} from "@mui/material";

import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import VerifiedIcon from '@mui/icons-material/Verified';

import api, { getImageUrl } from "../../api/api";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";



// Animation Variants
const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loadCart, toggleWishlist } = useCart();

  const userId = sessionStorage.getItem("userId");

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [wish, setWish] = useState(false);
  const [hasBought, setHasBought] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔥 LOAD PRODUCT + REVIEWS + WISHLIST STATUS
  useEffect(() => {
    const loadData = async () => {
      try {
        const productRes = await api.get(`/products/${id}`);
        setProduct(productRes.data);

        const reviewRes = await api.get(`/reviews/${id}`);
        setReviews(reviewRes.data || []);

        if (userId && productRes.data?._id) {
          const boughtRes = await api.get(
            `/orders/has-bought/${userId}/${productRes.data._id}`
          );
          setHasBought(boughtRes.data.hasBought);

          // ✅ CHECK WISHLIST
          const wishRes = await api.get(
            `/wishlist/check/${productRes.data._id}`
          );
          setWish(wishRes.data.wished);
        }
      } catch (err) {
        console.error("Load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, userId]);

  const refreshReviews = async () => {
    const res = await api.get(`/reviews/${id}`);
    setReviews(res.data || []);
  };

  // 🛒 ADD TO CART
  const addToCart = async () => {
    if (!userId) return navigate("/");

    await api.post("/cart/add", {
      userId,
      productId: product._id,
      quantity: 1
    });

    loadCart();
    alert("Added to cart 🛒");
  };

  const buyNow = async () => {
    await addToCart();
    navigate("/checkout");
  };

  // ❤️ TOGGLE WISHLIST
  const handleToggleWishlist = async () => {
    if (!userId) return navigate("/");

    const res = await toggleWishlist(product._id);
    setWish(res.wished);
  };

  // ⭐ SUBMIT REVIEW
  const submitReview = async () => {
    if (!hasBought) return alert("Only buyers can review");
    if (!comment.trim()) return alert("Write something");

    await api.post("/reviews", {
      userId,
      productId: product._id,
      rating,
      comment
    });

    setComment("");
    setRating(5);
    refreshReviews();
  };

  const deleteReview = async (reviewId) => {
    await api.delete(`/reviews/${reviewId}`);
    setReviews(r => r.filter(x => x._id !== reviewId));
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!product) {
    return (
      <Box textAlign="center" mt={12} sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
        <Typography variant="h5">Product not found 😕</Typography>
        <Button variant="outlined" color="primary" sx={{ mt: 2 }} onClick={() => navigate("/products")}>
          Back to Shop
        </Button>
      </Box>
    );
  }

  const avgRatingVal = Number(
    reviews.length
      ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length
      : 0
  ).toFixed(1);

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", color: "text.primary", overflowX: "hidden" }}>

      {/* HERO BACKGROUND */}
      <Box sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "60vh",
        background: (theme) => `linear-gradient(to bottom, transparent, ${theme.palette.background.default}), url(https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=2832&auto=format&fit=crop)`,
        backgroundSize: "cover",
        opacity: 0.15,
        zIndex: 0,
        pointerEvents: "none"
      }} />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, pt: 12, pb: 8 }}>

        <Grid container spacing={8} alignItems="center">

          {/* IMAGE SECTION */}
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
              <Box sx={{
                position: "relative",
                borderRadius: 4,
                overflow: "hidden",
                bgcolor: "background.paper",
                backdropFilter: "blur(10px)",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 20px 80px -20px rgba(0,0,0,0.8)",
                p: 4,
                display: "flex",
                justifyContent: "center"
              }}>
                <CardMedia
                  component="img"
                  image={product.images?.length ? getImageUrl(product.images[0]) : ""}
                  alt={product.name}
                  sx={{
                    height: "500px",
                    width: "100%",
                    objectFit: "contain",
                    filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.5))",
                    transition: "transform 0.4s",
                    "&:hover": { transform: "scale(1.05)" }
                  }}
                />

                {/* Floating Badge */}
                {product.stock < 5 && product.stock > 0 && (
                  <Chip
                    label="Low Stock"
                    color="error"
                    sx={{ position: "absolute", top: 20, right: 20, fontWeight: 800 }}
                  />
                )}
              </Box>
            </motion.div>
          </Grid>

          {/* DETAILS SECTION */}
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <Stack spacing={3}>

                {/* Breadcrumb-ish / Category */}
                <motion.div variants={fadeIn}>
                  {product.category?.name && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <VerifiedIcon color="primary" sx={{ fontSize: 20 }} />
                      <Typography variant="overline" letterSpacing={2} color="primary" fontWeight={800}>
                        {product.category.name}
                      </Typography>
                    </Stack>
                  )}
                </motion.div>

                {/* Title & Price */}
                <motion.div variants={fadeIn}>
                  <Typography variant="h2" fontWeight={900} sx={{ lineHeight: 1, mb: 2, textTransform: "uppercase" }}>
                    {product.name}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={3} mb={2}>
                    <Typography variant="h3" color="primary.main" fontWeight={800}>
                      ₹{product.price.toLocaleString()}
                    </Typography>

                    <Stack direction="row" alignItems="center" bgcolor="rgba(255,255,255,0.1)" px={2} py={0.5} borderRadius={5}>
                      <Rating value={Number(avgRatingVal)} readOnly precision={0.5} size="small" />
                      <Typography sx={{ ml: 1, fontWeight: 700 }}>{avgRatingVal} | {reviews.length} Reviews</Typography>
                    </Stack>
                  </Stack>
                </motion.div>

                {/* Description */}
                <motion.div variants={fadeIn}>
                  <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: "1.1rem", lineHeight: 1.7 }}>
                    {product.description}
                  </Typography>
                </motion.div>

                {/* Actions */}
                <motion.div variants={fadeIn}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={3}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<ShoppingBagIcon />}
                      onClick={addToCart}
                      disabled={!product.stock || product.stock <= 0}
                      sx={{
                        flex: 1,
                        bgcolor: "white",
                        color: "black",
                        fontWeight: 800,
                        py: 2,
                        borderRadius: 2,
                        fontSize: "1.1rem",
                        "&:hover": { bgcolor: "#ddd" },
                        "&.Mui-disabled": { bgcolor: "rgba(255,255,255,0.1)", color: "#aaa" }
                      }}
                    >
                      {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                    </Button>

                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<FlashOnIcon />}
                      onClick={buyNow}
                      disabled={!product.stock || product.stock <= 0}
                      sx={{
                        flex: 1,
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        fontWeight: 800,
                        py: 2,
                        borderRadius: 2,
                        fontSize: "1.1rem",
                        "&:hover": { bgcolor: "primary.dark" },
                        "&.Mui-disabled": { bgcolor: "action.disabledBackground", color: "action.disabled" }
                      }}
                    >
                      {product.stock > 0 ? "Buy Now" : "Out of Stock"}
                    </Button>

                    <IconButton
                      onClick={handleToggleWishlist}
                      sx={{
                        border: "2px solid rgba(255,255,255,0.2)",
                        borderRadius: 2,
                        px: 2,
                        "&:hover": { borderColor: "text.primary", bgcolor: "action.hover" }
                      }}
                    >
                      {wish ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon color="action" />}
                    </IconButton>
                  </Stack>
                </motion.div>

              </Stack>
            </motion.div>
          </Grid>
        </Grid>

        {/* REVIEWS SECTION */}
        <Box sx={{ mt: 15, position: "relative", zIndex: 1 }}>
          <Typography variant="h4" fontWeight={900} gutterBottom sx={{ borderLeft: "6px solid", borderColor: "primary.main", pl: 2 }}>
            Customer Reviews
          </Typography>

          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 4, bgcolor: "background.paper", borderRadius: 3, textAlign: "center", border: "1px solid", borderColor: "divider" }}>
                <Typography variant="h1" fontWeight={900} color="primary">{avgRatingVal}</Typography>
                <Rating value={Number(avgRatingVal)} readOnly precision={0.5} size="large" sx={{ my: 1 }} />
                <Typography color="text.secondary">Based on {reviews.length} reviews</Typography>
              </Paper>

              {hasBought ? (
                <Paper sx={{ p: 3, bgcolor: "background.paper", borderRadius: 3, mt: 3, border: "1px solid", borderColor: "divider" }}>
                  <Typography fontWeight={700} mb={2}>Write a Review</Typography>
                  <Rating value={rating} onChange={(e, v) => setRating(v)} />
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    sx={{
                      mt: 2,
                      bgcolor: "action.hover",
                      borderRadius: 1,
                      input: { color: "text.primary" }
                    }}
                    variant="filled"
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 2, bgcolor: "primary.main", color: "primary.contrastText", fontWeight: 800 }}
                    onClick={submitReview}
                  >
                    Post Review
                  </Button>
                </Paper>
              ) : (
                <Paper sx={{ p: 3, bgcolor: "action.hover", borderRadius: 3, mt: 3, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">Purchase this product to leave a review.</Typography>
                </Paper>
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={3}>
                {reviews.length === 0 && (
                  <Typography color="gray" fontStyle="italic">No reviews yet. Be the first!</Typography>
                )}

                <AnimatePresence>
                  {reviews.map(r => (
                    <motion.div
                      key={r._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <Paper sx={{ p: 3, bgcolor: "background.paper", borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText", fontWeight: 800 }}>
                              {r.userId?.fname?.[0] || "U"}
                            </Avatar>
                            <Box>
                              <Typography fontWeight={700} color="text.primary">{r.userId?.fname || "Anonymous User"}</Typography>
                              <Typography variant="caption" color="text.secondary">Verified Purchase</Typography>
                            </Box>
                          </Stack>

                          {r.userId?._id === userId && (
                            <IconButton size="small" onClick={() => deleteReview(r._id)}>
                              <DeleteIcon sx={{ color: "#ef5350", fontSize: 20 }} />
                            </IconButton>
                          )}
                        </Stack>

                        <Rating value={r.rating} readOnly size="small" sx={{ mt: 2 }} />
                        <Typography color="text.primary" mt={1} lineHeight={1.6}>
                          {r.comment}
                        </Typography>
                      </Paper>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Stack>
            </Grid>
          </Grid>
        </Box>

      </Container>
    </Box>
  );
}
