import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Send, 
  Trash2 
} from 'lucide-react';

interface News {
  id: number;
  title: string;
  content: string;
  image?: string;
  category: string;
  pinned: boolean;
  createdAt: string;
  author?: {
    email: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: {
    id: number;
    email: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

const NewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuthStore();

  const [news, setNews] = useState<News | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchNewsAndComments();
  }, [id]);

  const fetchNewsAndComments = async () => {
    setLoading(true);
    try {
      const [newsRes, commentsRes] = await Promise.all([
        api.get(`/news/${id}`),
        api.get(`/news/${id}/comments`)
      ]);
      
      setNews(newsRes.data);
      setComments(commentsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    setCommentLoading(true);
    try {
      await api.post(`/news/${id}/comments`, { content: newComment.trim() });
      setNewComment('');
      fetchNewsAndComments(); // оновлюємо список коментарів
    } catch (err: any) {
      alert(err.response?.data?.message || 'Не вдалося додати коментар');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Видалити цей коментар?')) return;

    try {
      await api.delete(`/news/${id}/comments/${commentId}`);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Не вдалося видалити коментар');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-xl text-slate-400">Завантаження...</div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl">Новину не знайдено</h2>
          <Link to="/news" className="text-cyan-400 hover:underline mt-4 inline-block">
            ← Повернутися до новин
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link
          to="/news"
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 text-lg transition"
        >
          <ArrowLeft size={20} />
          Повернутися до новин
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          {news.image && (
            <img
              src={news.image}
              alt={news.title}
              className="w-full h-[420px] object-cover"
            />
          )}

          <div className="p-8 md:p-12">
            {news.pinned && (
              <span className="inline-flex items-center gap-2 bg-amber-500 text-black px-5 py-2 rounded-2xl text-sm font-semibold mb-6">
                📌 Закріплена новина
              </span>
            )}

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              {news.title}
            </h1>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-400 mb-10">
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                {new Date(news.createdAt).toLocaleDateString('uk-UA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="capitalize">• {news.category}</div>
              {news.author?.profile && (
                <div className="flex items-center gap-2">
                  <User size={18} />
                  {news.author.profile.firstName} {news.author.profile.lastName}
                </div>
              )}
            </div>

            <div className="prose prose-invert max-w-none text-lg leading-relaxed text-slate-200">
              {news.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-6">{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            Коментарі ({comments.length})
          </h2>

          
          {isAuthenticated ? (
            <form onSubmit={handleSubmitComment} className="mb-10">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Напишіть свій коментар..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 min-h-[120px] focus:outline-none focus:border-cyan-500 resize-y"
                  required
                />
                <button
                  type="submit"
                  disabled={commentLoading || !newComment.trim()}
                  className="mt-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-black font-semibold px-8 py-3 rounded-2xl flex items-center gap-2 transition"
                >
                  {commentLoading ? 'Відправка...' : 'Опублікувати'}
                  <Send size={18} />
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center mb-10">
              <p className="text-slate-400">Увійдіть, щоб залишати коментарі</p>
              <Link
                to="/login"
                className="inline-block mt-4 bg-cyan-500 text-black px-6 py-3 rounded-2xl font-semibold hover:bg-cyan-400"
              >
                Увійти
              </Link>
            </div>
          )}

          
          <div className="space-y-6">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="font-medium">
                          {comment.author.profile?.firstName} {comment.author.profile?.lastName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(comment.createdAt).toLocaleDateString('uk-UA')}
                        </p>
                      </div>
                    </div>

                    {(user?.id === comment.author.id || user?.role === 'ADMIN') && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-400 hover:text-red-500 transition p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <p className="mt-4 text-slate-200 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                Коментарів поки немає. Будьте першим!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;