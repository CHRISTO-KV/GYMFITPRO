import {
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Divider,
  Grid,
  Paper,
  Container
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useCart } from "../../context/CartContext";
import api, { IMG_BASE_URL } from "../../api/api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const BASE_IMG = IMG_BASE_URL;

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.3 } }
};

export default function Cart() {
  const { cart, loadCart } = useCart();
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");

  const updateQty = async (pid, qty) => {
    if (qty < 1 || !pid) return;
    try {
      await api.put("/cart/update", {
        userId,
        productId: pid,
        quantity: qty
      });
      loadCart();
    } catch (err) {
      console.error("❌ Qty update failed:", err);
      alert("Failed to update quantity");
    }
  };

  // REMOVE ITEM
  const removeItem = async (pid) => {
    if (!pid) return;
    try {
      await api.delete(`/cart/item/${pid}`, { data: { userId } });
      loadCart();
    } catch (err) {
      console.error("❌ Remove failed:", err);
      alert("Failed to remove item from cart");
    }
  };

  // ✅ NULL-SAFE TOTAL CALCULATION
  const total = cart.items.reduce((sum, item) => {
    if (!item.productId) return sum;
    return (
      sum +
      (item.productId.price ?? 0) * (item.quantity ?? 1)
    );
  }, 0);

  // ✅ Empty cart AFTER filtering invalid products
  const validItems = cart.items.filter(i => i.productId);

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", color: "text.primary", overflowX: "hidden" }}>

      {/* HERO BACKGROUND */}
      <Box sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "50vh",
        background: (theme) => `linear-gradient(to bottom, transparent, ${theme.palette.background.default}), url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.15,
        zIndex: 0,
        pointerEvents: "none"
      }} />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, pt: 12, pb: 8 }}>

        <TitleHeader count={validItems.length} />

        {validItems.length === 0 ? (
          <EmptyState />
        ) : (
          <Grid container spacing={4} sx={{ mt: 2 }}>

            {/* CART ITEMS LIST */}
            <Grid item xs={12} md={8}>
              <AnimatePresence mode="popLayout">
                <Stack spacing={2} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
                  {validItems.map(item => (
                    <CartItem
                      key={item.productId._id}
                      item={item}
                      updateQty={updateQty}
                      removeItem={removeItem}
                    />
                  ))}
                </Stack>
              </AnimatePresence>
            </Grid>

            {/* ORDER SUMMARY */}
            <Grid item xs={12} md={4}>
              <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Paper
                  sx={{
                    p: 4,
                    bgcolor: "background.paper",
                    color: "text.primary",
                    borderRadius: 3,
                    position: "sticky",
                    top: 100,
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)"
                  }}
                >
                  <Typography fontWeight={900} fontSize={22} mb={3} textTransform="uppercase" letterSpacing={1}>
                    Order Summary
                  </Typography>

                  <Stack spacing={2} mb={3}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">Items ({validItems.length})</Typography>
                      <Typography fontWeight={700}>—</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">Shipping</Typography>
                      <Typography color="primary.main" fontWeight={700}>Free</Typography>
                    </Stack>
                    <Divider sx={{ borderColor: "divider" }} />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography fontWeight={800} fontSize={18}>Total Amount</Typography>
                      <Typography fontWeight={900} fontSize={24} color="primary.main">
                        ₹{total.toLocaleString()}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Button
                    fullWidth
                    size="large"
                    startIcon={<ShoppingCartCheckoutIcon />}
                    sx={{
                      background: "primary.main", // Will use theme warning if invalid but main is hex
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      fontWeight: 900,
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: "1.05rem",
                      "&:hover": { bgcolor: "background.paper", color: "text.primary", transform: "scale(1.02)" },
                      transition: "all 0.2s"
                    }}
                    onClick={() => navigate("/checkout")}
                  >
                    Proceed to Checkout
                  </Button>

                  <Stack direction="row" alignItems="center" justifyContent="center" gap={1} mt={2}>
                    <Typography variant="caption" color="text.secondary">Secure Checkout by</Typography>
                    <Typography variant="caption" color="text.primary" fontWeight={700}>GymFit Pro</Typography>
                  </Stack>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
}

// ---------------- SUBCOMPONENTS ---------------- //

function TitleHeader({ count }) {
  return (
    <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
      <Typography variant="h3" fontWeight={900} color="text.primary" sx={{ textTransform: "uppercase" }}>
        My <Box component="span" sx={{ color: "primary.main" }}>Cart</Box>
      </Typography>
      <Box sx={{
        bgcolor: "action.selected",
        color: "text.primary",
        px: 1.5,
        py: 0.5,
        borderRadius: 4,
        fontWeight: 700,
        fontSize: "0.9rem"
      }}>
        {count} Items
      </Box>
    </Box>
  );
}

function EmptyState() {
  const navigate = useNavigate();
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      sx={{
        textAlign: "center",
        py: 12,
        bgcolor: "action.hover",
        borderRadius: 4,
        border: "1px dashed",
        borderColor: "divider"
      }}
    >
      <ShoppingBagIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
      <Typography variant="h5" color="text.primary" fontWeight={800} gutterBottom>
        Your cart is feeling light 🛒
      </Typography>
      <Typography color="text.secondary" mb={4}>
        Explore our premium gear and supplements to fuel your journey.
      </Typography>
      <Button
        variant="outlined"
        onClick={() => navigate("/products")}
        sx={{
          color: "primary.main",
          borderColor: "primary.main",
          fontWeight: 800,
          px: 4,
          "&:hover": { bgcolor: "primary.main", color: "primary.contrastText", borderColor: "primary.main" }
        }}
      >
        Start Shopping
      </Button>
    </Box>
  );
}

function CartItem({ item, updateQty, removeItem }) {
  const imgFile = item.productId.images?.[0] || item.productId.image || null;
  const imgUrl = imgFile ? BASE_IMG + imgFile.replace(/^\/?uploads\//, "") : "";

  return (
    <motion.div variants={itemVariants} layout>
      <Card
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
          display: "flex",
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          flexDirection: { xs: "column", sm: "row" },
          position: "relative"
        }}
      >
        {/* IMAGE */}
        <Box sx={{ position: "relative", width: { xs: "100%", sm: 180 }, height: { xs: 200, sm: "auto" } }}>
          {imgUrl ? (
            <CardMedia
              component="img"
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              image={imgUrl}
              alt={item.productId.name}
            />
          ) : (
            <Box sx={{ width: "100%", height: "100%", bgcolor: "grey.900", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShoppingBagIcon sx={{ color: "grey.700" }} />
            </Box>
          )}
        </Box>

        {/* CONTENT */}
        <CardContent sx={{ flex: 1, p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography fontWeight={800} fontSize={20} gutterBottom>
                {item.productId.name}
              </Typography>
              <Typography variant="body2" color="#888">
                Unit Price: ₹{item.productId.price}
              </Typography>
            </Box>
            <IconButton onClick={() => removeItem(item.productId._id)} sx={{ color: "#ef5350", bgcolor: "rgba(239, 83, 80, 0.1)", "&:hover": { bgcolor: "#ef5350", color: "white" } }}>
              <DeleteIcon />
            </IconButton>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "flex-end" }}
            mt={3}
          >
            {/* QUANTITY CONTROLS */}
            <Stack direction="row" alignItems="center" bgcolor="action.hover" borderRadius={2} border="1px solid" borderColor="divider">
              <IconButton onClick={() => updateQty(item.productId._id, item.quantity - 1)} color="primary" disabled={item.quantity <= 1}>
                <RemoveIcon fontSize="small" />
              </IconButton>
              <Typography fontWeight={800} px={2} minWidth={30} textAlign="center">
                {item.quantity}
              </Typography>
              <IconButton onClick={() => updateQty(item.productId._id, item.quantity + 1)} color="primary">
                <AddIcon fontSize="small" />
              </IconButton>
            </Stack>

            {/* SUBTOTAL */}
            <Typography variant="h5" fontWeight={900} color="primary.main" sx={{ mt: { xs: 2, sm: 0 } }}>
              ₹{(item.productId.price ?? 0) * (item.quantity ?? 1)}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
}
