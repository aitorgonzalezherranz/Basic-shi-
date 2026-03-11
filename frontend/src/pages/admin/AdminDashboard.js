import { useState, useEffect } from "react";
import axios from "axios";
import AdminNav from "@/components/AdminNav";
import { Package, ShoppingBag, Users, DollarSign, TrendingUp } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/stats`, { withCredentials: true });
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
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
    <div className="min-h-screen bg-[#050505]" data-testid="admin-dashboard-page">
      <AdminNav />
      
      <div className="pt-24 pb-12 max-w-7xl mx-auto px-6 md:px-12">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-12" style={{ fontFamily: 'Space Grotesk, sans-serif' }} data-testid="admin-title">
          Admin Dashboard
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12" data-testid="stats-cards">
          <div className="glass-panel rounded-2xl p-6" data-testid="stat-revenue">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-10 h-10 text-green-500" />
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              ${stats?.total_revenue || 0}
            </div>
            <div className="text-sm text-zinc-400 mt-2">Total Revenue</div>
            {stats?.pending_revenue > 0 && (
              <div className="text-xs text-yellow-500 mt-2">
                +${stats.pending_revenue} pending
              </div>
            )}
          </div>

          <div className="glass-panel rounded-2xl p-6" data-testid="stat-orders">
            <div className="flex items-center justify-between mb-4">
              <ShoppingBag className="w-10 h-10 text-blue-500" />
            </div>
            <div className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {stats?.total_orders || 0}
            </div>
            <div className="text-sm text-zinc-400 mt-2">Total Orders</div>
          </div>

          <div className="glass-panel rounded-2xl p-6" data-testid="stat-products">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-10 h-10 text-purple-500" />
            </div>
            <div className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {stats?.total_products || 0}
            </div>
            <div className="text-sm text-zinc-400 mt-2">Products</div>
          </div>

          <div className="glass-panel rounded-2xl p-6" data-testid="stat-users">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-10 h-10 text-orange-500" />
            </div>
            <div className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {stats?.total_users || 0}
            </div>
            <div className="text-sm text-zinc-400 mt-2">Registered Users</div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="glass-panel rounded-2xl p-8" data-testid="recent-orders">
          <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Recent Orders
          </h2>
          {stats?.recent_orders?.length === 0 ? (
            <p className="text-zinc-400 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {stats?.recent_orders?.map((order) => (
                <div key={order.order_id} className="border border-zinc-800 rounded-xl p-4 flex justify-between items-center" data-testid={`recent-order-${order.order_id}`}>
                  <div>
                    <div className="text-sm text-zinc-500 uppercase tracking-widest mb-1">
                      #{order.order_id}
                    </div>
                    <div className="text-lg font-medium">${order.total.toFixed(2)}</div>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                    order.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                    order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-zinc-500/20 text-zinc-500'
                  }`}>
                    {order.status}
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
