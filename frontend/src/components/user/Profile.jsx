import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Avatar,
    Paper,
    Grid,
    CircularProgress,
    Alert,
    Stack,
    IconButton
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { motion } from "framer-motion";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";



export default function Profile() {
    const { user, login } = useAuth();
    const [formData, setFormData] = useState({
        fname: "",
        lname: "",
        email: "",
        mobile: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [deleteImage, setDeleteImage] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                fname: user.fname || "",
                lname: user.lname || "",
                email: user.email || "",
                mobile: user.mobile || ""
            });
            if (user.profileImage) {
                setPreview(`http://localhost:5000/uploads/${user.profileImage}`);
            }
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
            setDeleteImage(false);
        }
    };

    const handleDeleteImage = () => {
        setImageFile(null);
        setPreview(null);
        setDeleteImage(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const data = new FormData();
        data.append("fname", formData.fname);
        data.append("lname", formData.lname);
        data.append("mobile", formData.mobile);
        if (imageFile) {
            data.append("profileImage", imageFile);
        }
        if (deleteImage) {
            data.append("deleteImage", "true");
        }

        try {
            const config = {
                headers: {
                    "x-user-id": user._id,
                    "Content-Type": "multipart/form-data"
                }
            };

            const res = await axios.put("http://localhost:5000/api/auth/profile", data, config);

            setMessage({ type: "success", text: "Profile updated successfully!" });
            login(res.data.user);

        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "Failed to update profile." });
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: { xs: 2, md: 4 },
                background: (theme) => `linear-gradient(rgba(0,0,0,0.85), ${theme.palette.background.default}), url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed"
            }}
        >
            <Paper
                component={motion.div}
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                sx={{
                    p: { xs: 3, md: 6 },
                    width: "100%",
                    maxWidth: 900,
                    bgcolor: "background.paper",
                    backdropFilter: "blur(20px)",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 4,
                    boxShadow: "0 20px 80px rgba(0,0,0,0.5)",
                    position: "relative",
                    overflow: "hidden"
                }}
            >
                {/* Decorative Elements */}
                <Box sx={{
                    position: "absolute", top: -50, right: -50,
                    width: 150, height: 150,
                    bgcolor: "primary.main", opacity: 0.1,
                    filter: "blur(50px)", borderRadius: "50%"
                }} />

                <Typography
                    variant="h3"
                    fontWeight={900}
                    textAlign="center"
                    mb={6}
                    sx={{
                        textTransform: "uppercase",
                        letterSpacing: "2px",
                        color: "text.primary",
                        textShadow: "0 2px 10px rgba(0,0,0,0.5)"
                    }}
                >
                    My <Box component="span" sx={{ color: "primary.main" }}>Profile</Box>
                </Typography>

                {message && (
                    <Alert
                        severity={message.type}
                        sx={{
                            mb: 4, borderRadius: 2,
                            background: message.type === "success" ? "rgba(76, 175, 80, 0.1)" : "rgba(244, 67, 54, 0.1)",
                            color: message.type === "success" ? "#81c784" : "#e57373",
                            border: `1px solid ${message.type === "success" ? "#4caf50" : "#f44336"}`
                        }}
                    >
                        {message.text}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={6}>
                        {/* LEFT: IMAGE */}
                        <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
                            <Box sx={{ position: "relative", display: "inline-block" }}>
                                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                                    <Avatar
                                        src={preview}
                                        sx={{
                                            width: 180, height: 180,
                                            mx: "auto", mb: 3,
                                            border: "4px solid",
                                            borderColor: "primary.main",
                                            boxShadow: (theme) => `0 0 20px ${theme.palette.primary.main}50`,
                                            bgcolor: "grey.800"
                                        }}
                                    />
                                    <IconButton
                                        component="label"
                                        sx={{
                                            position: "absolute",
                                            bottom: 25,
                                            right: 10,
                                            bgcolor: "primary.main",
                                            color: "primary.contrastText",
                                            "&:hover": { bgcolor: "primary.light" },
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
                                        }}
                                    >
                                        <PhotoCamera />
                                        <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                                    </IconButton>
                                </motion.div>
                            </Box>

                            <Typography variant="h6" color="text.primary" fontWeight={700} mt={1}>
                                {user?.fname} {user?.lname}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={3}>
                                {user?.email}
                            </Typography>

                            {preview && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={handleDeleteImage}
                                    sx={{
                                        fontWeight: "bold",
                                        borderColor: "error.main",
                                        color: "error.main",
                                        "&:hover": { borderColor: "error.dark", bgcolor: "error.light", color: "error.dark" }
                                    }}
                                >
                                    Remove Photo
                                </Button>
                            )}
                        </Grid>

                        {/* RIGHT: FORM */}
                        <Grid item xs={12} md={8}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        name="fname"
                                        value={formData.fname}
                                        onChange={handleChange}
                                        sx={inputStyle}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        name="lname"
                                        value={formData.lname}
                                        onChange={handleChange}
                                        sx={inputStyle}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        name="email"
                                        value={formData.email}
                                        disabled
                                        sx={{
                                            ...inputStyle,
                                            opacity: 0.7,
                                            "& .MuiInputBase-input": { color: "text.disabled" }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Mobile Number"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        sx={inputStyle}
                                    />
                                </Grid>

                                <Grid item xs={12} sx={{ mt: 2 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={loading}
                                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                        component={motion.button}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        sx={{
                                            bgcolor: "primary.main",
                                            color: "primary.contrastText",
                                            fontWeight: 900,
                                            py: 1.5,
                                            px: 4,
                                            fontSize: "1rem",
                                            textTransform: "none",
                                            boxShadow: (theme) => `0 4px 15px ${theme.palette.primary.main}50`,
                                            "&:hover": { bgcolor: "primary.light", boxShadow: (theme) => `0 6px 20px ${theme.palette.primary.main}60` },
                                            "&.Mui-disabled": { bgcolor: "action.disabledBackground" }
                                        }}
                                    >
                                        {loading ? "Saving Changes..." : "Save Profile Changes"}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
}

const inputStyle = {
    "& .MuiInputLabel-root": { color: "text.secondary" },
    "& .MuiOutlinedInput-root": {
        color: "text.primary",
        bgcolor: "action.hover",
        transition: "0.3s",
        "& fieldset": { borderColor: "divider" },
        "&:hover fieldset": { borderColor: "text.primary" },
        "&.Mui-focused fieldset": { borderColor: "primary.main" },
        "&:hover": { bgcolor: "action.selected" }
    },
    "& .MuiInputBase-input": { color: "text.primary" }
};
