import api from './api';

export const DocumentsAPI = {
  getAll: (params?: any) =>
    api.get('/documents', { params }),

  getById: (id: number) =>
    api.get(`/documents/${id}`),

  create: (data: FormData) =>
    api.post('/documents', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: number, data: any) =>
    api.patch(`/documents/${id}`, data),

  remove: (id: number) =>
    api.delete(`/documents/${id}`),

  getCategories: () =>
    api.get('/documents/categories'),

  createCategory: (data: any) =>
    api.post('/documents/categories', data),

  deleteCategory: (id: number) =>
    api.delete(`/documents/categories/${id}`),
};