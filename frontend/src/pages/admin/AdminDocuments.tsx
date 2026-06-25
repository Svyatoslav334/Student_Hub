import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash, Pencil, File } from 'lucide-react';
import { DocumentsAPI } from '../../services/documents.api';
import DocumentModal from '../../components/admin/DocumentModal';
import CategoryModal from '../../components/admin/CategoryModal';
import Pagination from '../../components/admin/Pagination';

const AdminDocuments = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const [page, setPage] = useState(1);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [openModal, setOpenModal] = useState(false);
  const [editDoc, setEditDoc] = useState<any>(null);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [docsRes, catsRes] = await Promise.all([
        DocumentsAPI.getAll({
          page,
          limit: 20,
          search: search.trim() || undefined,
          categoryId: categoryFilter || undefined,
          type: typeFilter || undefined,
          showUnpublished: true,
        }),
        DocumentsAPI.getCategories(),
      ]);

      setDocuments(docsRes.data.items || []);
      setTotalPages(docsRes.data.totalPages || 1);
      setCategories(catsRes.data || []);
    } catch (err) {
      console.error('Помилка завантаження документів:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, typeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, typeFilter]);

  const handleDelete = async (id: number) => {
    if (!confirm('Видалити документ?')) return;
    await DocumentsAPI.remove(id);
    fetchData();
  };

  const openCreate = () => {
    setEditDoc(null);
    setOpenModal(true);
  };

  const openEdit = (doc: any) => {
    setEditDoc(doc);
    setOpenModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold">Документи</h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Управління файлами, шаблонами і формами
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setOpenCategoryModal(true)}
            className="px-3 py-2.5 sm:px-4 sm:py-2 bg-slate-800 rounded-xl text-sm hover:bg-slate-700 transition"
          >
            Категорії
          </button>
          <button
            onClick={openCreate}
            className="px-3 py-2.5 sm:px-4 sm:py-2 bg-cyan-500 text-black rounded-xl flex items-center gap-2 text-sm hover:bg-cyan-400 transition"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Додати документ</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Пошук по назві..."
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
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3"
        >
          <option value="">Всі типи</option>
          <option value="template">Шаблон (template)</option>
          <option value="sample">Приклад (sample)</option>
          <option value="form">Форма (form)</option>
          <option value="reference">Довідка (reference)</option>
          <option value="other">Інше (other)</option>
        </select>
      </div>
      
      {loading ? (
        <p className="text-slate-400 py-8 text-center">Завантаження...</p>
      ) : documents.length === 0 ? (
        <p className="text-slate-400 py-8 text-center">Документів не знайдено</p>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl gap-3"
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold truncate">{doc.title}</h3>
                <p className="text-sm text-slate-400">
                  {doc.category?.name} • {doc.type}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(doc.createdAt).toLocaleDateString('uk-UA')}
                </p>
              </div>

              <div className="flex gap-2 items-center shrink-0">
                {doc.file && (
                  <a
                    href={doc.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl hover:bg-cyan-500/20 transition"
                  >
                    <File size={18} />
                  </a>
                )}

                <button
                  onClick={() => openEdit(doc)}
                  className="p-2 bg-yellow-500/10 text-yellow-400 rounded-xl hover:bg-yellow-500/20 transition"
                >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition"
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {openModal && (
        <DocumentModal
          onClose={() => {
            setOpenModal(false);
            setEditDoc(null);
          }}
          onSuccess={fetchData}
          editData={editDoc}
          categories={categories}
        />
      )}

      {openCategoryModal && (
        <CategoryModal
          onClose={() => setOpenCategoryModal(false)}
          categories={categories}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};

export default AdminDocuments;
