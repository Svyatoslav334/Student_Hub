import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

import { 
  Users, 
  Search, 
  ArrowRight 
} from 'lucide-react';

interface Club {
  id: number;
  title: string;
  description: string;
  image?: string;
  currentMembers: number;
  maxMembers: number;
  leader?: string;
}

const ClubsList = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/clubs');
      const items = res.data.items || res.data;

      
      const fixedItems = items.map((club: any) => ({
        ...club,
        currentMembers: club.members?.length ?? club.currentMembers ?? 0
      }));

      setClubs(fixedItems);
      setTotal(res.data.total || items.length || 0);
    } catch (err) {
      console.error('Failed to load clubs', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClubs = clubs.filter(club =>
    club.title.toLowerCase().includes(search.toLowerCase()) ||
    club.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <Users size={36} className="text-cyan-400" />
            <div>
              <h1 className="text-4xl font-bold">Студентські гуртки</h1>
              <p className="text-slate-400 mt-1">Приєднуйся до спільнот та розвивайся разом</p>
            </div>
          </div>
          <p className="text-slate-500">Знайдено: <span className="text-white font-medium">{total}</span> гуртків</p>
        </div>

        
        <div className="relative mb-10">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Пошук гуртка..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-cyan-500 text-lg"
          />
        </div>

        
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 rounded-3xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : filteredClubs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredClubs.map((club) => (
              <Link
                to={`/clubs/${club.id}`}
                key={club.id}
                className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-cyan-500/50 transition-all hover:-translate-y-1 flex flex-col h-full"
              >
                
                <div className="relative h-52 bg-slate-800 overflow-hidden">
                  {club.image ? (
                    <img
                      src={club.image}
                      alt={club.title}
                      className="w-full h-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                      <Users size={60} className="text-slate-700" />
                    </div>
                  )}

                  <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Users size={14} />
                    {club.currentMembers}/{club.maxMembers || '∞'}
                  </div>
                </div>

                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold mb-3 line-clamp-2 group-hover:text-cyan-400 transition">
                    {club.title}
                  </h3>

                  <p className="text-slate-400 text-sm line-clamp-4 mb-6 flex-1">
                    {club.description}
                  </p>

                  <div className="flex items-center justify-between text-sm pt-4 border-t border-slate-800 text-cyan-400 font-medium">
                    Детальніше
                    <ArrowRight className="group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <Users size={64} className="mx-auto text-slate-700 mb-6" />
            <p className="text-2xl text-slate-400">Гуртків не знайдено</p>
            <p className="text-slate-500 mt-2">Спробуйте інший пошуковий запит</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubsList;