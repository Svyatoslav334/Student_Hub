import { useState } from 'react';
import { DocumentsAPI } from '../../services/documents.api';

const DocumentModal = ({ onClose, onSuccess, editData, categories }: any) => {
  const [title, setTitle] = useState(editData?.title || '');
  const [description, setDescription] = useState(editData?.description || '');
  const [type, setType] = useState(editData?.type || 'other');
  const [categoryId, setCategoryId] = useState(editData?.category?.id || '');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    try{
        const form = new FormData();

        form.append('title', title);
        form.append('description', description);
        form.append('type', type);
        form.append('categoryId', String(categoryId));

        if (file) form.append('file', file);

        if (editData) {
          await DocumentsAPI.update(editData.id, {
            title,
            description,
            type,
            categoryId,
          });
        } else {
          await DocumentsAPI.create(form);
        }

        onSuccess();
        onClose();
      
    } catch (err: any) {
      console.error('Server error:', err.response?.data);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-slate-900 p-6 rounded-3xl modal-enter w-[500px] space-y-3">
        <h2 className="text-xl font-bold">
          {editData ? 'Редагувати' : 'Новий документ'}
        </h2>

        <input
          className="w-full p-2 bg-slate-800 rounded"
          placeholder="Назва"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full p-2 bg-slate-800 rounded"
          placeholder="Опис (мінімум 10 символів)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {description.length > 0 && description.length < 10 && (
          <p className="text-red-400 text-xs">Мінімум 10 символів ({description.length}/10)</p>
        )}

        <select
          className="w-full p-2 bg-slate-800 rounded"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="template">Template</option>
          <option value="sample">Sample</option>
          <option value="form">Form</option>
          <option value="reference">Reference</option>
          <option value="other">Other</option>
        </select>

        <select
          className="w-full p-2 bg-slate-800 rounded"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Category</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {!editData && (
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={handleSubmit}
            className="bg-cyan-500 px-4 py-2 rounded text-black"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentModal;
