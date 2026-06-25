import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useValidation, RULES } from '../../hooks/useValidation';

const FIELD_RULES = {
  title:   [RULES.required(), RULES.minLength(3), RULES.maxLength(255)],
  content: [RULES.required(), RULES.minLength(10)],
};

const inputCls = (touched: boolean, error: string) =>
  `w-full mt-1 px-4 py-3 rounded-xl bg-slate-800 border transition outline-none ${
    !touched ? 'border-slate-700 focus:border-cyan-500' :
    error ? 'border-red-500' : 'border-green-600'
  }`;

const emptyForm = { title: '', content: '', category: 'ANNOUNCEMENT', pinned: false };

const NewsModal = ({ isOpen, onClose, onSuccess, initialData }: any) => {
  const isEdit = !!initialData;
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { errors, touched, touchField, validateField, validateAll } = useValidation(FIELD_RULES);

  useEffect(() => {
    if (initialData) {
      setForm({ title: initialData.title, content: initialData.content, category: initialData.category, pinned: initialData.pinned });
      setPreview(initialData.image || null);
    } else {
      setForm(emptyForm);
      setPreview(null);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const set = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (touched[field]) validateField(field, value);
  };

  const handleSubmit = async () => {
    if (!validateAll({ title: form.title, content: form.content })) return;

    const data = new FormData();
    data.append('title', form.title);
    data.append('content', form.content);
    data.append('category', form.category);
    data.append('pinned', form.pinned ? 'true' : 'false');
    if (image) data.append('image', image);

    try {
      if (isEdit && initialData?.id) {
        await api.patch(`/news/${initialData.id}`, data);
      } else {
        await api.post('/news', data);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save news:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[900px] max-w-[95%] bg-slate-900 border border-slate-800 rounded-3xl card-hover animate-fade-in shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-semibold">{isEdit ? 'Редагування новини' : 'Створення новини'}</h2>
            <p className="text-slate-400 text-sm mt-1">Заповніть дані та опублікуйте контент</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            {isEdit ? 'EDIT MODE' : 'CREATE MODE'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400">Заголовок</label>
              <input
                value={form.title}
                onChange={e => set('title', e.target.value)}
                onBlur={e => touchField('title', e.target.value)}
                className={inputCls(!!touched.title, errors.title)}
                placeholder="Введіть заголовок..."
              />
              {touched.title && errors.title && (
                <p className="text-red-400 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-slate-400">Контент</label>
              <textarea
                value={form.content}
                onChange={e => set('content', e.target.value)}
                onBlur={e => touchField('content', e.target.value)}
                className={`${inputCls(!!touched.content, errors.content)} h-40 resize-none`}
                placeholder="Текст новини..."
              />
              {touched.content && errors.content && (
                <p className="text-red-400 text-xs mt-1">{errors.content}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-slate-400">Категорія</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none"
              >
                <option value="ANNOUNCEMENT">Announcement</option>
                <option value="EVENT">Event</option>
                <option value="EDUCATION">Education</option>
                <option value="ADMINISTRATION">Administration</option>
              </select>
            </div>

            <label className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 cursor-pointer">
              <span className="text-slate-300">Закріпити (Pinned)</span>
              <input
                type="checkbox"
                checked={!!form.pinned}
                onChange={e => setForm(prev => ({ ...prev, pinned: e.target.checked }))}
              />
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400">Зображення</label>
              <div className="mt-1 border border-dashed border-slate-700 rounded-xl p-4 text-center">
                <input
                  type="file"
                  onChange={e => {
                    const file = e.target.files?.[0] || null;
                    setImage(file);
                    if (file) setPreview(URL.createObjectURL(file));
                  }}
                  className="text-sm"
                />
                {preview && (
                  <img src={preview} className="mt-4 w-full h-48 object-cover rounded-xl border border-slate-700" />
                )}
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h3 className="text-sm text-slate-400 mb-2">Preview</h3>
              <p className="font-semibold text-white">{form.title || 'Заголовок...'}</p>
              <p className="text-slate-400 text-sm mt-2 line-clamp-4">{form.content || 'Контент...'}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/40">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition">
            Скасувати
          </button>
          <button onClick={handleSubmit} className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 transition font-medium">
            {isEdit ? 'Зберегти зміни' : 'Створити'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsModal;
