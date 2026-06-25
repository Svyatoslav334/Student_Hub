import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { User, Edit2, X, Link } from 'lucide-react';
import { toast } from 'sonner';

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
    bio: '',
    socialLinks: {
      telegram: '',
      instagram: '',
      linkedin: '',
      facebook: '',
      twitter: '',
    },
  });

  const [teacherFormData, setTeacherFormData] = useState({
    department: '',
    subject: '',
    cabinet: '',
    consultationHours: '',
    phone: '',
    bio: '',
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const profileRes = await api.get('/profile/me');
      const profileData = profileRes.data;
      setProfile(profileData);

      const firstName = profileData.firstName || 
                       profileData.profile?.firstName || 
                       profileData.user?.firstName || '';

      const lastName = profileData.lastName || 
                      profileData.profile?.lastName || 
                      profileData.user?.lastName || '';
      const phone = profileData.phone || profileData.profile?.phone || '';

      setFormData({
        firstName,
        lastName,
        phone,
        bio: profileData.profile?.bio || '',
        socialLinks: {
          telegram: profileData.profile?.socialLinks?.telegram || '',
          instagram: profileData.profile?.socialLinks?.instagram || '',
          linkedin: profileData.profile?.socialLinks?.linkedin || '',
          facebook: profileData.profile?.socialLinks?.facebook || '',
          twitter: profileData.profile?.socialLinks?.twitter || '',
        },
      });

      if (isTeacher) {
        const teacherRes = await api.get('/teachers/me');
        setTeacherProfile(teacherRes.data);
        setTeacherFormData({
          department: teacherRes.data.department || '',
          subject: teacherRes.data.subject || '',
          cabinet: teacherRes.data.cabinet || '',
          consultationHours: teacherRes.data.consultationHours || '',
          phone: teacherRes.data.phone || '',
          bio: teacherRes.data.bio || '',
        });
      }
    } catch (err) {
      console.error('Failed to load profile', err);
      toast.error('Не вдалося завантажити профіль');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Файл занадто великий. Максимум 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      await api.patch('/profile/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Аватарку успішно оновлено!');
      fetchAllData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Помилка завантаження');
    }
  };

  const handleUpdateGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        bio: formData.bio,
        socialLinks: formData.socialLinks,
      };

      await api.patch('/profile/me', payload);
      toast.success('Профіль успішно оновлено!');
      fetchAllData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Помилка оновлення');
    }
  };

  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = Object.fromEntries(
        Object.entries(teacherFormData).filter(([_, v]) => v !== '')
      );
      await api.patch('/teachers/me', payload);
      toast.success('Викладацькі дані оновлено!');
      fetchAllData();
    } catch (err) {
      toast.error('Помилка оновлення викладацьких даних');
    }
  };
  const displayFirstName = profile?.firstName || profile?.profile?.firstName || profile?.user?.firstName || '—';
  const displayLastName = profile?.lastName || profile?.profile?.lastName || profile?.user?.lastName || '—';
  const displayPhone = profile?.phone || profile?.profile?.phone || '—';
  if (loading) return <div className="p-8 text-center">Завантаження...</div>;

return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Мій профіль</h1>
          <p className="text-slate-400">{user?.email}</p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
        >
          {editing ? <X size={20} /> : <Edit2 size={20} />}
          {editing ? 'Скасувати' : 'Редагувати'}
        </button>
      </div>

      <div className="flex justify-center mb-10">
        <div className="relative group">
          <img
            src={profile?.avatar || 'https://upmwhwnlxeeysddwzkzm.supabase.co/storage/v1/object/public/studenthub/avatars/default-avatar.png'}
            alt="avatar"
            className="w-32 h-32 rounded-2xl object-cover border-4 border-slate-700"
          />
          <label
            htmlFor="avatar-upload"
            className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
          >
            <div className="text-center">
              <Edit2 size={28} className="mx-auto text-cyan-400" />
              <p className="text-sm mt-1">Змінити</p>
            </div>
          </label>
          <input
            type="file"
            id="avatar-upload"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-8 mb-8">
        <h2 className="flex items-center gap-3 text-xl font-semibold mb-6">
          <User size={24} />
          Загальна інформація
        </h2>

        {!editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-slate-400 text-sm">Ім'я</p>
              <p className="text-lg">{displayFirstName}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Прізвище</p>
              <p className="text-lg">{displayLastName}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Телефон</p>
              <p className="text-lg">{displayPhone}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Роль</p>
              <p className="text-lg">{user?.role}</p>
            </div>

            {profile?.profile?.bio && (
              <div className="md:col-span-2">
                <p className="text-slate-400 text-sm mb-2">Біографія</p>
                <p className="text-slate-300 whitespace-pre-wrap">{profile.profile.bio}</p>
              </div>
            )}

            {Object.values(profile?.profile?.socialLinks || {}).some((v) => v) && (
              <div className="md:col-span-2">
                <p className="text-slate-400 text-sm mb-3 flex items-center gap-2">
                  <Link size={18} /> Соціальні мережі
                </p>
                <div className="flex flex-wrap gap-4">
                  {profile?.profile?.socialLinks?.telegram && (
                    <a href={profile.profile.socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                      Telegram
                    </a>
                  )}
                  {profile?.profile?.socialLinks?.instagram && (
                    <a href={profile.profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                      Instagram
                    </a>
                  )}
                  {profile?.profile?.socialLinks?.linkedin && (
                    <a href={profile.profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                      LinkedIn
                    </a>
                  )}
                  {profile?.profile?.socialLinks?.facebook && (
                    <a href={profile.profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                      Facebook
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleUpdateGeneral} className="space-y-6">
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
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Телефон</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Біографія</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 min-h-[140px]"
                placeholder="Розкажіть про себе..."
              />
            </div>

            <div>
              <label className="flex items-center gap-2 mb-3 text-sm text-slate-400">
                <Link size={20} /> Соціальні мережі
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500">Telegram</label>
                  <input
                    type="text"
                    value={formData.socialLinks.telegram}
                    onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, telegram: e.target.value } })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                    placeholder="@username або https://t.me/..."
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Instagram</label>
                  <input
                    type="text"
                    value={formData.socialLinks.instagram}
                    onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, instagram: e.target.value } })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">LinkedIn</label>
                  <input
                    type="text"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value } })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Facebook</label>
                  <input
                    type="text"
                    value={formData.socialLinks.facebook}
                    onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, facebook: e.target.value } })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="bg-cyan-500 text-black px-8 py-3 rounded-xl font-semibold hover:bg-cyan-400 transition"
            >
              Зберегти зміни
            </button>
          </form>
        )}
      </div>

      {isTeacher && (
        <div className="bg-slate-900 rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-6">Викладацькі дані</h2>

          {!editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <p className="text-slate-300 whitespace-pre-wrap">{teacherProfile.bio}</p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleUpdateTeacher} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Кафедра</label>
                  <input type="text" value={teacherFormData.department} onChange={(e) => setTeacherFormData({ ...teacherFormData, department: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Предмет</label>
                  <input type="text" value={teacherFormData.subject} onChange={(e) => setTeacherFormData({ ...teacherFormData, subject: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Кабінет</label>
                  <input type="text" value={teacherFormData.cabinet} onChange={(e) => setTeacherFormData({ ...teacherFormData, cabinet: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Години консультацій</label>
                  <input type="text" value={teacherFormData.consultationHours} onChange={(e) => setTeacherFormData({ ...teacherFormData, consultationHours: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3" placeholder="Наприклад: Пн, Ср 14:00-16:00" />
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
  );
};

export default ProfilePage;
