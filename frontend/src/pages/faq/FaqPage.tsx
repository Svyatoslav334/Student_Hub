import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Search, ChevronDown, HelpCircle, X } from 'lucide-react';
import { toast } from 'sonner';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  isPublished: boolean;
}

const FaqPage = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [openId, setOpenId] = useState<number | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [modalCategory, setModalCategory] = useState('OTHER');
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { value: 'ALL', label: 'Всі питання' },
    { value: 'ADMISSION', label: 'Вступ' },
    { value: 'DOCUMENTS', label: 'Документи' },
    { value: 'STUDIES', label: 'Навчання' },
    { value: 'SCHEDULE', label: 'Розклад' },
    { value: 'CLUBS', label: 'Гуртки' },
    { value: 'TEACHERS', label: 'Викладачі' },
    { value: 'OTHER', label: 'Інше' },
  ];

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/faq');
      setFaqs(res.data.items || res.data);
    } catch (err) {
      console.error('Failed to load FAQ', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFaqs = faqs
    .filter(faq => faq.isPublished)
    .filter(faq => {
      const matchesSearch =
        faq.question.toLowerCase().includes(search.toLowerCase()) ||
        faq.answer.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === 'ALL' || faq.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => a.question.localeCompare(b.question));

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    setSubmitting(true);
    try {
      await api.post('/faq/ask', {
        question: questionText.trim(),
        category: modalCategory
      });
      toast.success('Ваше питання надіслано! Дякуємо.');
      setQuestionText('');
      setShowModal(false);
    } catch (err) {
      toast.error('Помилка при відправці питання');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <HelpCircle size={48} className="text-cyan-400" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Часті запитання</h1>
          <p className="text-slate-400 text-lg">Тут зібрані відповіді на найпоширеніші питання студентів</p>
        </div>

        
        <div className="mb-10 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Пошук питань..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-11 py-4 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-cyan-500"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        
        {loading ? (
          <div className="space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-900 rounded-2xl animate-pulse" />)}
          </div>
        ) : filteredFaqs.length > 0 ? (
          <div className="space-y-3">
            {filteredFaqs.map((faq) => (
              <div key={faq.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-slate-800/50"
                >
                  <span className="font-medium pr-6 text-left">{faq.question}</span>
                  <ChevronDown className={`text-cyan-400 transition-transform ${openId === faq.id ? 'rotate-180' : ''}`} size={22} />
                </button>
                {openId === faq.id && (
                  <div className="px-6 pb-6 pt-2 text-slate-300 leading-relaxed border-t border-slate-800">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <HelpCircle size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-xl text-slate-400">Нічого не знайдено</p>
          </div>
        )}

        
        <div className="mt-16 text-center">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-8 py-4 rounded-2xl text-lg transition"
          >
            <HelpCircle size={24} />
            Задати своє питання
          </button>
        </div>
      </div>

      
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-3xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-2xl font-bold">Задати питання</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X size={28} />
              </button>
            </div>

            <form onSubmit={handleSubmitQuestion} className="p-6">
              <div className="mb-6">
                <label className="block text-slate-400 mb-2">Категорія</label>
                <select
                  value={modalCategory}
                  onChange={(e) => setModalCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 focus:border-cyan-500"
                >
                  {categories.slice(1).map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-slate-400 mb-2">Ваше питання</label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Напишіть ваше питання якомога детальніше..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-4 min-h-[140px] focus:border-cyan-500 resize-y"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !questionText.trim()}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-black font-semibold py-4 rounded-2xl transition"
              >
                {submitting ? 'Відправка...' : 'Надіслати питання'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaqPage;