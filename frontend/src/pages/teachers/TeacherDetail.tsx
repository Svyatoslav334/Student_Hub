import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';

import { 
  ArrowLeft, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar,
  User 
} from 'lucide-react';

const TeacherDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchTeacher();
  }, [id]);

  const fetchTeacher = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/teachers/${id}`);
      setTeacher(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-xl text-slate-400">Завантаження інформації...</div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl">Викладача не знайдено</h2>
          <Link to="/teachers" className="text-cyan-400 hover:underline mt-4 inline-block">
            ← Повернутися до списку викладачів
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link
          to="/teachers"
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 text-lg transition"
        >
          <ArrowLeft size={20} />
          Повернутися до викладачів
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          <div className="grid md:grid-cols-5 gap-0">
            
            <div className="md:col-span-2 bg-slate-800 p-8 flex items-center justify-center">
              <div className="relative w-full max-w-[320px]">
                {teacher.photo ? (
                  <img
                    src={teacher.photo}
                    alt={`${teacher.firstName} ${teacher.lastName}`}
                    className="w-full aspect-square object-cover rounded-2xl shadow-2xl border border-slate-700"
                  />
                ) : (
                  <div className="w-full aspect-square bg-slate-700 rounded-2xl flex items-center justify-center">
                    <User size={120} className="text-slate-500" />
                  </div>
                )}
              </div>
            </div>

            
            <div className="md:col-span-3 p-8 md:p-12">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                {teacher.firstName} {teacher.lastName}
              </h1>

              <p className="text-2xl text-cyan-400 mt-2">{teacher.department}</p>
              <p className="text-xl text-slate-300 mt-1">{teacher.subject}</p>

              <div className="mt-8 space-y-6">
                {teacher.cabinet && (
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <MapPin size={24} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Кабінет</p>
                      <p className="text-lg font-medium">{teacher.cabinet}</p>
                    </div>
                  </div>
                )}

                {teacher.email && (
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <Mail size={24} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Email</p>
                      <a 
                        href={`mailto:${teacher.email}`} 
                        className="text-lg hover:text-cyan-400 transition"
                      >
                        {teacher.email}
                      </a>
                    </div>
                  </div>
                )}

                {teacher.phone && (
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <Phone size={24} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Телефон</p>
                      <a 
                        href={`tel:${teacher.phone}`} 
                        className="text-lg hover:text-cyan-400 transition"
                      >
                        {teacher.phone}
                      </a>
                    </div>
                  </div>
                )}

                {teacher.consultationHours && (
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <Calendar size={24} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Години консультацій</p>
                      <p className="text-lg">{teacher.consultationHours}</p>
                    </div>
                  </div>
                )}
              </div>

              {teacher.bio && (
                <div className="mt-12">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    Про викладача
                  </h3>
                  <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed">
                    {teacher.bio.split('\n').map((paragraph: string, index: number) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetail;