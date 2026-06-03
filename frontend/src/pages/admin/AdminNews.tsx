import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Trash2, Edit, Plus } from 'lucide-react';
import NewsModal from '../../components/admin/NewsModal';

const AdminNews = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/news?limit=100');
      setNews(res.data.items);
    } finally {
      setLoading(false);
    }
  };

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
    await api.delete(`/news/${id}`);
    fetchNews();
  };

  return (
    <div>
      
      <div className="flex justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold">Новини</h1>
          <p className="text-slate-400 text-sm sm:text-base">CRUD керування новинами</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl flex items-center gap-2 shrink-0"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Створити</span>
        </button>
      </div>

      {loading ? (
        <p className="text-slate-400 p-4">Завантаження...</p>
      ) : (
        <>
          
          <div className="flex flex-col gap-3 sm:hidden">
            {news.map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-slate-400">{item.category}</span>
                      {item.pinned && <span className="text-xs">📌</span>}
                      <span className="text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteNews(item.id)}
                      className="p-2 rounded-xl bg-red-500/10 text-red-400"
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
              <thead className="text-left text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">ID</th>
                  <th>Заголовок</th>
                  <th>Категорія</th>
                  <th>Pinned</th>
                  <th>Дата</th>
                  <th className="text-right p-4">Дії</th>
                </tr>
              </thead>
              <tbody>
                {news.map((item) => (
                  <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                    <td className="p-4">{item.id}</td>
                    <td className="font-medium">{item.title}</td>
                    <td className="text-slate-400">{item.category}</td>
                    <td>{item.pinned ? '📌' : ''}</td>
                    <td className="text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => openEdit(item)} className="text-yellow-400">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => deleteNews(item.id)} className="text-red-400">
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

      <NewsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchNews}
        initialData={editItem}
      />
    </div>
  );
};

export default AdminNews;