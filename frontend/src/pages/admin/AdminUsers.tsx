import { useEffect, useState } from 'react';

import {
  Search,
  Shield,
  User,
  GraduationCap,
  Trash2,
  Edit,
} from 'lucide-react';

import { api } from '../../services/api';

interface IUser {
  id: number;
  fullName: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  createdAt: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');


  const [editingUser, setEditingUser] =
  useState<IUser | null>(null);

    const [editForm, setEditForm] =
    useState({
        firstName: '',
        lastName: '',
        email: '',
    });
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await api.get('/users');

      setUsers(
        res.data.items ||
          res.data ||
          []
      );
    } catch (err) {
      console.error(
        'Помилка завантаження користувачів',
        err
      );
    } finally {
      setLoading(false);
    }
  };

    const openEditModal = (
    user: IUser
    ) => {
    const names =
        user.fullName.split(' ');

    setEditingUser(user);

    setEditForm({
        firstName: names[0] || '',
        lastName: names[1] || '',
        email: user.email,
    });
    };

  const handleDelete = async (
    id: number
  ) => {
    const confirmDelete =
      window.confirm(
        'Видалити користувача?'
      );

    if (!confirmDelete) return;

    try {
      await api.delete(`/users/${id}`);

      setUsers((prev) =>
        prev.filter(
          (user) => user.id !== id
        )
      );
    } catch (err) {
      console.error(
        'Помилка видалення',
        err
      );
    }
  };

  const handleRoleChange = async (
    id: number,
    role: string
  ) => {
    try {
      await api.patch(
        `/users/${id}/role`,
        {
          role,
        }
      );

      setUsers((prev) =>
        prev.map((user) =>
          user.id === id
            ? {
                ...user,
                role:
                  role as IUser['role'],
              }
            : user
        )
      );
    } catch (err) {
      console.error(
        'Помилка зміни ролі',
        err
      );
    }
  };

  const filteredUsers =
    users.filter((user) =>
      `${user.fullName} ${user.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  const getRoleBadge = (
    role: string
  ) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';

      case 'TEACHER':
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';

      default:
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    }
  };

  const handleSaveEdit =
  async () => {
    if (!editingUser) return;

    try {
      await api.put(
        `/users/${editingUser.id}`,
        editForm
      );

      setUsers((prev) =>
        prev.map((user) =>
          user.id ===
          editingUser.id
            ? {
                ...user,
                fullName: `${editForm.firstName} ${editForm.lastName}`,
                email:
                  editForm.email,
              }
            : user
        )
      );

      setEditingUser(null);
    } catch (err) {
      console.error(
        'Помилка редагування',
        err
      );
    }
  };

  return (
    <div>
      
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Користувачі
          </h1>

          <p className="text-slate-400">
            Управління студентами,
            викладачами та
            адміністраторами
          </p>
        </div>

        
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />

          <input
            type="text"
            placeholder="Пошук користувачів..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 w-full lg:w-80 outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-800">
              <tr>
                <th className="text-left px-6 py-4 font-medium text-slate-300">
                  Користувач
                </th>

                <th className="text-left px-6 py-4 font-medium text-slate-300">
                  Email
                </th>

                <th className="text-left px-6 py-4 font-medium text-slate-300">
                  Роль
                </th>

                <th className="text-left px-6 py-4 font-medium text-slate-300">
                  Дата
                </th>

                <th className="text-right px-6 py-4 font-medium text-slate-300">
                  Дії
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-10 text-slate-400"
                  >
                    Завантаження...
                  </td>
                </tr>
              ) : filteredUsers.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-10 text-slate-400"
                  >
                    Користувачів не знайдено
                  </td>
                </tr>
              ) : (
                filteredUsers.map(
                  (user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-800 hover:bg-slate-800/40 transition"
                    >
                      
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                            <User
                              className="text-cyan-400"
                              size={20}
                            />
                          </div>

                          <div>
                            <p className="font-medium">
                              {
                                user.fullName
                              }
                            </p>

                            <p className="text-sm text-slate-500">
                              ID: {user.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      
                      <td className="px-6 py-5 text-slate-300">
                        {user.email}
                      </td>

                      
                      <td className="px-6 py-5">
                        <select
                          value={user.role}
                          onChange={(
                            e
                          ) =>
                            handleRoleChange(
                              user.id,
                              e.target.value
                            )
                          }
                          className={`px-3 py-2 rounded-xl text-sm font-medium bg-slate-950 ${getRoleBadge(
                            user.role
                          )}`}
                        >
                          <option value="STUDENT">
                            STUDENT
                          </option>

                          <option value="TEACHER">
                            TEACHER
                          </option>

                          <option value="ADMIN">
                            ADMIN
                          </option>
                        </select>
                      </td>

                      
                      <td className="px-6 py-5 text-slate-400 text-sm">
                        {new Date(
                          user.createdAt
                        ).toLocaleDateString()}
                      </td>

                      
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                                openEditModal(user)
                            }
                            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition"
                            >
                            <Edit
                              size={18}
                            />
                          </button>
                            {editingUser && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-md">
                                <h2 className="text-2xl font-bold mb-6">
                                    Редагування користувача
                                </h2>

                                <div className="space-y-4">
                                    <input
                                    type="text"
                                    placeholder="Ім'я"
                                    value={editForm.firstName}
                                    onChange={(e) =>
                                        setEditForm({
                                        ...editForm,
                                        firstName:
                                            e.target.value,
                                        })
                                    }
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 outline-none focus:border-cyan-500"
                                    />

                                    <input
                                    type="text"
                                    placeholder="Прізвище"
                                    value={editForm.lastName}
                                    onChange={(e) =>
                                        setEditForm({
                                        ...editForm,
                                        lastName:
                                            e.target.value,
                                        })
                                    }
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 outline-none focus:border-cyan-500"
                                    />

                                    <input
                                    type="email"
                                    placeholder="Email"
                                    value={editForm.email}
                                    onChange={(e) =>
                                        setEditForm({
                                        ...editForm,
                                        email:
                                            e.target.value,
                                        })
                                    }
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 outline-none focus:border-cyan-500"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 mt-8">
                                    <button
                                    onClick={() =>
                                        setEditingUser(null)
                                    }
                                    className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 transition"
                                    >
                                    Скасувати
                                    </button>

                                    <button
                                    onClick={handleSaveEdit}
                                    className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition"
                                    >
                                    Зберегти
                                    </button>
                                </div>
                                </div>
                            </div>
                            )}
                          <button
                            onClick={() =>
                              handleDelete(
                                user.id
                              )
                            }
                            className="w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition"
                          >
                            <Trash2
                              size={18}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>


  );
};

export default AdminUsers;