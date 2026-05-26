import { useEffect, useState } from 'react';
import api from '../../services/api';

const emptyForm = {
  title: '',
  content: '',
  category: 'ANNOUNCEMENT',
  pinned: false,
};

const NewsModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: any) => {
  const isEdit = !!initialData;

  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title,
        content: initialData.content,
        category: initialData.category,
        pinned: initialData.pinned,
      });

      setPreview(initialData.image || null);
    } else {
      setForm(emptyForm);
      setPreview(null);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleImage = (file: File | null) => {
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

const handleSubmit = async () => {
  console.log('FINAL FORM STATE:', form);

  const data = new FormData();

  data.append('title', form.title);
  data.append('content', form.content);
  data.append('category', form.category);
  data.append('pinned', form.pinned ? 'true' : 'false');

  if (image) {
    data.append('image', image);
  }

  await api.patch(`/news/${initialData.id}`, data);

  onSuccess();
  onClose();
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-[900px] max-w-[95%] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-semibold">
              {isEdit ? 'Редагування новини' : 'Створення новини'}
            </h2>

            <p className="text-slate-400 text-sm mt-1">
              Заповніть дані та опублікуйте контент
            </p>
          </div>

          <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            {isEdit ? 'EDIT MODE' : 'CREATE MODE'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 p-6">
          
          <div className="space-y-4">
            
            <div>
              <label className="text-sm text-slate-400">
                Заголовок
              </label>

              <input
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
                className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none transition"
                placeholder="Введіть заголовок..."
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">
                Контент
              </label>

              <textarea
                value={form.content}
                onChange={(e) =>
                  setForm({
                    ...form,
                    content: e.target.value,
                  })
                }
                className="w-full mt-1 px-4 py-3 h-40 rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none transition resize-none"
                placeholder="Текст новини..."
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">
                Категорія
              </label>

              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                  })
                }
                className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none"
              >
                <option value="ANNOUNCEMENT">Announcement</option>
                <option value="EVENT">Event</option>
                <option value="EDUCATION">Education</option>
                <option value="ADMINISTRATION">Administration</option>
              </select>
            </div>

            <label className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 cursor-pointer">
              <span className="text-slate-300">
                Закріпити (Pinned)
              </span>

              <input
                type="checkbox"
                checked={!!form.pinned}
                onChange={(e) => {
                  const value = e.target.checked;

                  console.log('PIN CHANGE:', value);

                  setForm((prev) => ({
                    ...prev,
                    pinned: value,
                  }));
                }}
              />
            </label>
          </div>

          <div className="space-y-4">
            
            <div>
              <label className="text-sm text-slate-400">
                Зображення
              </label>

              <div className="mt-1 border border-dashed border-slate-700 rounded-xl p-4 text-center">
                <input
                  type="file"
                  onChange={(e) =>
                    handleImage(e.target.files?.[0] || null)
                  }
                  className="text-sm"
                />

                {preview && (
                  <img
                    src={preview}
                    className="mt-4 w-full h-48 object-cover rounded-xl border border-slate-700"
                  />
                )}
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h3 className="text-sm text-slate-400 mb-2">
                Preview
              </h3>

              <p className="font-semibold text-white">
                {form.title || 'Заголовок...'}
              </p>

              <p className="text-slate-400 text-sm mt-2 line-clamp-4">
                {form.content || 'Контент...'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
          >
            Скасувати
          </button>

          <button
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 transition font-medium"
          >
            {isEdit ? 'Зберегти зміни' : 'Створити'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsModal;