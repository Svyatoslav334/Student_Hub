import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'sonner';

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const materialTypes = [
  { value: 'lecture', label: 'Лекція' },
  { value: 'presentation', label: 'Презентація' },
  { value: 'methodical', label: 'Методичні матеріали' },
  { value: 'other', label: 'Інше' },
];

const AddMaterialModal = ({ isOpen, onClose, onSuccess }: AddMaterialModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'lecture',
    categoryId: '',
  });

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!isOpen) return;

      setCategoriesLoading(true);
      try {
        const res = await api.get('/material-categories');
        setCategories(res.data);

        if (res.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            categoryId: String(res.data[0].id)
          }));
        }
      } catch (err) {
        console.error('Помилка завантаження категорій:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.categoryId || !file) {
      toast.error('Заповніть усі обов’язкові поля та оберіть файл!');
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('type', formData.type);
    data.append('categoryId', formData.categoryId);
    data.append('file', file);

    try {
      await api.post('/materials', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Матеріал успішно додано!');
      onSuccess();
      onClose();

      setFormData({
        title: '',
        description: '',
        type: 'lecture',
        categoryId: '',
      });
      setFile(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Помилка при додаванні матеріалу');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <h2 className="text-2xl font-semibold">Додати новий матеріал</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-auto max-h-[calc(95vh-80px)]"
        >
          <div>
            <label className="block text-sm text-slate-400 mb-2">Назва матеріалу</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-cyan-500"
              placeholder="Вступ до React"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Опис</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 min-h-[100px] focus:outline-none focus:border-cyan-500"
              placeholder="Короткий опис матеріалу..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Тип матеріалу</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-cyan-500"
              >
                {materialTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Категорія</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-cyan-500"
                required
                disabled={categoriesLoading}
              >
                {categoriesLoading ? (
                  <option>Завантаження категорій...</option>
                ) : categories.length === 0 ? (
                  <option>Немає доступних категорій</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Файл матеріалу</label>
            <div className="border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center hover:border-cyan-500 transition-colors">
              <Upload size={48} className="mx-auto text-slate-500 mb-4" />
              <p className="text-slate-300 mb-1">Перетягніть файл або натисніть для вибору</p>
              <p className="text-xs text-slate-500 mb-4">PDF, PPT, DOCX, ZIP та інші формати</p>

              <input
                type="file"
                required
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block bg-slate-800 hover:bg-slate-700 px-6 py-2.5 rounded-xl cursor-pointer text-sm transition"
              >
                {file ? file.name : 'Вибрати файл'}
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border border-slate-700 rounded-2xl hover:bg-slate-800 transition"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-black font-semibold py-4 rounded-2xl transition"
            >
              {loading ? 'Завантаження...' : 'Опублікувати матеріал'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMaterialModal;