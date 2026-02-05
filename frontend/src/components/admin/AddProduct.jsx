import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Stack,
  MenuItem,
  CardMedia
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { useState, useEffect } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";

const ACCENT = "#ffeb3b";
const BG = "#121212";
const CARD = "#1e1e1e";

export default function AddProduct() {
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    category: ""
  });

  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/categories").then(res => setCategories(res.data));
  }, []);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }
    setImages(files);
    setPreview(files.map(f => URL.createObjectURL(f)));
  };

  const submitProduct = async () => {
    if (!product.name || !product.price) {
      alert("Name & Price required");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(product).forEach(k => formData.append(k, product[k]));
      images.forEach(img => formData.append("images", img));

      // 🔥 FIXED: This will hit backend at 5000/api/products ✔
      await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Product added!");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", background: BG, p: 4 }}>
      <Typography variant="h4" color={ACCENT} fontWeight={800} mb={3}>
        Add New Gym Product
      </Typography>

      <Paper sx={{ maxWidth: 720, p: 4, background: CARD, borderRadius: 3 }}>
        <Grid container spacing={3}>

          {/* NAME */}
          <Grid size={{ xs: 12 }}>
            <TextField label="Product Name" name="name" fullWidth
              value={product.name} onChange={handleChange} sx={inputStyle}/>
          </Grid>

          {/* PRICE */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="Price (₹)" name="price" type="number" fullWidth
              value={product.price} onChange={handleChange} sx={inputStyle}/>
          </Grid>

          {/* STOCK */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="Stock" name="stock" type="number" fullWidth
              value={product.stock} onChange={handleChange} sx={inputStyle}/>
          </Grid>

          {/* CATEGORY */}
          <Grid size={{ xs: 12 }}>
            <TextField label="Category" name="category" select fullWidth
              value={product.category} onChange={handleChange} sx={inputStyle}>
              <MenuItem value="">No Category</MenuItem>
              {categories.map(cat => (
                <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* DESCRIPTION */}
          <Grid size={{ xs: 12 }}>
            <TextField label="Description" name="description" multiline rows={3} fullWidth
              value={product.description} onChange={handleChange} sx={inputStyle}/>
          </Grid>

          {/* IMAGE UPLOAD */}
          <Grid size={{ xs: 12 }}>
            <Button component="label" startIcon={<AddPhotoAlternateIcon />} sx={{background: ACCENT,color:"#000",fontWeight:800}}>
              Upload Images
              <input type="file" hidden multiple accept="image/*" onChange={handleImages}/>
            </Button>

            {/* PREVIEW */}
            <Stack direction="row" spacing={1} mt={2}>
              {preview.map((src,i) => (
                <CardMedia key={i} component="img" src={src}
                  sx={{width:80,height:80,borderRadius:2,border:`2px solid ${ACCENT}`}}/>
              ))}
            </Stack>

            <Typography color="#aaa" mt={1}>{images.length} selected</Typography>
          </Grid>

          {/* SUBMIT */}
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={2}>
              <Button fullWidth disabled={loading} onClick={submitProduct} sx={{background:ACCENT,color:"#000",fontWeight:900,py:1.4}}>
                {loading ? "Adding..." : "Add Product"}
              </Button>

              <Button fullWidth variant="outlined" onClick={() => navigate("/admin")} sx={{color:ACCENT,borderColor:ACCENT}}>
                Cancel
              </Button>
            </Stack>
          </Grid>

        </Grid>
      </Paper>
    </Box>
  );
}

const inputStyle = {
  input:{color:"white"}, textarea:{color:"white"}, label:{color:"#aaa"},
  "& .MuiOutlinedInput-root":{
    "& fieldset":{borderColor:"#444"},
    "&:hover fieldset":{borderColor:ACCENT},
    "&.Mui-focused fieldset":{borderColor:ACCENT,borderWidth:2}
  },
  "& .MuiInputLabel-root.Mui-focused":{color:ACCENT}
};
