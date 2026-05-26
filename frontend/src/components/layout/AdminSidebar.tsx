import { NavLink } from 'react-router-dom';

import {
  Home,
  Users,
  Newspaper,
  HelpCircle,
  FileText,
  User,
  Shield,
} from 'lucide-react';

const AdminSidebar = () => {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
      isActive
        ? 'bg-cyan-500/10 text-cyan-400'
        : 'hover:bg-slate-800'
    }`;

  return (
    <aside className="w-72 border-r border-slate-800 bg-slate-900 min-h-[calc(100vh-64px)] p-4 hidden lg:block">
      <div className="mb-8 px-3 flex items-center gap-3">
        <Shield className="text-cyan-400" />

        <div>
          <h2 className="text-cyan-400 font-semibold text-lg">
            Адмін панель
          </h2>

          <p className="text-slate-500 text-sm">
            System Control
          </p>
        </div>
      </div>

      <nav className="space-y-1">
        <NavLink
          to="/admin"
          end
          className={navClass}
        >
          <Home size={20} />
          Головна
        </NavLink>

        <NavLink
          to="/admin/users"
          className={navClass}
        >
          <Users size={20} />
          Користувачі
        </NavLink>

        <NavLink
          to="/admin/news"
          className={navClass}
        >
          <Newspaper size={20} />
          Новини
        </NavLink>

        <NavLink
          to="/admin/faq"
          className={navClass}
        >
          <HelpCircle size={20} />
          FAQ
        </NavLink>

        <NavLink
          to="/admin/documents"
          className={navClass}
        >
          <FileText size={20} />
          Документи
        </NavLink>

        <NavLink
          to="/profile"
          className={navClass}
        >
          <User size={20} />
          Профіль
        </NavLink>
      </nav>
    </aside>
  );
};

export default AdminSidebar;