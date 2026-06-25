import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

import { 
  Newspaper, 
  Users, 
  BookOpen, 
  User, 
  HelpCircle, 
  FileText,
  ArrowRight,
  Trophy
} from 'lucide-react';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  image?: string;
  category: string;
  pinned: boolean;
  createdAt: string;
}

interface Club {
  id: number;
  title: string;
  description: string;
  image?: string;
  maxMembers: number;
  currentMembers?: number;
  members?: any[];
}

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const categoryLabels: Record<string, string> = {
  ANNOUNCEMENT: 'Оголошення',
  EVENT: 'Подія',
  EDUCATION: 'Навчання',
  ADMINISTRATION: 'Адміністрація',
};

const categoryColors: Record<string, string> = {
  ANNOUNCEMENT: '#f59e0b',
  EVENT: '#06b6d4',
  EDUCATION: '#10b981',
  ADMINISTRATION: '#8b5cf6',
};

const Home = () => {
  const { isAuthenticated } = useAuthStore();
  
  const [news, setNews] = useState<NewsItem[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [totalNews, setTotalNews] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [newsRes, clubsRes, faqRes, teachersRes] = await Promise.all([
          api.get('/news', { params: { limit: 5 } }),
          api.get('/clubs', { params: { limit: 6 } }),
          api.get('/faq', { params: { limit: 4 } }),
          api.get('/teachers'),
        ]);

        setNews(newsRes.data.items || []);
        setTotalNews(newsRes.data.total || newsRes.data.items?.length || 0);
        
        setClubs(clubsRes.data.items || []);
        
        setFaqs(faqRes.data.items || []);
        
        setTotalTeachers(teachersRes.data.total || 42);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(6,182,212,0.12) 0%, transparent 70%)',
          }}
        />

        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(6,182,212,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.4) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col items-center justify-center px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Університетський портал студентів
          </div>

          <h1 className="max-w-4xl text-5xl font-black leading-[1.1] tracking-tight md:text-7xl">
            Усе необхідне<br />
            <span 
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              в одному місці
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
            Новини, навчальні матеріали, викладачі, гуртки та FAQ — актуальна інформація для кожного студента.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/news"
              className="rounded-2xl bg-cyan-500 px-8 py-3.5 font-semibold text-black transition hover:bg-cyan-400 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
            >
              Читати новини <ArrowRight size={18} />
            </Link>
            {isAuthenticated ? (
              <Link
                to="/clubs"
                className="rounded-2xl border border-slate-700 px-8 py-3.5 font-semibold transition hover:bg-slate-800 hover:-translate-y-0.5"
              >
                Мої гуртки
              </Link>
            ) : (
              <Link
                to="/register"
                className="rounded-2xl border border-slate-700 px-8 py-3.5 font-semibold transition hover:bg-slate-800 hover:-translate-y-0.5"
              >
                Зареєструватись
              </Link>
            )}
          </div>

          
          <div className="mt-16 flex flex-wrap justify-center gap-3 text-sm text-slate-400">
            {[
              { icon: <Newspaper size={20} />, label: 'Новин', value: totalNews },
              { icon: <User size={20} />, label: 'Викладачів', value: totalTeachers },
              { icon: <Users size={20} />, label: 'Гуртків', value: clubs.length },
              { icon: <Trophy size={20} />, label: 'Активних студентів', value: '1200+' },
            ].map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-5 py-3"
              >
                <div className="text-cyan-400">{s.icon}</div>
                <div>
                  <span className="text-xl font-bold text-white block">{s.value}</span>
                  <span className="text-xs">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none">
          <svg viewBox="0 0 1440 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              d="M0 96L60 85.3C120 75 240 53 360 48C480 43 600 53 720 58.7C840 64 960 64 1080 56C1200 48 1320 32 1380 24L1440 16V96H0Z"
              fill="#0f172a"
            />
          </svg>
        </div>
      </section>

      
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-cyan-400 mb-2">Актуально</p>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Newspaper size={28} className="text-cyan-400" />
              Останні новини
            </h2>
          </div>
          <Link
            to="/news"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition"
          >
            Всі новини <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-3xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : news.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {news.map((item, idx) => (
              <Link
                key={item.id}
                to={`/news/${item.id}`}
                className={`group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 transition hover:border-slate-600 hover:-translate-y-1 ${
                  idx === 0 ? 'md:col-span-2' : ''
                }`}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className={`w-full object-cover transition group-hover:scale-105 ${
                      idx === 0 ? 'h-72' : 'h-44'
                    }`}
                  />
                ) : (
                  <div
                    className={`w-full ${idx === 0 ? 'h-72' : 'h-44'} flex items-center justify-center bg-gradient-to-br from-cyan-900/30 to-slate-800`}
                  >
                    <Newspaper size={48} className="opacity-30" />
                  </div>
                )}

                <div className="p-6">
                  <div className="mb-3 flex items-center gap-3">
                    {item.pinned && (
                      <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400">
                        📌 Закріплено
                      </span>
                    )}
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        background: `${categoryColors[item.category] || '#06b6d4'}22`,
                        color: categoryColors[item.category] || '#06b6d4',
                      }}
                    >
                      {categoryLabels[item.category] || item.category}
                    </span>
                  </div>

                  <h3 className="line-clamp-2 text-lg font-semibold group-hover:text-cyan-400 transition">
                    {item.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                    {item.content}
                  </p>

                  <p className="mt-4 text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString('uk-UA', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center py-16 text-slate-500">Новин поки немає</p>
        )}
      </section>

      
      <section className="mx-auto max-w-7xl px-6 py-4 pb-20">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-cyan-400 mb-2">Розділи</p>
          <h2 className="text-3xl font-bold">Що є на порталі</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: BookOpen, title: 'Навчальні матеріали', desc: 'Лекції, презентації, методички від викладачів', to: '/materials', accent: '#06b6d4' },
            { icon: User, title: 'Викладачі', desc: 'Контакти, кабінети та інформація про кафедри', to: '/teachers', accent: '#8b5cf6' },
            { icon: Users, title: 'Гуртки', desc: 'Студентські клуби, запис та спілкування', to: '/clubs', accent: '#10b981' },
            { icon: HelpCircle, title: 'FAQ', desc: 'Відповіді на найпоширеніші питання студентів', to: '/faq', accent: '#f59e0b' },
            { icon: Newspaper, title: 'Новини', desc: 'Оголошення, події та новини університету', to: '/news', accent: '#ef4444' },
            { icon: FileText, title: 'Документи', desc: 'Шаблони, зразки, бланки та довідки', to: '/documents', accent: '#3b82f6' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-600 hover:-translate-y-0.5"
              >
                <div className="mb-4">
                  <Icon size={32} className="text-cyan-400" />
                </div>
                <h3 className="mb-1 font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
                <div 
                  className="mt-6 flex items-center gap-2 text-xs font-medium transition group-hover:gap-3"
                  style={{ color: item.accent }}
                >
                  Перейти <ArrowRight size={16} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      
      {clubs.length > 0 && (
        <section className="border-y border-slate-800/60 bg-slate-900/40 py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-cyan-400 mb-2">Спільнота</p>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <Users size={28} className="text-cyan-400" />
                  Студентські гуртки
                </h2>
              </div>
              <Link
                to="/clubs"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition"
              >
                Всі гуртки <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {clubs.slice(0, 6).map((club) => (
                <Link
                  key={club.id}
                  to={`/clubs/${club.id}`}
                  className="group flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-cyan-500/40 hover:-translate-y-0.5"
                >
                  {club.image ? (
                    <img
                      src={club.image}
                      alt={club.title}
                      className="h-14 w-14 flex-shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 flex-shrink-0 rounded-xl bg-slate-800 flex items-center justify-center text-2xl">
                      🎯
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold group-hover:text-cyan-400 transition">
                      {club.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">{club.description}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {club.currentMembers ?? club.members?.length ?? 0} / {club.maxMembers || '∞'} учасників
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      
      {faqs.length > 0 && (
        <section className="mx-auto max-w-4xl px-6 py-20">
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-widest text-cyan-400 mb-2">Питання</p>
            <h2 className="text-3xl font-bold flex items-center justify-center gap-3">
              <HelpCircle size={28} className="text-cyan-400" />
              Часті запитання
            </h2>
            <p className="mt-2 text-slate-400">Найпопулярніші питання від студентів</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden transition hover:border-slate-700"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <span className="font-medium pr-4">{faq.question}</span>
                  <span
                    className="text-cyan-400 text-xl flex-shrink-0 transition-transform"
                    style={{ transform: openFaq === faq.id ? 'rotate(180deg)' : 'none' }}
                  >
                    ↓
                  </span>
                </button>
                {openFaq === faq.id && (
                  <div className="border-t border-slate-800 px-5 pb-5 pt-4 text-slate-300 leading-relaxed text-sm">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 px-6 py-3 text-sm transition hover:bg-slate-800"
            >
              Всі запитання <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      
      {!isAuthenticated && (
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div
            className="relative overflow-hidden rounded-3xl border border-cyan-500/20 p-12 text-center"
            style={{
              background: 'radial-gradient(ellipse 80% 120% at 50% 120%, rgba(6,182,212,0.12) 0%, transparent 60%)',
            }}
          >
            <h2 className="text-3xl font-bold mb-3">Приєднуйся до StudentHub</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Реєструйся, щоб записуватись у гуртки, стежити за новинами та спілкуватись із спільнотою.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="rounded-2xl bg-cyan-500 px-8 py-3.5 font-semibold text-black transition hover:bg-cyan-400"
              >
                Створити акаунт
              </Link>
              <Link
                to="/login"
                className="rounded-2xl border border-slate-700 px-8 py-3.5 font-semibold transition hover:bg-slate-800"
              >
                Увійти
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
