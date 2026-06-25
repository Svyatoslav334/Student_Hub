import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'sonner';
import { useValidation, RULES } from '../../hooks/useValidation';

const FIELD_RULES = {
  title:       [RULES.required(), RULES.minLength(2), RULES.maxLength(255)],
  description: [RULES.required(), RULES.minLength(10)],
  contact:     [RULES.required(), RULES.minLength(3)],
};

const inputCls = (touched: boolean, error: string) =>
  `w-full bg-slate-800 border rounded-2xl px-4 py-3 focus:outline-none transition ${
    !touched ? 'border-slate-700 focus:border-cyan-500' :
    error ? 'border-red-500' : 'border-green-600'
  }`;

interface CreateClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateClubModal = ({ isOpen, onClose, onSuccess }: CreateClubModalProps) => {
  const [formData, setFormData] = useState({
    title: '', description: '', contact: '', schedule: '', meetingTime: '', maxMembers: 20,
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { errors, touched, touchField, validateField, validateAll } = useValidation(FIELD_RULES);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile/me');
        const user = res.data.user || res.data.profile?.user || res.data;
        setCurrentUser(user);
      } catch {}
    };
    if (isOpen) fetchProfile();
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) validateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll({ title: formData.title, description: formData.description, contact: formData.contact })) return;

    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('contact', formData.contact);
    data.append('schedule', formData.schedule || '');
    data.append('meetingTime', formData.meetingTime || '');
    data.append('maxMembers', formData.maxMembers.toString());
    if (currentUser?.id) data.append('leaderId', currentUser.id.toString());
    if (image) data.append('image', image);

    try {
      await api.post('/clubs', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Гурток успішно створено!');
      onSuccess();
      onClose();
      setFormData({ title: '', description: '', contact: '', schedule: '', meetingTime: '', maxMembers: 20 });
      setImage(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Не вдалося створити гурток');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <h2 className="text-2xl font-semibold">Створити новий гурток</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-auto max-h-[calc(95vh-80px)]" noValidate>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Назва гуртка *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => set('title', e.target.value)}
              onBlur={e => touchField('title', e.target.value)}
              className={inputCls(!!touched.title, errors.title)}
              placeholder="Програмування, Музика..."
            />
            {touched.title && errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Опис гуртка *</label>
            <textarea
              value={formData.description}
              onChange={e => set('description', e.target.value)}
              onBlur={e => touchField('description', e.target.value)}
              className={`${inputCls(!!touched.description, errors.description)} min-h-[100px] resize-y`}
            />
            {touched.description && errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Керівник</label>
            <input
              type="text"
              value={currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() : ''}
              disabled
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Контакт *</label>
            <input
              type="text"
              value={formData.contact}
              onChange={e => set('contact', e.target.value)}
              onBlur={e => touchField('contact', e.target.value)}
              className={inputCls(!!touched.contact, errors.contact)}
              placeholder="@telegram або email"
            />
            {touched.contact && errors.contact && <p className="text-red-400 text-xs mt-1">{errors.contact}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Розклад</label>
              <input
                type="text"
                value={formData.schedule}
                onChange={e => setFormData({ ...formData, schedule: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-cyan-500"
                placeholder="Пн, Ср, Пт 18:00"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Час зустрічі</label>
              <input
                type="text"
                value={formData.meetingTime}
                onChange={e => setFormData({ ...formData, meetingTime: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-cyan-500"
                placeholder="18:00 - 20:00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Максимальна кількість учасників</label>
            <input
              type="number"
              min="1"
              max="40"
              value={formData.maxMembers}
              onChange={e => setFormData({ ...formData, maxMembers: parseInt(e.target.value) || 20 })}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Фото гуртка</label>
            <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center">
              <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} className="hidden" id="club-image" />
              <label htmlFor="club-image" className="cursor-pointer text-cyan-400 hover:text-cyan-300">
                {image ? image.name : 'Натисніть для вибору фото'}
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 border border-slate-700 rounded-2xl hover:bg-slate-800">
              Скасувати
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-4 rounded-2xl transition disabled:opacity-60">
              {loading ? 'Створення...' : 'Створити гурток'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClubModal;
