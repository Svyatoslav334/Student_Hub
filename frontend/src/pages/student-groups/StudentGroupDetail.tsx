import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { ArrowLeft, Users, UserCheck } from 'lucide-react';

const StudentGroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchGroup();
  }, [id]);

  const fetchGroup = async () => {
    try {
      const res = await api.get(`/student-groups/${id}`);
      setGroup(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Завантаження...</div>;
  if (!group) return <div>Групу не знайдено</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link to="/student-groups" className="flex items-center gap-2 text-cyan-400 mb-8">
          <ArrowLeft size={20} /> Назад до груп
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
          <h1 className="text-4xl font-bold text-cyan-400">{group.name}</h1>
          
          {group.specialty && <p className="text-xl text-slate-400 mt-2">{group.specialty}</p>}
          {group.year && <p className="text-slate-500">Рік вступу: {group.year}</p>}

          {group.curator && (
            <div className="mt-6 flex items-center gap-4 bg-slate-800 rounded-2xl p-5">
              <UserCheck size={28} className="text-emerald-400" />
              <div>
                <p className="text-sm text-slate-400">Куратор</p>
                <p className="font-medium">{group.curator.fullName}</p>
              </div>
            </div>
          )}

          <div className="mt-10">
            <h3 className="flex items-center gap-3 text-xl font-semibold mb-6">
              <Users size={24} /> Студенти групи ({group.studentCount})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {group.students?.map((student: any) => (
                <div key={student.id} className="bg-slate-800 p-4 rounded-2xl flex items-center gap-3">
                  {student.avatar && (
                    <img src={student.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  )}
                  <div>
                    <p className="font-medium">{student.fullName}</p>
                    <p className="text-sm text-slate-400">{student.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentGroupDetail;