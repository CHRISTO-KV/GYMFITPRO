import {
  Box,
  Typography,
  Chip,
  Toolbar,
  Grid,
  Card,
  CardContent,
  Container,
  CircularProgress,
  IconButton
} from "@mui/material";
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { useEffect, useState } from "react";
import api from "../../api/api";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = "http://localhost:5000";

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
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } }
};

export default function WorkoutVideos() {
  const [videos, setVideos] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const categories = ["Chest", "Back", "Legs", "Arms", "Core", "Cardio"];

  useEffect(() => { loadVideos(); }, []);

  const loadVideos = async () => {
    try {
      const res = await api.get("/workouts");
      setVideos(res.data || []);
    } catch (err) {
      console.error(err);
      // alert("❌ Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  const visible = filter === "ALL" ? videos : videos.filter(v => v.category === filter);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress sx={{ color: "primary.main" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary", overflowX: "hidden" }}>

      {/* Background Image */}
      <Box sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "60vh",
        bgcolor: "background.default",
        opacity: 0.15,
        zIndex: 0,
        pointerEvents: "none"
      }} />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, pt: 12, pb: 8 }}>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Typography variant="h3" fontWeight={900} textAlign="center" mb={1} textTransform="uppercase" color="text.primary">
            Workout <Box component="span" sx={{ color: "primary.main" }}>Videos</Box>
          </Typography>
          <Typography textAlign="center" color="text.secondary" mb={6}>
            Master your form with professional guides
          </Typography>
        </motion.div>

        {/* Filter Toolbar */}
        <Toolbar sx={{ justifyContent: "center", flexWrap: "wrap", gap: 1.5, mb: 6, p: 0 }}>
          <Chip
            label="All Workouts"
            clickable
            onClick={() => setFilter("ALL")}
            sx={pillStyle("ALL", filter)}
          />
          {categories.map(c => (
            <Chip
              key={c}
              label={c}
              clickable
              onClick={() => setFilter(c)}
              sx={pillStyle(c, filter)}
            />
          ))}
        </Toolbar>

        <Grid container spacing={4} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
          <AnimatePresence mode="popLayout">
            {visible.map(v => (
              <Grid item xs={12} sm={6} md={4} key={v._id} component={motion.div} variants={itemVariants} layout>
                <Card
                  sx={{
                    bgcolor: "background.paper",
                    backdropFilter: "blur(12px)",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 4,
                    overflow: "hidden",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.4s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: 6,
                      bgcolor: "action.hover"
                    }
                  }}
                >
                  <Box sx={{ position: "relative", bgcolor: "#000" }}>
                    <video
                      width="100%"
                      height="240"
                      controls
                      preload="metadata"
                      poster={v.thumbnail ? `${API_BASE}${v.thumbnail}` : ""}
                      style={{ display: "block", objectFit: "cover" }}
                    >
                      <source src={`${API_BASE}${v.videoUrl}`} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </Box>

                  <CardContent sx={{ p: 3, flexGrow: 1 }}>
                    <Typography variant="caption" color="primary.main" fontWeight={700} textTransform="uppercase" letterSpacing={1}>
                      {v.category}
                    </Typography>
                    <Typography variant="h6" fontWeight={800} color="text.primary" mt={0.5} mb={1} lineHeight={1.2}>
                      {v.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                      {v.description || "No description available for this workout."}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>

        {visible.length === 0 && (
          <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} textAlign="center" py={10} bgcolor="action.hover" borderRadius={4}>
            <PlayCircleOutlineIcon sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
            <Typography variant="h5" color="text.secondary" fontWeight={700}>No videos found for this category</Typography>
          </Box>
        )}

      </Container>
    </Box>
  );
}

// Reusable Styles
function pillStyle(id, selected) {
  const active = id === selected;
  return {
    px: 3,
    py: 2.5, // Taller pill for modern look
    borderRadius: 50,
    fontWeight: 800,
    fontSize: "0.9rem",
    bgcolor: active ? "primary.main" : "action.hover",
    color: active ? "primary.contrastText" : "text.secondary",
    border: "1px solid",
    borderColor: active ? "primary.main" : "divider",
    transition: "all 0.3s ease",
    "&:hover": {
      bgcolor: active ? "primary.dark" : "action.selected",
      borderColor: active ? "primary.dark" : "text.secondary",
      transform: "translateY(-2px)"
    }
  };
}
