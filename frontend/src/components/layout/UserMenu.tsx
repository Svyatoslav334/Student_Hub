import { useState } from 'react';
import { LogOut, User, Users, ChevronDown, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const UserMenu = ({ user }: any) => {
  const { logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const fullName = `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`.trim();
  const isTeacher = user?.role === 'TEACHER';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-2xl bg-slate-800 pl-2 pr-4 py-1.5 hover:bg-slate-700 transition"
      >
        <img
          src={user?.profile?.avatar || '/default-avatar.png'}
          alt="avatar"
          className="w-8 h-8 rounded-full object-cover border border-slate-700"
        />
        <div className="text-left text-sm hidden md:block">
          <div className="font-medium">{fullName || user?.email}</div>
          <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
        </div>
        <ChevronDown size={18} className={`transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-2 w-56 z-50">
            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl">
              
              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl text-sm"
                onClick={() => setIsOpen(false)}
              >
                <User size={18} />
                Мій профіль
              </Link>

              {}
              {isTeacher && (
                <Link
                  to="/teacher"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard size={18} />
                  Панель викладача
                </Link>
              )}

              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard size={18} />
                  Панель адміна
                </Link>
              )}

              <Link
                to="/my-clubs"
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl text-sm"
                onClick={() => setIsOpen(false)}
              >
                <Users size={18} />
                Мої гуртки
              </Link>

              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 rounded-xl text-sm"
              >
                <LogOut size={18} />
                Вийти з акаунту
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;