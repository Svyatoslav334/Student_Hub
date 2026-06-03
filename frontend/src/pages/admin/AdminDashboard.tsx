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

const H24 = 24 * 60 * 60 * 1000;

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    materials: 0,
    news: 0,
    clubs: 0,
    faq: 0,
    documents: 0,
  });

  const [faqAlerts, setFaqAlerts] = useState({
    newFromStudents: 0,
    awaitingAnswer: 0,
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
        api.get('/faq?showUnpublished=true&limit=200'),
        api.get('/documents'),
      ]);

      const faqItems: any[] = faqRes.data.items ?? [];
      const now = Date.now();

      const newFromStudents = faqItems.filter((i) => {
        const isNew = now - new Date(i.createdAt).getTime() < H24;
        const hasNoAnswer = !i.answer || i.answer.trim() === '';
        return !i.isPublished && hasNoAnswer && i.author && isNew;
      }).length;

      const awaitingAnswer = faqItems.filter((i) => {
        const hasNoAnswer = !i.answer || i.answer.trim() === '';
        const isNew = now - new Date(i.createdAt).getTime() < H24;
        
        return !i.isPublished && hasNoAnswer && !(i.author && isNew);
      }).length;

      setFaqAlerts({ newFromStudents, awaitingAnswer });

      setStats({
        users: usersRes.data.items?.length ?? usersRes.data.length ?? 0,
        materials: materialsRes.data.items?.length ?? materialsRes.data.length ?? 0,
        news: newsRes.data.items?.length ?? newsRes.data.length ?? 0,
        clubs: clubsRes.data.items?.length ?? clubsRes.data.length ?? 0,
        faq: faqItems.length,
        documents: documentsRes.data.items?.length ?? documentsRes.data.length ?? 0,
      });
    } catch (err) {
      console.error('Помилка завантаження статистики', err);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { title: 'Користувачів', value: stats.users, icon: Users, color: 'cyan' },
    { title: 'Матеріалів', value: stats.materials, icon: BookOpen, color: 'purple' },
    { title: 'Новин', value: stats.news, icon: Newspaper, color: 'emerald' },
    { title: 'Гуртків', value: stats.clubs, icon: GraduationCap, color: 'orange' },
    { title: 'FAQ', value: stats.faq, icon: HelpCircle, color: 'pink' },
    { title: 'Документів', value: stats.documents, icon: FileText, color: 'yellow' },
  ];

  const hasFaqAlerts = faqAlerts.newFromStudents > 0 || faqAlerts.awaitingAnswer > 0;

  return (
    <div>
      
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="text-cyan-400" size={38} />
          <h1 className="text-4xl font-bold">Панель адміністратора</h1>
        </div>
        <p className="text-slate-400 text-lg">
          Керуйте всією системою, користувачами та контентом
        </p>
      </div>

      
      {!loading && hasFaqAlerts && (
        <div className="mb-8 flex flex-wrap gap-3">
          {faqAlerts.newFromStudents > 0 && (
            <Link
              to="/admin/faq"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 transition"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium text-red-400">
                {faqAlerts.newFromStudents} нових питань від студентів
              </span>
              <span className="text-xs text-red-500/60">(останні 24г)</span>
            </Link>
          )}
          {faqAlerts.awaitingAnswer > 0 && (
            <Link
              to="/admin/faq"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-yellow-500/40 bg-yellow-500/10 hover:bg-yellow-500/20 transition"
            >
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">
                {faqAlerts.awaitingAnswer} питань очікує відповідь
              </span>
            </Link>
          )}
        </div>
      )}

      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          const isFaq = card.title === 'FAQ';

          return (
            <div
              key={index}
              className={`bg-slate-900 border rounded-3xl p-6 hover:border-cyan-500/40 transition relative ${
                isFaq && hasFaqAlerts
                  ? 'border-red-500/40'
                  : 'border-slate-800'
              }`}
            >
              
              {isFaq && hasFaqAlerts && (
                <div className="absolute -top-2 -right-2 flex flex-col gap-1 items-end">
                  {faqAlerts.newFromStudents > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 font-medium whitespace-nowrap">
                      🔴 {faqAlerts.newFromStudents} нових
                    </span>
                  )}
                  {faqAlerts.awaitingAnswer > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 font-medium whitespace-nowrap">
                      🟡 {faqAlerts.awaitingAnswer} очікує
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 mb-2">{card.title}</p>
                  <h3 className="text-4xl font-bold">
                    {loading ? '...' : card.value}
                  </h3>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                  <Icon size={30} className="text-cyan-400" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      
      <div className="mt-14">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="text-cyan-400" />
          <h2 className="text-2xl font-semibold">Швидкі дії</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Link
            to="/admin/users"
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500 transition group"
          >
            <Users size={34} className="text-cyan-400 mb-4 group-hover:scale-110 transition" />
            <h3 className="text-xl font-semibold">Користувачі</h3>
            <p className="text-slate-400 mt-2 text-sm">
              Перегляд, редагування та блокування користувачів
            </p>
          </Link>

          <Link
            to="/admin/materials"
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500 transition group"
          >
            <BookOpen size={34} className="text-cyan-400 mb-4 group-hover:scale-110 transition" />
            <h3 className="text-xl font-semibold">Матеріали</h3>
            <p className="text-slate-400 mt-2 text-sm">
              Управління навчальними матеріалами
            </p>
          </Link>

          <Link
            to="/admin/news"
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500 transition group"
          >
            <Newspaper size={34} className="text-cyan-400 mb-4 group-hover:scale-110 transition" />
            <h3 className="text-xl font-semibold">Новини</h3>
            <p className="text-slate-400 mt-2 text-sm">
              Створення та редагування новин
            </p>
          </Link>

          <Link
            to="/admin/clubs"
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500 transition group"
          >
            <GraduationCap size={34} className="text-cyan-400 mb-4 group-hover:scale-110 transition" />
            <h3 className="text-xl font-semibold">Гуртки</h3>
            <p className="text-slate-400 mt-2 text-sm">
              Управління студентськими гуртками
            </p>
          </Link>

          
          <Link
            to="/admin/faq"
            className={`bg-slate-900 border rounded-3xl p-6 hover:border-cyan-500 transition group relative ${
              hasFaqAlerts ? 'border-red-500/30' : 'border-slate-800'
            }`}
          >
            <HelpCircle size={34} className="text-cyan-400 mb-4 group-hover:scale-110 transition" />
            <h3 className="text-xl font-semibold">FAQ</h3>
            <p className="text-slate-400 mt-2 text-sm">
              Відповіді на питання студентів
            </p>
            {hasFaqAlerts && (
              <div className="mt-3 flex flex-col gap-1">
                {faqAlerts.newFromStudents > 0 && (
                  <span className="text-xs flex items-center gap-1.5 text-red-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                    {faqAlerts.newFromStudents} нових питань від студентів
                  </span>
                )}
                {faqAlerts.awaitingAnswer > 0 && (
                  <span className="text-xs flex items-center gap-1.5 text-yellow-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
                    {faqAlerts.awaitingAnswer} очікує відповідь
                  </span>
                )}
              </div>
            )}
          </Link>

          <Link
            to="/admin/documents"
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500 transition group"
          >
            <FileText size={34} className="text-cyan-400 mb-4 group-hover:scale-110 transition" />
            <h3 className="text-xl font-semibold">Документи</h3>
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