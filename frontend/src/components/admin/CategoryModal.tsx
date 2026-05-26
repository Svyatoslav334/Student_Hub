import { useState } from 'react';
import { DocumentsAPI } from '../../services/documents.api';

const CategoryModal = ({ categories, onClose, onSuccess }: any) => {
  const [name, setName] = useState('');

  const create = async () => {
    await DocumentsAPI.createCategory({ name });
    setName('');
    onSuccess();
  };

  const remove = async (id: number) => {
    await DocumentsAPI.deleteCategory(id);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-slate-900 p-6 rounded-3xl w-[400px]">
        <h2 className="text-xl font-bold mb-3">Категорії</h2>

        <div className="flex gap-2 mb-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 p-2 bg-slate-800 rounded"
          />
          <button onClick={create} className="bg-cyan-500 px-3 rounded">
            +
          </button>
        </div>

        <div className="space-y-2">
          {categories.map((c: any) => (
            <div
              key={c.id}
              className="flex justify-between bg-slate-800 p-2 rounded"
            >
              <span>{c.name}</span>
              <button onClick={() => remove(c.id)}>x</button>
            </div>
          ))}
        </div>

        <button className="mt-4 w-full" onClick={onClose}>
          Закрити
        </button>
      </div>
    </div>
  );
};

export default CategoryModal;