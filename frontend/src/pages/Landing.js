import { useNavigate } from "react-router-dom";
import { ChevronRight, User } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Landing() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, { withCredentials: true });
      setUser(response.data);
    } catch (error) {
      setUser(null);
    }
  };

  const handleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const featuredProducts = [
    {
      id: 1,
      name: "Premium Headphones",
      category: "Audio",
      image: "https://images.unsplash.com/photo-1744591433649-28069739f80b?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
    },
    {
      id: 2,
      name: "Urban Sneakers",
      category: "Footwear",
      image: "https://images.unsplash.com/photo-1770795945641-b05670167c8f?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
    },
    {
      id: 3,
      name: "Signature Fragrance",
      category: "Perfumes",
      image: "https://images.unsplash.com/photo-1561997837-ad5a1641dbd7?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505]" data-testid="landing-page">
      {/* Floating Nav */}
      <nav className="floating-nav flex items-center gap-8" data-testid="landing-nav">
        <div className="font-bold text-lg tracking-tight">Basic Shi</div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/shop')}
            className="text-zinc-400 hover:text-white transition-colors text-sm"
            data-testid="landing-nav-shop"
          >
            Shop
          </button>
          {user ? (
            <button
              onClick={() => navigate(user.is_admin ? '/admin' : '/dashboard')}
              className="btn-secondary text-sm flex items-center gap-2"
              data-testid="landing-nav-dashboard"
            >
              <User className="w-4 h-4" />
              {user.is_admin ? 'Admin' : 'Dashboard'}
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="btn-secondary text-sm"
              data-testid="landing-nav-login"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20" data-testid="hero-section">
        <div className="hero-glow" style={{ top: '20%', left: '10%' }}></div>
        <div className="hero-glow" style={{ bottom: '10%', right: '10%' }}></div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center relative z-10">
          <div className="mb-6 text-sm text-zinc-500 uppercase tracking-widest" data-testid="hero-subtitle">
            Premium Lifestyle Essentials
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }} data-testid="hero-title">
            Elevate Your
            <br />
            Everyday Style
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed" data-testid="hero-description">
            Curated collection of premium sneakers, audio gear, fragrances, and streetwear
            for the modern generation.
          </p>
          <div className="flex gap-4 justify-center" data-testid="hero-cta">
            <button
              onClick={() => navigate('/shop')}
              className="btn-primary flex items-center gap-2"
              data-testid="explore-collection-btn"
            >
              Explore Collection
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 md:py-32 max-w-7xl mx-auto px-6 md:px-12" data-testid="featured-products-section">
        <h2 className="text-3xl font-medium tracking-tight mb-12" style={{ fontFamily: 'Space Grotesk, sans-serif' }} data-testid="featured-title">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="featured-grid">
          {featuredProducts.map((product, idx) => (
            <div
              key={idx}
              onClick={() => navigate('/shop')}
              className="product-card group relative bg-transparent hover:bg-zinc-900/30 rounded-2xl p-4 border border-transparent hover:border-zinc-800 cursor-pointer"
              data-testid={`featured-product-${idx}`}
            >
              <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-zinc-900">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="text-sm text-zinc-500 uppercase tracking-widest mb-2">
                {product.category}
              </div>
              <div className="text-xl font-medium">
                {product.name}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 md:py-32 max-w-7xl mx-auto px-6 md:px-12" data-testid="categories-section">
        <h2 className="text-3xl font-medium tracking-tight mb-12" style={{ fontFamily: 'Space Grotesk, sans-serif' }} data-testid="categories-title">
          Shop by Category
        </h2>
        <div className="flex flex-wrap gap-4" data-testid="category-chips">
          {['Zapatillas', 'Auriculares', 'Perfumes', 'Mochilas', 'Relojes', 'Ropa', 'Altavoces', 'Gorras'].map((cat) => (
            <button
              key={cat}
              onClick={() => navigate('/shop', { state: { category: cat.toLowerCase() } })}
              className="category-chip"
              data-testid={`category-chip-${cat.toLowerCase()}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12" data-testid="footer">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center text-zinc-500 text-sm">
          <p>© 2026 Basic Shi. Premium lifestyle essentials.</p>
        </div>
      </footer>
    </div>
  );
}
