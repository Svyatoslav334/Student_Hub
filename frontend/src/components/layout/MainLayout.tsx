import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import {
  Home, Newspaper, Users, BookOpen, FileText,
  HelpCircle, GraduationCap, ChevronLeft, ChevronRight,
  Menu, X, Map
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import UserMenu from './UserMenu';

const navLinks = [
  { to: '/',          label: 'Головна',   icon: Home },
  { to: '/news',      label: 'Новини',    icon: Newspaper },
  { to: '/teachers',  label: 'Викладачі', icon: Users },
  { to: '/clubs',     label: 'Гуртки',    icon: GraduationCap },
  { to: '/materials', label: 'Матеріали', icon: BookOpen },
  { to: '/documents', label: 'Документи', icon: FileText },
  { to: '/map', label: 'Інтерактивна Карта', icon: Map},
  { to: '/faq',       label: 'FAQ',       icon: HelpCircle },
];

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] bg-slate-950 text-white overflow-hidden">

      <aside
        className={`
          relative hidden lg:flex flex-col shrink-0
          border-r border-slate-800 bg-slate-900
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[72px]' : 'w-[220px]'}
        `}
      >
        <div className={`flex items-center h-16 px-4 border-b border-slate-800 shrink-0 ${collapsed ? 'justify-center' : ''}`}>
          <Link to="/" className="text-xl font-bold text-cyan-400 truncate">
            {collapsed ? 'S' : 'StudentHub'}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <NavLink
                key={to} to={to} end={to === '/'}
                title={collapsed ? label : undefined}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all
                  ${active ? 'bg-cyan-500/15 text-cyan-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} className="shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <button
          onClick={() => setCollapsed(v => !v)}
          className="absolute -right-3 top-[72px] z-10 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition"
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
<header className="shrink-0 h-16 flex items-center justify-between px-4 lg:px-6 border-b border-slate-800 bg-slate-900">
  <Link to="/" className="text-xl font-bold text-cyan-400 lg:hidden">
    StudentHub
  </Link>

  <div className="flex items-center gap-3 w-full lg:justify-end">
    
    <div className="hidden lg:flex items-center gap-3">
      {isAuthenticated && user ? (
        <UserMenu user={user} />
      ) : (
        <>
          <Link 
            to="/login" 
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800"
          >
            Вхід
          </Link>
          <Link 
            to="/register" 
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-400"
          >
            Реєстрація
          </Link>
        </>
      )}
    </div>

    
    <button
      onClick={() => setMobileOpen(true)}
      className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-slate-700 hover:bg-slate-800 transition active:scale-95 ml-auto"
    >
      <Menu size={22} />
    </button>
  </div>
</header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      
      <div className={`fixed inset-0 z-[200] lg:hidden transition-all duration-300 ${mobileOpen ? 'visible' : 'invisible'}`}>
        <div
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
        />

        <div
          className={`absolute bottom-0 left-0 right-0 bg-slate-900 rounded-t-3xl border-t border-slate-700 transition-transform duration-300 ease-out ${mobileOpen ? 'translate-y-0' : 'translate-y-full'}`}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-slate-700" />
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
            <span className="text-lg font-bold text-cyan-400">StudentHub</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 transition active:scale-95"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1 px-3 py-4">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-2xl transition active:scale-95 ${
                    active ? 'bg-cyan-500/15 text-cyan-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                  <span className="text-[11px] font-medium leading-tight text-center">{label}</span>
                </Link>
              );
            })}
          </div>

          <div className="px-4 pb-8 pt-2 border-t border-slate-800">
            {isAuthenticated && user ? (
              <UserMenu user={user} mobile />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  to="/login" 
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center rounded-2xl border border-slate-700 py-4 text-sm font-medium hover:bg-slate-800 transition active:scale-95"
                >
                  Вхід
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center rounded-2xl bg-cyan-500 py-4 text-sm font-semibold text-black hover:bg-cyan-400 transition active:scale-95"
                >
                  Реєстрація
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;