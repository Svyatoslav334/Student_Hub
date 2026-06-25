import { useEffect, useState, useMemo } from 'react';
import { Search, User, Trash2, Edit } from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'sonner';
import Pagination from '../../components/admin/Pagination';

interface IUser {
  id: number;
  firstName?: string;
  lastName?: string;
  fullName: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  createdAt: string;
  studentGroup?: {
    id: number;
    name: string;
    specialty?: string;
  };
}

const AdminUsers = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<any[]>([]);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'STUDENT' | 'TEACHER' | 'ADMIN'>('all');

  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    groupId: '',
  });

  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data.items || res.data || []);
    } catch (err) {
      console.error('Помилка завантаження користувачів', err);
      toast.error('Не вдалося завантажити користувачів');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get('/student-groups');
      setGroups(res.data || []);
    } catch (err) {
      console.error('Помилка завантаження груп', err);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = `${user.fullName} ${user.email}`.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => b.id - a.id);
  }, [filteredUsers]);

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return sortedUsers.slice(start, start + itemsPerPage);
  }, [sortedUsers, page]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  const openEditModal = (user: IUser) => {
    setEditingUser(user);
    setEditForm({
      firstName: user.firstName || user.fullName.split(' ')[0] || '',
      lastName: user.lastName || user.fullName.split(' ').slice(1).join(' ') || '',
      email: user.email,
      groupId: user.studentGroup?.id?.toString() || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    try {
      await api.put(`/users/${editingUser.id}`, {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        email: editForm.email.trim(),
        groupId: editForm.groupId ? Number(editForm.groupId) : null,
      });
      toast.success('Зміни збережено!');
      await fetchUsers();
      setEditingUser(null);
    } catch (err: any) {
      console.error('Помилка редагування', err);
      toast.error(err.response?.data?.message || 'Не вдалося зберегти зміни');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Видалити користувача?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('Користувача видалено');
      await fetchUsers();
    } catch (err) {
      console.error('Помилка видалення', err);
      toast.error('Не вдалося видалити користувача');
    }
  };

  const handleRoleChange = async (id: number, role: string) => {
    try {
      await api.patch(`/users/${id}/role`, { role });
      toast.success('Роль змінено');
      await fetchUsers();
    } catch (err) {
      console.error('Помилка зміни ролі', err);
      toast.error('Не вдалося змінити роль');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'TEACHER':
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    }
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Користувачі</h1>
          <p className="text-slate-400">
            Управління студентами, викладачами та адміністраторами
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Пошук користувачів..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 w-full outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3"
          >
            <option value="all">Всі ролі</option>
            <option value="STUDENT">Студенти</option>
            <option value="TEACHER">Викладачі</option>
            <option value="ADMIN">Адміністратори</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-800">
              <tr>
                <th className="text-left px-6 py-4 font-medium text-slate-300">Користувач</th>
                <th className="text-left px-6 py-4 font-medium text-slate-300">Email</th>
                <th className="text-left px-6 py-4 font-medium text-slate-300">Роль</th>
                <th className="text-left px-6 py-4 font-medium text-slate-300">Група</th>
                <th className="text-right px-6 py-4 font-medium text-slate-300">Дії</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    Завантаження...
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    Користувачів не знайдено
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-800 hover:bg-slate-800/40 transition"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                          <User className="text-cyan-400" size={20} />
                        </div>
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-sm text-slate-500">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-slate-300">{user.email}</td>
                    <td className="px-6 py-5">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium bg-slate-950 ${getRoleBadge(user.role)}`}
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="TEACHER">TEACHER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-6 py-5 text-slate-300">
                      {user.studentGroup?.name || '—'}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Редагування користувача</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Ім'я"
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 outline-none focus:border-cyan-500"
              />
              <input
                type="text"
                placeholder="Прізвище"
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 outline-none focus:border-cyan-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 outline-none focus:border-cyan-500"
              />
              <div>
                <label className="block text-sm text-slate-400 mb-2">Група</label>
                <select
                  value={editForm.groupId}
                  onChange={(e) => setEditForm({ ...editForm, groupId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 outline-none focus:border-cyan-500"
                >
                  <option value="">Без групи</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} {group.specialty ? `(${group.specialty})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setEditingUser(null)}
                className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 transition"
              >
                Скасувати
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition"
              >
                Зберегти зміни
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
