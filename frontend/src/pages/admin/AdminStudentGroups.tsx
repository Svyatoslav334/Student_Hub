import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import StudentGroupModal from '../../components/admin/StudentGroupModal';
import { toast } from 'sonner';

const AdminStudentGroups = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  useEffect(() => { fetchGroups(); }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/student-groups');
      setGroups(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => { setEditData(null); setModalOpen(true); };
  const openEditModal = (group: any) => { setEditData(group); setModalOpen(true); };

  const deleteGroup = async (id: number) => {
    if (!confirm('Видалити цю групу?')) return;
    try {
      await api.delete(`/student-groups/${id}`);
      fetchGroups();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Помилка видалення');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold">Студентські групи</h1>
          <p className="text-slate-400 text-sm sm:text-base">Управління групами та кураторами</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-cyan-500 text-black px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl flex items-center gap-2 font-semibold hover:bg-cyan-400 transition shrink-0"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Створити групу</span>
        </button>
      </div>

      {loading ? (
        <p className="text-center py-10">Завантаження...</p>
      ) : (
        <>
          
          <div className="flex flex-col gap-3 sm:hidden">
            {groups.map((group) => (
              <div key={group.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{group.name}</p>
                    {group.specialty && (
                      <p className="text-sm text-slate-400 mt-0.5">{group.specialty}</p>
                    )}
                    <div className="flex gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                      {group.year && <span>Рік: {group.year}</span>}
                      <span>Куратор: {group.curator?.fullName || '—'}</span>
                      <span>Студентів: {group.studentCount ?? 0}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => openEditModal(group)}
                      className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteGroup(group.id)}
                      className="p-2 rounded-xl bg-red-500/10 text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          
          <div className="hidden sm:block bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-950">
                <tr>
                  <th className="text-left p-6">Назва групи</th>
                  <th className="text-left p-6">Спеціальність</th>
                  <th className="text-left p-6">Рік</th>
                  <th className="text-left p-6">Куратор</th>
                  <th className="text-center p-6">Студентів</th>
                  <th className="text-center p-6">Дії</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={group.id} className="border-t border-slate-800 hover:bg-slate-800/50">
                    <td className="p-6 font-semibold">{group.name}</td>
                    <td className="p-6 text-slate-400">{group.specialty || '—'}</td>
                    <td className="p-6 text-slate-400">{group.year || '—'}</td>
                    <td className="p-6">{group.curator?.fullName || '—'}</td>
                    <td className="p-6 text-center font-medium">{group.studentCount ?? 0}</td>
                    <td className="p-6">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => openEditModal(group)} className="p-2 hover:bg-slate-700 rounded-xl text-cyan-400">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => deleteGroup(group.id)} className="p-2 hover:bg-red-900/30 text-red-400 rounded-xl">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <StudentGroupModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchGroups}
        editData={editData}
      />
    </div>
  );
};

export default AdminStudentGroups;