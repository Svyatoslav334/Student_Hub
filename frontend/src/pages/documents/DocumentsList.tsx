import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Download, FileText, Search, X } from 'lucide-react';

interface Document {
  id: number;
  title: string;
  description: string;
  file: string | null;
  originalFileName?: string;
  mimeType?: string;
  size?: number;
  type: string;
  category: {
    id: number;
    name: string;
  };
  createdAt: string;
  author?: {
    profile?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

const DocumentsList = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/documents');
      setDocuments(res.data.items || res.data);
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setLoading(false);
    }
  };

  const openFile = (doc: Document) => {
    if (!doc.file) return;
    setSelectedTitle(doc.title);
    setSelectedFile(doc.file);
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(search.toLowerCase()) ||
    doc.description.toLowerCase().includes(search.toLowerCase()) ||
    doc.category.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <FileText size={36} className="text-cyan-400" />
            <div>
              <h1 className="text-4xl font-bold">Документи</h1>
              <p className="text-slate-400 mt-1">Офіційні документи, шаблони та бланки</p>
            </div>
          </div>
          <p className="text-slate-500">
            Знайдено: <span className="text-white font-medium">{documents.length}</span> документів
          </p>
        </div>

        
        <div className="relative mb-10">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Пошук документів..."
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
        ) : filteredDocuments.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                onClick={() => openFile(doc)}
                className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-cyan-500/50 transition-all hover:-translate-y-1 cursor-pointer flex flex-col h-full"
              >
                <div className="h-52 bg-slate-800 flex items-center justify-center relative">
                  <FileText size={80} className="text-slate-600 group-hover:text-cyan-500/30 transition" />
                  <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded-full text-xs font-medium">
                    {doc.category.name}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold mb-3 line-clamp-2 group-hover:text-cyan-400 transition">
                    {doc.title}
                  </h3>

                  <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-1">
                    {doc.description}
                  </p>

                  <div className="flex items-center justify-between text-sm pt-4 border-t border-slate-800">
                    <div className="text-cyan-400 flex items-center gap-2">
                      <Download size={16} />
                      Переглянути
                    </div>
                    {doc.originalFileName && (
                      <span className="text-xs text-slate-500 truncate max-w-[140px]">
                        {doc.originalFileName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <FileText size={64} className="mx-auto text-slate-700 mb-6" />
            <p className="text-2xl text-slate-400">Документів не знайдено</p>
            <p className="text-slate-500 mt-2">Спробуйте змінити пошуковий запит</p>
          </div>
        )}
      </div>

      
      {selectedFile && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col">
          
          <div className="flex items-center justify-between border-b border-slate-700 bg-slate-900 px-6 py-4">
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-cyan-400" />
              <h3 className="font-medium text-lg truncate max-w-[700px]">{selectedTitle}</h3>
            </div>

            <div className="flex items-center gap-4">
              <a
                href={selectedFile}
                download
                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition text-sm font-medium"
              >
                <Download size={18} />
                Завантажити
              </a>

              <button
                onClick={() => {
                  setSelectedFile(null);
                  setSelectedTitle('');
                }}
                className="p-2 hover:bg-slate-800 rounded-xl transition"
              >
                <X size={26} />
              </button>
            </div>
          </div>

          
          <div className="flex-1 bg-slate-950 p-4">
            <iframe
              src={selectedFile}
              className="w-full h-full rounded-2xl border border-slate-700 bg-white"
              title={selectedTitle}
            />
          </div>

          <div className="p-3 text-center text-xs text-slate-500 bg-slate-900 border-t border-slate-700">
            Якщо документ не відображається, спробуйте завантажити файл
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsList;