import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText
} from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useThemeContext } from "../../context/ThemeContext";
import { useTheme } from "@mui/material";
import { IMG_BASE_URL, getImageUrl } from "../../api/api";




export default function Navbar() {
  const { cart, wishlist } = useCart();
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth(); // Use context
  const { mode, toggleColorMode } = useThemeContext();
  const theme = useTheme();
  const role = user?.role; // Get role from context

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = cart.items.filter(item => item.productId).reduce((sum, item) => sum + item.quantity, 0);

  const openMenu = (event) => setAnchorEl(event.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const logout = () => {
    authLogout(); // Clear context and session
    navigate("/"); // Redirect to home (which will show login popup if appropriate)
  };

  const drawerContent = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center", height: "100%", bgcolor: "background.default", color: "text.primary" }}>
      <Typography variant="h6" sx={{ my: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
        <FitnessCenterIcon color="primary" /> GYM FIT PRO
      </Typography>
      <Divider />
      <List>
        {role !== "delivery_boy" && (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/products" sx={{ textAlign: "center" }}>
                <ListItemText primary="Shop" primaryTypographyProps={{ fontWeight: 700 }} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/workouts" sx={{ textAlign: "center" }}>
                <ListItemText primary="Workouts" primaryTypographyProps={{ fontWeight: 700 }} />
              </ListItemButton>
            </ListItem>
          </>
        )}

        {!["admin", "delivery_boy"].includes(role) && (
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/wishlist" sx={{ textAlign: "center" }}>
              <ListItemText primary="Wishlist" primaryTypographyProps={{ fontWeight: 700 }} />
            </ListItemButton>
          </ListItem>
        )}

        {role === "admin" && (
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/admin" sx={{ textAlign: "center", color: "primary.main" }}>
              <ListItemText primary="Admin Dashboard" primaryTypographyProps={{ fontWeight: 900 }} />
            </ListItemButton>
          </ListItem>
        )}

        {/* Profile Links for Mobile */}
        <Divider sx={{ my: 1 }} />
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/profile" sx={{ textAlign: "center" }}>
            <ListItemText primary="My Profile" />
          </ListItemButton>
        </ListItem>
        {role !== "delivery_boy" && (
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/orders" sx={{ textAlign: "center" }}>
              <ListItemText primary="My Orders" />
            </ListItemButton>
          </ListItem>
        )}
        <ListItem disablePadding>
          <ListItemButton onClick={logout} sx={{ textAlign: "center", color: "error.main" }}>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 800 }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" sx={{ borderBottom: "2px solid", borderColor: "primary.main", bgcolor: "background.paper", color: "text.primary" }}>
      <Toolbar>
        {/* MOBILE MENU ICON */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: "none" } }} // Show only on request (xs)
        >
          <MenuIcon />
        </IconButton>

        {/* LOGO */}
        <Typography sx={{ flexGrow: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <FitnessCenterIcon color="primary" />
          <Link to="/home" style={{ color: theme.palette.text.primary, textDecoration: "none", fontWeight: 900 }}>
            GYM FIT PRO
          </Link>
        </Typography>

        {/* DESKTOP LINKS */}
        <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center" }}>
          {/* SHOP */}
          {role !== "delivery_boy" && (
            <Button component={Link} to="/products" sx={{ color: "text.primary", fontWeight: 800 }}>
              Shop
            </Button>
          )}

          {/* WORKOUT VIDEOS */}
          {role !== "delivery_boy" && (
            <Button component={Link} to="/workouts" sx={{ color: "text.primary", fontWeight: 800, ml: 1 }}>
              Workouts
            </Button>
          )}

          {/* ADMIN LINK */}
          {role === "admin" && (
            <Button component={Link} to="/admin" sx={{ color: "primary.main", fontWeight: 900, ml: 2 }}>
              Admin
            </Button>
          )}
        </Box>

        {/* RIGHT SIDE ICONS (Always visible or partially visible) */}

        {/* CART (Always visible) */}
        {!["admin", "delivery_boy"].includes(role) && (
          <IconButton component={Link} to="/cart" sx={{ ml: { xs: 0, sm: 2 } }}>
            <Badge badgeContent={cartCount} color="error">
              <ShoppingCartIcon color="primary" />
            </Badge>
          </IconButton>
        )}

        {/* WISHLIST (Desktop Only - moved to drawer on mobile to save space, OR keep it?) */}
        {/* User usually likes Wishlist accessible. Let's keep it desktop only and put in drawer for mobile to avoid clutter */}
        <Box sx={{ display: { xs: "none", sm: "block" } }}>
          {!["admin", "delivery_boy"].includes(role) && (
            <IconButton component={Link} to="/wishlist" sx={{ ml: 1 }}>
              <Badge badgeContent={wishlist.length} color="secondary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.1 8.64l-.1.1-.11-.12C10.14 6.6 7.42 6.6 5.47 8.56 3.52 10.51 3.52 13.23 5.47 15.18l6.53 6.53 6.53-6.53c1.95-1.95 1.95-4.67 0-6.62-1.95-1.96-4.67-1.96-6.53 0z" fill="#FF5252" />
                </svg>
              </Badge>
            </IconButton>
          )}
        </Box>

        {/* THEME TOGGLE (Always visible) */}
        <IconButton onClick={toggleColorMode} sx={{ ml: { xs: 1, sm: 2 }, color: "text.primary" }}>
          {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>

        {/* PROFILE AVATAR (Desktop Only - Mobile has it in Drawer? OR keep it?) */}
        {/* Usually Avatar is nice to have. But if we have Hamburger, maybe hide Avatar on mobile and put Profile links in Drawer? */}
        {/* Let's keep Avatar on Desktop only to save space on mobile header */}
        <Box sx={{ display: { xs: "none", sm: "block" } }}>
          <IconButton onClick={openMenu} sx={{ ml: 1 }}>
            <Avatar
              sx={{
                bgcolor: "primary.main",
                color: "#000",
                fontWeight: 900,
                width: 36,
                height: 36
              }}
              src={user?.profileImage ? getImageUrl(user.profileImage) : undefined}
            >
              {role?.[0]?.toUpperCase() || "U"}
            </Avatar>
          </IconButton>
        </Box>

        {/* DESKTOP MENU for Avatar */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={closeMenu}
          PaperProps={{
            sx: {
              bgcolor: "background.paper",
              color: "text.primary",
              minWidth: 180,
              border: "1px solid",
              borderColor: "divider"
            }
          }}
        >
          <MenuItem
            onClick={() => {
              closeMenu();
              navigate("/profile");
            }}
            sx={{ fontWeight: 700 }}
          >
            My Profile
          </MenuItem>

          {role !== "delivery_boy" && (
            <MenuItem
              onClick={() => {
                closeMenu();
                navigate("/orders");
              }}
              sx={{ fontWeight: 700 }}
            >
              My Orders
            </MenuItem>
          )}

          <Divider sx={{ my: 1 }} />

          <MenuItem
            onClick={() => {
              closeMenu();
              logout();
            }}
            sx={{ color: "#ff5252", fontWeight: 800 }}
          >
            Logout
          </MenuItem>
        </Menu>

      </Toolbar>

      {/* MOBILE DRAWER */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} // Better open performance on mobile
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 }
        }}
      >
        {drawerContent}
      </Drawer>
    </AppBar>
  );
}
