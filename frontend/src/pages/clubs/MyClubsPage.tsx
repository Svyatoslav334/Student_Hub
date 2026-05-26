import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import { api } from '../../services/api';

import {
  Users,
  MessageCircle,
} from 'lucide-react';

const MyClubsPage = () => {
  const [clubs, setClubs] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const res = await api.get(
        '/clubs/participated',
      );

      setClubs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Завантаження...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          Мої гуртки
        </h1>

        {clubs.length === 0 ? (
          <div className="text-slate-400">
            Ви ще не берете участі в гуртках
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clubs.map((club) => (
              <div
                key={club.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6"
              >
                {club.image && (
                  <img
                    src={club.image}
                    alt={club.title}
                    className="w-full h-44 object-cover rounded-2xl mb-5"
                  />
                )}

                <h2 className="text-xl font-semibold">
                  {club.title}
                </h2>

                <p className="text-slate-400 mt-3 line-clamp-3">
                  {club.description}
                </p>

                <div className="flex items-center gap-2 text-sm text-slate-500 mt-5">
                  <Users size={16} />

                  {club.members?.length || 0}{' '}
                  учасників
                </div>

                <div className="mt-6 flex gap-3">
                  <Link
                    to={`/clubs/${club.id}`}
                    className="
                      flex-1
                      h-11
                      rounded-xl
                      bg-slate-800
                      hover:bg-slate-700
                      flex items-center justify-center
                    "
                  >
                    Деталі
                  </Link>

                  <Link
                    to={`/chat/clubs/${club.id}`}
                    className="
                      flex-1
                      h-11
                      rounded-xl
                      bg-cyan-500
                      hover:bg-cyan-400
                      text-black
                      flex items-center justify-center gap-2
                      font-medium
                    "
                  >
                    <MessageCircle
                      size={18}
                    />

                    Чат
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyClubsPage;