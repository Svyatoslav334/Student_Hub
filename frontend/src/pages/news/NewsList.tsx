import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

import { 
  Newspaper, 
  ArrowRight, 
  Calendar,
  Tag
} from 'lucide-react';

interface News {
  id: number;
  title: string;
  content: string;
  image?: string;
  category: string;
  pinned: boolean;
  createdAt: string;
  author?: {
    email: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

const categories = [
  { value: '', label: 'Всі новини' },
  { value: 'ANNOUNCEMENT', label: 'Оголошення' },
  { value: 'EVENT', label: 'Події' },
  { value: 'EDUCATION', label: 'Навчання' },
  { value: 'ADMINISTRATION', label: 'Адміністрація' },
];

const categoryColors: Record<string, string> = {
  ANNOUNCEMENT: '#f59e0b',
  EVENT: '#06b6d4',
  EDUCATION: '#10b981',
  ADMINISTRATION: '#8b5cf6',
};

const NewsList = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchNews();
  }, [search, category, page]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/news', {
        params: {
          search,
          category: category || undefined,
          page,
          limit: 9,
        },
      });

      setNews(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalItems(res.data.total || 0);
    } catch (err) {
      console.error('Failed to load news', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <Newspaper size={36} className="text-cyan-400" />
            <div>
              <h1 className="text-4xl font-bold">Новини та оголошення</h1>
              <p className="text-slate-400 mt-1">Актуальна інформація університету</p>
            </div>
          </div>
          <p className="text-slate-500">Знайдено: <span className="text-white font-medium">{totalItems}</span> публікацій</p>
        </div>

        
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Пошук новин..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-cyan-500 min-w-[200px]"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 rounded-3xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : news.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <Link
                to={`/news/${item.id}`}
                key={item.id}
                className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-cyan-500/50 transition-all hover:-translate-y-1 flex flex-col h-full"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-52 object-cover"
                  />
                ) : (
                  <div className="w-full h-52 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <Newspaper size={48} className="text-slate-700" />
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    {item.pinned && (
                      <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1 rounded-full">
                        📌 Закріплено
                      </span>
                    )}
                    <span
                      className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: `${categoryColors[item.category] || '#64748b'}22`,
                        color: categoryColors[item.category] || '#64748b',
                      }}
                    >
                      <Tag size={14} />
                      {item.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold mb-3 line-clamp-2 group-hover:text-cyan-400 transition">
                    {item.title}
                  </h3>

                  <p className="text-slate-400 line-clamp-3 text-sm mb-6 flex-1">
                    {item.content}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(item.createdAt).toLocaleDateString('uk-UA', {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </div>
                    {item.author?.profile && (
                      <span>
                        {item.author.profile.firstName} {item.author.profile.lastName}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <Newspaper size={64} className="mx-auto text-slate-700 mb-6" />
            <p className="text-2xl text-slate-400">За вашим запитом нічого не знайдено</p>
            <p className="text-slate-500 mt-2">Спробуйте змінити параметри пошуку</p>
          </div>
        )}

        
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-16">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition font-medium ${
                  p === page
                    ? 'bg-cyan-500 text-black'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsList;