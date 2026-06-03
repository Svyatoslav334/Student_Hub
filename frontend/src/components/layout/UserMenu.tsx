import { useState } from 'react';
import { LogOut, User, Users, ChevronDown, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const UserMenu = ({ user, mobile = false }: { user: any; mobile?: boolean }) => {
  const { logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const fullName = `${user?.firstName || user?.profile?.firstName || ''} ${user?.lastName || user?.profile?.lastName || ''}`.trim();
  const isTeacher = user?.role === 'TEACHER';
  const isAdmin = user?.role === 'ADMIN';
  const avatar = user?.avatar || user?.profile?.avatar || '/default-avatar.png';

  
  if (mobile) {
    return (
      <div className="pt-2">
        
        <div className="flex items-center gap-3 px-1 py-3 mb-1 border-b border-slate-800">
          <img
            src={avatar}
            alt="avatar"
            className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
          />
          <div>
            <div className="text-sm font-medium">{fullName || user?.email}</div>
            <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
          </div>
        </div>

        
        <Link to="/profile" className="flex items-center gap-3 px-1 py-3 text-sm text-slate-300 hover:text-white active:scale-95 transition">
          <User size={18} className="text-slate-400" /> Мій профіль
        </Link>

        {isTeacher && (
          <Link to="/teacher" className="flex items-center gap-3 px-1 py-3 text-sm text-slate-300 hover:text-white active:scale-95 transition">
            <LayoutDashboard size={18} className="text-slate-400" /> Панель викладача
          </Link>
        )}

        {isAdmin && (
          <Link to="/admin" className="flex items-center gap-3 px-1 py-3 text-sm text-slate-300 hover:text-white active:scale-95 transition">
            <LayoutDashboard size={18} className="text-slate-400" /> Панель адміна
          </Link>
        )}

        <Link to="/my-clubs" className="flex items-center gap-3 px-1 py-3 text-sm text-slate-300 hover:text-white active:scale-95 transition">
          <Users size={18} className="text-slate-400" /> Мої гуртки
        </Link>

        <Link to="/my-group" className="flex items-center gap-3 px-1 py-3 text-sm text-slate-300 hover:text-white active:scale-95 transition">
          <Users size={18} className="text-slate-400" /> Моя група
        </Link>

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-1 py-3 text-sm text-red-400 hover:text-red-300 active:scale-95 transition"
        >
          <LogOut size={18} /> Вийти з акаунту
        </button>
      </div>
    );
  }

  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-2xl bg-slate-800 pl-2 pr-4 py-1.5 hover:bg-slate-700 transition"
      >
        <img
          src={avatar}
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
              <Link to="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl text-sm" onClick={() => setIsOpen(false)}>
                <User size={18} /> Мій профіль
              </Link>
              {isTeacher && (
                <Link to="/teacher" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl text-sm" onClick={() => setIsOpen(false)}>
                  <LayoutDashboard size={18} /> Панель викладача
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl text-sm" onClick={() => setIsOpen(false)}>
                  <LayoutDashboard size={18} /> Панель адміна
                </Link>
              )}
              <Link to="/my-clubs" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl text-sm" onClick={() => setIsOpen(false)}>
                <Users size={18} /> Мої гуртки
              </Link>
              <Link to="/my-group" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl text-sm" onClick={() => setIsOpen(false)}>
                <Users size={18} /> Моя група
              </Link>
              <button
                onClick={() => { logout(); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 rounded-xl text-sm"
              >
                <LogOut size={18} /> Вийти з акаунту
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;