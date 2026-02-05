import { Box, Typography, Chip, Toolbar, Card, CardContent, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import api, { SERVER_URL } from "../../api/api";
import { motion } from "framer-motion";

const API_BASE = SERVER_URL;

export default function WorkoutVideosUser() {
  const [videos, setVideos] = useState([]);
  const [filter, setFilter] = useState("ALL");

  const categories = ["Chest", "Back", "Legs", "Arms", "Core", "Cardio"];

  useEffect(() => { loadVideos(); }, []);

  const loadVideos = async () => {
    try {
      const res = await api.get("/workouts"); // hits backend /api/workouts
      setVideos(res.data || []);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to load videos");
    }
  };

  const visible = filter === "ALL" ? videos : videos.filter(v => v.category === filter);


  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: 4, pt: 12 }}>

      {/* HEADER */}
      <Typography variant="h3" fontWeight={900} color="text.primary" textAlign="center" mb={4} mt={6}>
        Workout <Box component="span" sx={{ color: "primary.main" }}>Videos</Box>
      </Typography>

      {/* FILTER CHIPS */}
      <Toolbar sx={{ justifyContent: "center", flexWrap: "wrap", gap: 1.2, mb: 4 }}>
        <Chip
          label="ALL"
          clickable
          onClick={() => setFilter("ALL")}
          sx={{
            bgcolor: filter === "ALL" ? "primary.main" : "action.selected",
            color: filter === "ALL" ? "primary.contrastText" : "text.primary",
            fontWeight: 900,
            px: 2
          }}
        />
        {categories.map(c => (
          <Chip
            key={c}
            label={c}
            clickable
            onClick={() => setFilter(c)}
            sx={{
              bgcolor: filter === c ? "primary.main" : "background.paper",
              color: filter === c ? "primary.contrastText" : "primary.main",
              fontWeight: 800,
              border: "1px solid",
              borderColor: "primary.main",
              "&:hover": { bgcolor: "primary.light", color: "primary.contrastText" }
            }}
          />
        ))}
      </Toolbar>

      {/* VIDEO GRID */}
      <Box sx={{ maxWidth: "1200px", mx: "auto", px: 2 }}>
        {visible.length > 0 ? (
          <Grid container spacing={4} justifyContent="center">
            {visible.map((v, i) => (
              <Grid item xs={12} sm={6} md={4} key={v._id}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card sx={{ bgcolor: "transparent", boxShadow: "none", color: "text.primary" }}>

                    {/* VIDEO PLAYER */}
                    <Box sx={{ borderRadius: 3, overflow: "hidden", mb: 1.5 }}>
                      <video width="100%" height="200" controls preload="metadata" poster={v.thumbnail ? `${API_BASE}${v.thumbnail}` : ""}>
                        <source src={`${API_BASE}${v.videoUrl}`} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </Box>

                    {/* VIDEO INFO (YouTube Style) */}
                    <CardContent sx={{ p: "0 !important" }}>
                      <Typography fontWeight={700} fontSize={16} lineHeight={1.2} mb={0.5} noWrap title={v.title} color="text.primary">
                        {v.title}
                      </Typography>

                      <Typography fontSize={13} color="text.secondary" fontWeight={500}>
                        {v.category}
                      </Typography>
                    </CardContent>

                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        ) : (
          /* EMPTY STATE */
          <Typography textAlign="center" color="text.secondary" mt={8} fontSize={20} fontWeight={700}>
            No videos available 😕
          </Typography>
        )}
      </Box>

    </Box>
  );
}
