import { NavLink } from 'react-router-dom';
import { BookOpen, Users, User, Home } from 'lucide-react';

const TeacherSidebar = () => {
  return (
    <div className="w-64 border-r border-slate-800 bg-slate-900 min-h-[calc(100vh-64px)] p-4 hidden lg:block">
      <div className="mb-8 px-3">
        <h2 className="text-cyan-400 font-semibold text-lg">Панель викладача</h2>
      </div>

      <nav className="space-y-1">
        <NavLink
          to="/teacher"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-2xl transition ${isActive ? 'bg-cyan-500/10 text-cyan-400' : 'hover:bg-slate-800'}`
          }
        >
          <Home size={20} />
          Головна
        </NavLink>

        <NavLink
          to="/teacher/materials"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-2xl transition ${isActive ? 'bg-cyan-500/10 text-cyan-400' : 'hover:bg-slate-800'}`
          }
        >
          <BookOpen size={20} />
          Мої матеріали
        </NavLink>

        <NavLink
          to="/teacher/clubs"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-2xl transition ${isActive ? 'bg-cyan-500/10 text-cyan-400' : 'hover:bg-slate-800'}`
          }
        >
          <Users size={20} />
          Мої гуртки
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-2xl transition ${isActive ? 'bg-cyan-500/10 text-cyan-400' : 'hover:bg-slate-800'}`
          }
        >
          <User size={20} />
          Мій профіль
        </NavLink>
      </nav>
    </div>
  );
};

export default TeacherSidebar;