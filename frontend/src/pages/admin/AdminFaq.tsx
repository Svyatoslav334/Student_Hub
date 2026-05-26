import { useEffect, useState } from 'react';
import { Plus, Trash, Pencil } from 'lucide-react';
import { faqApi } from '../../services/faqApi.service';

const emptyForm = {
  question: '',
  answer: '',
  category: 'OTHER',
  isPublished: true,
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
      const res = await faqApi.getAll({
        showUnpublished: true,
        limit: 50,
      });

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
          i.id === item.id
            ? { ...i, isPublished: !i.isPublished }
            : i
        )
      );
    } catch (err: any) {
      console.log('ERROR MESSAGE:', err.message);
    }
  };

  return (
    <div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">FAQ</h1>
          <p className="text-slate-400">
            Адміністрування питань
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="bg-cyan-500 px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus size={18} />
          Додати
        </button>
      </div>

      
      {showForm && (
        <div className="bg-slate-900 p-6 rounded-2xl mb-6 border border-slate-800">
          <input
            className="w-full mb-3 p-3 bg-slate-800 rounded-xl"
            placeholder="Питання"
            value={form.question}
            onChange={(e) =>
              setForm({ ...form, question: e.target.value })
            }
          />

          <textarea
            className="w-full mb-3 p-3 bg-slate-800 rounded-xl"
            placeholder="Відповідь"
            value={form.answer}
            onChange={(e) =>
              setForm({ ...form, answer: e.target.value })
            }
          />

          <select
            className="w-full mb-3 p-3 bg-slate-800 rounded-xl"
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value,
              })
            }
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
          items.map((item: any) => (
            <div
              key={item.id}
              className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between"
            >
              
              <div>
                <h3 className="font-semibold">
                  {item.question}
                </h3>

                <p className="text-slate-400 text-sm mt-1">
                  {item.answer || '— немає відповіді —'}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-400">
                    {item.category}
                  </span>

                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      item.isPublished
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-yellow-500/10 text-yellow-400'
                    }`}
                  >
                    {item.isPublished
                      ? 'published'
                      : 'draft'}
                  </span>

                  
                  <button
                    onClick={() => togglePublish(item)}
                    className={`text-xs px-2 py-1 rounded-lg border transition ${
                      item.isPublished
                        ? 'border-green-500 text-green-400 hover:bg-green-500/10'
                        : 'border-yellow-500 text-yellow-400 hover:bg-yellow-500/10'
                    }`}
                  >
                    Toggle
                  </button>
                </div>
              </div>

              
              <div className="flex gap-2">
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
          ))
        )}
      </div>
    </div>
  );
};

export default AdminFaq;