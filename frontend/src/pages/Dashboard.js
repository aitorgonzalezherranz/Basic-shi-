import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Package, ShoppingBag } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    fetchOrders();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, { withCredentials: true });
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`, { withCredentials: true });
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505]" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-12" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* User Info */}
        {user && (
          <div className="mb-12" data-testid="user-info">
            <div className="flex items-center gap-6 mb-6">
              {user.picture && (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-20 h-20 rounded-full border-2 border-zinc-800"
                  data-testid="user-avatar"
                />
              )}
              <div>
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }} data-testid="user-name">
                  Welcome, {user.name}
                </h1>
                <p className="text-lg text-zinc-400 mt-2" data-testid="user-email">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12" data-testid="quick-actions">
          <button
            onClick={() => navigate("/shop")}
            className="glass-panel rounded-2xl p-8 hover:border-zinc-700 transition-all text-left group"
            data-testid="quick-action-shop"
          >
            <ShoppingBag className="w-10 h-10 mb-4 text-blue-500" />
            <h3 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Continue Shopping
            </h3>
            <p className="text-zinc-400">Explore our latest collection</p>
          </button>
          <button
            onClick={() => navigate("/cart")}
            className="glass-panel rounded-2xl p-8 hover:border-zinc-700 transition-all text-left group"
            data-testid="quick-action-cart"
          >
            <Package className="w-10 h-10 mb-4 text-green-500" />
            <h3 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              View Cart
            </h3>
            <p className="text-zinc-400">Review your items</p>
          </button>
        </div>

        {/* Orders */}
        <div data-testid="orders-section">
          <h2 className="text-3xl font-semibold tracking-tight mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }} data-testid="orders-title">
            Your Orders
          </h2>
          {orders.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center" data-testid="no-orders">
              <Package className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 text-lg mb-4">No orders yet</p>
              <button onClick={() => navigate("/shop")} className="btn-primary" data-testid="start-shopping-btn">
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6" data-testid="orders-list">
              {orders.map((order) => (
                <div key={order.order_id} className="glass-panel rounded-2xl p-6" data-testid={`order-${order.order_id}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-sm text-zinc-500 uppercase tracking-widest mb-2">
                        Order #{order.order_id}
                      </div>
                      <div className="text-2xl font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        ${order.total.toFixed(2)}
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                      order.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                      order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-zinc-500/20 text-zinc-500'
                    }`} data-testid={`order-status-${order.order_id}`}>
                      {order.status}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-zinc-400 text-sm" data-testid={`order-item-${order.order_id}-${idx}`}>
                        {item.name} x {item.quantity}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
