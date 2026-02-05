import { Box, Typography, Card, CardContent, IconButton, Stack, Chip, Toolbar, Grid } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/api";

const API_BASE = "http://localhost:5000";

import { useNavigate } from "react-router-dom";

export default function ManageWorkoutVideos() {
  const [videos, setVideos] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const navigate = useNavigate();

  const categories = ["Chest", "Back", "Legs", "Arms", "Core", "Cardio"];

  useEffect(() => { loadVideos(); }, []);

  const loadVideos = async () => {
    try {
      const res = await api.get("/workouts"); // ✅ /api/workouts
      setVideos(res.data || []);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to load videos");
    }
  };

  const deleteVideo = async (id) => {
    if (!window.confirm("Delete this video?")) return;
    try {
      await api.delete(`/workouts/${id}`); // ✅ delete route
      alert("🗑 Deleted!");
      loadVideos();
    } catch (err) {
      console.error(err);
      alert("❌ Delete failed");
    }
  };

  const visible = filter === "ALL" ? videos : videos.filter(v => v.category === filter);



  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", px: 4, pb: 4, pt: 12 }}>
      <Typography variant="h4" fontWeight={900} color="text.primary" textAlign="center" mb={4}>
        Manage <Box component="span" sx={{ color: "primary.main" }}>Workout Videos</Box>
      </Typography>

      {/* FILTER CHIPS */}
      <Toolbar sx={{ justifyContent: "center", flexWrap: "wrap", gap: 1.2, mb: 4 }}>
        <Chip
          label="ALL"
          clickable
          onClick={() => setFilter("ALL")}
          sx={{ bgcolor: "primary.main", color: "primary.contrastText", fontWeight: 900, px: 2 }}
        />
        {categories.map(c => (
          <Chip
            key={c}
            label={c}
            clickable
            onClick={() => setFilter(c)}
            sx={{ bgcolor: "background.paper", color: "primary.main", fontWeight: 800, border: "1px solid", borderColor: "primary.main" }}
          />
        ))}
      </Toolbar>

      <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
        {visible.length > 0 ? (
          <Grid container spacing={4} justifyContent="center">
            {visible.map((v, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={v._id}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card sx={{ bgcolor: "transparent", boxShadow: "none", color: "text.primary" }}>

                    {/* ✅ Video plays because backend serves static */}
                    <Box sx={{ borderRadius: 3, overflow: "hidden", mb: 1.5, position: "relative" }}>
                      <video width="100%" height="200" controls preload="metadata" poster={v.thumbnail ? `${API_BASE}${v.thumbnail}` : ""}>
                        <source src={`${API_BASE}${v.videoUrl}`} />
                        Your browser does not support the video tag.
                      </video>
                    </Box>

                    <CardContent sx={{ p: "0 !important" }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography fontWeight={700} fontSize={16} lineHeight={1.2} mb={0.5} noWrap title={v.title}>
                            {v.title}
                          </Typography>
                          <Typography fontSize={13} color="text.secondary" fontWeight={500}>
                            {v.category}
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", gap: 0 }}>
                          <IconButton size="small" onClick={() => navigate(`/admin/edit-workout-video/${v._id}`)}>
                            <EditIcon fontSize="small" sx={{ color: "primary.main" }} />
                          </IconButton>
                          <IconButton size="small" onClick={() => deleteVideo(v._id)}>
                            <DeleteIcon fontSize="small" sx={{ color: "error.main" }} />
                          </IconButton>
                        </Box>
                      </Stack>
                    </CardContent>

                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography textAlign="center" color="text.secondary" mt={8} fontSize={18}>
            No videos found
          </Typography>
        )}
      </Box>


    </Box>
  );
}
