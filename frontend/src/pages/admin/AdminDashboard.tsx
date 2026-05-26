import { useEffect, useState } from 'react';
import {
  Users,
  BookOpen,
  Newspaper,
  HelpCircle,
  FileText,
  GraduationCap,
  Shield,
  Activity,
} from 'lucide-react';

import { Link } from 'react-router-dom';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    materials: 0,
    news: 0,
    clubs: 0,
    faq: 0,
    documents: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const [
        usersRes,
        materialsRes,
        newsRes,
        clubsRes,
        faqRes,
        documentsRes,
      ] = await Promise.all([
        api.get('/users'),
        api.get('/materials'),
        api.get('/news'),
        api.get('/clubs'),
        api.get('/faq'),
        api.get('/documents'),
      ]);

      setStats({
        users:
          usersRes.data.items?.length ||
          usersRes.data.length ||
          0,

        materials:
          materialsRes.data.items?.length ||
          materialsRes.data.length ||
          0,

        news:
          newsRes.data.items?.length ||
          newsRes.data.length ||
          0,

        clubs:
          clubsRes.data.items?.length ||
          clubsRes.data.length ||
          0,

        faq:
          faqRes.data.items?.length ||
          faqRes.data.length ||
          0,

        documents:
          documentsRes.data.items?.length ||
          documentsRes.data.length ||
          0,
      });
    } catch (err) {
      console.error('Помилка завантаження статистики', err);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: 'Користувачів',
      value: stats.users,
      icon: Users,
      color: 'cyan',
    },
    {
      title: 'Матеріалів',
      value: stats.materials,
      icon: BookOpen,
      color: 'purple',
    },
    {
      title: 'Новин',
      value: stats.news,
      icon: Newspaper,
      color: 'emerald',
    },
    {
      title: 'Гуртків',
      value: stats.clubs,
      icon: GraduationCap,
      color: 'orange',
    },
    {
      title: 'FAQ',
      value: stats.faq,
      icon: HelpCircle,
      color: 'pink',
    },
    {
      title: 'Документів',
      value: stats.documents,
      icon: FileText,
      color: 'yellow',
    },
  ];

  return (
    <div>
      
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="text-cyan-400" size={38} />

          <h1 className="text-4xl font-bold">
            Панель адміністратора
          </h1>
        </div>

        <p className="text-slate-400 text-lg">
          Керуйте всією системою, користувачами та контентом
        </p>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500/40 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 mb-2">
                    {card.title}
                  </p>

                  <h3 className="text-4xl font-bold">
                    {loading ? '...' : card.value}
                  </h3>
                </div>

                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                  <Icon
                    size={30}
                    className="text-cyan-400"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      
      <div className="mt-14">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="text-cyan-400" />
          <h2 className="text-2xl font-semibold">
            Швидкі дії
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Link
            to="/admin/users"
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500 transition group"
          >
            <Users
              size={34}
              className="text-cyan-400 mb-4 group-hover:scale-110 transition"
            />

            <h3 className="text-xl font-semibold">
              Користувачі
            </h3>

            <p className="text-slate-400 mt-2 text-sm">
              Перегляд, редагування та блокування користувачів
            </p>
          </Link>

          <Link
            to="/admin/materials"
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500 transition group"
          >
            <BookOpen
              size={34}
              className="text-cyan-400 mb-4 group-hover:scale-110 transition"
            />

            <h3 className="text-xl font-semibold">
              Матеріали
            </h3>

            <p className="text-slate-400 mt-2 text-sm">
              Управління навчальними матеріалами
            </p>
          </Link>

          <Link
            to="/admin/news"
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500 transition group"
          >
            <Newspaper
              size={34}
              className="text-cyan-400 mb-4 group-hover:scale-110 transition"
            />

            <h3 className="text-xl font-semibold">
              Новини
            </h3>

            <p className="text-slate-400 mt-2 text-sm">
              Створення та редагування новин
            </p>
          </Link>

          <Link
            to="/admin/clubs"
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500 transition group"
          >
            <GraduationCap
              size={34}
              className="text-cyan-400 mb-4 group-hover:scale-110 transition"
            />

            <h3 className="text-xl font-semibold">
              Гуртки
            </h3>

            <p className="text-slate-400 mt-2 text-sm">
              Управління студентськими гуртками
            </p>
          </Link>

          <Link
            to="/admin/faq"
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500 transition group"
          >
            <HelpCircle
              size={34}
              className="text-cyan-400 mb-4 group-hover:scale-110 transition"
            />

            <h3 className="text-xl font-semibold">
              FAQ
            </h3>

            <p className="text-slate-400 mt-2 text-sm">
              Відповіді на питання студентів
            </p>
          </Link>

          <Link
            to="/admin/documents"
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500 transition group"
          >
            <FileText
              size={34}
              className="text-cyan-400 mb-4 group-hover:scale-110 transition"
            />

            <h3 className="text-xl font-semibold">
              Документи
            </h3>

            <p className="text-slate-400 mt-2 text-sm">
              Управління шаблонами та файлами
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;