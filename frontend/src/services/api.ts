import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// RFP APIs
export const rfpApi = {
  create: (description: string) => api.post('/rfps', { description }),
  getAll: () => api.get('/rfps'),
  getById: (id: number) => api.get(`/rfps/${id}`),
  sendToVendors: (id: number, vendorIds: number[]) =>
    api.post(`/rfps/${id}/send`, { vendor_ids: vendorIds }),
};

// Vendor APIs
export const vendorApi = {
  create: (data: {
    name: string;
    email: string;
    contact_person?: string;
    phone?: string;
    address?: string;
  }) => api.post('/vendors', data),
  getAll: () => api.get('/vendors'),
  getById: (id: number) => api.get(`/vendors/${id}`),
  update: (id: number, data: Partial<{
    name: string;
    email: string;
    contact_person?: string;
    phone?: string;
    address?: string;
  }>) => api.put(`/vendors/${id}`, data),
  delete: (id: number) => api.delete(`/vendors/${id}`),
};

// Proposal APIs
export const proposalApi = {
  parse: (data: {
    rfp_id: number;
    vendor_id: number;
    email_subject: string;
    email_body: string;
  }) => api.post('/proposals/parse', data),
  compare: (rfpId: number) => api.get(`/proposals/rfp/${rfpId}/compare`),
};

// Email APIs
export const emailApi = {
  receive: (data: {
    from: string;
    subject: string;
    body: string;
    rfp_id?: number;
  }) => api.post('/email/receive', data),
};

export default api;
