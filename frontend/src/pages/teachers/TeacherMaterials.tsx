import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, FileText, Edit2, Trash2 } from 'lucide-react';
import AddMaterialModal from '../../components/materials/AddMaterialModal';
import EditMaterialModal from '../../components/materials/EditMaterialModal';

const TeacherMaterials = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);

  // Завантаження матеріалів викладача
  useEffect(() => {
    fetchMyMaterials();
  }, []);

  const fetchMyMaterials = async () => {
    try {
      setLoading(true);
      const res = await api.get('/materials?my=true');
      setMaterials(res.data.items || res.data);
    } catch (err) {
      console.error('Помилка завантаження матеріалів:', err);
    } finally {
      setLoading(false);
    }
  };

  // Відкриття модалки редагування
  const handleEdit = (material: any) => {
    setSelectedMaterial(material);
    setIsEditModalOpen(true);
  };

  // Видалення матеріалу
  const handleDelete = async (id: number) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей матеріал?')) {
      return;
    }

    try {
      await api.delete(`/materials/${id}`);
      alert('Матеріал успішно видалено');
      fetchMyMaterials(); // оновлюємо список
    } catch (err: any) {
      alert(err.response?.data?.message || 'Помилка при видаленні');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Мої матеріали</h1>
            <p className="text-slate-400">Матеріали, які ви завантажили</p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-cyan-500 text-black px-5 py-3 rounded-2xl font-semibold hover:bg-cyan-400 transition"
          >
            <Plus size={20} />
            Додати матеріал
          </button>
        </div>

        
        {loading ? (
          <div className="flex justify-center py-20">
            <p className="text-slate-400">Завантаження матеріалів...</p>
          </div>
        ) : materials.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <FileText size={60} className="mx-auto text-slate-600 mb-4" />
            <p className="text-xl text-slate-400">У вас ще немає матеріалів</p>
            <p className="text-slate-500 mt-2">Натисніть "Додати матеріал", щоб почати</p>
          </div>
        ) : (
          /* Materials Grid */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {materials.map((mat) => (
              <div
                key={mat.id}
                className="bg-slate-900 border border-slate-700 rounded-3xl p-6 hover:border-slate-600 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg leading-tight">{mat.title}</h3>
                  <span className="text-xs px-2.5 py-1 bg-slate-800 text-cyan-400 rounded-full">
                    {mat.type === 'lecture' && 'Лекція'}
                    {mat.type === 'presentation' && 'Презентація'}
                    {mat.type === 'methodical' && 'Методичка'}
                    {mat.type === 'other' && 'Інше'}
                  </span>
                </div>

                <p className="text-slate-400 text-sm line-clamp-3 mb-6">
                  {mat.description}
                </p>

                {mat.category && (
                  <p className="text-xs text-slate-500 mb-4">
                    Категорія: {mat.category.name}
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(mat)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 py-2.5 rounded-2xl text-sm flex items-center justify-center gap-2 transition"
                  >
                    <Edit2 size={16} />
                    Редагувати
                  </button>

                  <button
                    onClick={() => handleDelete(mat.id)}
                    className="flex-1 bg-red-900/50 hover:bg-red-900 py-2.5 rounded-2xl text-sm text-red-400 flex items-center justify-center gap-2 transition"
                  >
                    <Trash2 size={16} />
                    Видалити
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      
      <AddMaterialModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchMyMaterials}
      />

      <EditMaterialModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMaterial(null);
        }}
        material={selectedMaterial}
        onSuccess={fetchMyMaterials}
      />
    </div>
  );
};

export default TeacherMaterials;