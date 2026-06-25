import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash, Pencil } from 'lucide-react';
import { faqApi } from '../../services/faqApi.service';
import Pagination from '../../components/admin/Pagination';

const emptyForm = {
  question: '',
  answer: '',
  category: 'OTHER' as const,
  isPublished: true,
};

const H24 = 24 * 60 * 60 * 1000;

const getItemStatus = (item: any) => {
  const isNew = Date.now() - new Date(item.createdAt).getTime() < H24;
  const hasNoAnswer = !item.answer || item.answer.trim() === '';

  if (!item.isPublished && hasNoAnswer && item.author && isNew) return 'student';
  if (!item.isPublished && hasNoAnswer) return 'awaiting';
  return 'normal';
};

const AdminFaq = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  // Пагінація
  const [page, setPage] = useState(1);

  // Фільтри (тільки те, що підтримує бекенд)
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadFaq = useCallback(async () => {
    setLoading(true);
    try {
      const res = await faqApi.getAll({
        page,
        limit: 20,
        search: search.trim() || undefined,
        category: categoryFilter || undefined,
        showUnpublished: true,        // важливо для адміна
      });

      setItems(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Помилка завантаження FAQ:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter]);

  useEffect(() => {
    loadFaq();
  }, [loadFaq]);

  // Скидаємо на першу сторінку при зміні фільтрів
  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await faqApi.update(editingId, form);
      } else {
        await faqApi.create(form);
      }
      resetForm();
      loadFaq();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (item: any) => {
    setForm({
      question: item.question,
      answer: item.answer || '',
      category: item.category,
      isPublished: item.isPublished,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Видалити FAQ?')) return;
    await faqApi.remove(id);
    loadFaq();
  };

  const togglePublish = async (item: any) => {
    try {
      const payload = {
        question: item.question,
        answer: item.answer || '',
        category: item.category ?? 'OTHER',
        isPublished: !item.isPublished,
      };
      await faqApi.update(item.id, payload);
      loadFaq();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Заголовок */}
      <div className="flex justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">FAQ</h1>
          <p className="text-slate-400 text-sm sm:text-base">Адміністрування питань</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-cyan-500 px-4 py-2.5 rounded-xl flex items-center gap-2 shrink-0 hover:bg-cyan-400 transition"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Додати питання</span>
        </button>
      </div>

      {/* Фільтри */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Пошук по питанню..."
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
          <option value="ADMISSION">ADMISSION</option>
          <option value="DOCUMENTS">DOCUMENTS</option>
          <option value="STUDIES">STUDIES</option>
          <option value="SCHEDULE">SCHEDULE</option>
          <option value="CLUBS">CLUBS</option>
          <option value="TEACHERS">TEACHERS</option>
          <option value="OTHER">OTHER</option>
        </select>
      </div>

      {/* Форма створення/редагування */}
      {showForm && (
        <div className="bg-slate-900 p-6 rounded-2xl mb-6 border border-slate-800">
          <input
            className="w-full mb-3 p-3 bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Питання"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
          />
          <textarea
            className="w-full mb-3 p-3 bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[120px]"
            placeholder="Відповідь"
            value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
          />
          <select
            className="w-full mb-3 p-3 bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as any })}
          >
            <option value="ADMISSION">ADMISSION</option>
            <option value="DOCUMENTS">DOCUMENTS</option>
            <option value="STUDIES">STUDIES</option>
            <option value="SCHEDULE">SCHEDULE</option>
            <option value="CLUBS">CLUBS</option>
            <option value="TEACHERS">TEACHERS</option>
            <option value="OTHER">OTHER</option>
          </select>

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className="bg-cyan-500 hover:bg-cyan-400 px-6 py-2.5 rounded-xl text-black font-medium transition"
            >
              {editingId ? 'Оновити' : 'Створити'}
            </button>
            <button
              onClick={resetForm}
              className="bg-slate-700 hover:bg-slate-600 px-6 py-2.5 rounded-xl transition"
            >
              Скасувати
            </button>
          </div>
        </div>
      )}

      {/* Список FAQ */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-slate-400 py-8 text-center">Завантаження...</p>
        ) : items.length === 0 ? (
          <p className="text-slate-400 py-8 text-center">Нічого не знайдено</p>
        ) : (
          items.map((item: any) => {
            const status = getItemStatus(item);
            const borderClass =
              status === 'student'
                ? 'border-red-500/40 border-l-4 border-l-red-500'
                : status ===
