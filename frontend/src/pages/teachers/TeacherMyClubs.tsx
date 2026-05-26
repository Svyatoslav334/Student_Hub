import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Users, Edit2, Trash2, MessageCircle } from 'lucide-react';
import CreateClubModal from '../../components/clubs/CreateClubModal';
import EditClubModal from '../../components/clubs/EditClubModal';
import { useNavigate } from 'react-router-dom';

const TeacherMyClubs = () => {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const navigate = useNavigate();
  // Завантажуємо створені викладачем гуртки
  const fetchMyCreatedClubs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/clubs/my-created');   // Важливо: my-created
      console.log('Отримані гуртки:', res.data);        // ← Для дебагу
      setClubs(Array.isArray(res.data) ? res.data : res.data.items || []);
    } catch (err) {
      console.error('Помилка завантаження моїх гуртків:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCreatedClubs();
  }, []);

  const handleCreateSuccess = () => {
    fetchMyCreatedClubs();   // Примусово оновлюємо список
  };

  const handleEdit = (club: any) => {
    setSelectedClub(club);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Розформувати цей гурток?')) return;
    try {
      await api.delete(`/clubs/${id}`);
      fetchMyCreatedClubs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Помилка видалення');
    }
  };

  const openChat = (clubId: number) => {
    navigate(`/club-chat/${clubId}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Мої гуртки</h1>
            <p className="text-slate-400">Гуртки, які ви створили як викладач</p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-cyan-500 text-black px-5 py-3 rounded-2xl font-semibold hover:bg-cyan-400 transition"
          >
            <Plus size={20} />
            Створити гурток
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">Завантаження гуртків...</div>
        ) : clubs.length === 0 ? (
          <div className="text-center py-20">
            <Users size={60} className="mx-auto text-slate-600 mb-4" />
            <p className="text-xl text-slate-400">Ви ще не створили жодного гуртка</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clubs.map((club) => (
              <div key={club.id} className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                {club.image && (
                  <img 
                    src={club.image} 
                    alt={club.title} 
                    className="w-full h-40 object-cover rounded-2xl mb-4" 
                  />
                )}

                <h3 className="font-semibold text-xl mb-2">{club.title}</h3>
                <p className="text-slate-400 text-sm line-clamp-3 mb-4">{club.description}</p>

                <div className="flex justify-between text-sm text-slate-400 mb-6">
                  <span>Учасників: {club.currentMembers || 0} / {club.maxMembers || '∞'}</span>
                  {club.leader && <span>Керівник: {club.leader}</span>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => openChat(club.id)}
                    className="py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl flex items-center justify-center gap-2 text-sm"
                  >
                    <MessageCircle size={18} /> Чат
                  </button>

                  <button
                    onClick={() => handleEdit(club)}
                    className="py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl flex items-center justify-center gap-2 text-sm"
                  >
                    <Edit2 size={18} /> Редагувати
                  </button>

                  <button
                    onClick={() => handleDelete(club.id)}
                    className="col-span-2 py-3 bg-red-900/50 hover:bg-red-900 rounded-2xl text-red-400 flex items-center justify-center gap-2 text-sm"
                  >
                    <Trash2 size={18} /> Розформувати гурток
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateClubModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess} 
      />

      <EditClubModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedClub(null);
        }}
        club={selectedClub}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default TeacherMyClubs;