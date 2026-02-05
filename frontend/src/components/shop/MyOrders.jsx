import {
  Box,
  Typography,
  Stack,
  Paper,
  Card,
  CardMedia,
  CardContent,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Container,
  Tooltip
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api, { IMG_BASE_URL } from "../../api/api";
import OrderMap from "../common/OrderMap";
import MapIcon from "@mui/icons-material/Map";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { motion, AnimatePresence } from "framer-motion";



// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function MyOrdersUser() {
  const userId = sessionStorage.getItem("userId");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [editDialog, setEditDialog] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editAddress, setEditAddress] = useState({
    fullName: "",
    buildingName: "",
    mobile: "",
    alternateMobile: "",
    pincode: "",
    type: "home"
  });

  const loadOrders = useCallback(async () => {
    try {
      const res = await api.get(`/orders/user/${userId}`);
      const orderData = res.data.order || res.data.orders || res.data;
      setOrders(orderData || []);
    } catch (err) {
      console.error("❌ Order fetch failed:", err);
      alert("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return navigate("/");
    loadOrders();
  }, [userId, navigate, loadOrders]);

  const cancelOrder = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;
    try {
      await api.put(`/orders/cancel/${id}`);
      setOrders(o => o.map(x => (x._id === id ? { ...x, status: "cancelled" } : x)));
    } catch (err) {
      console.error("❌ Cancel failed:", err);
      alert("Failed to cancel order");
    }
  };

  const openEditAddress = (order) => {
    setEditingOrder(order);
    setEditAddress({ ...order.address });
    setEditDialog(true);
  };

  const saveAddress = async () => {
    if (!editAddress.fullName.trim() || !editAddress.buildingName.trim() || !editAddress.mobile.trim() || !editAddress.pincode.trim()) {
      alert("Please fill in full name, building name, mobile number, and pin code.");
      return;
    }
    if (editAddress.mobile.length !== 10 || !/^\d+$/.test(editAddress.mobile)) {
      alert("Mobile number must be 10 digits.");
      return;
    }
    if (editAddress.pincode.length !== 6 || !/^\d+$/.test(editAddress.pincode)) {
      alert("Pin code must be 6 digits.");
      return;
    }
    try {
      await api.put(`/orders/${editingOrder._id}/address`, { address: editAddress });
      setOrders(o => o.map(x => (x._id === editingOrder._id ? { ...x, address: editAddress } : x)));
      setEditDialog(false);
    } catch (err) {
      console.error("❌ Update failed:", err);
      alert("Failed to update address");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'cancelled': return <CancelIcon fontSize="small" />;
      case 'delivered': return <CheckCircleIcon fontSize="small" />;
      case 'shipped': return <LocalShippingIcon fontSize="small" />;
      default: return <AccessTimeIcon fontSize="small" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'cancelled': return "#ef5350";
      case 'delivered': return "#66bb6a";
      case 'shipped': return "primary.main";
      default: return "#ffa726";
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
        height: "50vh",
        background: (theme) => `linear-gradient(to bottom, transparent, ${theme.palette.background.default}), url(https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop)`,
        backgroundSize: "cover",
        backgroundPosition: "top center",
        opacity: 0.15,
        zIndex: 0,
        pointerEvents: "none"
      }} />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, pt: 12, pb: 8 }}>

        <Typography variant="h3" fontWeight={900} textAlign="center" mb={1} textTransform="uppercase">
          My <Box component="span" sx={{ color: "primary.main" }}>Orders</Box>
        </Typography>
        <Typography textAlign="center" color="text.secondary" mb={6}>
          Track your gear and review your history
        </Typography>

        {orders.length === 0 ? (
          <Box textAlign="center" py={10} bgcolor="action.hover" borderRadius={4}>
            <Typography variant="h5" color="text.secondary" fontWeight={700}>No orders found 🤷‍♂️</Typography>
            <Button
              variant="outlined"
              color="primary"
              sx={{ mt: 3 }}
              onClick={() => navigate('/products')}
            >
              Start Shopping
            </Button>
          </Box>
        ) : (
          <Stack spacing={4} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
            {orders.map(order => (
              <Paper
                key={order._id}
                component={motion.div}
                variants={itemVariants}
                sx={{
                  p: 3,
                  bgcolor: "background.paper", // Semi-transparent glass
                  backdropFilter: "blur(10px)",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: (theme) => `0 10px 30px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'}`
                  }
                }}
              >
                {/* Order Header */}
                <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} mb={3} gap={2}>
                  <Box>
                    <Typography color="text.primary" fontWeight={800} fontSize={20} display="flex" alignItems="center" gap={1}>
                      Order #{order._id.slice(-6)}
                      <Chip
                        icon={getStatusIcon(order.status)}
                        label={order.status.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: `${getStatusColor(order.status)}22`,
                          color: getStatusColor(order.status),
                          fontWeight: 800,
                          fontSize: 11,
                          border: `1px solid`,
                          borderColor: getStatusColor(order.status),
                          borderRadius: 1
                        }}
                      />
                    </Typography>
                    <Typography color="text.secondary" fontSize={13} mt={0.5}>
                      Placed on {new Date().toLocaleDateString()} • Total: <Box component="span" color="text.primary" fontWeight={700}>₹{order.amount}</Box>
                    </Typography>
                  </Box>

                  {/* OTP for Shipped/Out for Delivery */}
                  {["shipped", "out_for_delivery"].includes(order.status) && (
                    <Box sx={{
                      px: 2, py: 1,
                      bgcolor: "action.hover",
                      border: "1px dashed",
                      borderColor: "primary.main",
                      borderRadius: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center"
                    }}>
                      <Typography color="text.secondary" fontSize={11} textTransform="uppercase" letterSpacing={1}>Delivery OTP</Typography>
                      <Typography color="primary.main" fontWeight={900} fontSize={20} letterSpacing={2}>
                        {order.deliveryOtp || "---"}
                      </Typography>
                    </Box>
                  )}
                </Stack>

                <Divider sx={{ borderColor: "divider", mb: 3 }} />

                {/* Items Grid */}
                <Grid container spacing={2}>
                  {(order.items || []).map((item, idx) => {
                    const pid = item.productId?._id || item.productId;
                    const cleanImage = item.image?.replace(/^\/?uploads\//, "") || null;
                    const imgUrl = cleanImage ? `${IMG_BASE_URL}${cleanImage}` : "https://via.placeholder.com/150";

                    return (
                      <Grid item xs={12} sm={6} md={4} key={idx}>
                        <Box sx={{ display: "flex", bgcolor: "background.default", borderRadius: 2, overflow: "hidden", p: 1 }}>
                          <Box
                            component="img"
                            src={imgUrl}
                            alt={item.name}
                            sx={{ width: 70, height: 70, objectFit: "cover", borderRadius: 1.5, cursor: "pointer" }}
                            onClick={() => pid && navigate(`/products/${pid}`)}
                          />
                          <Box sx={{ ml: 2, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <Typography color="text.primary" fontWeight={700} fontSize={14} noWrap sx={{ maxWidth: 150 }}>
                              {item.name}
                            </Typography>
                            <Typography color="text.secondary" fontSize={12}>
                              Qty: {item.quantity} × ₹{item.price}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )
                  })}
                </Grid>

                <Divider sx={{ borderColor: "divider", my: 3 }} />

                {/* Footer: Address & Actions */}
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="flex-start" gap={3}>

                  {/* Address Section */}
                  <Box>
                    <Typography color="text.secondary" fontSize={12} textTransform="uppercase" fontWeight={700} mb={1}>Shipping To</Typography>
                    <Typography color="text.primary" fontSize={14} fontWeight={600}>
                      {order.address?.fullName}
                      <Box component="span" sx={{ color: "text.secondary", fontSize: 13, ml: 1 }}>({order.address?.type})</Box>
                    </Typography>
                    <Typography color="text.secondary" fontSize={13} sx={{ mt: 0.5, lineHeight: 1.4 }}>
                      {order.address?.buildingName}, {order.address?.city}<br />
                      {order.address?.state} - {order.address?.pincode}
                    </Typography>
                    <Typography color="text.secondary" fontSize={13} mt={0.5}>
                      📱 {order.address?.mobile}
                    </Typography>

                    <Stack direction="row" gap={1} mt={1.5}>
                      {["placed", "shipped"].includes(order.status) && (
                        <Tooltip title="Edit Address">
                          <IconButton size="small" onClick={() => openEditAddress(order)} sx={{ bgcolor: "action.hover", color: "text.primary", "&:hover": { bgcolor: "primary.main", color: "primary.contrastText" } }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="View on Map">
                        <IconButton size="small" onClick={() => { setEditingOrder(order); setEditDialog(false); }} sx={{ bgcolor: "action.hover", color: "text.primary", "&:hover": { bgcolor: "primary.main", color: "primary.contrastText" } }}>
                          <MapIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>

                  {/* Actions */}
                  <Box>
                    {order.status === "placed" && (
                      <Button
                        variant="outlined"
                        onClick={() => cancelOrder(order._id)}
                        startIcon={<CancelIcon />}
                        sx={{
                          color: "#ef5350",
                          borderColor: "rgba(239, 83, 80, 0.5)",
                          fontWeight: 700,
                          "&:hover": { borderColor: "#ef5350", bgcolor: "rgba(239, 83, 80, 0.1)" }
                        }}
                      >
                        Cancel Order
                      </Button>
                    )}
                    {order.status === "cancelled" && (
                      <Typography color="#ef5350" fontSize={14} fontWeight={700} display="flex" alignItems="center" gap={0.5}>
                        <CancelIcon fontSize="small" /> Order Cancelled
                      </Typography>
                    )}
                  </Box>

                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Container>


      {/* --- Dialogs --- */}

      {/* Edit Address Dialog */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: "background.paper", backgroundImage: "none", border: "1px solid", borderColor: "divider" } }}
      >
        <DialogTitle sx={{ color: "text.primary", fontWeight: 800 }}>Edit Delivery Address</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Full Name"
              fullWidth
              value={editAddress.fullName}
              onChange={(e) => setEditAddress({ ...editAddress, fullName: e.target.value })}
              sx={inputStyle}
            />
            <TextField
              label="Building / Street"
              fullWidth
              multiline
              rows={2}
              value={editAddress.buildingName}
              onChange={(e) => setEditAddress({ ...editAddress, buildingName: e.target.value })}
              sx={inputStyle}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Mobile"
                fullWidth
                value={editAddress.mobile}
                onChange={(e) => setEditAddress({ ...editAddress, mobile: e.target.value })}
                sx={inputStyle}
              />
              <TextField
                label="Pin Code"
                fullWidth
                value={editAddress.pincode}
                onChange={(e) => setEditAddress({ ...editAddress, pincode: e.target.value })}
                sx={inputStyle}
              />
            </Stack>
            <Box>
              <Typography color="text.secondary" fontSize={12} mb={1}>Address Type</Typography>
              <RadioGroup row value={editAddress.type} onChange={(e) => setEditAddress({ ...editAddress, type: e.target.value })}>
                <FormControlLabel value="home" control={<Radio color="primary" />} label={<Typography color="text.primary" fontSize={14}>Home</Typography>} />
                <FormControlLabel value="work" control={<Radio color="primary" />} label={<Typography color="text.primary" fontSize={14}>Work</Typography>} />
              </RadioGroup>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setEditDialog(false)} sx={{ color: "text.secondary" }}>Cancel</Button>
          <Button variant="contained" onClick={saveAddress} sx={{ bgcolor: "primary.main", color: "primary.contrastText", fontWeight: 700, "&:hover": { bgcolor: "primary.light" } }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Map Dialog */}
      <Dialog
        open={!!editingOrder && !editDialog}
        onClose={() => setEditingOrder(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { bgcolor: "background.paper" } }}
      >
        <DialogTitle sx={{ color: "text.primary", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Track Location</span>
          <IconButton onClick={() => setEditingOrder(null)} sx={{ color: "text.secondary" }}><CancelIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: 400 }}>
          {editingOrder && <OrderMap address={editingOrder.address} />}
        </DialogContent>
      </Dialog>

    </Box>
  );
}

// Reusable Styles
const inputStyle = {
  "& .MuiInputBase-root": { color: "text.primary", bgcolor: "background.paper" },
  "& .MuiInputLabel-root": { color: "text.secondary" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "divider" },
    "&:hover fieldset": { borderColor: "text.primary" },
    "&.Mui-focused fieldset": { borderColor: "primary.main" }
  }
};
