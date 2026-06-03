import { Menu, X, Home, Newspaper, Users, BookOpen, FileText, HelpCircle, GraduationCap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import UserMenu from './UserMenu';

const navLinks = [
  { to: '/',          label: 'Головна',   icon: Home },
  { to: '/news',      label: 'Новини',    icon: Newspaper },
  { to: '/teachers',  label: 'Викладачі', icon: Users },
  { to: '/clubs',     label: 'Гуртки',    icon: GraduationCap },
  { to: '/materials', label: 'Матеріали', icon: BookOpen },
  { to: '/documents', label: 'Документи', icon: FileText },
  { to: '/faq',       label: 'FAQ',       icon: HelpCircle },
];

const Header = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <>
      <header className="sticky top-0 z-[100] border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

          <Link to="/" className="text-2xl font-bold text-cyan-400 transition hover:text-cyan-300 shrink-0">
            StudentHub
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`transition-colors ${
                  isActive(to)
                    ? 'text-cyan-400'
                    : 'text-slate-300 hover:text-cyan-400'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex flex items-center gap-3">
              {isAuthenticated && user ? (
                <UserMenu user={user} />
              ) : (
                <>
                  <Link to="/login" className="rounded-xl border border-slate-700 px-4 py-2 text-sm transition hover:bg-slate-800">
                    Вхід
                  </Link>
                  <Link to="/register" className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-400">
                    Реєстрація
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Відкрити меню"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 md:hidden transition hover:bg-slate-800 active:scale-95"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      
      <div
        className={`fixed inset-0 z-[200] md:hidden transition-all duration-300 ${
          mobileOpen ? 'visible' : 'invisible'
        }`}
      >
        
        <div
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        
        <div
          className={`absolute bottom-0 left-0 right-0 bg-slate-900 rounded-t-3xl border-t border-slate-700 transition-transform duration-300 ease-out ${
            mobileOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-slate-700" />
          </div>

          
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
            <span className="text-lg font-bold text-cyan-400">StudentHub</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 transition active:scale-95"
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
                  className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-2xl transition active:scale-95 ${
                    active
                      ? 'bg-cyan-500/15 text-cyan-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                  <span className="text-[11px] font-medium leading-tight text-center">{label}</span>
                </Link>
              );
            })}
          </div>

          
          <div className="px-4 pb-6 pt-1 border-t border-slate-800">
            {isAuthenticated && user ? (
              <UserMenu user={user} mobile />
            ) : ( 
              <div className="grid grid-cols-2 gap-3 pt-4">
                <Link
                  to="/login"
                  className="flex items-center justify-center rounded-2xl border border-slate-700 py-4 text-sm font-medium transition hover:bg-slate-800 active:scale-95"
                >
                  Вхід
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center rounded-2xl bg-cyan-500 py-4 text-sm font-semibold text-black transition hover:bg-cyan-400 active:scale-95"
                >
                  Реєстрація
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;