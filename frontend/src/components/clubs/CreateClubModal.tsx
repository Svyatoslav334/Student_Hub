import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../../services/api';

interface CreateClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateClubModal = ({ isOpen, onClose, onSuccess }: CreateClubModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contact: '',
    leader: '',           
    schedule: '',         
    meetingTime: '',      
    maxMembers: 20,
  });

  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile/me');
        const profile = res.data.profile || res.data;
        if (profile) {
          setFormData(prev => ({
            ...prev,
            leader: `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
          }));
        }
      } catch (err) {
        console.error('Не вдалося завантажити профіль');
      }
    };

    if (isOpen) fetchProfile();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.contact) {
      alert('Заповніть обов’язкові поля!');
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('contact', formData.contact);
    data.append('leader', formData.leader);
    data.append('schedule', formData.schedule);
    data.append('meetingTime', formData.meetingTime);
    data.append('maxMembers', formData.maxMembers.toString());

    if (image) data.append('image', image);

    try {
      await api.post('/clubs', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Гурток успішно створено!');
      onSuccess();
      onClose();
      
      setFormData({
        title: '', description: '', contact: '', leader: '', 
        schedule: '', meetingTime: '', maxMembers: 20
      });
      setImage(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Помилка при створенні гуртка');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <h2 className="text-2xl font-semibold">Створити новий гурток</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-auto">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Назва гуртка *</label>
            <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} 
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3" />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Опис гуртка *</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 min-h-[100px]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Керівник (Leader)</label>
              <input type="text" value={formData.leader} onChange={e => setFormData({...formData, leader: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3" />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Контакт *</label>
              <input type="text" required value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Розклад</label>
              <input type="text" value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3" placeholder="Пн, Ср, Пт 18:00" />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Час зустрічі</label>
              <input type="text" value={formData.meetingTime} onChange={e => setFormData({...formData, meetingTime: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3" placeholder="18:00 - 20:00" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Максимальна кількість учасників</label>
            <input type="number" min="1" max="40" value={formData.maxMembers} 
              onChange={e => setFormData({...formData, maxMembers: parseInt(e.target.value)})} 
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3" />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Фото гуртка</label>
            <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center">
              <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} className="hidden" id="club-image" />
              <label htmlFor="club-image" className="cursor-pointer text-cyan-400">
                {image ? image.name : 'Вибрати фото'}
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 border border-slate-700 rounded-2xl hover:bg-slate-800">
              Скасувати
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-4 rounded-2xl">
              {loading ? 'Створення...' : 'Створити гурток'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClubModal;