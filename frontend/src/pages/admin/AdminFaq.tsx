import { useEffect, useState } from 'react';
import { Plus, Trash, Pencil } from 'lucide-react';
import { faqApi } from '../../services/faqApi.service';

const emptyForm = {
  question: '',
  answer: '',
  category: 'OTHER',
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
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadFaq();
  }, []);

  const loadFaq = async () => {
    setLoading(true);
    try {
      const res = await faqApi.getAll({ showUnpublished: true, limit: 50 });
      setItems(res.data.items);
    } finally {
      setLoading(false);
    }
  };

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
      answer: item.answer,
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
        answer: item.answer,
        category: item.category ?? 'OTHER',
        isPublished: !item.isPublished,
      };
      await faqApi.update(item.id, payload);
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, isPublished: !i.isPublished } : i
        )
      );
    } catch (err: any) {
      console.log('ERROR MESSAGE:', err.message);
    }
  };

  const newFromStudents = items.filter((i) => getItemStatus(i) === 'student');
  const awaitingAnswer = items.filter((i) => getItemStatus(i) === 'awaiting');

  return (
    <div>
      
    <div className="flex justify-between items-center mb-6 gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">FAQ</h1>
        <p className="text-slate-400 text-sm sm:text-base">Адміністрування питань</p>
      </div>
      <button
        onClick={() => setShowForm(true)}
        className="bg-cyan-500 px-4 py-2.5 rounded-xl flex items-center gap-2 shrink-0"
      >
        <Plus size={18} />
        <span className="hidden sm:inline">Додати</span>
      </button>
    </div>

      
      {(newFromStudents.length > 0 || awaitingAnswer.length > 0) && (
        <div className="flex gap-3 mb-6 flex-wrap">
          {newFromStudents.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/40 bg-red-500/10">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium text-red-400">
                {newFromStudents.length} нових питань
              </span>
              <span className="text-xs text-red-500/70">(від студентів, останні 24г)</span>
            </div>
          )}
          {awaitingAnswer.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-yellow-500/40 bg-yellow-500/10">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">
                {awaitingAnswer.length} питань очікує відповідь
              </span>
            </div>
          )}
        </div>
      )}

      
      {showForm && (
        <div className="bg-slate-900 p-6 rounded-2xl mb-6 border border-slate-800">
          <input
            className="w-full mb-3 p-3 bg-slate-800 rounded-xl"
            placeholder="Питання"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
          />
          <textarea
            className="w-full mb-3 p-3 bg-slate-800 rounded-xl"
            placeholder="Відповідь"
            value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
          />
          <select
            className="w-full mb-3 p-3 bg-slate-800 rounded-xl"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
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
              className="bg-cyan-500 px-4 py-2 rounded-xl"
            >
              {editingId ? 'Оновити' : 'Створити'}
            </button>
            <button
              onClick={resetForm}
              className="bg-slate-700 px-4 py-2 rounded-xl"
            >
              Скасувати
            </button>
          </div>
        </div>
      )}

      
      <div className="space-y-3">
        {loading ? (
          <p className="text-slate-400">Завантаження...</p>
        ) : (
          items.map((item: any) => {
            const status = getItemStatus(item);

            const borderClass =
              status === 'student'
                ? 'border-red-500/40 border-l-4 border-l-red-500'
                : status === 'awaiting'
                ? 'border-yellow-500/40 border-l-4 border-l-yellow-500'
                : 'border-slate-800';

            return (
              <div
                key={item.id}
                className={`bg-slate-900 p-4 rounded-2xl border flex justify-between ${borderClass}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {status === 'student' && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-500/10 text-red-400 border border-red-500/30">
                        🔴 Нове від студента
                      </span>
                    )}
                    {status === 'awaiting' && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                        🟡 Очікує відповідь
                      </span>
                    )}
                    {status === 'normal' && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          item.isPublished
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-yellow-500/10 text-yellow-400'
                        }`}
                      >
                        {item.isPublished ? 'published' : 'draft'}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">{item.category}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleString('uk-UA', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <h3 className="font-semibold">{item.question}</h3>
                  <p className="text-slate-400 text-sm mt-1">
                    {item.answer || '— немає відповіді —'}
                  </p>

                  {status === 'normal' && (
                    <button
                      onClick={() => togglePublish(item)}
                      className={`mt-2 text-xs px-2 py-1 rounded-lg border transition ${
                        item.isPublished
                          ? 'border-green-500 text-green-400 hover:bg-green-500/10'
                          : 'border-yellow-500 text-yellow-400 hover:bg-yellow-500/10'
                      }`}
                    >
                      Toggle
                    </button>
                  )}
                </div>

                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 hover:bg-slate-800 rounded-lg"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminFaq;