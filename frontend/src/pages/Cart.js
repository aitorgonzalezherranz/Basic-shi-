import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Trash2, Plus, Minus } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API}/cart`, { withCredentials: true });
      setCartItems(response.data);
    } catch (error) {
      console.error("Failed to fetch cart", error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await axios.put(
        `${API}/cart/${cartItemId}?quantity=${newQuantity}`,
        {},
        { withCredentials: true }
      );
      fetchCart();
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      await axios.delete(`${API}/cart/${cartItemId}`, { withCredentials: true });
      toast.success("Removed from cart");
      fetchCart();
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505]" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-12" data-testid="cart-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-12" style={{ fontFamily: 'Space Grotesk, sans-serif' }} data-testid="cart-title">
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-24" data-testid="empty-cart">
            <p className="text-zinc-400 text-lg mb-6">Your cart is empty</p>
            <button
              onClick={() => navigate("/shop")}
              className="btn-primary"
              data-testid="continue-shopping-btn"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6" data-testid="cart-items">
              {cartItems.map((item) => (
                <div
                  key={item.cart_item_id}
                  className="glass-panel rounded-2xl p-6 flex gap-6"
                  data-testid={`cart-item-${item.cart_item_id}`}
                >
                  <div className="w-32 h-32 rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-zinc-500 uppercase tracking-widest mb-2">
                      {item.product.category}
                    </div>
                    <h3 className="text-xl font-medium mb-2">{item.product.name}</h3>
                    <div className="text-2xl font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      ${item.product.price}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.cart_item_id)}
                      className="text-zinc-400 hover:text-red-500 transition-colors"
                      data-testid={`remove-item-${item.cart_item_id}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center"
                        data-testid={`decrease-quantity-${item.cart_item_id}`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-lg font-medium w-8 text-center" data-testid={`quantity-${item.cart_item_id}`}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center"
                        data-testid={`increase-quantity-${item.cart_item_id}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="glass-panel rounded-2xl p-8 sticky top-24" data-testid="order-summary">
                <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Order Summary
                </h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span data-testid="subtotal">${calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t border-zinc-800 pt-4 flex justify-between text-2xl font-semibold">
                    <span>Total</span>
                    <span data-testid="total">${calculateTotal()}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/checkout")}
                  className="btn-primary w-full text-lg"
                  data-testid="checkout-btn"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
