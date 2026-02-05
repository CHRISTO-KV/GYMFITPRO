import { Routes, Route, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

/* LAYOUT */
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

/* AUTH */
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import DeliveryBoySignup from "./components/auth/DeliveryBoySignup";

/* USER */
import Profile from "./components/user/Profile";

/* SHOP */
import Home from "./components/shop/Home";
import ProductList from "./components/shop/ProductList";
import ProductDetails from "./components/shop/ProductDetails";
import Cart from "./components/shop/Cart";
import Checkout from "./components/shop/Checkout";
import OrderSuccess from "./components/shop/OrderSuccess";
import MyOrders from "./components/shop/MyOrders";
import WorkoutVideos from "./components/shop/WorkoutVideos";
import WorkoutVideosUser from "./components/shop/WorkoutVideosUser";
import Wishlist from "./components/shop/Wishlist";

/* ADMIN */
import Dashboard from "./components/admin/Dashboard";
import Users from "./components/admin/Users";
import Products from "./components/admin/Products"; // ✔ FIXED IMPORT
import AddProduct from "./components/admin/AddProduct";
import UploadWorkoutVideo from "./components/admin/UploadWorkoutVideo";
import EditWorkoutVideo from "./components/admin/EditWorkoutVideo";
import ManageWorkoutVideos from "./components/admin/ManageWorkoutVideos";
import Orders from "./components/admin/Orders";
import ManageDeliveryBoys from "./components/admin/ManageDeliveryBoys";
import DeliveryBoyDashboard from "./components/admin/DeliveryBoyDashboard";

/* ROUTE GUARD */
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  const location = useLocation();
  const { user } = useAuth();

  // Routes where we don't want the Navbar/Footer
  const hideLayout = ["/signup", "/delivery-boy-signup", "/login"].includes(location.pathname);

  // Show Login Modal if we are on Home ("/") and NOT logged in
  const showLoginModal = location.pathname === "/" && !user;

  return (
    <>
      {/* Main Content Wrapper - Blurred if Modal is Open */}
      <div style={showLoginModal ? { filter: "blur(8px)", pointerEvents: "none" } : {}}>
        {!hideLayout && <Navbar />}

        <Routes>
          {/* AUTH */}
          {/* Route "/" now renders Home. Login handles itself via Modal above this content */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/delivery-boy-signup" element={<DeliveryBoySignup />} />

          {/* SHOP */}
          <Route path="/home" element={<Home />} /> {/* Kept alias /home for safety */}
          <Route path="/products" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
          <Route path="/products/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/workout-videos" element={<ProtectedRoute><WorkoutVideos /></ProtectedRoute>} />
          <Route path="/workouts" element={<ProtectedRoute><WorkoutVideosUser /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* ADMIN */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><Dashboard /></ProtectedRoute>} />
          <Route path="/admin-dashboard" element={<ProtectedRoute role="admin"><Dashboard /></ProtectedRoute>} /> {/* Support legacy URL */}
          <Route path="/admin/products" element={<ProtectedRoute role="admin"><Products /></ProtectedRoute>} /> {/* ✔ FIXED */}
          <Route path="/admin/orders" element={<ProtectedRoute role="admin"><Orders /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="admin"><Users /></ProtectedRoute>} />
          <Route path="/admin/add-product" element={<ProtectedRoute role="admin"><AddProduct /></ProtectedRoute>} />

          {/* WORKOUT ADMIN */}
          <Route path="/admin/upload-workout-video" element={<ProtectedRoute role="admin"><UploadWorkoutVideo /></ProtectedRoute>} />
          <Route path="/admin/edit-workout-video/:id" element={<ProtectedRoute role="admin"><EditWorkoutVideo /></ProtectedRoute>} />
          <Route path="/admin/workout-videos" element={<ProtectedRoute role="admin"><ManageWorkoutVideos /></ProtectedRoute>} />
          <Route path="/admin/manage-delivery-boys" element={<ProtectedRoute role="admin"><ManageDeliveryBoys /></ProtectedRoute>} />

          {/* DELIVERY BOY */}
          <Route path="/delivery-dashboard" element={<ProtectedRoute role="delivery_boy"><DeliveryBoyDashboard /></ProtectedRoute>} />
        </Routes>

        {!hideLayout && <Footer />}
      </div>

      {/* Login Modal Overlay */}
      {showLoginModal && <Login isModal={true} />}
    </>
  );
}
