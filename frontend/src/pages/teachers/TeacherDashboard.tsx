import { useState, useEffect } from 'react';
import { BookOpen, Users, Award } from 'lucide-react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
  const [stats, setStats] = useState({
    materials: 0,
    clubs: 0,
    students: 0,
  });
  const [, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Можна зробити паралельні запити
      const [materialsRes, clubsRes] = await Promise.all([
        api.get('/materials?my=true'),
        api.get('/clubs/my'),
      ]);

      setStats({
        materials: materialsRes.data.items?.length || materialsRes.data.length || 0,
        clubs: clubsRes.data.length || 0,
        students: 89, // поки статично
      });
    } catch (err) {
      console.error('Помилка завантаження статистики', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">Вітаємо у панелі викладача</h1>
        <p className="text-slate-400 text-lg">Керуйте своїми матеріалами, оголошеннями та гуртками</p>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center">
              <BookOpen className="text-cyan-400" size={28} />
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.materials}</p>
              <p className="text-slate-400">Моїх матеріалів</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center">
              <Users className="text-purple-400" size={28} />
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.clubs}</p>
              <p className="text-slate-400">Гуртків</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <Award className="text-emerald-400" size={28} />
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.students}</p>
              <p className="text-slate-400">Студентів</p>
            </div>
          </div>
        </div>
      </div>

      
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Швидкі дії</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          
          <Link 
            to="/teacher/materials" 
            className="block p-6 bg-slate-900 border border-slate-700 rounded-3xl hover:border-cyan-500 transition group"
          >
            <BookOpen size={32} className="text-cyan-400 mb-4 group-hover:scale-110 transition" />
            <h3 className="font-semibold text-lg">Мої матеріали</h3>
            <p className="text-slate-400 text-sm mt-1">Завантажуйте та редагуйте лекції, презентації</p>
          </Link>

          
          <Link 
            to="/teacher/clubs" 
            className="block p-6 bg-slate-900 border border-slate-700 rounded-3xl hover:border-cyan-500 transition"
          >
            <Users size={32} className="text-cyan-400 mb-4" />
            <h3 className="font-semibold text-lg">Мої гуртки</h3>
            <p className="text-slate-400 text-sm mt-1">Керуйте своїми студентськими об’єднаннями</p>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
