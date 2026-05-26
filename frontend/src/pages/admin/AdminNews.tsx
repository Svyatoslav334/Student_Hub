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
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Новини</h1>
          <p className="text-slate-400">
            CRUD керування новинами
          </p>
        </div>

        <button
          onClick={openCreate}
          className="bg-cyan-500 hover:bg-cyan-600 px-5 py-3 rounded-2xl flex items-center gap-2"
        >
          <Plus size={18} />
          Створити
        </button>
      </div>

      
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
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
            {loading ? (
              <tr>
                <td colSpan={6} className="p-4">
                  Loading...
                </td>
              </tr>
            ) : (
              news.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-800 hover:bg-slate-800/30"
                >
                  <td className="p-4">{item.id}</td>

                  <td className="font-medium">
                    {item.title}
                  </td>

                  <td className="text-slate-400">
                    {item.category}
                  </td>

                  <td>{item.pinned ? '📌' : ''}</td>

                  <td className="text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-4">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => openEdit(item)}
                        className="text-yellow-400"
                      >
                        <Edit size={18} />
                      </button>

                      <button
                        onClick={() =>
                          deleteNews(item.id)
                        }
                        className="text-red-400"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      
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