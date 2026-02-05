import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Divider,
  Tabs,
  Tab,
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  InputAdornment,
  IconButton
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AssignmentIcon from "@mui/icons-material/Assignment";
import HistoryIcon from "@mui/icons-material/History";
import PersonIcon from "@mui/icons-material/Person";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import MapIcon from "@mui/icons-material/Map";
import { useEffect, useState, useCallback } from "react";
import api, { IMG_BASE_URL } from "../../api/api";
import OrderMap from "../common/OrderMap";
import { motion, AnimatePresence } from "framer-motion";

import allIndianStateDistricts from "../../data/indianStateDistricts";

// Extract states from data
const INDIAN_STATES = Object.keys(allIndianStateDistricts || {});

const MotionCard = motion(Card);
const MotionBox = motion(Box);

export default function DeliveryBoyDashboard() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    active: 0,
    total: 0,
    completed: 0
  });

  const [tabValue, setTabValue] = useState(0);
  const [otpInputs, setOtpInputs] = useState({});
  const [verifying, setVerifying] = useState({});

  // Profile Edit State
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [mapOrder, setMapOrder] = useState(null);
  const [pData, setPData] = useState({}); // Profile Data
  const [showPassword, setShowPassword] = useState(false);

  const openEditProfile = () => {
    setPData({
      fname: user.fname || "",
      lname: user.lname || "",
      email: user.email || "",
      password: user.password || "",
      mobile: user.mobile || "",
      vehicleType: user.vehicleType || "bike",
      vehicleNumber: user.vehicleNumber || "",
      aadharNumber: user.aadharNumber || "",
      state: user.state || "",
      district: user.district || "",
      city: user.city || "",
      localArea: user.localArea || ""
    });
    setEditProfileOpen(true);
  };

  const saveProfile = async () => {
    try {
      const res = await api.put("/auth/profile", pData);
      alert("✅ Profile Updated Successfully!");
      login(res.data.user); // Update local context
      setEditProfileOpen(false);
    } catch (err) {
      alert("❌ Update Failed: " + (err.response?.data?.message || err.message));
    }
  };

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get(`/orders/delivery-boy/${user._id}`);
      const data = res.data;
      setOrders(data);

      const active = data.filter(o => !["delivered", "cancelled"].includes(o.status)).length;
      const completed = data.filter(o => o.status === "delivered").length;

      setStats({
        active,
        total: data.length,
        completed
      });
    } catch (err) {
      console.error("Failed to load orders");
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const verifyOtp = async (orderId) => {
    const otp = otpInputs[orderId];
    if (!otp || otp.length !== 4) return alert("Please enter a valid 4-digit OTP");

    setVerifying(prev => ({ ...prev, [orderId]: true }));
    try {
      await api.post(`/orders/${orderId}/verify-delivery-otp`, { otp });
      alert("✅ Delivery Verified & Completed!");
      fetchOrders(); // Refresh list to move order to completed
    } catch (err) {
      alert(err.response?.data?.message || "Verification Failed");
    } finally {
      setVerifying(prev => ({ ...prev, [orderId]: false }));
    }
  };

  if (!user || user.role !== "delivery_boy") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "background.default",
          color: "text.primary"
        }}
      >
        <Typography variant="h5">Access Denied</Typography>
      </Box>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <Box
      sx={{
        minHeight: "135vh",
        bgcolor: "background.default",
        padding: { xs: 2, md: 4 },
        paddingTop: "120px",
        color: "text.primary"
      }}
      component={motion.div}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Stack spacing={4} sx={{ position: "relative", zIndex: 1, maxWidth: 1200, mx: "auto", paddingTop: "120px" }}>

        {/* Header Section */}
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={2} component={motion.div} variants={itemVariants}>
          <Box>
            <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: -1, textTransform: "uppercase", color: "text.primary" }}>
              Hello, <Box component="span" sx={{ color: "primary.main" }}>{user.fname}</Box> 👋
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.1rem" }}>
              Ready to deliver some gains today?
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleLogout}
            sx={{
              backgroundColor: "error.main",
              color: "white",
              fontWeight: 800,
              px: 4,
              borderRadius: 2,
              boxShadow: "0 4px 15px rgba(198, 40, 40, 0.4)",
              "&:hover": { backgroundColor: "error.dark" }
            }}
          >
            Logout
          </Button>
        </Stack>

        {/* Stats Grid */}
        <Grid container spacing={3} component={motion.div} variants={itemVariants}>
          {[
            { label: "Active Deliveries", val: stats.active, icon: <LocalShippingIcon sx={{ fontSize: 40 }} />, color: "#2196f3" },
            { label: "Completed Orders", val: stats.completed, icon: <HistoryIcon sx={{ fontSize: 40 }} />, color: "#4caf50" },
            { label: "Total Assigned", val: stats.total, icon: <AssignmentIcon sx={{ fontSize: 40 }} />, color: "primary.main" }
          ].map((stat, idx) => (
            <Grid size={{ xs: 12, md: 4 }} key={idx}>
              <MotionCard
                whileHover={{ y: -5, boxShadow: `0 12px 30px ${stat.color}22` }}
                sx={{
                  bgcolor: "background.paper",
                  boxShadow: 3,
                  borderRadius: 4,
                  height: "100%",
                  color: "text.primary",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 4 }}>
                  <Box sx={{ color: stat.color, mb: 1, filter: `drop-shadow(0 0 10px ${stat.color}66)` }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h3" fontWeight={900} color="text.primary">
                    {stat.val}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
                    {stat.label}
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>

        {/* Main Content Area */}
        <Grid container spacing={4}>
          {/* Left Column: Profile */}
          <Grid size={{ xs: 12, md: 4 }}>
            <MotionBox variants={itemVariants}
              sx={{
                bgcolor: "background.paper",
                borderRadius: 4,
                p: 3,
                position: "sticky",
                top: 100,
                boxShadow: 3
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <Box sx={{ p: 0.5, bgcolor: "action.hover", borderRadius: "50%", border: "1px solid", borderColor: "primary.main" }}>
                  {user.profileImage ? (
                    <Box
                      component="img"
                      src={`${IMG_BASE_URL}${user.profileImage}`}
                      alt="Profile"
                      sx={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    <PersonIcon sx={{ fontSize: 40, color: "primary.main", m: 1 }} />
                  )}
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={800} color="text.primary">
                    {user.fname} {user.lname}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Delivery Partner</Typography>
                </Box>
              </Stack>

              <Divider sx={{ borderColor: "divider", my: 2 }} />

              <Stack spacing={2}>
                <Box>
                  <Typography color="text.secondary" fontSize={12} fontWeight={700} gutterBottom>VEHICLE</Typography>
                  <Typography color="text.primary" fontWeight={600}>
                    {user.vehicleType?.toUpperCase()} • {user.vehicleNumber}
                  </Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary" fontSize={12} fontWeight={700} gutterBottom>CONTACT</Typography>
                  <Typography color="text.primary" fontWeight={600}>
                    {user.mobile}
                  </Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary" fontSize={12} fontWeight={700} gutterBottom>LOCATION</Typography>
                  <Typography color="text.primary" fontWeight={600}>
                    {user.city}, {user.state}
                  </Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary" fontSize={12} fontWeight={700} gutterBottom>STATUS</Typography>
                  <Chip label="ONLINE & VERIFIED" size="small" sx={{ bgcolor: "success.main", color: "white", fontWeight: 900 }} />
                </Box>
              </Stack>

              <Button
                fullWidth
                variant="outlined"
                onClick={openEditProfile}
                sx={{
                  mt: 4,
                  borderColor: "primary.main",
                  color: "primary.main",
                  fontWeight: 800,
                  borderWidth: 2,
                  "&:hover": { borderColor: "text.primary", color: "text.primary", borderWidth: 2, bgcolor: "action.hover" }
                }}
              >
                Edit Profile
              </Button>
            </MotionBox>
          </Grid>

          {/* Right Column: Orders */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Box component={motion.div} variants={itemVariants}>
              <Tabs
                value={tabValue}
                onChange={(e, val) => setTabValue(val)}
                centered
                sx={{
                  mb: 3,
                  "& .MuiTab-root": { color: "text.secondary", fontWeight: 700, fontSize: 16, textTransform: "none" },
                  "& .Mui-selected": { color: `primary.main !important` },
                  "& .MuiTabs-indicator": { backgroundColor: "primary.main", height: 3, borderRadius: 3 }
                }}
              >
                <Tab label="Active Tasks" />
                <Tab label="Completed History" />
                <Tab label="All Assignments" />
              </Tabs>

              <Stack spacing={3}>
                <AnimatePresence mode="popLayout">
                  {orders
                    .filter(o => {
                      if (tabValue === 0) return !["delivered", "cancelled"].includes(o.status);
                      if (tabValue === 1) return o.status === "delivered";
                      return true;
                    })
                    .map((order) => (
                      <MotionCard
                        key={order._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        sx={{
                          bgcolor: "background.paper",
                          borderRadius: 3,
                          overflow: "visible",
                          boxShadow: 3
                        }}
                      >
                        <Box sx={{ p: 0.5, background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main} 0%, transparent 100%)`, height: 4, borderTopLeftRadius: 12, borderTopRightRadius: 12 }} />
                        <CardContent sx={{ p: 3 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Box>
                              <Chip
                                label={order.status.replace(/_/g, " ").toUpperCase()}
                                sx={{
                                  bgcolor: order.status === "delivered" ? "success.main" : "primary.main",
                                  color: order.status === "delivered" ? "white" : "primary.contrastText",
                                  fontWeight: 900,
                                  borderRadius: 1,
                                  mb: 1
                                }}
                                size="small"
                              />
                              <Typography variant="h6" fontWeight={800} color="text.primary">
                                Order #{order._id.slice(-6).toUpperCase()}
                              </Typography>
                            </Box>
                            <Box textAlign="right">
                              <Typography variant="h5" fontWeight={900} color="text.primary">
                                ₹{order.amount}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {order.paymentMethod.toUpperCase()}
                              </Typography>
                            </Box>
                          </Stack>

                          {/* Address Section */}
                          <Box sx={{ bgcolor: "action.hover", p: 2, borderRadius: 2, mb: 2, border: "1px dashed", borderColor: "divider" }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography color="text.secondary" fontSize={12} fontWeight={700} gutterBottom>DELIVERY LOCATION</Typography>
                              <IconButton
                                size="small"
                                onClick={() => setMapOrder(order)}
                                sx={{ color: "primary.main", bgcolor: 'action.selected' }}
                                title="View Map"
                              >
                                <MapIcon />
                              </IconButton>
                            </Stack>

                            <Typography color="text.primary" fontWeight={700}>
                              {order.address?.fullName} <span style={{ fontSize: 12, color: "text.secondary", fontWeight: 400 }}>({order.address?.type || "Home"})</span>
                            </Typography>
                            <Typography color="text.secondary" fontSize={14}>
                              {order.address?.buildingName}
                            </Typography>
                            <Typography color="text.secondary" fontSize={14}>
                              {order.address?.city}{order.address?.district && `, ${order.address?.district}`}
                            </Typography>
                            <Typography color="text.secondary" fontSize={14}>
                              {order.address?.state} - {order.address?.pincode}
                            </Typography>
                            {order.address?.postOffice && (
                              <Typography color="text.secondary" fontSize={14}>
                                PO: {order.address.postOffice}
                              </Typography>
                            )}
                            <Typography color="primary.main" fontWeight={700} fontSize={14} mt={0.5}>
                              📞 {order.address?.mobile}
                            </Typography>
                            {order.address?.alternateMobile && (
                              <Typography color="text.secondary" fontSize={13}>
                                Alt: {order.address.alternateMobile}
                              </Typography>
                            )}
                            {order.address?.email && (
                              <Typography color="text.secondary" fontSize={13}>
                                📧 {order.address.email}
                              </Typography>
                            )}
                          </Box>

                          {/* Items & Verification */}
                          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={2}>
                            {/* Items Preview */}
                            <Box sx={{ display: "flex", gap: 1 }}>
                              {order.items?.map((item, i) => (
                                <Box key={i} sx={{ position: "relative" }}>
                                  <Box
                                    component="img"
                                    src={item.image ? `${IMG_BASE_URL}${item.image}` : "https://via.placeholder.com/50"}
                                    sx={{ width: 40, height: 40, borderRadius: 1, objectFit: "cover", border: "1px solid #333" }}
                                  />
                                  <Box sx={{
                                    position: "absolute", bottom: -5, right: -5,
                                    bgcolor: "primary.main", color: "primary.contrastText",
                                    borderRadius: "50%", width: 18, height: 18,
                                    fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: "bold"
                                  }}>
                                    {item.quantity}
                                  </Box>
                                </Box>
                              ))}
                            </Box>

                            {/* OTP Verification */}
                            {tabValue === 0 && (
                              <Box sx={{ display: "flex", gap: 1, minWidth: 200 }}>
                                <TextField
                                  placeholder="OTP"
                                  size="small"
                                  value={otpInputs[order._id] || ""}
                                  onChange={(e) => setOtpInputs({ ...otpInputs, [order._id]: e.target.value })}
                                  sx={{
                                    input: { color: "text.primary", textAlign: "center", fontWeight: "bold", letterSpacing: 3 },
                                    "& .MuiOutlinedInput-root": {
                                      "& fieldset": { borderColor: "divider" },
                                      "&:hover fieldset": { borderColor: "text.primary" },
                                      "&.Mui-focused fieldset": { borderColor: "primary.main" }
                                    }
                                  }}
                                />
                                <Button
                                  variant="contained"
                                  disabled={verifying[order._id] || !otpInputs[order._id]}
                                  onClick={() => verifyOtp(order._id)}
                                  sx={{
                                    bgcolor: "primary.main", color: "primary.contrastText", fontWeight: 900,
                                    "&:disabled": { bgcolor: "action.disabledBackground", color: "text.disabled" },
                                    "&:hover": { bgcolor: "primary.dark" }
                                  }}
                                >
                                  {verifying[order._id] ? <CircularProgress size={20} color="inherit" /> : "Verify"}
                                </Button>
                              </Box>
                            )}
                          </Stack>

                        </CardContent>
                      </MotionCard>
                    ))}
                </AnimatePresence>

                {orders.filter(o => {
                  if (tabValue === 0) return !["delivered", "cancelled"].includes(o.status);
                  if (tabValue === 1) return o.status === "delivered";
                  return true;
                }).length === 0 && (
                    <Box textAlign="center" py={10} color="text.secondary">
                      <LocalShippingIcon sx={{ fontSize: 60, opacity: 0.2, mb: 2 }} />
                      <Typography variant="h6">No orders found in this category.</Typography>
                    </Box>
                  )}
              </Stack>
            </Box>
          </Grid>
        </Grid>

      </Stack>

      {/* EDIT PROFILE DIALOG */}
      <Dialog
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: "background.paper", color: "text.primary", fontWeight: 800, fontSize: 22, borderBottom: "1px solid", borderColor: "divider" }}>
          Edit Profile
        </DialogTitle>
        <DialogContent sx={{ bgcolor: "background.paper", color: "text.primary", pt: 3 }}>
          <Stack spacing={3} mt={1}>
            {/* Personal Info */}
            <Typography color="primary.main" fontWeight={700} fontSize={14}>PERSONAL INFORMATION</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="First Name" fullWidth value={pData.fname} onChange={(e) => setPData({ ...pData, fname: e.target.value })}
                  sx={dialogInputStyle} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Last Name" fullWidth value={pData.lname} onChange={(e) => setPData({ ...pData, lname: e.target.value })}
                  sx={dialogInputStyle} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Email" fullWidth value={pData.email} onChange={(e) => setPData({ ...pData, email: e.target.value })}
                  sx={dialogInputStyle} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Mobile" fullWidth value={pData.mobile} onChange={(e) => setPData({ ...pData, mobile: e.target.value })}
                  sx={dialogInputStyle} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Aadhaar No" fullWidth value={pData.aadharNumber} onChange={(e) => setPData({ ...pData, aadharNumber: e.target.value })}
                  sx={dialogInputStyle} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  value={pData.password}
                  onChange={(e) => setPData({ ...pData, password: e.target.value })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: "#aaa" }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={dialogInputStyle}
                />
              </Grid>
            </Grid>

            <Divider sx={{ borderColor: "divider" }} />

            {/* Vehicle Info */}
            <Typography color="primary.main" fontWeight={700} fontSize={14}>VEHICLE DETAILS</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Vehicle Type"
                  fullWidth
                  value={pData.vehicleType || "bike"}
                  onChange={(e) => setPData({ ...pData, vehicleType: e.target.value })}
                  sx={dialogInputStyle}
                >
                  <MenuItem value="bike">Bike</MenuItem>
                  <MenuItem value="scooter">Scooter</MenuItem>
                  <MenuItem value="car">Car</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Vehicle Number" fullWidth value={pData.vehicleNumber} onChange={(e) => setPData({ ...pData, vehicleNumber: e.target.value })}
                  sx={dialogInputStyle} />
              </Grid>
            </Grid>

            <Divider sx={{ borderColor: "divider" }} />

            {/* Location Info */}
            <Typography color="primary.main" fontWeight={700} fontSize={14}>LOCATION</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="State"
                  fullWidth
                  value={pData.state}
                  onChange={(e) => setPData({ ...pData, state: e.target.value, district: "" })}
                  sx={dialogInputStyle}
                >
                  {INDIAN_STATES.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="District"
                  fullWidth
                  value={pData.district}
                  onChange={(e) => setPData({ ...pData, district: e.target.value })}
                  disabled={!pData.state}
                  sx={dialogInputStyle}
                >
                  {(allIndianStateDistricts[pData.state] || []).map((district) => (
                    <MenuItem key={district} value={district}>
                      {district}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="City" fullWidth value={pData.city} onChange={(e) => setPData({ ...pData, city: e.target.value })}
                  sx={dialogInputStyle} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Local Area" fullWidth value={pData.localArea} onChange={(e) => setPData({ ...pData, localArea: e.target.value })}
                  sx={dialogInputStyle} />
              </Grid>
            </Grid>
          </Stack>

        </DialogContent>
        <DialogActions sx={{ bgcolor: "background.paper", p: 3, pt: 0 }}>
          <Button onClick={() => setEditProfileOpen(false)} sx={{ color: "text.secondary", fontWeight: 700 }}>Cancel</Button>
          <Button
            onClick={saveProfile}
            variant="contained"
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontWeight: 900,
              px: 4,
              py: 1,
              "&:hover": { bgcolor: "primary.dark" }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* MAP DIALOG */}
      <Dialog
        open={!!mapOrder}
        onClose={() => setMapOrder(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: "background.paper", color: "text.primary", borderBottom: "1px solid", borderColor: "divider" }}>
          Delivery Location
        </DialogTitle>
        <DialogContent sx={{ bgcolor: "background.paper", color: "text.primary", px: 0, height: 400 }}>
          {mapOrder && <OrderMap address={mapOrder.address} />}
        </DialogContent>
        <DialogActions sx={{ bgcolor: "background.paper" }}>
          <Button onClick={() => setMapOrder(null)} sx={{ color: "primary.main" }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box >
  );
}

// Dialog Input Style
const dialogInputStyle = {
  "& .MuiInputLabel-root": { color: "text.secondary" },
  "& .MuiOutlinedInput-root": {
    color: "text.primary",
    "& fieldset": { borderColor: "divider" },
    "&:hover fieldset": { borderColor: "text.primary" },
    "&.Mui-focused fieldset": { borderColor: "primary.main" }
  },
  "& .MuiSelect-select": { color: "text.primary" },
  "& .MuiSvgIcon-root": { color: "text.secondary" }
};
