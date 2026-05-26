import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../../services/api';

interface EditClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  club: any;
  onSuccess: () => void;
}

const EditClubModal = ({ isOpen, onClose, club, onSuccess }: EditClubModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contact: '',
    maxMembers: 20,
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (club) {
      setFormData({
        title: club.title,
        description: club.description,
        contact: club.contact,
        maxMembers: club.maxMembers || 20,
      });
    }
  }, [club]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('contact', formData.contact);
    data.append('maxMembers', formData.maxMembers.toString());
    if (image) data.append('image', image);

    try {
      await api.patch(`/clubs/${club.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Гурток успішно оновлено!');
      onSuccess();
      onClose();
      setImage(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Помилка при редагуванні');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !club) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <h2 className="text-2xl font-semibold">Редагувати гурток</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Назва гуртка</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Опис</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 min-h-[120px]"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Контакт</label>
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Макс. учасників</label>
            <input
              type="number"
              min="1"
              max="40"
              value={formData.maxMembers}
              onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Нове фото (необов’язково)</label>
            <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="hidden"
                id="edit-club-image"
              />
              <label htmlFor="edit-club-image" className="cursor-pointer text-cyan-400">
                {image ? image.name : 'Вибрати нове фото'}
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 border border-slate-700 rounded-2xl hover:bg-slate-800">
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

export default EditClubModal;