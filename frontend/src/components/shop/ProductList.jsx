import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Stack,
  Chip,
  Toolbar,
  Container,
  TextField,
  InputAdornment
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import api, { IMG_BASE_URL, getImageUrl } from "../../api/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61";


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
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data || []);
    } catch (err) {
      console.error("Failed to load products", err);
      alert("Failed to load products");
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data || []);
    } catch (err) {
      console.error("Failed to load categories", err);
      alert("Failed to load categories");
    }
  };

  const visibleProducts = products.filter((p) => {
    const matchesCategory = filter === "ALL" || p.category?._id === filter;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary", overflowX: "hidden" }}>

      {/* HEADER / HERO SECTION */}
      <Box sx={{
        position: "relative",
        height: "40vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.paper", // Fallback
        backgroundImage: (theme) => `linear-gradient(to bottom, rgba(0,0,0,0.5), ${theme.palette.background.default}), url(https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        flexDirection: "column",
        gap: 2,
        mt: 8 // Space for fixed navbar
      }}>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography variant="h2" fontWeight={900} color="white" textTransform="uppercase" textAlign="center" sx={{ letterSpacing: "-1px" }}>
            Shop <Box component="span" sx={{ color: "primary.main", WebkitTextStroke: (theme) => `1px ${theme.palette.mode === 'dark' ? 'black' : 'transparent'}` }}>Premium</Box> Gear
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Typography variant="h6" color="text.secondary" fontWeight={300}>
            Fuel your ambition with the best supplements
          </Typography>
        </motion.div>
      </Box>

      <Container maxWidth="xl" sx={{ pb: 10 }}>

        {/* CONTROLS SECTION */}
        <Grid container spacing={4} sx={{ mb: 6 }} alignItems="center" justifyContent="space-between">
          <Grid size={{ xs: 12, md: 8 }}>
            <Toolbar sx={{ p: 0, flexWrap: "wrap", gap: 1 }}>
              <Chip
                label="All Products"
                clickable
                onClick={() => setFilter("ALL")}
                sx={pillStyle("ALL", filter)}
              />
              {categories.map((c) => (
                <Chip
                  key={c._id}
                  label={c.name}
                  clickable
                  onClick={() => setFilter(c._id)}
                  sx={pillStyle(c._id, filter)}
                />
              ))}
            </Toolbar>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#666" }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 20,
                  bgcolor: "background.paper",
                  color: "text.primary",
                  "& fieldset": { border: "none" },
                  "& input": { py: 1.5 },
                  boxShadow: 1
                }
              }}
            />
          </Grid>
        </Grid>

        {/* PRODUCTS GRID */}
        <AnimatePresence>
          <Grid
            container
            spacing={4}
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {visibleProducts.map((p) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={p._id} component={motion.div} variants={itemVariants} layout>
                <Card sx={{
                  bgcolor: "background.paper",
                  color: "text.primary",
                  borderRadius: 2,
                  overflow: "hidden",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  transition: "all 0.3s ease",
                  border: "1px solid",
                  borderColor: "divider",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: (theme) => `0 10px 40px -10px ${theme.palette.primary.main}20`,
                    borderColor: "primary.main"
                  },
                  "&:hover .action-btn": { opacity: 1, transform: "translateY(0)" }
                }}>
                  {/* IMAGE AREA */}
                  <CardMedia
                    component="img"
                    height="250"
                    image={p.images?.length ? getImageUrl(p.images[0]) : FALLBACK_IMG}
                    alt={p.name}
                    sx={{
                      objectFit: "contain",
                      backgroundColor: "white", // Images often look better on white, or dynamic? Let's keep white for products to be safe, or stick to a neutral grey
                      p: 2,
                      transition: "transform 0.5s ease",
                      "&:hover": { transform: "scale(1.1)" }
                    }}
                  />

                  {/* OVERLAY ACTION BUTTON */}
                  <Box className="action-btn" sx={{
                    position: "absolute",
                    top: "180px", // Adjusted for 250px height
                    left: 0,
                    right: 0,
                    display: "flex",
                    justifyContent: "center",
                    opacity: 0,
                    transform: "translateY(20px)",
                    transition: "all 0.3s ease",
                    zIndex: 2
                  }}>
                    <Button
                      variant="contained"
                      startIcon={<ShoppingCartIcon />}
                      onClick={() => navigate(`/products/${p._id}`)}
                      sx={{
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        fontWeight: 800,
                        borderRadius: 50,
                        "&:hover": { bgcolor: "background.paper", color: "text.primary" }
                      }}
                    >
                      Quick View
                    </Button>
                  </Box>

                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                    {/* Category Tag */}
                    {p.category?.name && (
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                        {p.category.name}
                      </Typography>
                    )}

                    <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2, mb: 1 }}>
                      {p.name}
                    </Typography>

                    <Box sx={{ mt: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography variant="h6" color="primary.main" fontWeight={800}>
                        ₹{p.price.toLocaleString()}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: p.stock > 0 ? "#4caf50" : "#f44336" }} />
                        <Typography variant="caption" color={p.stock > 0 ? "#aaa" : "#f44336"} fontWeight={600}>
                          {p.stock > 0 ? "In Stock" : "Sold Out"}
                        </Typography>
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </AnimatePresence>

        {/* EMPTY STATE */}
        {visibleProducts.length === 0 && (
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            sx={{ textAlign: "center", py: 10 }}
          >
            <Typography variant="h4" color="#444" fontWeight={900}>
              No items found
            </Typography>
            <Typography color="#666">
              Try adjusting your filters or search terms
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}

function pillStyle(id, selected) {
  const active = id === selected;
  return {
    px: 3,
    py: 1,
    borderRadius: 50,
    fontWeight: 800,
    fontSize: "0.85rem",
    bgcolor: active ? "primary.main" : "transparent",
    color: active ? "primary.contrastText" : "text.secondary",
    border: "1px solid",
    borderColor: active ? "primary.main" : "divider",
    transition: "all 0.3s ease",
    "&:hover": {
      bgcolor: active ? "primary.dark" : "action.hover",
      borderColor: active ? "primary.dark" : "text.primary",
      color: active ? "primary.contrastText" : "text.primary"
    }
  };
}
