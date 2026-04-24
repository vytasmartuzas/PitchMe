import { Link, useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/useAuthStore.js";

export default function Navbar() {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-semibold">PitchMe</Link>
        <div className="flex items-center gap-4 text-sm">
          {token ? (
            <>
              <Link to="/interview" className="hover:underline">New interview</Link>
              <Link to="/dashboard" className="hover:underline">Dashboard</Link>
              <span className="text-slate-500">{user?.name}</span>
              <button onClick={handleLogout} className="text-slate-600 hover:text-slate-900">Logout</button>
            </>
          ) : (
            <Link to="/login" className="hover:underline">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
