import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Shop() {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(location.state?.category || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url = selectedCategory
        ? `${API}/products?category=${selectedCategory}`
        : `${API}/products`;
      const response = await axios.get(url);
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    try {
      await axios.post(
        `${API}/cart`,
        { product_id: productId, quantity: 1 },
        { withCredentials: true }
      );
      toast.success("Added to cart");
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Please sign in to add items to cart");
        const redirectUrl = window.location.origin + '/dashboard';
        setTimeout(() => {
          window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
        }, 1500);
      } else {
        toast.error("Failed to add to cart");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-12" data-testid="shop-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }} data-testid="shop-title">
            Shop All Products
          </h1>
          <p className="text-lg text-zinc-400" data-testid="shop-subtitle">
            Discover our curated collection of premium lifestyle essentials
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-12" data-testid="category-filter">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`category-chip ${selectedCategory === null ? 'active' : ''}`}
              data-testid="category-all"
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                data-testid={`category-filter-${cat}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24" data-testid="loading-spinner">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24" data-testid="no-products">
            <p className="text-zinc-400 text-lg">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12" data-testid="products-grid">
            {products.map((product) => (
              <div
                key={product.product_id}
                className="product-card group relative bg-transparent rounded-2xl p-4 border border-transparent"
                data-testid={`product-card-${product.product_id}`}
              >
                <div
                  onClick={() => navigate(`/product/${product.product_id}`)}
                  className="cursor-pointer"
                >
                  <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-zinc-900">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="text-sm text-zinc-500 uppercase tracking-widest mb-2">
                    {product.category}
                    {product.brand && ` • ${product.brand}`}
                  </div>
                  <div className="text-xl font-medium mb-2">
                    {product.name}
                  </div>
                  <div className="text-2xl font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    ${product.price}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product.product_id);
                  }}
                  className="mt-4 w-full btn-secondary flex items-center justify-center gap-2"
                  data-testid={`add-to-cart-${product.product_id}`}
                >
                  <Plus className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
