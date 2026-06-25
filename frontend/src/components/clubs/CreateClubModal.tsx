import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'sonner';
import { useValidation, RULES } from '../../hooks/useValidation';

const FIELD_RULES = {
  title: [
    RULES.required('Назва гуртка обов\'язкова'),
    RULES.minLength(2, 'Назва повинна містити мінімум 2 символи'),
    RULES.maxLength(255, 'Назва не може перевищувати 255 символів'),
  ],
  description: [
    RULES.required('Опис гуртка обов\'язковий'),
    RULES.minLength(10, 'Опис повинен містити мінімум 10 символів'),
  ],
  contact: [
    RULES.required('Контакт обов\'язковий'),
    RULES.minLength(3, 'Контакт повинен містити мінімум 3 символи'),
  ],
  schedule: [
    RULES.minLength(3, 'Розклад повинен містити мінімум 3 символи'),
  ],
  meetingTime: [
    RULES.minLength(3, 'Час зустрічі повинен містити мінімум 3 символи'),
  ],
  maxMembers: [
    RULES.required('Вкажіть максимальну кількість учасників'),
  ],
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
    title: '',
    description: '',
    contact: '',
    schedule: '',
    meetingTime: '',
    maxMembers: 20,
  });

  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const { errors, touched, touchField, validateField, validateAll } = useValidation(FIELD_RULES);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile/me');
        const user = res.data.user || res.data.profile?.user || res.data;
        setCurrentUser(user);
      } catch (err) {
        console.error('Не вдалося завантажити профіль', err);
      }
    };
    if (isOpen) fetchProfile();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));

    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleMaxMembersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 20;
    const clamped = Math.max(1, Math.min(40, value));
    
    setFormData(prev => ({ ...prev, maxMembers: clamped }));
    
    if (touched.maxMembers) {
      validateField('maxMembers', clamped.toString());
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError('');

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setImageError('Фото не повинно перевищувати 5 МБ');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setImageError('Оберіть зображення');
        return;
      }
      setImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateAll({
      title: formData.title,
      description: formData.description,
      contact: formData.contact,
      schedule: formData.schedule,
      meetingTime: formData.meetingTime,
      maxMembers: formData.maxMembers.toString(),
    });

    if (!isValid || imageError) return;

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
      await api.post('/clubs', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Гурток успішно створено!');
      onSuccess();
      onClose();

      // Reset form
      setFormData({
        title: '', description: '', contact: '', schedule: '',
        meetingTime: '', maxMembers: 20,
      });
      setImage(null);
      setImageError('');
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
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-auto max-h-[calc(95vh-80px)]" noValidate>
          {/* Назва */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Назва гуртка *</label>
            <input
              type="text"
              value={formData.title}
              onChange={handleChange('title')}
              onBlur={() => touchField('title', formData.title)}
              className={inputCls(!!touched.title, errors.title)}
              placeholder="Програмування, Музика..."
            />
            {touched.title && errors.title && (
              <p className="text-red-400 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Опис */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Опис гуртка *</label>
            <textarea
              value={formData.description}
              onChange={handleChange('description')}
              onBlur={() => touchField('description', formData.description)}
              className={`${inputCls(!!touched.description, errors.description)} min-h-[100px] resize-y`}
              placeholder="Детальний опис..."
            />
            {touched.description && errors.description && (
              <p className="text-red-400 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Керівник */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Керівник</label>
            <input
              type="text"
              value={currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() : ''}
              disabled
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-slate-400"
            />
          </div>

          {/* Контакт */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Контакт *</label>
            <input
              type="text"
              value={formData.contact}
              onChange={handleChange('contact')}
              onBlur={() => touchField('contact', formData.contact)}
              className={inputCls(!!touched.contact, errors.contact)}
              placeholder="@telegram або email"
            />
            {touched.contact && errors.contact && (
              <p className="text-red-400 text-xs mt-1">{errors.contact}</p>
            )}
          </div>

          {/* Розклад + Час зустрічі */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Розклад</label>
              <input
                type="text"
                value={formData.schedule}
                onChange={handleChange('schedule')}
                onBlur={() => touchField('schedule', formData.schedule)}
                className={inputCls(!!touched.schedule, errors.schedule)}
                placeholder="Пн, Ср, Пт 18:00"
              />
              {touched.schedule && errors.schedule && (
                <p className="text-red-400 text-xs mt-1">{errors.schedule}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Час зустрічі</label>
              <input
                type="text"
                value={formData.meetingTime}
                onChange={handleChange('meetingTime')}
                onBlur={() => touchField('meetingTime', formData.meetingTime)}
                className={inputCls(!!touched.meetingTime, errors.meetingTime)}
                placeholder="18:00 - 20:00"
              />
              {touched.meetingTime && errors.meetingTime && (
                <p className="text-red-400 text-xs mt-1">{errors.meetingTime}</p>
              )}
            </div>
          </div>

          {/* Максимальна кількість учасників */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Максимальна кількість учасників *</label>
            <input
              type="number"
              min="1"
              max="40"
              value={formData.maxMembers}
              onChange={handleMaxMembersChange}
              onBlur={() => touchField('maxMembers', formData.maxMembers.toString())}
              className={inputCls(!!touched.maxMembers, errors.maxMembers)}
            />
            {touched.maxMembers && errors.maxMembers && (
              <p className="text-red-400 text-xs mt-1">{errors.maxMembers}</p>
            )}
          </div>

          {/* Фото */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Фото гуртка</label>
            <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="club-image"
              />
              <label htmlFor="club-image" className="cursor-pointer text-cyan-400 hover:text-cyan-300 block">
                {image ? image.name : 'Натисніть для вибору фото'}
              </label>
            </div>
            {imageError && <p className="text-red-400 text-xs mt-1">{imageError}</p>}
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
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-4 rounded-2xl transition disabled:opacity-60"
            >
              {loading ? 'Створення...' : 'Створити гурток'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClubModal;
