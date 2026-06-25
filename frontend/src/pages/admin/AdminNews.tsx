import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Edit, Pin } from 'lucide-react';
import api from '../../services/api';
import NewsModal from '../../components/admin/NewsModal';
import Pagination from '../../components/Pagination';

const AdminNews = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/news', {
        params: {
          page,
          limit: 20,
          search: search.trim() || undefined,
          category: categoryFilter || undefined,
        },
      });

      setNews(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Помилка завантаження новин:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter]);

  const openCreate = () => {
    setEditItem(null);
    setModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setModalOpen(true);
  };

  const deleteNews = async (id: number) => {
    if (!confirm('Видалити новину?')) return;
    try {
      await api.delete(`/news/${id}`);
      fetchNews();
    } catch (err) {
      console.error(err);
    }
  };

  const sortedNews = [...news].sort((a, b) => b.id - a.id);

  return (
    <div>
      <div className="flex justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold">Новини</h1>
          <p className="text-slate-400 text-sm sm:text-base">CRUD керування новинами</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl flex items-center gap-2 shrink-0 transition"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Створити новину</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Пошук по заголовку..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 flex-1 min-w-[260px] focus:border-cyan-500 outline-none"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3"
        >
          <option value="">Всі категорії</option>
          <option value="ANNOUNCEMENT">ANNOUNCEMENT</option>
          <option value="EVENT">EVENT</option>
          <option value="EDUCATION">EDUCATION</option>
          <option value="ADMINISTRATION">ADMINISTRATION</option>
        </select>
      </div>

      {loading ? (
        <p className="text-slate-400 py-8 text-center">Завантаження...</p>
      ) : sortedNews.length === 0 ? (
        <p className="text-slate-400 py-8 text-center">Новин не знайдено</p>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:hidden">
            {sortedNews.map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {item.pinned && <Pin size={16} className="text-amber-400" />}
                      <p className="font-medium truncate">{item.title}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{item.category}</span>
                      <span>•</span>
                      <span>{new Date(item.createdAt).toLocaleDateString('uk-UA')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteNews(item.id)}
                      className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden sm:block bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
            <table className="w-full">
              <thead className="text-left text-slate-400 border-b border-slate-800 bg-slate-950/50">
                <tr>
                  <th className="p-4 w-16">ID</th>
                  <th className="p-4">Заголовок</th>
                  <th className="p-4">Категорія</th>
                  <th className="p-4 text-center">Pinned</th>
                  <th className="p-4">Дата</th>
                  <th className="text-right p-4 w-24">Дії</th>
                </tr>
              </thead>
              <tbody>
                {sortedNews.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-800 hover:bg-slate-800/50 transition"
                  >
                    <td className="p-4 font-mono text-slate-500">{item.id}</td>
                    <td className="p-4 font-medium">
                      <div className="flex items-center gap-2">
                        {item.pinned && <Pin size={18} className="text-amber-400" />}
                        {item.title}
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">{item.category}</td>
                    <td className="p-4 text-center">
                      {item.pinned ? '📌' : '—'}
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(item.createdAt).toLocaleString('uk-UA', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openEdit(item)}
                          className="text-yellow-400 hover:text-yellow-300 transition"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => deleteNews(item.id)}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <NewsModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditItem(null);
        }}
        onSuccess={fetchNews}
        initialData={editItem}
      />
    </div>
  );
};

export default AdminNews;
