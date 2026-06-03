import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import GroupChat from '../../components/chat/GroupChat';
import {
  Users,
  UserCheck,
  Calendar,
  ChevronRight,
} from 'lucide-react';

const MyGroup = () => {
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    fetchMyGroup();
    window.scrollTo(0, 0);
  }, []);


  const fetchMyGroup = async () => {
    try {
      const res = await api.get('/student-groups/my');
      setGroup(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setGroup(null);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center text-slate-400">
        Завантаження...
      </div>
    );
  }

  if (!group) {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center text-center px-6">
        <Users size={80} className="text-slate-700 mb-6" />

        <h2 className="text-3xl font-bold mb-3">
          Ви ще не в групі
        </h2>

        <p className="text-slate-400 max-w-md">
          Зверніться до адміністратора або куратора
          для зарахування у групу.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] bg-slate-950 text-white overflow-hidden">
      <div className="grid h-full lg:grid-cols-12">

        
        <aside
          className="
            hidden
            lg:flex
            lg:col-span-3
            flex-col
            border-r
            border-slate-800
            bg-slate-900/50
            backdrop-blur
            overflow-hidden
          "
        >
          <div className="p-5 border-b border-slate-800">
            <h2 className="font-bold text-xl text-cyan-400">
              {group.name}
            </h2>

            {group.specialty && (
              <p className="text-sm text-slate-400 mt-1">
                {group.specialty}
              </p>
            )}

            {group.year && (
              <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
                <Calendar size={16} />
                {group.year}
              </div>
            )}
          </div>

          {group.curator && (
            <div className="p-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <UserCheck
                    size={22}
                    className="text-emerald-400"
                  />
                </div>

                <div>
                  <p className="font-medium">
                    {group.curator.fullName}
                  </p>

                  <p className="text-xs text-slate-500">
                    Куратор
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
                Учасники ({group.studentCount})
              </h3>

              <div className="space-y-2">
                {group.students?.map((student: any) => (
                  <div
                    key={student.id}
                    className="
                      flex
                      items-center
                      gap-3
                      p-3
                      rounded-xl
                      hover:bg-slate-800
                      transition
                    "
                  >
                    {student.avatar ? (
                      <img
                        src={student.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        {student.fullName?.charAt(0)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {student.fullName}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {student.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        
        <main className="lg:col-span-9 flex flex-col h-full">

          
          <div
            className="
              lg:hidden
              sticky
              top-0
              z-20
              bg-slate-950/95
              backdrop-blur
              border-b
              border-slate-800
            "
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <h1 className="font-semibold">
                  {group.name}
                </h1>

                <p className="text-xs text-slate-500">
                  {group.studentCount} учасників
                </p>
              </div>

              <button
                onClick={() =>
                  setShowMembers(true)
                }
                className="
                  p-2
                  rounded-xl
                  bg-slate-900
                  border
                  border-slate-800
                "
              >
                <Users size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <GroupChat groupId={group.id} />
          </div>
        </main>
      </div>

      
      {showMembers && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-40"
            onClick={() =>
              setShowMembers(false)
            }
          />

          <div
            className="
              fixed
              bottom-0
              left-0
              right-0
              z-50
              bg-slate-900
              rounded-t-3xl
              max-h-[80vh]
              overflow-hidden
            "
          >
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold">
                Учасники ({group.studentCount})
              </h3>

              <button
                onClick={() =>
                  setShowMembers(false)
                }
              >
                <ChevronRight />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[70vh] p-4">
              {group.students?.map((student: any) => (
                <div
                  key={student.id}
                  className="
                    flex
                    items-center
                    gap-3
                    p-3
                    rounded-xl
                    hover:bg-slate-800
                  "
                >
                  {student.avatar ? (
                    <img
                      src={student.avatar}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      {student.fullName?.charAt(0)}
                    </div>
                  )}

                  <div>
                    <p>{student.fullName}</p>

                    <p className="text-xs text-slate-500">
                      {student.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MyGroup;