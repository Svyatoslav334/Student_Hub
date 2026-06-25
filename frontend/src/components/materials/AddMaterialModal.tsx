import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'sonner';
import { useValidation, RULES } from '../../hooks/useValidation';

const FIELD_RULES = {
  title:       [RULES.required(), RULES.minLength(3), RULES.maxLength(255)],
  description: [RULES.required(), RULES.minLength(10)],
  categoryId:  [RULES.required('Оберіть категорію')],
};

const inputCls = (touched: boolean, error: string) =>
  `w-full bg-slate-800 border rounded-2xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition ${
    !touched ? 'border-slate-700' : error ? 'border-red-500' : 'border-green-600'
  }`;

const materialTypes = [
  { value: 'lecture',      label: 'Лекція' },
  { value: 'presentation', label: 'Презентація' },
  { value: 'methodical',   label: 'Методичні матеріали' },
  { value: 'other',        label: 'Інше' },
];

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddMaterialModal = ({ isOpen, onClose, onSuccess }: AddMaterialModalProps) => {
  const [formData, setFormData] = useState({ title: '', description: '', type: 'lecture', categoryId: '' });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const { errors, touched, touchField, validateField, validateAll } = useValidation(FIELD_RULES);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!isOpen) return;
      try {
        const res = await api.get('/material-categories');
        setCategories(res.data);
        if (res.data.length > 0) setFormData(prev => ({ ...prev, categoryId: String(res.data[0].id) }));
      } catch {}
    };
    fetchCategories();
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) validateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const vals = { title: formData.title, description: formData.description, categoryId: formData.categoryId };
    const valid = validateAll(vals);
    const hasFile = !!file;
    if (!hasFile) setFileError('Оберіть файл');
    if (!valid || !hasFile) return;

    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('type', formData.type);
    data.append('categoryId', formData.categoryId);
    data.append('file', file!);

    try {
      await api.post('/materials', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Матеріал успішно додано!');
      onSuccess();
      onClose();
      setFormData({ title: '', description: '', type: 'lecture', categoryId: '' });
      setFile(null);
      setFileError('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Помилка при додаванні матеріалу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <h2 className="text-2xl font-semibold">Додати новий матеріал</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-auto max-h-[calc(95vh-80px)]" noValidate>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Назва матеріалу *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => set('title', e.target.value)}
              onBlur={e => touchField('title', e.target.value)}
              className={inputCls(!!touched.title, errors.title)}
              placeholder="Вступ до React"
            />
            {touched.title && errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Опис *</label>
            <textarea
              value={formData.description}
              onChange={e => set('description', e.target.value)}
              onBlur={e => touchField('description', e.target.value)}
              className={`${inputCls(!!touched.description, errors.description)} min-h-[100px] resize-y`}
              placeholder="Короткий опис матеріалу..."
            />
            {touched.description && errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Тип матеріалу</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-cyan-500"
              >
                {materialTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Категорія *</label>
              <select
                value={formData.categoryId}
                onChange={e => set('categoryId', e.target.value)}
                onBlur={e => touchField('categoryId', e.target.value)}
                className={`w-full bg-slate-800 border rounded-2xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition ${
                  touched.categoryId && errors.categoryId ? 'border-red-500' : 'border-slate-700'
                }`}
              >
                {categories.length === 0
                  ? <option>Немає доступних категорій</option>
                  : categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                }
              </select>
              {touched.categoryId && errors.categoryId && <p className="text-red-400 text-xs mt-1">{errors.categoryId}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Файл матеріалу *</label>
            <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${fileError ? 'border-red-500' : 'border-slate-700 hover:border-cyan-500'}`}>
              <Upload size={48} className="mx-auto text-slate-500 mb-4" />
              <p className="text-slate-300 mb-1">Перетягніть файл або натисніть для вибору</p>
              <p className="text-xs text-slate-500 mb-4">PDF, PPT, DOCX, ZIP та інші формати</p>
              <input type="file" onChange={e => { setFile(e.target.files?.[0] || null); setFileError(''); }} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="inline-block bg-slate-800 hover:bg-slate-700 px-6 py-2.5 rounded-xl cursor-pointer text-sm transition">
                {file ? file.name : 'Вибрати файл'}
              </label>
            </div>
            {fileError && <p className="text-red-400 text-xs mt-1">{fileError}</p>}
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 border border-slate-700 rounded-2xl hover:bg-slate-800 transition">
              Скасувати
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-black font-semibold py-4 rounded-2xl transition">
              {loading ? 'Завантаження...' : 'Опублікувати матеріал'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMaterialModal;
