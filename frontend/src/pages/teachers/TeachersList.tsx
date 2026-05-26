import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

import { 
  Users, 
  Search, 
  MapPin, 
  Mail, 
  Phone,
  ArrowRight 
} from 'lucide-react';

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  department: string;
  subject: string;
  cabinet?: string;
  phone?: string;
  email?: string;
  photo?: string;
  createdAt: string;
}

const TeachersList = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/teachers');
      setTeachers(res.data.items || res.data);
      setTotal(res.data.total || res.data.length || 0);
    } catch (err) {
      console.error('Failed to load teachers', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter((teacher) =>
    `${teacher.firstName} ${teacher.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase()) ||
    teacher.department.toLowerCase().includes(search.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <Users size={36} className="text-cyan-400" />
            <div>
              <h1 className="text-4xl font-bold">Викладачі</h1>
              <p className="text-slate-400 mt-1">Контакти та інформація про викладацький склад</p>
            </div>
          </div>
          <p className="text-slate-500">Знайдено: <span className="text-white font-medium">{total}</span> викладачів</p>
        </div>

        
        <div className="relative mb-10">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Пошук викладача, кафедри чи предмету..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-cyan-500 text-lg"
          />
        </div>

        
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 rounded-3xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : filteredTeachers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeachers.map((teacher) => (
              <Link
                to={`/teachers/${teacher.id}`}
                key={teacher.id}
                className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-cyan-500/50 transition-all hover:-translate-y-1 flex flex-col"
              >
                
                <div className="h-64 bg-slate-800 flex items-center justify-center overflow-hidden relative">
                  {teacher.photo ? (
                    <img
                      src={teacher.photo}
                      alt={`${teacher.firstName} ${teacher.lastName}`}
                      className="w-full h-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="text-7xl text-slate-700">
                      👨‍🏫
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                    {teacher.department}
                  </div>
                </div>

                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-2xl font-semibold mb-1 group-hover:text-cyan-400 transition">
                    {teacher.firstName} {teacher.lastName}
                  </h3>
                  
                  <p className="text-cyan-400 font-medium mb-4">{teacher.subject}</p>

                  <div className="space-y-3 text-sm text-slate-400 flex-1">
                    {teacher.cabinet && (
                      <div className="flex items-center gap-3">
                        <MapPin size={18} className="text-slate-500" />
                        <span>Кабінет: <span className="text-white">{teacher.cabinet}</span></span>
                      </div>
                    )}

                    {teacher.email && (
                      <div className="flex items-center gap-3">
                        <Mail size={18} className="text-slate-500" />
                        <a 
                          href={`mailto:${teacher.email}`} 
                          className="hover:text-cyan-400 transition"
                        >
                          {teacher.email}
                        </a>
                      </div>
                    )}

                    {teacher.phone && (
                      <div className="flex items-center gap-3">
                        <Phone size={18} className="text-slate-500" />
                        <a 
                          href={`tel:${teacher.phone}`} 
                          className="hover:text-cyan-400 transition"
                        >
                          {teacher.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Детальніше</span>
                    <ArrowRight className="text-cyan-400 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <Users size={64} className="mx-auto text-slate-700 mb-6" />
            <p className="text-2xl text-slate-400">Викладачів за вашим запитом не знайдено</p>
            <p className="text-slate-500 mt-2">Спробуйте змінити параметри пошуку</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeachersList;