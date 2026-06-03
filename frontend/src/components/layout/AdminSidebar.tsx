import { NavLink } from 'react-router-dom';
import { Home, Users, Newspaper, HelpCircle, FileText, User, Shield, Map } from 'lucide-react';

const navItems = [
  { to: '/admin',           end: true, icon: Home,        label: 'Головна' },
  { to: '/admin/users',               icon: Users,       label: 'Користувачі' },
  { to: '/admin/groups',              icon: Users,       label: 'Групи' },
  { to: '/admin/news',                icon: Newspaper,   label: 'Новини' },
  { to: '/admin/faq',                 icon: HelpCircle,  label: 'FAQ' },
  { to: '/admin/documents',           icon: FileText,    label: 'Документи' },
  { to: '/admin/map-editor',          icon: Map,         label: 'Карта' },
  { to: '/profile',                   icon: User,        label: 'Профіль' },
];

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
    isActive ? 'bg-cyan-500/10 text-cyan-400' : 'hover:bg-slate-800'
  }`;

const AdminSidebar = () => {
  return (
    <>
      
      <aside className="w-72 border-r border-slate-800 bg-slate-900 min-h-[calc(100vh-64px)] p-4 hidden lg:block">
        <div className="mb-8 px-3 flex items-center gap-3">
          <Shield className="text-cyan-400" />
          <div>
            <h2 className="text-cyan-400 font-semibold text-lg">Адмін панель</h2>
            <p className="text-slate-500 text-sm">System Control</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map(({ to, end, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={end} className={navClass}>
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 flex lg:hidden overflow-x-auto">
        {navItems.map(({ to, end, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 flex-1 min-w-[56px] py-3 text-xs transition ${
                isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Icon size={20} />
            <span className="leading-tight text-center text-[10px]">{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
};

export default AdminSidebar;