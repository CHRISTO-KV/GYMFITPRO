import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  Stack,
  Divider,
  Card,
  CardMedia,
  RadioGroup,
  FormControlLabel,
  Radio,
  MenuItem,
  Container
} from "@mui/material";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import LockIcon from '@mui/icons-material/Lock';
import api, { IMG_BASE_URL } from "../../api/api";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import stateDistricts from "../../data/indianStateDistricts";
import { motion } from "framer-motion";

const BASE_IMG = IMG_BASE_URL;
import { useTheme } from "@mui/material";

// Replace with your actual Publishable Key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const CheckoutForm = () => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { cart, loadCart } = useCart();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [address, setAddress] = useState({
    fullName: "",
    buildingName: "",
    mobile: "",
    email: "",
    alternateMobile: "",
    pincode: "",
    postOffice: "",
    city: "",
    district: "",
    state: "",
    type: "home"
  });

  const INDIAN_STATES = Object.keys(stateDistricts);

  /* Pincode Lookup Handler */
  const fetchPincodeDetails = async (pin) => {
    if (pin.length !== 6) return;
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();

      if (data && data[0].Status === "Success") {
        const details = data[0].PostOffice[0];
        setAddress((prev) => ({
          ...prev,
          state: details.Circle, // Circle often maps to State in India Post API
          district: details.District,
          city: details.Block !== "NA" ? details.Block : details.Division,
          postOffice: details.Name
        }));
      }
    } catch (err) {
      console.error("Failed to fetch pincode details:", err);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    if (name === "pincode") {
      setAddress((prev) => ({ ...prev, [name]: value }));
      if (value.length === 6) {
        fetchPincodeDetails(value);
      }
      return;
    }

    // If state changes, reset district
    if (name === "state") {
      setAddress((prev) => ({
        ...prev,
        [name]: value,
        district: ""
      }));
    } else {
      setAddress((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [nameOnCard, setNameOnCard] = useState("");
  const [upiId, setUpiId] = useState("");

  const validItems = cart.items.filter(i => i.productId);

  const amount = validItems.reduce(
    (s, i) => s + i.productId.price * i.quantity,
    0
  );

  const placeOrder = async () => {
    // 1. Validate Address

    if (!address.fullName.trim() || !address.buildingName.trim() || !address.mobile.trim() || !address.pincode.trim() || !address.email.trim() || !address.postOffice.trim() || !address.city.trim() || !address.district.trim() || !address.state.trim()) {
      alert("Please fill in all required fields (Name, Email, Address, Mobile, Pin Code, Post Office, City, District, State).");
      return;
    }

    if (address.mobile.length !== 10 || !/^\d+$/.test(address.mobile)) {
      alert("Mobile number must be 10 digits.");
      return;
    }

    if (address.pincode.length !== 6 || !/^\d+$/.test(address.pincode)) {
      alert("Pin code must be 6 digits.");
      return;
    }

    if (address.alternateMobile && (address.alternateMobile.length !== 10 || !/^\d+$/.test(address.alternateMobile))) {
      alert("Alternate mobile number must be 10 digits if provided.");
      return;
    }

    let paymentData = {};

    if (paymentMethod === "upi" && !upiId.trim()) {
      alert("Please enter your UPI ID.");
      return;
    } else if (paymentMethod === "upi") {
      paymentData = { upiId };
    }

    // 2. Validate / Process Payment
    if (paymentMethod === "card") {
      if (!nameOnCard.trim()) {
        alert("Please enter the name on the card.");
        return;
      }

      if (!stripe || !elements) {
        // Stripe.js has not loaded yet.
        return;
      }

      try {
        // 1. Create PaymentIntent on the backend
        const { data: { clientSecret } } = await api.post("/payment/create-payment-intent", {
          amount: amount,
          currency: "inr" // Assuming INR, can be dynamic
        });

        const cardElement = elements.getElement(CardElement);

        // 2. Confirm Card Payment
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: nameOnCard,
              phone: address.mobile,
              email: address.email,
              address: {
                line1: address.buildingName,
                postal_code: address.pincode,
                city: address.city,
                state: address.state,
                country: 'IN', // Assuming India
              },
            },
          },
        });

        if (result.error) {
          // Show error to your customer (e.g., insufficient funds)
          console.error('[Stripe Error]', result.error);
          alert(result.error.message);
          return;
        } else {
          // The payment has been processed!
          if (result.paymentIntent.status === 'succeeded') {
            console.log('[PaymentIntent]', result.paymentIntent);
            paymentData = {
              id: result.paymentIntent.id,
              status: result.paymentIntent.status,
              brand: result.paymentIntent.payment_method_types[0], // simplified
            };
            // Proceed to place order below
          }
        }
      } catch (err) {
        console.error("Payment initiation failed:", err);
        alert("Failed to initiate payment. Please try again.");
        return;
      }
    };

    // 3. Send Order to Backend
    try {
      await api.post("/orders", {
        userId: sessionStorage.getItem("userId"),
        address,
        amount,
        paymentMethod,
        paymentData // Send stripe details if available
      });
      loadCart();
      navigate("/order-success");
    } catch (error) {
      console.error("Order failed:", error);
      const msg = error.response?.data?.error || error.response?.data?.message || "Failed to place order";
      alert(`Order Failed: ${msg}`);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: isDarkMode ? "#fff" : "#000",
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: isDarkMode ? "#aaa" : "#666",
        },
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    },
    hidePostalCode: true, // We collect pincode in address section
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", color: "text.primary", overflowX: "hidden" }}>

      {/* HERO BACKGROUND */}
      <Box sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "40vh",
        background: `linear-gradient(to bottom, transparent, ${theme.palette.background.default}), url(https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.1,
        zIndex: 0,
        pointerEvents: "none"
      }} />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, pt: 12, pb: 8 }}>

        <Box sx={{ mb: 6, textAlign: "center" }}>
          <Typography variant="h3" fontWeight={900} textTransform="uppercase">
            Secure <Box component="span" sx={{ color: "primary.main" }}>Checkout</Box>
          </Typography>
          <Typography color="text.secondary" mt={1}>Complete your order and start your journey</Typography>
        </Box>

        <Grid container spacing={4} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">

          {/* ================= LEFT COLUMN ================= */}
          <Grid item xs={12} md={7}>
            <Stack spacing={4}>

              {/* ORDER ITEMS REVIEW */}
              <Box component={motion.div} variants={itemVariants}>
                <SectionTitle icon={<ShoppingBagIcon color="primary" />} title="Order Items" />
                <Paper sx={{ p: 3, bgcolor: "background.paper", borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                  <Stack spacing={2}>
                    {validItems.map((i) => {
                      const imgFile = i.productId.images?.[0] || i.productId.image || null;
                      const imgUrl = imgFile ? BASE_IMG + imgFile.replace(/^\/?uploads\//, "") : "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTAiIGhlaWdodD0iOTAiIHZpZXdCb3g9IjAgMCA5MCA5MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjkwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjQ1IiB5PSI0NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiIgZm9udC1zaXplPSIxMiI+Tm8gSW1nPC90ZXh0Pgo8L3N2Zz4=";
                      return (
                        <Card key={i.productId._id} sx={{ display: "flex", bgcolor: "action.hover", borderRadius: 2 }}>
                          <CardMedia component="img" sx={{ width: 80, height: 80, objectFit: "cover" }} image={imgUrl} />
                          <Box sx={{ p: 2, flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box>
                              <Typography fontWeight={700} fontSize={15}>{i.productId.name}</Typography>
                              <Typography color="text.secondary" fontSize={13}>Qty: {i.quantity}</Typography>
                            </Box>
                            <Typography color="primary.main" fontWeight={700}>₹{i.productId.price * i.quantity}</Typography>
                          </Box>
                        </Card>
                      );
                    })}
                  </Stack>
                </Paper>
              </Box>

              {/* SHIPPING ADDRESS */}
              <Box component={motion.div} variants={itemVariants}>
                <SectionTitle icon={<LocalShippingIcon color="primary" />} title="Shipping Address" />
                <Paper sx={{ p: 4, bgcolor: "background.paper", borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Full Name" fullWidth value={address.fullName} onChange={handleAddressChange} name="fullName" sx={inputStyle(isDarkMode)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Email Address" fullWidth value={address.email} onChange={handleAddressChange} name="email" sx={inputStyle(isDarkMode)} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField label="Building Name / Apartment / Street" fullWidth multiline rows={2} value={address.buildingName} onChange={handleAddressChange} name="buildingName" sx={inputStyle(isDarkMode)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Mobile Number" fullWidth value={address.mobile} onChange={handleAddressChange} name="mobile" sx={inputStyle(isDarkMode)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Alt Mobile (Optional)" fullWidth value={address.alternateMobile} onChange={handleAddressChange} name="alternateMobile" sx={inputStyle(isDarkMode)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Pin Code" fullWidth value={address.pincode} onChange={handleAddressChange} name="pincode" sx={inputStyle(isDarkMode)} helperText={address.pincode.length === 6 ? "Checking..." : ""} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="State" fullWidth value={address.state} onChange={handleAddressChange} name="state" select sx={{ ...inputStyle(isDarkMode), "& .MuiSvgIcon-root": { color: "text.secondary" } }}>
                        {INDIAN_STATES.length > 0 ? INDIAN_STATES.map((state) => (
                          <MenuItem key={state} value={state}>{state}</MenuItem>
                        )) : <MenuItem value="">No States</MenuItem>}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="District" fullWidth value={address.district} onChange={handleAddressChange} name="district" select disabled={!address.state} sx={{ ...inputStyle(isDarkMode), "& .MuiSvgIcon-root": { color: "text.secondary" } }}>
                        {address.state ? stateDistricts[address.state]?.map((d) => (
                          <MenuItem key={d} value={d}>{d}</MenuItem>
                        )) : <MenuItem value="">Select State</MenuItem>}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="City" fullWidth value={address.city} onChange={handleAddressChange} name="city" sx={inputStyle(isDarkMode)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Post Office" fullWidth value={address.postOffice} onChange={handleAddressChange} name="postOffice" sx={inputStyle(isDarkMode)} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography color="text.secondary" mb={1} fontSize={14}>Address Type</Typography>
                      <RadioGroup value={address.type} onChange={(e) => setAddress({ ...address, type: e.target.value })} row>
                        <FormControlLabel value="home" control={<Radio color="primary" />} label="Home" />
                        <FormControlLabel value="work" control={<Radio color="primary" />} label="Work" />
                      </RadioGroup>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>

              {/* PAYMENT METHOD */}
              <Box component={motion.div} variants={itemVariants}>
                <SectionTitle icon={<PaymentIcon color="primary" />} title="Payment Method" />
                <Paper sx={{ p: 4, bgcolor: "background.paper", borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                  <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} sx={{ mb: 3 }}>
                    <FormControlLabel value="card" control={<Radio color="primary" />} label="Credit/Debit Card" />
                    <FormControlLabel value="upi" control={<Radio color="primary" />} label="UPI" />
                    <FormControlLabel value="cod" control={<Radio color="primary" />} label="Cash on Delivery" />
                  </RadioGroup>

                  {paymentMethod === "upi" && (
                    <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
                      <TextField label="UPI ID" placeholder="example@oksbi" fullWidth value={upiId} onChange={(e) => setUpiId(e.target.value)} sx={inputStyle(isDarkMode)} />
                    </Box>
                  )}

                  {paymentMethod === "card" && (
                    <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
                      <TextField label="Name on Card" fullWidth value={nameOnCard} onChange={(e) => setNameOnCard(e.target.value)} sx={{ ...inputStyle(isDarkMode), mb: 2 }} />
                      <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 2, bgcolor: isDarkMode ? "#000" : "#fff" }}>
                        <CardElement options={cardElementOptions} />
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Box>

            </Stack>
          </Grid>

          {/* ================= RIGHT COLUMN (SUMMARY) ================= */}
          <Grid item xs={12} md={5}>
            <Box component={motion.div} variants={itemVariants} sx={{ position: "sticky", top: 100 }}>
              <Paper sx={{
                p: 4,
                bgcolor: "background.paper",
                color: "text.primary",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)"
              }}>
                <Typography fontWeight={900} fontSize={20} mb={3} textTransform="uppercase" letterSpacing={1}>Order Summary</Typography>
                <Stack spacing={2} mb={3}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Items ({validItems.length})</Typography>
                    <Typography fontWeight={700}>₹{amount}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Shipping</Typography>
                    <Typography color="primary.main" fontWeight={700}>Free</Typography>
                  </Stack>
                  <Divider sx={{ borderColor: "divider" }} />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography fontWeight={800} fontSize={18}>Total to Pay</Typography>
                    <Typography fontWeight={900} fontSize={24} color="primary.main">₹{amount}</Typography>
                  </Stack>
                </Stack>

                <Button
                  fullWidth
                  size="large"
                  startIcon={<LockIcon />}
                  sx={{
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    fontWeight: 900,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: "1.05rem",
                    "&:hover": { bgcolor: "background.paper", color: "text.primary" },
                    "&:disabled": { bgcolor: "action.disabledBackground", color: "action.disabled" }
                  }}
                  onClick={placeOrder}
                  disabled={paymentMethod === 'card' && (!stripe || !elements)}
                >
                  {paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'}
                </Button>

                <Typography fontSize={12} color="text.secondary" textAlign="center" mt={3} display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                  <LockIcon fontSize="inherit" /> 100% Secure SSL Encrypted
                </Typography>
              </Paper>
            </Box>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
};

// Helper Component for Section Headers
const SectionTitle = ({ icon, title }) => (
  <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
    {icon}
    <Typography variant="h6" fontWeight={800} color="text.primary">{title}</Typography>
  </Stack>
);

/* ================= STYLES ================= */
const inputStyle = (isDarkMode) => ({
  "& .MuiInputBase-root": {
    color: "text.primary",
    bgcolor: "background.paper"
  },
  "& .MuiInputLabel-root": {
    color: "text.secondary"
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "divider" },
    "&:hover fieldset": { borderColor: "text.primary" },
    "&.Mui-focused fieldset": { borderColor: "primary.main" }
  }
});

export default function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
