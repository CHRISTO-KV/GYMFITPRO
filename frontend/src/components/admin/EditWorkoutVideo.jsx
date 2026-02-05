import { Box, Typography, TextField, Button, Paper, Stack, MenuItem, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import api from "../../api/api";
import { useNavigate, useParams } from "react-router-dom";



export default function EditWorkoutVideo() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [form, setForm] = useState({ title: "", description: "", category: "Chest" });
    const [file, setFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        loadVideo();
    }, []);

    const loadVideo = async () => {
        try {
            const res = await api.get(`/workouts/${id}`);
            setForm({
                title: res.data.title,
                description: res.data.description,
                category: res.data.category
            });
        } catch (err) {
            console.error(err);
            alert("Failed to load video details");
            navigate("/admin/workout-videos");
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleFile = (e) => setFile(e.target.files[0]);
    const handleThumbnail = (e) => setThumbnail(e.target.files[0]);

    const submit = async () => {
        if (!form.title.trim()) return alert("Title required");

        setLoading(true);
        const fd = new FormData();
        if (file) fd.append("video", file);
        if (thumbnail) fd.append("thumbnail", thumbnail);
        fd.append("title", form.title);
        fd.append("description", form.description);
        fd.append("category", form.category);

        try {
            await api.put(`/workouts/${id}`, fd, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            alert("🔥 Video updated!");
            navigate("/admin/workout-videos");
        } catch (err) {
            console.error(err);
            alert("❌ Update failed");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", justifyContent: "center", alignItems: "center" }}><CircularProgress /></Box>;

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default", px: 4, pb: 4, pt: 12 }}>
            <Typography variant="h4" fontWeight={900} color="text.primary" mb={3}>
                Edit Workout Video
            </Typography>

            <Paper sx={{ maxWidth: 600, p: 3, bgcolor: "background.paper", borderRadius: 2 }}>
                <Stack spacing={2}>

                    <TextField
                        fullWidth
                        label="Video Title"
                        name="title"
                        onChange={handleChange}
                        value={form.title}
                        sx={{
                            "& .MuiInputBase-input": { color: "text.primary" },
                            "& .MuiInputLabel-root": { color: "text.secondary" },
                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
                            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "text.primary" },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" }
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        multiline
                        rows={3}
                        onChange={handleChange}
                        value={form.description}
                        sx={{
                            "& .MuiInputBase-input": { color: "text.primary" },
                            "& .MuiInputLabel-root": { color: "text.secondary" },
                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
                            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "text.primary" },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" }
                        }}
                    />

                    <TextField
                        select
                        fullWidth
                        label="Category"
                        name="category"
                        onChange={handleChange}
                        value={form.category}
                        sx={{
                            "& .MuiSelect-select": { color: "text.primary" },
                            "& .MuiInputLabel-root": { color: "text.secondary" },
                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
                            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "text.primary" },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" }
                        }}
                    >
                        {["Chest", "Back", "Legs", "Arms", "Core", "Cardio"].map(cat => (
                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                    </TextField>

                    <Button component="label" sx={{ bgcolor: "primary.main", color: "primary.contrastText", fontWeight: 800 }}>
                        {file ? file.name : "Replace Video (Optional)"}
                        <input type="file" hidden accept="video/*" onChange={handleFile} />
                    </Button>

                    <Button component="label" sx={{ bgcolor: "action.disabledBackground", color: "text.secondary", fontWeight: 800 }}>
                        {thumbnail ? thumbnail.name : "Replace Thumbnail (Optional)"}
                        <input type="file" hidden accept="image/*" onChange={handleThumbnail} />
                    </Button>

                    <Button fullWidth onClick={submit} disabled={loading} sx={{ bgcolor: "primary.main", color: "primary.contrastText", fontWeight: 900, "&:hover": { bgcolor: "primary.dark" } }}>
                        {loading ? "Updating..." : "Update Video"}
                    </Button>

                </Stack>
            </Paper>
        </Box>
    );
}
