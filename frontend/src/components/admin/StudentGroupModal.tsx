import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { X, Search, UserCheck, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface StudentGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: any;
}

const StudentGroupModal = ({ isOpen, onClose, onSuccess, editData }: StudentGroupModalProps) => {
  const [form, setForm] = useState({ name: '', year: '', specialty: '', curatorEmail: '' });
  const [teachers, setTeachers] = useState<any[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<any[]>([]);
  const [searchTeacher, setSearchTeacher] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Завантаження викладачів при відкритті модалки
  useEffect(() => {
    if (isOpen) fetchTeachers();
  }, [isOpen]);

  const fetchTeachers = async () => {
    setTeachersLoading(true);
    try {
      const res = await api.get('/teachers');
      const teacherList = res.data.items || res.data;
      setTeachers(teacherList);
      setFilteredTeachers(teacherList);
    } catch (err) {
      console.error('Помилка завантаження викладачів', err);
      toast.error('Не вдалося завантажити список викладачів');
    } finally {
      setTeachersLoading(false);
    }
  };

  // Фільтрація
  useEffect(() => {
    if (!searchTeacher.trim()) {
      setFilteredTeachers(teachers);
    } else {
      const filtered = teachers.filter((t: any) => {
        const fullName = `${getFirstName(t)} ${getLastName(t)}`.toLowerCase();
        const email = (t.user?.email || t.email || '').toLowerCase();
        const subject = (t.subject || '').toLowerCase();
        return fullName.includes(searchTeacher.toLowerCase()) || 
               email.includes(searchTeacher.toLowerCase()) || 
               subject.includes(searchTeacher.toLowerCase());
      });
      setFilteredTeachers(filtered);
    }
  }, [searchTeacher, teachers]);

  // Заповнення форми при редагуванні
  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || '',
        year: editData.year?.toString() || '',
        specialty: editData.specialty || '',
        curatorEmail: editData.curator?.email || '',
      });

      if (editData.curator) {
        setSelectedTeacher(editData.curator);
        setSearchTeacher(`${getFirstName(editData.curator)} ${getLastName(editData.curator)}`.trim());
      }
    } else {
      resetForm();
    }
  }, [editData]);

  const getFirstName = (t: any) => t.user?.firstName || t.firstName || '';
  const getLastName = (t: any) => t.user?.lastName || t.lastName || '';
  const getEmail = (t: any) => t.user?.email || t.email || '';

  const resetForm = () => {
    setForm({ name: '', year: '', specialty: '', curatorEmail: '' });
    setSelectedTeacher(null);
    setSearchTeacher('');
    setIsDropdownOpen(false);
  };

  const selectTeacher = (teacher: any) => {
    setSelectedTeacher(teacher);
    setSearchTeacher(`${getFirstName(teacher)} ${getLastName(teacher)}`.trim());
    setForm(prev => ({ ...prev, curatorEmail: getEmail(teacher) }));
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Назва групи обов’язкова!');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        year: form.year ? parseInt(form.year) : undefined,
        specialty: form.specialty.trim() || undefined,
        curatorEmail: form.curatorEmail || undefined,
      };

      if (editData) {
        await api.patch(`/student-groups/${editData.id}`, payload);
      } else {
        await api.post('/student-groups', payload);
      }

      toast.success(editData ? 'Групу успішно оновлено!' : 'Групу успішно створено!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Помилка при збереженні');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <h2 className="text-2xl font-semibold">
            {editData ? 'Редагувати групу' : 'Створити нову групу'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-auto max-h-[calc(95vh-80px)]">
          {/* Назва групи */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Назва групи *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 focus:border-cyan-500 outline-none"
              placeholder="КН-211"
            />
          </div>

          {/* Рік + Спеціальність */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Рік вступу</label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 focus:border-cyan-500 outline-none"
                placeholder="2024"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Спеціальність</label>
              <input
                type="text"
                value={form.specialty}
                onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 focus:border-cyan-500 outline-none"
                placeholder="Комп'ютерні науки"
              />
            </div>
          </div>

          {/* Вибір куратора */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Куратор (викладач)</label>
            
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={searchTeacher}
                  onChange={(e) => {
                    setSearchTeacher(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Пошук викладача..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-11 py-3 focus:border-cyan-500 outline-none"
                />
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>

              {/* Випадаючий список */}
              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-2xl max-h-72 overflow-auto shadow-2xl py-2">
                  {teachersLoading ? (
                    <p className="p-4 text-slate-400">Завантаження...</p>
                  ) : filteredTeachers.length > 0 ? (
                    filteredTeachers.map((teacher: any) => (
                      <div
                        key={teacher.id}
                        onClick={() => selectTeacher(teacher)}
                        className="px-4 py-3 hover:bg-slate-700 cursor-pointer flex items-center gap-3 border-b border-slate-700 last:border-none transition"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {getFirstName(teacher)} {getLastName(teacher)}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{getEmail(teacher)}</p>
                        </div>
                        {teacher.subject && (
                          <span className="text-xs bg-slate-700 px-2 py-1 rounded-lg text-slate-300">
                            {teacher.subject}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="p-4 text-slate-400 text-center">Викладачів не знайдено</p>
                  )}
                </div>
              )}
            </div>

            {/* Обраний куратор */}
            {selectedTeacher && (
              <div className="mt-4 p-4 bg-emerald-900/30 border border-emerald-700/50 rounded-2xl flex items-center gap-3">
                <UserCheck size={24} className="text-emerald-400" />
                <div>
                  <p className="text-sm text-emerald-300">Обраний куратор:</p>
                  <p className="font-medium text-lg">
                    {getFirstName(selectedTeacher)} {getLastName(selectedTeacher)}
                  </p>
                  <p className="text-xs text-emerald-400/80">{getEmail(selectedTeacher)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Кнопки */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border border-slate-700 rounded-2xl hover:bg-slate-800 transition"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={loading || !form.name.trim()}
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-400 text-black font-semibold py-4 rounded-2xl transition"
            >
              {loading ? 'Збереження...' : editData ? 'Зберегти зміни' : 'Створити групу'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentGroupModal;