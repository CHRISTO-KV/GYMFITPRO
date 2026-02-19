import {
  Box,
  Typography,
  Paper,
  Stack,
  Select,
  MenuItem,
  Chip,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
  CircularProgress,
  IconButton
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import api, { getImageUrl } from "../../api/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";



const PAYMENT_LABELS = {
  card: "Credit/Debit Card",
  cod: "Cash on Delivery",
  upi: "UPI",
  test_card: "Test Card (Dummy)",
  test_upi: "Test UPI (Dummy)"
};

export default function MyOrdersUser() {
  const [orders, setOrders] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const [res, dbRes] = await Promise.all([
        api.get("/orders/admin"),
        api.get("/auth/delivery-boys")
      ]);
      console.log("📦 Admin Orders:", res.data);
      console.log("🚚 Delivery Boys:", dbRes.data);
      setOrders(res.data || []);
      setDeliveryBoys(dbRes.data || []);
    } catch (err) {
      console.error("❌ Failed:", err);
      alert("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await api.put(`/orders/${id}/status`, { status });
      setOrders(o => o.map(x => (x._id === id ? { ...x, status: res.data.order.status } : x)));
    } catch {
      alert("Status update failed");
    }
  };

  const assignDeliveryBoy = async (orderId, deliveryBoyId) => {
    try {
      const res = await api.put(`/orders/${orderId}/assign`, { deliveryBoyId });
      setOrders(o => o.map(x => (x._id === orderId ? { ...x, deliveryBoy: res.data.order.deliveryBoy } : x)));
      alert("✅ Delivery boy assigned!");
    } catch (err) {
      console.error(err);
      alert("Failed to assign delivery boy");
    }
  };

  const handlePrint = (order) => {
    const printWindow = window.open('', '_blank');
    const paymentLabel = PAYMENT_LABELS[order.paymentMethod] || (order.paymentMethod || 'Prepaid').toUpperCase();

    const html = `
      <html>
        <head>
          <title>Invoice #${order._id}</title>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .title { font-size: 28px; font-weight: 900; color: #000; }
            .logo { font-size: 20px; font-weight: bold; color: #ffeb3b; background: #000; padding: 5px 10px; display: inline-block; margin-bottom: 10px; }
            .section { margin-bottom: 30px; }
            .label { font-weight: bold; font-size: 14px; color: #666; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th { text-align: left; padding: 12px; background: #f8f8f8; border-bottom: 2px solid #eee; font-weight: 800; font-size: 14px; }
            td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; font-size: 15px; }
            .total-row { border-top: 2px solid #000; }
            .total { text-align: right; font-size: 20px; font-weight: 900; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">GYM FIT PRO</div>
              <div style="margin-top: 10px;">INVOICE</div>
            </div>
            <div style="text-align: right;">
              <div><strong>#${order._id.slice(-6).toUpperCase()}</strong></div>
              <div>${new Date(order.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
          
          <div style="display: flex; gap: 40px;">
            <div class="section" style="flex: 1;">
            <div class="label">Billed To</div>
            <div><strong>${order.address?.fullName || ''}</strong> (${order.address?.type || 'Home'})</div>
            <div>${order.address?.buildingName || ''}</div>
            <div>${order.address?.city || ''}${order.address?.district ? `, ${order.address.district}` : ''}</div>
            <div>${order.address?.state || ''} - ${order.address?.pincode || ''}</div>
            ${order.address?.postOffice ? `<div>PO: ${order.address.postOffice}</div>` : ''}
            <div>Mobile: ${order.address?.mobile || ''}</div>
            ${order.address?.alternateMobile ? `<div>Alt: ${order.address.alternateMobile}</div>` : ''}
            <div>Email: ${order.address?.email || ''}</div>
            </div>

            <div class="section" style="flex: 1;">
              <div class="label">Payment Details</div>
              <div>Method: <strong>${paymentLabel}</strong></div>
              <div>Payment Status: ${order.status === 'delivered' ? 'Paid' : 'Pending'}</div>
              ${order.paymentData?.upiId ? `<div>UPI ID: ${order.paymentData.upiId}</div>` : ''}
              ${order.paymentData?.brand ? `<div>Card: ${order.paymentData.brand.toUpperCase()} **** ${order.paymentData.last4}</div>` : ''}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price}</td>
                  <td>₹${item.quantity * item.price}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            Grand Total: ₹${order.amount}
          </div>
          
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={12}>
        <CircularProgress />
        <Typography color="text.secondary" mt={2}>Loading orders & delivery boys...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", p: 4 }}>
      <Box sx={{ mt: "70px" }} />

      <Typography variant="h3" fontWeight={900} color="text.primary" textAlign="center" mb={5}>
        My <Box component="span" sx={{ color: "primary.main" }}>Orders</Box>
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {orders.map(order => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={order._id + "_order"}>
            <Paper
              sx={{
                bgcolor: "background.paper",
                color: "text.primary",
                p: 3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: (theme) => `0 0 12px ${theme.palette.mode === 'dark' ? 'rgba(255,235,0,0.05)' : 'rgba(0,0,0,0.1)'}`
              }}
            >
              <Stack spacing={2}>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={800} fontSize={18} noWrap sx={{ maxWidth: "70%" }}>
                    {order.userId?.email || "Unknown User"}
                  </Typography>
                  <IconButton onClick={() => handlePrint(order)} sx={{ color: "action.active", "&:hover": { color: "primary.main" } }} title="Print Invoice">
                    <PrintIcon />
                  </IconButton>
                </Stack>

                <Divider sx={{ borderColor: "divider" }} />

                <Typography fontWeight={800} fontSize={16} color="primary.main">
                  Shipping Address
                </Typography>
                <Typography color="text.secondary" fontSize={14}>
                  <strong>{order.address?.fullName || "N/A"}</strong> ({order.address?.type || "Home"})<br />
                  {order.address?.buildingName || ""}<br />
                  {order.address?.city}{order.address?.district && `, ${order.address?.district}`}<br />
                  {order.address?.state} - <strong>{order.address?.pincode}</strong><br />
                  {order.address?.postOffice && <span>PO: {order.address.postOffice}<br /></span>}
                  Mobile: {order.address?.mobile || "N/A"}<br />
                  {order.address?.alternateMobile && <span>Alt: {order.address.alternateMobile}<br /></span>}
                  {order.address?.email && <span>Email: {order.address.email}<br /></span>}
                </Typography>

                <Divider sx={{ borderColor: "divider" }} />

                <Typography fontWeight={800} fontSize={16} color="primary.main">
                  Payment Method
                </Typography>
                <Typography color="text.secondary" fontSize={14}>
                  Mode: {PAYMENT_LABELS[order.paymentMethod] || (order.paymentMethod || "Prepaid").toUpperCase()}
                </Typography>
                {order.paymentData?.upiId && (
                  <Typography color="text.secondary" fontSize={13}>UPI: {order.paymentData.upiId}</Typography>
                )}
                {order.paymentData?.last4 && (
                  <Typography color="text.secondary" fontSize={13}>Card: **** {order.paymentData.last4}</Typography>
                )}

                <Divider sx={{ borderColor: "divider" }} />


                <Typography fontWeight={800} fontSize={16} color="primary.main">
                  Order Items
                </Typography>

                {order.items?.map(item => {
                  const imgUrl = item.image ? getImageUrl(item.image) : FALLBACK_IMG;
                  const total = (item.price ?? 0) * (item.quantity ?? 1);

                  return (
                    <Card
                      key={item.productId + "_item"}
                      sx={{
                        display: "flex",
                        bgcolor: "background.paper", // changed from #000
                        borderRadius: 2,
                        overflow: "hidden",
                        border: "1px solid",
                        borderColor: "divider",
                        cursor: "pointer",
                        transition: "0.3s",
                        "&:hover": { transform: "scale(1.02)", borderColor: "primary.main" }
                      }}
                      onClick={() => item.productId && navigate(`/products/${item.productId}`)}
                    >
                      <CardMedia
                        component="img"
                        sx={{ width: 80, height: 80, objectFit: "contain", bgcolor: "background.default", flexShrink: 0 }}
                        image={imgUrl}
                        alt={item.name}
                      />

                      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", px: 2, py: 1, flex: 1, overflow: "hidden" }}>
                        <Typography fontWeight={900} color="text.primary" fontSize={14} noWrap>
                          {item.name}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                          <Typography color="text.secondary" fontWeight={700} fontSize={12}>Qty: {item.quantity}</Typography>
                          <Typography color="primary.main" fontWeight={900} fontSize={13}>₹{total}</Typography>
                        </Stack>
                      </Box>
                    </Card>
                  );
                })}

                <Chip
                  key={order._id + "_status"}
                  label={(order.status || "placed").toUpperCase()}
                  sx={{
                    bgcolor: order.status === "cancelled" ? "error.main" : "primary.main",
                    color: order.status === "cancelled" ? "white" : "primary.contrastText",
                    fontWeight: 900,
                    fontSize: 12,
                    px: 1,
                    width: "fit-content",
                    borderRadius: 2
                  }}
                />

                <Divider sx={{ borderColor: "divider" }} />

                <Typography fontWeight={800} fontSize={16} color="primary.main">
                  Allocation
                </Typography>

                {/* Show currently assigned delivery boy if exists */}
                {order.deliveryBoy ? (
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: "action.hover", borderRadius: 2 }}>
                    <Typography color="text.secondary" fontSize={12}>Assigned To:</Typography>
                    <Typography color="text.primary" fontWeight={700}>
                      {typeof order.deliveryBoy === 'object'
                        ? `${order.deliveryBoy.fname} ${order.deliveryBoy.lname}`
                        : "Delivery Boy Assigned"}
                    </Typography>
                    {typeof order.deliveryBoy === 'object' && order.deliveryBoy.mobile && (
                      <Typography color="primary.main" fontSize={12}>
                        📞 {order.deliveryBoy.mobile}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography color="text.secondary" fontSize={13} mb={1}>
                    Not assigned yet
                  </Typography>
                )}

                <Typography color="text.secondary" fontSize={12} mb={0.5}>Assign / Re-assign:</Typography>
                <Select
                  value={
                    // Handle case where deliveryBoy is object vs ID
                    (order.deliveryBoy && typeof order.deliveryBoy === 'object')
                      ? order.deliveryBoy._id
                      : (order.deliveryBoy || "")
                  }
                  onChange={(e) => assignDeliveryBoy(order._id, e.target.value)}
                  displayEmpty
                  size="small"
                  sx={{
                    bgcolor: "background.paper",
                    color: "text.primary",
                    borderRadius: 1,
                    "& .MuiSvgIcon-root": { color: "action.active" },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" }
                  }}
                >
                  <MenuItem value="" disabled>
                    Select Delivery Boy
                  </MenuItem>
                  {deliveryBoys.map((db) => (
                    <MenuItem key={db._id} value={db._id}>
                      {db.fname} {db.lname} ({db.city})
                    </MenuItem>
                  ))}
                </Select>

                {order.status !== "cancelled" && (
                  <Select
                    key={order._id + "_select"}
                    value={order.status || order.orderStatus || "placed"}
                    onChange={e => updateStatus(order._id, e.target.value)}
                    sx={{ bgcolor: "background.paper", borderRadius: 2, fontWeight: 900, color: "text.primary" }}
                  >
                    <MenuItem value="placed">Placed</MenuItem>
                    <MenuItem value="shipped">Shipped</MenuItem>
                    <MenuItem value="out_for_delivery">Out for Delivery</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                  </Select>
                )}

              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {orders.length === 0 && (
        <Typography textAlign="center" color="text.secondary" mt={10} fontSize={22} fontWeight={900}>
          No orders yet 😕
        </Typography>
      )}
    </Box>
  );
}

const FALLBACK_IMG = "https://via.placeholder.com/600x400?text=No+Image"; // kept for safety
