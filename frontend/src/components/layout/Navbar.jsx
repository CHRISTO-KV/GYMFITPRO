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
  Divider
} from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useThemeContext } from "../../context/ThemeContext";
import { useTheme } from "@mui/material";




export default function Navbar() {
  const { cart, wishlist } = useCart();
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth(); // Use context
  const { mode, toggleColorMode } = useThemeContext();
  const theme = useTheme();
  const role = user?.role; // Get role from context

  const [anchorEl, setAnchorEl] = useState(null);

  const cartCount = cart.items.filter(item => item.productId).reduce((sum, item) => sum + item.quantity, 0);

  const openMenu = (event) => setAnchorEl(event.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  const logout = () => {
    authLogout(); // Clear context and session
    navigate("/"); // Redirect to home (which will show login popup if appropriate)
  };

  return (
    <AppBar position="sticky" sx={{ borderBottom: "2px solid", borderColor: "primary.main", bgcolor: "background.paper", color: "text.primary" }}>
      <Toolbar>

        {/* LOGO */}
        <Typography sx={{ flexGrow: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <FitnessCenterIcon color="primary" />
          <Link to="/home" style={{ color: theme.palette.text.primary, textDecoration: "none", fontWeight: 900 }}>
            GYM FIT PRO
          </Link>
        </Typography>

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

        {/* CART */}
        {!["admin", "delivery_boy"].includes(role) && (
          <IconButton component={Link} to="/cart" sx={{ ml: 2 }}>
            <Badge badgeContent={cartCount} color="error">
              <ShoppingCartIcon color="primary" />
            </Badge>
          </IconButton>
        )}

        {/* WISHLIST */}
        {!["admin", "delivery_boy"].includes(role) && (
          <IconButton component={Link} to="/wishlist" sx={{ ml: 1 }}>
            <Badge badgeContent={wishlist.length} color="secondary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.1 8.64l-.1.1-.11-.12C10.14 6.6 7.42 6.6 5.47 8.56 3.52 10.51 3.52 13.23 5.47 15.18l6.53 6.53 6.53-6.53c1.95-1.95 1.95-4.67 0-6.62-1.95-1.96-4.67-1.96-6.53 0z" fill="#FF5252" />
              </svg>
            </Badge>
          </IconButton>
        )}

        {/* ADMIN LINK */}
        {role === "admin" && (
          <Button component={Link} to="/admin" sx={{ color: "primary.main", fontWeight: 900, ml: 2 }}>
            Admin
          </Button>
        )}

        {/* THEME TOGGLE */}
        <IconButton onClick={toggleColorMode} sx={{ ml: 2, color: "text.primary" }}>
          {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>

        {/* PROFILE AVATAR */}
        <IconButton onClick={openMenu} sx={{ ml: 1 }}>
          <Avatar
            sx={{
              bgcolor: "primary.main",
              color: "#000",
              fontWeight: 900,
              width: 36,
              height: 36
            }}
            src={user?.profileImage ? `http://localhost:5000/uploads/${user.profileImage}` : undefined}
          >
            {role?.[0]?.toUpperCase() || "U"}
          </Avatar>
        </IconButton>

        {/* DROPDOWN MENU */}
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
    </AppBar>
  );
}
