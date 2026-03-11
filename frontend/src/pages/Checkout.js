import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Placeholder PayPal Client ID - user needs to provide their own
const PAYPAL_CLIENT_ID = "YOUR_PAYPAL_CLIENT_ID";

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState(null);

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

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2);
  };

  const createOrder = async () => {
    try {
      const items = cartItems.map(item => ({
        product_id: item.product_id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      }));

      const response = await axios.post(
        `${API}/orders`,
        {
          items,
          total: parseFloat(calculateTotal())
        },
        { withCredentials: true }
      );

      setOrderId(response.data.order_id);
      return response.data.order_id;
    } catch (error) {
      console.error("Failed to create order", error);
      toast.error("Failed to create order");
      throw error;
    }
  };

  const handlePayPalApprove = async (data) => {
    try {
      await axios.patch(
        `${API}/orders/${orderId}`,
        null,
        {
          params: {
            status: "completed",
            paypal_order_id: data.orderID
          },
          withCredentials: true
        }
      );
      toast.success("Payment successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to update order", error);
      toast.error("Payment processing failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505]" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#050505] pt-24 pb-12" data-testid="empty-cart-checkout">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-semibold tracking-tight mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Your cart is empty
          </h1>
          <button onClick={() => navigate("/shop")} className="btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-12" data-testid="checkout-page">
      <div className="max-w-3xl mx-auto px-6 md:px-12">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-12" style={{ fontFamily: 'Space Grotesk, sans-serif' }} data-testid="checkout-title">
          Checkout
        </h1>

        {/* Order Summary */}
        <div className="glass-panel rounded-2xl p-8 mb-8" data-testid="checkout-summary">
          <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Order Summary
          </h2>
          <div className="space-y-4 mb-6">
            {cartItems.map((item) => (
              <div key={item.cart_item_id} className="flex justify-between text-zinc-400" data-testid={`checkout-item-${item.cart_item_id}`}>
                <span>
                  {item.product.name} x {item.quantity}
                </span>
                <span>${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-zinc-800 pt-4 flex justify-between text-2xl font-semibold">
            <span>Total</span>
            <span data-testid="checkout-total">${calculateTotal()}</span>
          </div>
        </div>

        {/* PayPal Payment */}
        <div className="glass-panel rounded-2xl p-8" data-testid="paypal-container">
          <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Payment
          </h2>
          
          {PAYPAL_CLIENT_ID === "YOUR_PAYPAL_CLIENT_ID" ? (
            <div className="text-center py-8 text-zinc-400" data-testid="paypal-config-needed">
              <p className="mb-4">PayPal integration requires configuration.</p>
              <p className="text-sm">Please add your PayPal Client ID to enable payments.</p>
            </div>
          ) : (
            <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
              <PayPalButtons
                createOrder={async () => {
                  const id = await createOrder();
                  return id;
                }}
                onApprove={handlePayPalApprove}
                onError={(err) => {
                  console.error("PayPal Error:", err);
                  toast.error("Payment failed");
                }}
                style={{ layout: "vertical" }}
              />
            </PayPalScriptProvider>
          )}
        </div>
      </div>
    </div>
  );
}
