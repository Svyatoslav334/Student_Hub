import { useEffect, useState } from 'react';
import { DocumentsAPI } from '../../services/documents.api';

import { Plus, Trash, Pencil, File } from 'lucide-react';
import DocumentModal from '../../components/admin/DocumentModal';
import CategoryModal from '../../components/admin/CategoryModal';


const AdminDocuments = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [editDoc, setEditDoc] = useState<any>(null);

  const [openCategoryModal, setOpenCategoryModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [docs, cats] = await Promise.all([
        DocumentsAPI.getAll({ page: 1, limit: 50 }),
        DocumentsAPI.getCategories(),
      ]);

      setDocuments(docs.data.items);
      setCategories(cats.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Видалити документ?')) return;

    await DocumentsAPI.remove(id);
    fetchData();
  };

  return (
    <div>
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Документи</h1>
          <p className="text-slate-400">
            Управління файлами, шаблонами і формами
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setOpenCategoryModal(true)}
            className="px-4 py-2 bg-slate-800 rounded-xl"
          >
            Категорії
          </button>

          <button
            onClick={() => {
              setEditDoc(null);
              setOpenModal(true);
            }}
            className="px-4 py-2 bg-cyan-500 text-black rounded-xl flex items-center gap-2"
          >
            <Plus size={18} />
            Додати
          </button>
        </div>
      </div>

      
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        {loading ? (
          <p className="text-slate-400">Завантаження...</p>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex justify-between items-center bg-slate-800 p-4 rounded-2xl"
              >
                <div>
                  <h3 className="font-semibold">{doc.title}</h3>

                  <p className="text-sm text-slate-400">
                    {doc.category?.name} • {doc.type}
                  </p>
                </div>

                <div className="flex gap-2 items-center">
                  {doc.file && (
                    <a
                      href={doc.file}
                      target="_blank"
                      className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl"
                    >
                      <File size={18} />
                    </a>
                  )}

                  <button
                    onClick={() => {
                      setEditDoc(doc);
                      setOpenModal(true);
                    }}
                    className="p-2 bg-yellow-500/10 text-yellow-400 rounded-xl"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 bg-red-500/10 text-red-400 rounded-xl"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      
      {openModal && (
        <DocumentModal
          onClose={() => setOpenModal(false)}
          onSuccess={fetchData}
          editData={editDoc}
          categories={categories}
        />
      )}

      {openCategoryModal && (
        <CategoryModal
          onClose={() => setOpenCategoryModal(false)}
          categories={categories}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};

export default AdminDocuments;