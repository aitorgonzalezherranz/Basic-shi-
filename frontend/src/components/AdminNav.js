import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, LogOut, Store } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminNav() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
      toast.success("Logged out");
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <nav className="floating-nav flex items-center gap-8" data-testid="admin-nav">
      <Link to="/admin" className="font-bold text-lg tracking-tight flex items-center gap-2" data-testid="admin-nav-home">
        <Store className="w-5 h-5" />
        Admin Panel
      </Link>
      <div className="flex items-center gap-6">
        <Link to="/admin" className="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-2" data-testid="admin-nav-dashboard">
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </Link>
        <Link to="/admin/products" className="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-2" data-testid="admin-nav-products">
          <Package className="w-4 h-4" />
          Products
        </Link>
        <Link to="/admin/orders" className="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-2" data-testid="admin-nav-orders">
          <ShoppingBag className="w-4 h-4" />
          Orders
        </Link>
        <div className="border-l border-zinc-700 h-6"></div>
        <Link to="/" className="text-zinc-400 hover:text-white transition-colors text-sm" data-testid="admin-nav-store">
          View Store
        </Link>
        <button onClick={handleLogout} className="text-zinc-400 hover:text-white transition-colors" data-testid="admin-nav-logout">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}
