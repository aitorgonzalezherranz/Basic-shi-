import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function FloatingNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Only check auth once on mount, not on every route change
    checkAuth();
  }, []);

  useEffect(() => {
    // Fetch cart count when user changes
    if (user) {
      fetchCartCount();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, { withCredentials: true });
      setUser(response.data);
    } catch (error) {
      // Don't set user to null if request fails - keep existing state
      if (error.response?.status === 401) {
        setUser(null);
      }
    }
  };

  const fetchCartCount = async () => {
    try {
      const response = await axios.get(`${API}/cart`, { withCredentials: true });
      setCartCount(response.data.length);
    } catch (error) {
      console.error("Failed to fetch cart", error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <nav className="floating-nav flex items-center gap-8" data-testid="floating-nav">
      <Link to="/" className="font-bold text-lg tracking-tight" data-testid="nav-home">
        Basic Shi
      </Link>
      <div className="flex items-center gap-6">
        <Link to="/shop" className="text-zinc-400 hover:text-white transition-colors text-sm" data-testid="nav-shop">
          Shop
        </Link>
        {user ? (
          <>
            <Link to="/cart" className="relative" data-testid="nav-cart">
              <ShoppingCart className="w-5 h-5 text-zinc-400 hover:text-white transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center" data-testid="cart-count">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/dashboard" data-testid="nav-dashboard">
              <User className="w-5 h-5 text-zinc-400 hover:text-white transition-colors" />
            </Link>
            <button onClick={handleLogout} data-testid="nav-logout">
              <LogOut className="w-5 h-5 text-zinc-400 hover:text-white transition-colors" />
            </button>
          </>
        ) : (
          <button
            onClick={handleLogin}
            className="btn-secondary text-sm"
            data-testid="nav-login"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
