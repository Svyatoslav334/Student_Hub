import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { UserCheck, Calendar, Search } from 'lucide-react';

const StudentGroupsList = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

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

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(search.toLowerCase()) ||
    group.specialty?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold">Студентські групи</h1>
            <p className="text-slate-400 mt-2">Список академічних груп та їх кураторів</p>
          </div>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Пошук групи або спеціальності..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-12 py-4 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {loading ? (
          <p>Завантаження...</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map((group) => (
              <Link
                key={group.id}
                to={`/student-groups/${group.id}`}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500 transition-all hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-cyan-400">{group.name}</h3>
                    {group.specialty && (
                      <p className="text-slate-400 mt-1">{group.specialty}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-500">Студентів</div>
                    <div className="text-2xl font-semibold">{group.studentCount || 0}</div>
                  </div>
                </div>

                {group.year && (
                  <div className="flex items-center gap-2 mt-4 text-sm text-slate-400">
                    <Calendar size={16} />
                    Рік вступу: {group.year}
                  </div>
                )}

                {group.curator && (
                  <div className="mt-4 flex items-center gap-3 text-sm">
                    <UserCheck size={18} className="text-emerald-400" />
                    <div>
                      Куратор: <span className="text-white">{group.curator.fullName}</span>
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentGroupsList;