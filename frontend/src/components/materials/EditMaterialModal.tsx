import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { api } from '../../services/api';

interface EditMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: any;
  onSuccess: () => void;
}

const materialTypes = [
  { value: 'lecture', label: 'Лекція' },
  { value: 'presentation', label: 'Презентація' },
  { value: 'methodical', label: 'Методичні матеріали' },
  { value: 'other', label: 'Інше' },
];

const EditMaterialModal = ({ isOpen, onClose, material, onSuccess }: EditMaterialModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'lecture',
    categoryId: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [, setCategoriesLoading] = useState(false);

  useEffect(() => {
    if (material && isOpen) {
      setFormData({
        title: material.title,
        description: material.description,
        type: material.type,
        categoryId: material.category?.id?.toString() || '',
      });
    }
  }, [material, isOpen]);

  
  useEffect(() => {
    const fetchCategories = async () => {
      if (!isOpen) return;
      setCategoriesLoading(true);
      try {
        const res = await api.get('/material-categories');
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.categoryId) {
        alert('Заповніть обов’язкові поля!');
        return;
    }

    setLoading(true);
    const formDataToSend = new FormData();

    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('type', formData.type);           
    formDataToSend.append('categoryId', formData.categoryId);

    if (file) {
        formDataToSend.append('file', file);
    }

    try {
        await api.patch(`/materials/${material.id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        });

        alert('Матеріал успішно оновлено!');
        onSuccess();
        onClose();
        setFile(null);
    } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.message || 'Помилка при оновленні матеріалу');
    } finally {
        setLoading(false);
    }
    };

  if (!isOpen || !material) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <h2 className="text-2xl font-semibold">Редагувати матеріал</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-auto max-h-[calc(95vh-80px)]">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Назва матеріалу</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Опис</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 min-h-[100px] focus:border-cyan-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Тип матеріалу</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 focus:border-cyan-500"
              >
                {materialTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Категорія</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 focus:border-cyan-500"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Новий файл (необов’язково)</label>
            <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center">
              <Upload size={40} className="mx-auto text-slate-500 mb-3" />
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="edit-file"
              />
              <label htmlFor="edit-file" className="cursor-pointer text-cyan-400 hover:text-cyan-300">
                {file ? file.name : 'Вибрати новий файл'}
              </label>
            </div>
            {material.file && !file && (
              <p className="text-xs text-slate-500 mt-2">Поточний файл: {material.originalFileName}</p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border border-slate-700 rounded-2xl hover:bg-slate-800"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-black font-semibold py-4 rounded-2xl"
            >
              {loading ? 'Збереження...' : 'Зберегти зміни'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMaterialModal;
