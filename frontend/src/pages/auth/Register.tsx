import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService, type RegisterDto } from '../../services/authService';
import { toast } from 'sonner';
import { useValidation, RULES } from '../../hooks/useValidation';

const FIELD_RULES = {
  firstName: [RULES.required(), RULES.minLength(2), RULES.maxLength(50)],
  lastName:  [RULES.required(), RULES.minLength(2), RULES.maxLength(50)],
  email:     [RULES.required(), RULES.email()],
  password:  [RULES.required(), RULES.minLength(6)],
  phone:     [RULES.phone()],
};

const inputCls = (touched: boolean, error: string) =>
  `w-full bg-slate-800 border rounded-xl px-4 py-3 focus:outline-none transition ${
    !touched ? 'border-slate-700 focus:border-cyan-500' :
    error ? 'border-red-500 focus:border-red-500' : 'border-green-500 focus:border-green-500'
  }`;

const Register = () => {
  const [formData, setFormData] = useState<RegisterDto>({
    email: '', password: '', firstName: '', lastName: '', phone: '', role: 'STUDENT',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { errors, touched, touchField, validateField, validateAll } = useValidation(FIELD_RULES);

  const set = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) validateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const values: Record<string, string> = {
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      email: formData.email,
      password: formData.password,
      phone: formData.phone || '',
    };
    if (!validateAll(values)) return;
    setLoading(true);
    try {
      await authService.register(formData);
      toast.success('Реєстрація успішна! Тепер увійдіть.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Помилка реєстрації');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cyan-400">Реєстрація</h1>
          <p className="text-slate-400 mt-2">Створіть новий акаунт</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Ім'я</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={e => set('firstName', e.target.value)}
                  onBlur={e => touchField('firstName', e.target.value)}
                  className={inputCls(!!touched.firstName, errors.firstName)}
                  placeholder="Іван"
                />
                {touched.firstName && errors.firstName && (
                  <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Прізвище</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={e => set('lastName', e.target.value)}
                  onBlur={e => touchField('lastName', e.target.value)}
                  className={inputCls(!!touched.lastName, errors.lastName)}
                  placeholder="Іваненко"
                />
                {touched.lastName && errors.lastName && (
                  <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => set('email', e.target.value)}
                onBlur={e => touchField('email', e.target.value)}
                className={inputCls(!!touched.email, errors.email)}
                placeholder="ivan@example.com"
              />
              {touched.email && errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Пароль</label>
              <input
                type="password"
                value={formData.password}
                onChange={e => set('password', e.target.value)}
                onBlur={e => touchField('password', e.target.value)}
                className={inputCls(!!touched.password, errors.password)}
                placeholder="Мінімум 6 символів"
              />
              {touched.password && errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Телефон (необов'язково)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => set('phone', e.target.value)}
                onBlur={e => touchField('phone', e.target.value)}
                className={inputCls(!!touched.phone, errors.phone || '')}
                placeholder="+380501234567"
              />
              {touched.phone && errors.phone && (
                <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 rounded-xl transition disabled:opacity-70"
            >
              {loading ? 'Реєстрація...' : 'Зареєструватися'}
            </button>
          </form>

          <p className="text-center text-slate-400 mt-6">
            Вже маєте акаунт?{' '}
            <Link to="/login" className="text-cyan-400 hover:underline">Увійти</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
