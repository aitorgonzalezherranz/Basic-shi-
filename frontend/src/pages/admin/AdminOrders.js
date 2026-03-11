import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import AdminNav from "@/components/AdminNav";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/admin/orders`, { withCredentials: true });
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(
        `${API}/admin/orders/${orderId}/status?status=${newStatus}`,
        {},
        { withCredentials: true }
      );
      toast.success("Order status updated");
      fetchOrders();
    } catch (error) {
      console.error("Failed to update order", error);
      toast.error("Failed to update order status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505]" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const filteredOrders = filterStatus === "all" 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  return (
    <div className="min-h-screen bg-[#050505]" data-testid="admin-orders-page">
      <AdminNav />
      
      <div className="pt-24 pb-12 max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }} data-testid="admin-orders-title">
            Manage Orders
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-zinc-400 text-sm">Filter:</span>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 bg-zinc-900 border-zinc-800 text-white" data-testid="filter-status-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                <SelectItem value="all" className="hover:bg-zinc-800">All Orders</SelectItem>
                <SelectItem value="pending" className="hover:bg-zinc-800">Pending</SelectItem>
                <SelectItem value="completed" className="hover:bg-zinc-800">Completed</SelectItem>
                <SelectItem value="cancelled" className="hover:bg-zinc-800">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center" data-testid="no-orders">
            <p className="text-zinc-400 text-lg">No orders found</p>
          </div>
        ) : (
          <div className="space-y-6" data-testid="orders-list">
            {filteredOrders.map((order) => (
              <div key={order.order_id} className="glass-panel rounded-2xl p-6" data-testid={`order-${order.order_id}`}>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-sm text-zinc-500 uppercase tracking-widest mb-2">
                      Order #{order.order_id}
                    </div>
                    <div className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      ${order.total.toFixed(2)}
                    </div>
                    <div className="text-sm text-zinc-400">
                      Customer: <span className="text-white">{order.user_info?.name}</span>
                    </div>
                    <div className="text-sm text-zinc-400">
                      Email: <span className="text-white">{order.user_info?.email}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-4">
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                      order.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                      order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                      order.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                      'bg-zinc-500/20 text-zinc-500'
                    }`} data-testid={`order-status-badge-${order.order_id}`}>
                      {order.status}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-400">Update Status:</span>
                      <Select 
                        value={order.status} 
                        onValueChange={(value) => handleStatusChange(order.order_id, value)}
                      >
                        <SelectTrigger className="w-36 bg-zinc-800 border-zinc-700 text-white" data-testid={`status-select-${order.order_id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                          <SelectItem value="pending" className="hover:bg-zinc-800">Pending</SelectItem>
                          <SelectItem value="completed" className="hover:bg-zinc-800">Completed</SelectItem>
                          <SelectItem value="cancelled" className="hover:bg-zinc-800">Cancelled</SelectItem>
                          <SelectItem value="shipped" className="hover:bg-zinc-800">Shipped</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-zinc-800 pt-4">
                  <div className="text-sm text-zinc-500 uppercase tracking-widest mb-3">Items</div>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm" data-testid={`order-item-${order.order_id}-${idx}`}>
                        <span className="text-zinc-300">
                          {item.name} x {item.quantity}
                        </span>
                        <span className="text-white font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {order.paypal_order_id && (
                  <div className="border-t border-zinc-800 pt-4 mt-4">
                    <div className="text-xs text-zinc-500">
                      PayPal Order ID: <span className="text-zinc-400">{order.paypal_order_id}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
