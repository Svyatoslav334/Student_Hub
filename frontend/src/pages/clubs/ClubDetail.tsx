import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

import { 
  ArrowLeft, 
  Users, 
  User, 
  Clock, 
  Calendar 
} from 'lucide-react';

const ClubDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuthStore();

  const [club, setClub] = useState<any>(null);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchClub();
  }, [id]);

  const fetchClub = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/clubs/${id}`);
      const clubData = res.data;
      
      // Фікс кількості учасників
      const memberCount = clubData.members?.length ?? clubData.currentMembers ?? 0;
      
      setClub({
        ...clubData,
        currentMembers: memberCount
      });
      
      setIsMember(clubData.members?.some((m: any) => m.id === user?.id) || false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!isAuthenticated) {
      alert("Увійдіть, щоб приєднатися до гуртка");
      return;
    }
    setJoining(true);
    try {
      await api.post(`/clubs/${id}/join`);
      alert("Ви приєдналися до гуртка!");
      fetchClub(); // оновлюємо дані
    } catch (err: any) {
      alert(err.response?.data?.message || "Не вдалося приєднатися");
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    setJoining(true);
    try {
      await api.delete(`/clubs/${id}/leave`);
      alert("Ви вийшли з гуртка");
      fetchClub();
    } catch (err: any) {
      alert(err.response?.data?.message || "Помилка");
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <div className="text-center py-20">Завантаження...</div>;
  if (!club) return <div className="text-center py-20">Гурток не знайдено</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Link
          to="/clubs"
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 text-base"
        >
          <ArrowLeft size={18} />
          Назад до гуртків
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          {club.image && (
            <img
              src={club.image}
              alt={club.title}
              className="w-full h-72 object-cover"
            />
          )}

          <div className="p-8">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h1 className="text-3xl font-bold leading-tight">{club.title}</h1>
                <p className="text-cyan-400 mt-1">Студентський гурток</p>
              </div>

              <div className="bg-slate-800 rounded-2xl px-4 py-2 text-center flex-shrink-0">
                <div className="text-lg font-semibold">{club.currentMembers}</div>
                <div className="text-xs text-slate-400">учасників</div>
              </div>
            </div>

            <p className="mt-6 text-slate-300 leading-relaxed">
              {club.description}
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              {club.leader && (
                <div className="flex items-center gap-3">
                  <User size={20} className="text-slate-400" />
                  <div>
                    <p className="text-slate-400">Керівник</p>
                    <p className="font-medium">{club.leader}</p>
                  </div>
                </div>
              )}

              {club.meetingTime && (
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-slate-400" />
                  <div>
                    <p className="text-slate-400">Час зустрічей</p>
                    <p className="font-medium">{club.meetingTime}</p>
                  </div>
                </div>
              )}

              {club.schedule && (
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-slate-400" />
                  <div>
                    <p className="text-slate-400">Розклад</p>
                    <p className="font-medium">{club.schedule}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Users size={20} className="text-slate-400" />
                <div>
                  <p className="text-slate-400">Учасників</p>
                  <p className="font-medium">
                    {club.currentMembers} з {club.maxMembers || 'необмежено'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <p className="text-slate-400 mb-2">Контакт</p>
              <p className="text-lg">{club.contact}</p>
            </div>

            <div className="mt-10">
              {isAuthenticated ? (
                <button
                  onClick={isMember ? handleLeave : handleJoin}
                  disabled={joining}
                  className={`w-full py-4 rounded-2xl font-semibold text-base transition ${
                    isMember 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-cyan-500 hover:bg-cyan-400 text-black'
                  }`}
                >
                  {joining 
                    ? "Обробка..." 
                    : isMember 
                      ? "Вийти з гуртка" 
                      : "Приєднатися до гуртка"}
                </button>
              ) : (
                <Link
                  to="/login"
                  className="block w-full text-center bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-4 rounded-2xl"
                >
                  Увійти, щоб приєднатися
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDetail;