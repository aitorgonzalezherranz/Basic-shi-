import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Plus, ArrowLeft } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${productId}`);
      setProduct(response.data);
    } catch (error) {
      console.error("Failed to fetch product", error);
      toast.error("Product not found");
      navigate("/shop");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    try {
      await axios.post(
        `${API}/cart`,
        { product_id: productId, quantity },
        { withCredentials: true }
      );
      toast.success("Added to cart");
      navigate("/cart");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505]" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-12" data-testid="product-detail-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <button
          onClick={() => navigate("/shop")}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8"
          data-testid="back-to-shop"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12" data-testid="product-detail-grid">
          {/* Product Image */}
          <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-900">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              data-testid="product-image"
            />
          </div>

          {/* Product Info */}
          <div>
            <div className="text-sm text-zinc-500 uppercase tracking-widest mb-4" data-testid="product-category">
              {product.category}
              {product.brand && ` • ${product.brand}`}
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }} data-testid="product-name">
              {product.name}
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed mb-8" data-testid="product-description">
              {product.description}
            </p>
            <div className="text-4xl font-bold mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif' }} data-testid="product-price">
              ${product.price}
            </div>

            {/* Quantity Selector */}
            <div className="mb-8">
              <label className="text-sm text-zinc-400 uppercase tracking-widest mb-3 block">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center"
                  data-testid="quantity-decrease"
                >
                  -
                </button>
                <span className="text-2xl font-medium w-12 text-center" data-testid="quantity-value">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center"
                  data-testid="quantity-increase"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={addToCart}
              className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
              data-testid="add-to-cart-btn"
            >
              <Plus className="w-5 h-5" />
              Add to Cart
            </button>

            {/* Stock Info */}
            <div className="mt-6 text-sm text-zinc-500" data-testid="stock-info">
              {product.stock > 0 ? (
                <span className="text-green-500">In Stock ({product.stock} available)</span>
              ) : (
                <span className="text-red-500">Out of Stock</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
