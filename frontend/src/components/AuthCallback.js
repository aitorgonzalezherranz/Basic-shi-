import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // CRITICAL: Prevent double execution with useRef (synchronous check)
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      const hash = location.hash;
      const sessionIdMatch = hash.match(/session_id=([^&]+)/);

      if (!sessionIdMatch) {
        toast.error("Authentication failed");
        navigate("/");
        return;
      }

      const sessionId = sessionIdMatch[1];

      try {
        const response = await axios.post(
          `${API}/auth/session`,
          { session_id: sessionId },
          { withCredentials: true }
        );

        const userData = response.data;
        toast.success(`Welcome, ${userData.name}!`);
        
        // Navigate to dashboard with user data
        navigate("/dashboard", { state: { user: userData }, replace: true });
      } catch (error) {
        console.error("Auth error:", error);
        toast.error("Authentication failed");
        navigate("/", { replace: true });
      }
    };

    processSession();
  }, [location.hash, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#050505]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-zinc-400">Authenticating...</p>
      </div>
    </div>
  );
}
