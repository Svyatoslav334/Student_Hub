import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuthStore } from '../../store/authStore';
import UserMenu from './UserMenu';

const Header = () => {
  const { isAuthenticated, user } = useAuthStore();

  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[100] border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="text-2xl font-bold text-cyan-400 transition hover:text-cyan-300"
        >
          StudentHub
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link to="/" className="transition hover:text-cyan-400">
            Головна
          </Link>

          <Link to="/news" className="transition hover:text-cyan-400">
            Новини
          </Link>

          <Link to="/teachers" className="transition hover:text-cyan-400">
            Викладачі
          </Link>

          <Link to="/clubs" className="transition hover:text-cyan-400">
            Гуртки
          </Link>

          <Link to="/materials" className="transition hover:text-cyan-400">
            Матеріали
          </Link>

          <Link to="/documents" className="transition hover:text-cyan-400">
            Документи
          </Link>

          <Link to="/faq" className="transition hover:text-cyan-400">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-3">
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
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 md:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <div
        className={`
          overflow-hidden border-t border-slate-800 bg-slate-900 transition-all duration-300 md:hidden
          ${mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="flex flex-col px-4 py-4">
          <Link
            to="/"
            className="rounded-xl px-4 py-3 transition hover:bg-slate-800"
            onClick={() => setMobileOpen(false)}
          >
            Головна
          </Link>

          <Link
            to="/news"
            className="rounded-xl px-4 py-3 transition hover:bg-slate-800"
            onClick={() => setMobileOpen(false)}
          >
            Новини
          </Link>

          <Link
            to="/teachers"
            className="rounded-xl px-4 py-3 transition hover:bg-slate-800"
            onClick={() => setMobileOpen(false)}
          >
            Викладачі
          </Link>

          <Link
            to="/clubs"
            className="rounded-xl px-4 py-3 transition hover:bg-slate-800"
            onClick={() => setMobileOpen(false)}
          >
            Гуртки
          </Link>

          <Link
            to="/faq"
            className="rounded-xl px-4 py-3 transition hover:bg-slate-800"
            onClick={() => setMobileOpen(false)}
          >
            FAQ
          </Link>

          <div className="my-4 border-t border-slate-800" />

          {isAuthenticated && user ? (
            <div className="px-2">
              <UserMenu user={user} />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                className="rounded-xl border border-slate-700 px-4 py-3 text-center transition hover:bg-slate-800"
                onClick={() => setMobileOpen(false)}
              >
                Вхід
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-cyan-500 px-4 py-3 text-center font-semibold text-black transition hover:bg-cyan-400"
                onClick={() => setMobileOpen(false)}
              >
                Реєстрація
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;