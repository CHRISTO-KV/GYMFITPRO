
import { Box, Typography, Button, Grid, Container, Stack, Card, CardContent, CardMedia, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

// Reusing existing image imports
import wheyImg from "../img/1118910_1_af26fc31-6747-4679-8e5f-00dc04b9aecd.webp";
import dumbbellImg from "../img/dumbbell_set.jpg";
import opti from "../img/Optimum-Nutrition-_ON_-Micronised-Creatine-Powder-250gm.webp";
import massGainerImg from "../img/Front_36a235e1-a06c-438e-9896-5cde5711666d.webp";



const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Home() {
  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", color: "text.primary", overflowX: "hidden" }}>
      {/* HERO SECTION */}
      <Box
        component={motion.div}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        sx={{
          minHeight: "95vh",
          background: (theme) => `linear-gradient(to bottom, rgba(0,0,0,0.3), ${theme.palette.background.default}), url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          display: "flex",
          alignItems: "center",
          position: "relative"
        }}
      >
        <Container maxWidth="lg">
          <Grid container>
            <Grid size={{ xs: 12, md: 8 }}>
              <motion.div variants={fadeInUp}>
                <Typography variant="h1" sx={{
                  fontWeight: 900,
                  fontSize: { xs: "3rem", md: "5.5rem" },
                  lineHeight: 0.9,
                  letterSpacing: "-2px",
                  textTransform: "uppercase",
                  mb: 2
                }}>
                  Unleash Your <br />
                  <Box component="span" sx={{ color: "transparent", WebkitTextStroke: (theme) => `2px ${theme.palette.primary.main}` }}>Inner Beast</Box>
                </Typography>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Typography variant="h5" sx={{ color: "text.secondary", mb: 4, maxWidth: "600px", fontWeight: 300 }}>
                  Premium supplements and gear designed for elite performance.
                  Elevate your training with the best in the industry.
                </Typography>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    component={Link}
                    to="/products"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      fontWeight: 800,
                      fontSize: "1.1rem",
                      px: 4,
                      py: 1.5,
                      borderRadius: 0,
                      "&:hover": { bgcolor: "background.paper", color: "text.primary" }
                    }}
                  >
                    Shop Now
                  </Button>
                  <Button
                    component={Link}
                    to="/orders"
                    variant="outlined"
                    size="large"
                    sx={{
                      color: "text.primary",
                      borderColor: "text.primary",
                      fontWeight: 800,
                      fontSize: "1.1rem",
                      px: 4,
                      py: 1.5,
                      borderRadius: 0,
                      "&:hover": { bgcolor: "action.hover", borderColor: "text.primary" }
                    }}
                  >
                    My Orders
                  </Button>
                </Stack>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FEATURES SECTION */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Grid container spacing={4} justifyContent="center">
              {[
                { icon: <VerifiedIcon sx={{ fontSize: 50 }} />, title: "Certified Quality", desc: "100% Authentic products directly from brands." },
                { icon: <LocalShippingIcon sx={{ fontSize: 50 }} />, title: "Express Delivery", desc: "Get your gains delivered to your doorstep fast." },
                { icon: <FitnessCenterIcon sx={{ fontSize: 50 }} />, title: "Pro Equipment", desc: "Gear used by professional bodybuilders." }
              ].map((feature, idx) => (
                <Grid size={{ xs: 12, md: 4 }} key={idx}>
                  <Box sx={{
                    p: 4,
                    borderRadius: 4,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.03)",
                    backdropFilter: "blur(10px)",
                    transition: "all 0.4s ease",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                    "&:hover": {
                      borderColor: "primary.main",
                      transform: "translateY(-10px)",
                      background: "action.hover",
                      boxShadow: (theme) => `0 10px 30px -10px ${theme.palette.primary.main}40`
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "4px",
                      background: (theme) => theme.palette.primary.main,
                      transform: "scaleX(0)",
                      transformOrigin: "left",
                      transition: "transform 0.4s ease"
                    },
                    "&:hover::before": {
                      transform: "scaleX(1)"
                    }
                  }}>
                    <Box sx={{
                      color: "primary.main",
                      mb: 3,
                      filter: (theme) => `drop-shadow(0 0 10px ${theme.palette.primary.main}50)`
                    }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" fontWeight={800} gutterBottom sx={{ letterSpacing: 1 }}>
                      {feature.title}
                    </Typography>
                    <Typography color="#aaa" sx={{ lineHeight: 1.6 }}>
                      {feature.desc}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* FEATURED PRODUCTS */}
      <Box sx={{ py: 10, bgcolor: "background.paper" }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "end", mb: 6 }}>
            <Box>
              <Typography variant="overline" color="primary" fontWeight={800} letterSpacing={2}>Only the Best</Typography>
              <Typography variant="h3" fontWeight={900}>Featured Deals</Typography>
            </Box>
            <Button component={Link} to="/products" endIcon={<ArrowForwardIcon />} sx={{ color: "text.primary" }}>View All</Button>
          </Box>

          <Grid container spacing={4}>
            {[
              { name: "Gold Standard Whey", price: "₹2,499", img: wheyImg },
              { name: "Serious Mass Gainer", price: "₹2,999", img: massGainerImg },
              { name: "Pro Dumbbell Set", price: "₹999", img: dumbbellImg },
              { name: "Micronized Creatine", price: "₹699", img: opti }
            ].map((product, idx) => (
              <Grid size={{ xs: 12, sm: 3, md: 3 }} key={idx}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  style={{ height: "100%" }}
                >

                  <Card sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: "background.default",
                    color: "text.primary",
                    borderRadius: 0,
                    position: "relative",
                    overflow: "hidden",
                    "&:hover .overlay": { opacity: 1 },
                    "&:hover img": { transform: "scale(1.1)" }
                  }}>
                    <Box sx={{ position: "relative", pt: "100%", overflow: "hidden" }}>
                      <CardMedia
                        component="img"
                        image={product.img}
                        alt={product.name}
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          p: 2,
                          bgcolor: "white",
                          transition: "0.5s"
                        }}
                      />
                      {/* Overlay with Add to Cart */}
                      <Box className="overlay" sx={{
                        position: "absolute",
                        inset: 0,
                        bgcolor: "rgba(0,0,0,0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0,
                        transition: "0.3s"
                      }}>
                        <IconButton component={Link} to="/products" sx={{ bgcolor: "primary.main", "&:hover": { bgcolor: "white", color: "black" } }}>
                          <ShoppingCartIcon sx={{ color: "primary.contrastText" }} />
                        </IconButton>
                      </Box>
                    </Box>
                    <CardContent>
                      <Typography variant="h6" fontWeight={700} noWrap>{product.name}</Typography>
                      <Typography variant="h6" color="primary.main" fontWeight={800}>{product.price}</Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA SECTION */}
      <Box sx={{
        py: 12,
        textAlign: "center",
        background: `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url(https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}>
        <Container maxWidth="md">
          <Typography variant="h2" fontWeight={900} gutterBottom textTransform="uppercase">
            Ready to Transform?
          </Typography>
          <Typography variant="h6" color="#ccc" mb={4}>
            Join thousands of athletes who trust us for their fitness journey.
          </Typography>
          <Button
            component={Link}
            to="/signup"
            variant="contained"
            size="large"
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontWeight: 800,
              fontSize: "1.2rem",
              px: 6,
              py: 2,
              borderRadius: 0,
              "&:hover": { bgcolor: "background.paper", color: "text.primary" }
            }}
          >
            Get Started
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
