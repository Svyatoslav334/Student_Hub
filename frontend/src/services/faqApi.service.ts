import api from './api';

export const faqApi = {
  getAll: (params?: any) => api.get('/faq', { params }),

  create: (data: any) => {
    console.log('📤 CREATE PAYLOAD:', data);
    return api.post('/faq', data);
  },

  update: (id: number, data: any) => {    
    return api.patch(`/faq/${id}`, data);
  },

  remove: (id: number) => api.delete(`/faq/${id}`),
};