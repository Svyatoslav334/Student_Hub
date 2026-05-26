import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { Save, User, Edit2, X } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuthStore();
  const isTeacher = user?.role === 'TEACHER';

  const [profile, setProfile] = useState<any>(null);
  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  const [teacherFormData, setTeacherFormData] = useState({
    department: '',
    subject: '',
    cabinet: '',
    consultationHours: '',
    bio: '',
    phone: '',
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Загальний профіль
      const profileRes = await api.get('/profile/me');
      setProfile(profileRes.data);

      setFormData({
        firstName: profileRes.data.profile?.firstName || '',
        lastName: profileRes.data.profile?.lastName || '',
        phone: profileRes.data.profile?.phone || '',
      });

      // Якщо викладач — завантажуємо додаткові дані
      if (isTeacher) {
        const teacherRes = await api.get('/teachers/me');
        setTeacherProfile(teacherRes.data);

        setTeacherFormData({
          department: teacherRes.data.department || '',
          subject: teacherRes.data.subject || '',
          cabinet: teacherRes.data.cabinet || '',
          consultationHours: teacherRes.data.consultationHours || '',
          bio: teacherRes.data.bio || '',
          phone: teacherRes.data.phone || '',
        });
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch('/profile/me', formData);
      alert('Загальну інформацію оновлено!');
      fetchAllData();
    } catch (err) {
      alert('Помилка оновлення');
    }
  };

  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = Object.fromEntries(
        Object.entries(teacherFormData).filter(([_, v]) => v !== '')
      );
      await api.patch('/teachers/me', payload);
      alert('Викладацькі дані оновлено!');
      fetchAllData();
    } catch (err) {
      alert('Помилка оновлення викладацьких даних');
    }
  };

  if (loading) return <div className="p-8 text-center">Завантаження...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">Мій профіль</h1>
            <p className="text-slate-400 mt-1">{user?.email}</p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
          >
            {editing ? <X size={20} /> : <Edit2 size={20} />}
            {editing ? 'Скасувати' : 'Редагувати'}
          </button>
        </div>

        
        <div className="flex flex-col items-center mb-10">
          <img
            src={profile?.profile?.avatar || '/default-avatar.png'}
            alt="avatar"
            className="w-32 h-32 rounded-2xl object-cover border-4 border-slate-700"
          />
          <button className="mt-3 text-cyan-400 text-sm hover:underline">
            Змінити аватарку
          </button>
        </div>

        
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User size={22} /> Загальна інформація
          </h2>

          {!editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-slate-400 text-sm">Ім'я</p>
                <p className="text-lg">{profile?.profile?.firstName || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Прізвище</p>
                <p className="text-lg">{profile?.profile?.lastName || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Телефон</p>
                <p className="text-lg">{profile?.profile?.phone || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Роль</p>
                <p className="text-lg capitalize">{user?.role}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateGeneral} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Ім'я</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Прізвище</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-1">Телефон</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                  />
                </div>
              </div>
              <button type="submit" className="bg-cyan-500 text-black px-6 py-3 rounded-xl font-semibold">
                Зберегти загальну інформацію
              </button>
            </form>
          )}
        </div>

        
        {isTeacher && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Викладацькі дані</h2>

            {!editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-slate-400">Кафедра</p>
                  <p className="font-medium">{teacherProfile?.department || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Предмет</p>
                  <p className="font-medium">{teacherProfile?.subject || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Кабінет</p>
                  <p className="font-medium">{teacherProfile?.cabinet || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Години консультацій</p>
                  <p className="font-medium">{teacherProfile?.consultationHours || '—'}</p>
                </div>
                {teacherProfile?.bio && (
                  <div className="md:col-span-2">
                    <p className="text-slate-400">Біографія</p>
                    <p className="text-slate-300 whitespace-pre-line">{teacherProfile.bio}</p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleUpdateTeacher} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Кафедра</label>
                    <input
                      type="text"
                      value={teacherFormData.department}
                      onChange={(e) => setTeacherFormData({ ...teacherFormData, department: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Предмет</label>
                    <input
                      type="text"
                      value={teacherFormData.subject}
                      onChange={(e) => setTeacherFormData({ ...teacherFormData, subject: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Кабінет</label>
                    <input
                      type="text"
                      value={teacherFormData.cabinet}
                      onChange={(e) => setTeacherFormData({ ...teacherFormData, cabinet: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Години консультацій</label>
                    <input
                      type="text"
                      value={teacherFormData.consultationHours}
                      onChange={(e) => setTeacherFormData({ ...teacherFormData, consultationHours: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                      placeholder="Наприклад: Пн, Ср 14:00-16:00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Біографія</label>
                  <textarea
                    value={teacherFormData.bio}
                    onChange={(e) => setTeacherFormData({ ...teacherFormData, bio: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 min-h-[120px]"
                    placeholder="Коротка інформація про вас як викладача..."
                  />
                </div>

                <button type="submit" className="bg-cyan-500 text-black px-6 py-3 rounded-xl font-semibold">
                  Зберегти викладацькі дані
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;