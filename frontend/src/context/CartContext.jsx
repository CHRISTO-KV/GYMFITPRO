import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [wishlist, setWishlist] = useState([]);

  const loadCart = async () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      setCart({ items: [] });
      return;
    }

    try {
      const res = await api.get(`/cart/${userId}`);
      setCart(res.data || { items: [] });
    } catch (err) {
      console.error("Cart load error:", err);
      setCart({ items: [] });
    }
  };

  const loadWishlist = async () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      setWishlist([]);
      return;
    }

    try {
      const res = await api.get(`/wishlist`);
      setWishlist(res.data || []);
    } catch (err) {
      console.error("Wishlist load error:", err);
      setWishlist([]);
    }
  };

  const toggleWishlist = async (productId) => {
    try {
      const res = await api.post(`/wishlist/toggle`, { productId });
      await loadWishlist();
      return res.data;
    } catch (err) {
      console.error("Toggle wishlist error:", err);
      throw err;
    }
  };

  useEffect(() => {
    loadCart();
    loadWishlist();
  }, []);

  return (
    <CartContext.Provider value={{ cart, loadCart, wishlist, loadWishlist, toggleWishlist }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
};
