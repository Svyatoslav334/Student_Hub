import { NavLink } from 'react-router-dom';
import { BookOpen, Users, User, Home } from 'lucide-react';

const navItems = [
  { to: '/teacher', end: true, icon: Home, label: 'Головна' },
  { to: '/teacher/materials', icon: BookOpen, label: 'Матеріали' },
  { to: '/teacher/clubs', icon: Users, label: 'Гуртки' },
  { to: '/profile', icon: User, label: 'Профіль' },
];

const TeacherSidebar = () => {
  return (
    <>
      
      <div className="w-64 border-r border-slate-800 bg-slate-900 min-h-[calc(100vh-64px)] p-4 hidden lg:block">
        <div className="mb-8 px-3">
          <h2 className="text-cyan-400 font-semibold text-lg">Панель викладача</h2>
        </div>
        <nav className="space-y-1">
          {navItems.map(({ to, end, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                  isActive ? 'bg-cyan-500/10 text-cyan-400' : 'hover:bg-slate-800'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 flex lg:hidden">
        {navItems.map(({ to, end, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 flex-1 py-3 text-xs transition ${
                isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
};

export default TeacherSidebar;