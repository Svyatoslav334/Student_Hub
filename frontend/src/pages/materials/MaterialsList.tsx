import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  BookOpen, 
  Search, 
  Download, 
  X 
} from 'lucide-react';

interface Material {
  id: number;
  title: string;
  description: string;
  type: string;
  file?: string;
  originalFileName?: string;
  category: { name: string };
  createdAt: string;
  author?: {
    firstName?: string; lastName?: string
  };
}

const MaterialsList = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState('');

  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchMaterials(1);
  }, []);

  const fetchMaterials = async (pageNumber = 1) => {
    setLoading(true);
  
    try {
      const res = await api.get(
        `/materials?page=${pageNumber}&limit=${limit}`
      );
  
      setMaterials(res.data.items);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
      setPage(res.data.page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openDocument = (fileUrl: string, title: string) => {
    if (fileUrl.endsWith('.pdf')) {
      setSelectedFile(fileUrl);
      setSelectedTitle(title);
    } else {
      
      window.open(fileUrl, '_blank');
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = 
      material.title.toLowerCase().includes(search.toLowerCase()) ||
      material.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'ALL' || material.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center gap-4 mb-4">
          <BookOpen size={40} className="text-cyan-400" />
          <div>
            <h1 className="text-4xl font-bold">Навчальні матеріали</h1>
            <p className="text-slate-400">Лекції, презентації та методичні посібники</p>
            <p className="text-slate-500 mt-2">
              Знайдено: <span className="text-white font-medium">{total}</span> матеріалів
            </p>
          </div>
        </div>

        
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Пошук матеріалів..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-12 py-4 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Всі типи</option>
            <option value="lecture">Лекції</option>
            <option value="presentation">Презентації</option>
            <option value="methodical">Методичні матеріали</option>
            <option value="other">Інше</option>
          </select>
        </div>

        
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-80 bg-slate-900 rounded-3xl animate-pulse" />)}
          </div>
        ) : filteredMaterials.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials.map((material) => (
              <div
                key={material.id}
                className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-cyan-500/50 transition-all hover:-translate-y-1 flex flex-col cursor-pointer"
                onClick={() => material.file && openDocument(material.file, material.title)}
              >
                <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400">
                    {material.category.name}
                  </div>
                  <BookOpen size={52} className="text-slate-600 group-hover:scale-110 transition" />
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-cyan-400 transition mb-3">
                    {material.title}
                  </h3>

                  <p className="text-slate-400 text-sm line-clamp-3 flex-1">
                    {material.description}
                  </p>

                  <div className="mt-auto pt-4 flex items-center justify-between text-xs text-slate-500">
                    <div>{new Date(material.createdAt).toLocaleDateString('uk-UA')}</div>
                    {material.author && (
                      <div>{material.author.firstName} {material.author.lastName}</div>
                    )}
                  </div>

                  {material.file && (
                    <button className="mt-4 w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 transition">
                      <Download size={18} />
                      Переглянути / Завантажити
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                disabled={page === 1}
                onClick={() => fetchMaterials(page - 1)}
                className="px-4 py-2 bg-slate-800 rounded-xl disabled:opacity-50"
              >
                Назад
              </button>
        
              <span className="text-slate-300">
                Сторінка {page} з {totalPages}
              </span>
        
              <button
                disabled={page === totalPages}
                onClick={() => fetchMaterials(page + 1)}
                className="px-4 py-2 bg-slate-800 rounded-xl disabled:opacity-50"
              >
                Вперед
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <BookOpen size={64} className="mx-auto text-slate-700 mb-6" />
            <p className="text-2xl text-slate-400">Матеріалів не знайдено</p>
          </div>
        )}
      </div>

      
      {selectedFile && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col">
          
          <div className="flex items-center justify-between border-b border-slate-700 bg-slate-900 px-6 py-4 z-10">
            <div className="flex items-center gap-3">
              <h3 className="font-medium text-lg">{selectedTitle}</h3>
            </div>
            
            <div className="flex items-center gap-4">
              <a
                href={selectedFile}
                download
                className="text-cyan-400 hover:text-cyan-300 transition flex items-center gap-2 text-sm"
              >
                Завантажити
              </a>
              
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setSelectedTitle('');
                }}
                className="p-2 hover:bg-slate-800 rounded-xl transition"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          
          <div className="flex-1 bg-slate-950 relative">
            <iframe
              src={selectedFile}
              className="w-full h-full"
              title={selectedTitle}
            />
          </div>

          
          <div className="p-3 text-center text-xs text-slate-500 bg-slate-900 border-t border-slate-700">
            Якщо документ не завантажується, спробуйте завантажити файл
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialsList;
