import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Stack,
  Card,
  CardMedia,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import api from "../../api/api";
import { motion, AnimatePresence } from "framer-motion";


const BASE_IMG = "http://localhost:5000/uploads/";

const MotionPaper = motion.create(Paper);
const MotionCard = motion.create(Card);

export default function Products() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  /* ---------------- LOAD PRODUCTS + CATEGORIES ---------------- */
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.get("/admin/products");
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

  const addCategory = async () => {
    if (!newCategory.trim()) return alert("Enter category name");
    try {
      await api.post("/categories", { name: newCategory.trim() });
      setNewCategory("");
      loadCategories();
      alert("Category added");
    } catch (err) {
      console.error("Failed to add category", err);
      alert("Failed to add category");
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      loadCategories();
      alert("Category deleted");
    } catch (err) {
      console.error("Failed to delete category", err);
      alert("Failed to delete category");
    }
  };

  /* ---------------- SAVE PRODUCT UPDATE ---------------- */
  const handleSave = async () => {
    try {
      const formData = new FormData();

      ["name", "price", "stock", "description"].forEach((k) => {
        formData.append(k, editing[k]);
      });

      formData.append("category", editing.category || null);

      images.forEach((img) => formData.append("images", img));

      await api.put(`/admin/products/${editing._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("✅ Product updated");
      setEditing(null);
      setImages([]);
      loadProducts();
    } catch (err) {
      console.error("Update failed", err);
      alert("❌ Update failed");
    }
  };

  /* ---------------- DELETE PRODUCT ---------------- */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      loadProducts();
    } catch (err) {
      console.error("Delete failed", err);
      alert("❌ Delete failed");
    }
  };

  /* ---------------- SEARCH & FILTER ---------------- */
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? p.category?._id === filterCategory : true;
    return matchesSearch && matchesCategory;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        background: (theme) => `linear-gradient(rgba(0,0,0,0.85), ${theme.palette.background.default}), url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        color: "text.primary"
      }}
      component={motion.div}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Typography
        variant="h3"
        fontWeight={900}
        mb={1}
        mt={4}
        sx={{
          textTransform: "uppercase",
          letterSpacing: "1px",
          textShadow: "2px 2px 10px rgba(0,0,0,0.5)"
        }}
        component={motion.div}
        variants={itemVariants}
      >
        Manage <Box component="span" sx={{ color: "primary.main" }}>Products</Box>
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4} component={motion.div} variants={itemVariants}>
        View, edit, and update your gym inventory efficiently.
      </Typography>

      {/* SEARCH & FILTER CONTROLS */}
      <MotionPaper
        variants={itemVariants}
        sx={{
          p: 3,
          mb: 4,
          bgcolor: "background.paper",
          backdropFilter: "blur(12px)",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          boxShadow: (theme) => `0 8px 32px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}`
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                )
              }}
              sx={inputStyle}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
              <Button
                variant={filterCategory === "" ? "contained" : "outlined"}
                onClick={() => setFilterCategory("")}
                sx={{
                  borderColor: "primary.main",
                  color: filterCategory === "" ? "primary.contrastText" : "primary.main",
                  fontWeight: 700,
                  bgcolor: filterCategory === "" ? "primary.main" : "transparent",
                  "&:hover": { bgcolor: filterCategory === "" ? "primary.dark" : "action.hover" }
                }}
              >
                All
              </Button>
              {categories.map(c => (
                <Button
                  key={c._id}
                  variant={filterCategory === c._id ? "contained" : "outlined"}
                  onClick={() => setFilterCategory(c._id)}
                  sx={{
                    borderColor: "primary.main",
                    color: filterCategory === c._id ? "primary.contrastText" : "primary.main",
                    fontWeight: 700,
                    bgcolor: filterCategory === c._id ? "primary.main" : "transparent",
                    "&:hover": { bgcolor: filterCategory === c._id ? "primary.dark" : "action.hover" }
                  }}
                >
                  {c.name}
                </Button>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </MotionPaper>

      {/* Add Category Form */}
      <Box component={motion.div} variants={itemVariants} sx={{ mb: 4, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
        <TextField
          label="New Category Name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          sx={{ ...inputStyle, minWidth: 300 }}
          size="small"
        />
        <Button
          onClick={addCategory}
          startIcon={<AddIcon />}
          variant="contained"
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            fontWeight: 800,
            "&:hover": { bgcolor: "primary.light" }
          }}
        >
          Add Category
        </Button>
      </Box>

      <Box sx={{ mb: 4 }} component={motion.div} variants={itemVariants}>
        <Typography variant="h6" color="primary.main" mb={2} fontWeight={700}>
          Manage Categories
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ gap: 2 }}>
          {categories.map((c) => (
            <Paper
              key={c._id}
              elevation={0}
              sx={{
                p: "4px 12px",
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                color: "text.primary",
                display: "flex",
                alignItems: "center",
                gap: 1,
                borderRadius: 2
              }}
            >
              <Typography fontWeight={500}>{c.name}</Typography>
              <IconButton size="small" onClick={() => deleteCategory(c._id)}>
                <DeleteIcon sx={{ color: "#ff5252", fontSize: 18 }} />
              </IconButton>
            </Paper>
          ))}
        </Stack>
      </Box>

      {/* ---------------- PRODUCT LIST ---------------- */}
      <Grid container spacing={3} component={motion.div} variants={containerVariants}>
        <AnimatePresence>
          {filteredProducts.map((p) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={p._id} component={motion.div} layout variants={itemVariants} exit={{ opacity: 0, scale: 0.9 }}>
              <MotionCard
                whileHover={{ y: -8, boxShadow: `0 12px 30px rgba(0,0,0,0.5)` }}
                sx={{
                  bgcolor: "background.paper",
                  backdropFilter: "blur(10px)",
                  border: "1px solid",
                  borderColor: "divider",
                  color: "text.primary",
                  borderRadius: 3,
                  overflow: "hidden",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <Box sx={{ position: "relative", height: 280, overflow: "hidden" }}>
                  <CardMedia
                    component="img"
                    image={p.images?.length ? BASE_IMG + p.images[0] : ""}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      transition: "transform 0.5s ease",
                      "&:hover": { transform: "scale(1.1)" }
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      bgcolor: "rgba(0,0,0,0.6)",
                      color: "primary.main",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: 12,
                      fontWeight: 800,
                      backdropFilter: "blur(4px)",
                      textTransform: "uppercase",
                      letterSpacing: 1
                    }}
                  >
                    {p.category?.name || "Uncategorized"}
                  </Box>
                </Box>
                <Box p={3} flexGrow={1} display="flex" flexDirection="column">
                  <Typography variant="h6" fontWeight={800} gutterBottom sx={{ lineHeight: 1.2 }}>
                    {p.name}
                  </Typography>

                  <Stack direction="row" justifyContent="space-between" alignItems="center" mt="auto">
                    <Typography variant="h5" color="primary.main" fontWeight={900}>₹{p.price}</Typography>
                    <Box
                      sx={{
                        px: 1.5, py: 0.5, borderRadius: 1,
                        bgcolor: p.stock > 0 ? "rgba(76, 175, 80, 0.2)" : "rgba(244, 67, 54, 0.2)",
                        color: p.stock > 0 ? "success.main" : "error.main",
                        fontWeight: 700, fontSize: 13,
                        border: "1px solid",
                        borderColor: p.stock > 0 ? "success.main" : "error.main"
                      }}
                    >
                      {p.stock > 0 ? `Stock: ${p.stock}` : "Out of Stock"}
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1} mt={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => setEditing({ ...p, category: p.category?._id || "" })}
                      sx={{
                        borderColor: "divider",
                        color: "text.primary",
                        "&:hover": { borderColor: "primary.main", color: "primary.main", bgcolor: "action.hover" }
                      }}
                    >
                      Edit
                    </Button>
                    <IconButton
                      onClick={() => handleDelete(p._id)}
                      sx={{
                        bgcolor: "rgba(244, 67, 54, 0.1)",
                        color: "error.main",
                        borderRadius: 2,
                        "&:hover": { bgcolor: "rgba(244, 67, 54, 0.2)" }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Box>
              </MotionCard>
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>

      {/* ---------------- EDIT DIALOG ---------------- */}
      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            boxShadow: (theme) => `0 20px 60px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.2)'}`
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: "background.paper", color: "text.primary", fontWeight: 800, fontSize: 22, borderBottom: "1px solid", borderColor: "divider" }}>
          Edit Product
        </DialogTitle>
        <DialogContent sx={{ bgcolor: "background.paper", color: "text.primary", pt: 3 }}>
          <Stack spacing={3} mt={1}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Product Name"
                  value={editing?.name || ""}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  sx={inputStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Price (₹)"
                  type="number"
                  value={editing?.price || ""}
                  onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                  sx={inputStyle}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Stock Quantity"
                  type="number"
                  value={editing?.stock || ""}
                  onChange={(e) => setEditing({ ...editing, stock: e.target.value })}
                  sx={inputStyle}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={editing?.description || ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  sx={inputStyle}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth sx={inputStyle}>
                  <InputLabel sx={{ color: "text.secondary" }}>Category</InputLabel>
                  <Select
                    value={editing?.category || ""}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    sx={{
                      color: "text.primary",
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
                      "& .MuiSvgIcon-root": { color: "action.active" }
                    }}
                    label="Category"
                  >
                    <MenuItem value="">
                      <em>No Category</em>
                    </MenuItem>
                    {categories.map((c) => (
                      <MenuItem key={c._id} value={c._id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 3,
                    textAlign: "center",
                    transition: "0.2s",
                    "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" }
                  }}
                >
                  <Button
                    component="label"
                    startIcon={<AddPhotoAlternateIcon />}
                    sx={{ color: "primary.main", fontWeight: 700 }}
                  >
                    Replace Images
                    <input
                      type="file"
                      hidden
                      multiple
                      onChange={(e) => setImages([...e.target.files])}
                    />
                  </Button>
                  <Typography variant="caption" display="block" color="text.secondary" mt={1}>
                    Uploading new images will replace existing ones.
                  </Typography>

                  {/* preview replaced images */}
                  <Stack direction="row" spacing={2} mt={2} justifyContent="center" flexWrap="wrap">
                    {images.length > 0 ? (
                      images.map((file, i) => (
                        <CardMedia
                          key={i}
                          component="img"
                          image={URL.createObjectURL(file)}
                          sx={{ width: 80, height: 80, borderRadius: 2, border: "2px solid", borderColor: "primary.main", objectFit: "cover" }}
                        />
                      ))
                    ) : (
                      editing?.images?.length > 0 && (
                        editing.images.map((img, i) => (
                          <CardMedia
                            key={i}
                            component="img"
                            image={BASE_IMG + img}
                            sx={{ width: 80, height: 80, borderRadius: 2, border: "1px solid", borderColor: "divider", objectFit: "cover", opacity: 0.5 }}
                          />
                        ))
                      )
                    )}
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ background: "transparent", p: 3, pt: 0 }}>
          <Button onClick={() => setEditing(null)} sx={{ color: "text.secondary", fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontWeight: 900,
              px: 4,
              py: 1,
              "&:hover": { bgcolor: "primary.light" }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/* ---------------- STYLES ---------------- */
const inputStyle = {
  "& .MuiInputLabel-root": { color: "text.secondary" },
  "& .MuiOutlinedInput-root": {
    color: "text.primary",
    "& fieldset": { borderColor: "divider" },
    "&:hover fieldset": { borderColor: "text.primary" },
    "&.Mui-focused fieldset": { borderColor: "primary.main" }
  },
  "& .MuiInputBase-input": { color: "text.primary" }
};
