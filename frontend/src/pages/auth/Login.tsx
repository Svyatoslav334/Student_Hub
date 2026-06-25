import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService, type LoginDto } from '../../services/authService';
import { useValidation, RULES } from '../../hooks/useValidation';

const FIELD_RULES = {
  email:    [RULES.required(), RULES.email()],
  password: [RULES.required(), RULES.minLength(6)],
};

const inputCls = (touched: boolean, error: string) =>
  `w-full bg-slate-800 border rounded-xl px-4 py-3 focus:outline-none transition ${
    !touched ? 'border-slate-700 focus:border-cyan-500' :
    error ? 'border-red-500 focus:border-red-500' : 'border-green-500 focus:border-green-500'
  }`;

const Login = () => {
  const [formData, setFormData] = useState<LoginDto>({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { errors, touched, touchField, validateField, validateAll } = useValidation(FIELD_RULES);

  const set = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) validateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll({ email: formData.email, password: formData.password })) return;
    setLoading(true);
    try {
      const response = await authService.login(formData);
      await useAuthStore.getState().login(response.access_token);
      navigate('/');
    } catch (err: any) {
      touchField('email', formData.email);
      touchField('password', formData.password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-cyan-400">StudentHub</h1>
          <p className="text-slate-400 mt-2">Увійдіть у свій акаунт</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => set('email', e.target.value)}
                onBlur={e => touchField('email', e.target.value)}
                className={inputCls(!!touched.email, errors.email)}
                placeholder="your@email.com"
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
                placeholder="••••••••"
              />
              {touched.password && errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 rounded-xl transition disabled:opacity-70"
            >
              {loading ? 'Вхід...' : 'Увійти'}
            </button>
          </form>

          <p className="text-center text-slate-400 mt-6">
            Немає акаунту?{' '}
            <Link to="/register" className="text-cyan-400 hover:underline">Зареєструватися</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
