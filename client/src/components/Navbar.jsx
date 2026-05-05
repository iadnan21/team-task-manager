import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-indigo-600">TaskFlow</Link>
        {user && (
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-1.5 text-gray-600 hover:text-indigo-600 text-sm">
              <LayoutDashboard size={16} /> Dashboard
            </Link>
            <Link to="/projects" className="flex items-center gap-1.5 text-gray-600 hover:text-indigo-600 text-sm">
              <FolderKanban size={16} /> Projects
            </Link>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <span className="text-sm text-gray-500">
                {user.name} <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">{user.role}</span>
              </span>
              <button onClick={handleLogout} className="text-gray-400 hover:text-red-500">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
