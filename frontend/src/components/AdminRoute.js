import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminRoute({ children }) {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await axios.get(`${API}/auth/me`, {
          withCredentials: true
        });
        setUser(response.data);
        if (response.data.is_admin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, []);

  // Loading state
  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  // Not admin
  if (isAdmin === false) {
    return <Navigate to="/" replace />;
  }

  // Is admin
  return children;
}
