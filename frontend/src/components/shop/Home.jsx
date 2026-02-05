
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
          minHeight: { xs: "85vh", md: "95vh" },
          background: (theme) => `linear-gradient(to bottom, rgba(0,0,0,0.4), ${theme.palette.background.default}), url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          display: "flex",
          alignItems: "center",
          position: "relative",
          pt: { xs: 8, md: 0 } // Extra padding for mobile navbar
        }}
      >
        <Container maxWidth="lg">
          <Grid container>
            <Grid size={{ xs: 12, md: 8 }}>
              <motion.div variants={fadeInUp}>
                <Typography variant="h1" sx={{
                  fontWeight: 900,
                  fontSize: { xs: "3.5rem", sm: "4.5rem", md: "6rem" }, // Responsive font size
                  lineHeight: { xs: 1, md: 0.9 },
                  letterSpacing: { xs: "-1px", md: "-2px" },
                  textTransform: "uppercase",
                  mb: 2,
                  textShadow: "0 10px 30px rgba(0,0,0,0.5)"
                }}>
                  Unleash Your <br />
                  <Box component="span" sx={{
                    color: "transparent",
                    WebkitTextStroke: (theme) => `2px ${theme.palette.primary.main}`,
                    textShadow: "none"
                  }}>Inner Beast</Box>
                </Typography>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Typography variant="h5" sx={{
                  color: "rgba(255,255,255,0.8)",
                  mb: 4,
                  maxWidth: "600px",
                  fontWeight: 400,
                  fontSize: { xs: "1rem", md: "1.25rem" },
                  lineHeight: 1.6
                }}>
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
                      px: 5,
                      py: 1.5,
                      borderRadius: 1,
                      width: { xs: "100%", sm: "auto" }, // Full width on mobile
                      boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                      "&:hover": { bgcolor: "white", color: "black", transform: "translateY(-2px)" },
                      transition: "all 0.3s"
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
                      color: "white",
                      borderColor: "rgba(255,255,255,0.5)",
                      fontWeight: 800,
                      fontSize: "1.1rem",
                      px: 5,
                      py: 1.5,
                      borderRadius: 1,
                      width: { xs: "100%", sm: "auto" }, // Full width on mobile
                      backdropFilter: "blur(5px)",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.1)", borderColor: "white" }
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
      <Box sx={{ py: { xs: 8, md: 12 } }}>
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
                    p: { xs: 4, md: 5 },
                    borderRadius: 4,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(25,25,25,0.4)", // Darker translucent bg
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
                      background: "rgba(30,30,30,0.6)",
                      boxShadow: (theme) => `0 20px 40px -10px ${theme.palette.primary.main}30`
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
                      p: 2,
                      bgcolor: "rgba(255, 235, 59, 0.1)", // Subtle highlight behind icon
                      borderRadius: "50%",
                      display: "inline-flex"
                    }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" fontWeight={800} gutterBottom sx={{ letterSpacing: 0.5 }}>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.6, fontSize: "0.95rem" }}>
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
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.paper", borderRadius: { xs: "30px 30px 0 0", md: "50px 50px 0 0" }, mt: -5, position: "relative", zIndex: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "end" }, mb: 6, gap: 2 }}>
            <Box>
              <Typography variant="overline" color="primary" fontWeight={800} letterSpacing={2}>Only the Best</Typography>
              <Typography variant="h3" fontWeight={900} sx={{ fontSize: { xs: "2rem", md: "3rem" } }}>Featured Deals</Typography>
            </Box>
            <Button component={Link} to="/products" endIcon={<ArrowForwardIcon />} sx={{ color: "text.primary", fontWeight: 700 }}>View All Products</Button>
          </Box>

          <Grid container spacing={4}>
            {[
              { name: "Gold Standard Whey", price: "₹2,499", img: wheyImg },
              { name: "Serious Mass Gainer", price: "₹2,999", img: massGainerImg },
              { name: "Pro Dumbbell Set", price: "₹999", img: dumbbellImg },
              { name: "Micronized Creatine", price: "₹699", img: opti }
            ].map((product, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  style={{ height: "100%" }}
                >
                  <Card sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: "background.default",
                    color: "text.primary",
                    borderRadius: 4,
                    boxShadow: "none",
                    border: "1px solid",
                    borderColor: "divider",
                    position: "relative",
                    overflow: "hidden",
                    "&:hover .overlay": { opacity: 1 },
                    "&:hover img": { transform: "scale(1.1)" }
                  }}>
                    <Box sx={{ position: "relative", pt: "100%", overflow: "hidden", bgcolor: "white" }}>
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
                          p: 3,
                          transition: "0.5s"
                        }}
                      />
                      {/* Overlay with Add to Cart */}
                      <Box className="overlay" sx={{
                        position: "absolute",
                        inset: 0,
                        bgcolor: "rgba(0,0,0,0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0,
                        transition: "0.3s",
                        backdropFilter: "blur(2px)"
                      }}>
                        <Button
                          component={Link}
                          to="/products"
                          variant="contained"
                          startIcon={<ShoppingCartIcon />}
                          sx={{
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                            fontWeight: 800,
                            borderRadius: 10,
                            px: 3,
                            "&:hover": { bgcolor: "white", color: "black" }
                          }}
                        >
                          View Details
                        </Button>
                      </Box>
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={600} fontSize={12} textTransform="uppercase" letterSpacing={1} mb={0.5}>
                        Best Seller
                      </Typography>
                      <Typography variant="h6" fontWeight={800} noWrap gutterBottom title={product.name}>{product.name}</Typography>
                      <Typography variant="h6" color="primary.main" fontWeight={900}>{product.price}</Typography>
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
        py: { xs: 8, md: 16 },
        textAlign: "center",
        background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        position: "relative"
      }}>
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h2" fontWeight={900} gutterBottom textTransform="uppercase" sx={{ fontSize: { xs: "2.5rem", md: "4rem" }, textShadow: "0 5px 15px rgba(0,0,0,0.5)" }}>
              Ready to <span style={{ color: "#ffeb3b" }}>Transform?</span>
            </Typography>
            <Typography variant="h6" color="rgba(255,255,255,0.8)" mb={6} sx={{ maxWidth: 600, mx: "auto", fontSize: { xs: "1rem", md: "1.25rem" } }}>
              Join thousands of elite athletes who trust us for their daily nutrition and training gear.
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
                borderRadius: 50,
                boxShadow: "0 10px 30px rgba(255, 235, 59, 0.3)",
                "&:hover": { bgcolor: "white", color: "text.primary", transform: "scale(1.05)" },
                transition: "all 0.3s"
              }}
            >
              Get Started Now
            </Button>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}
