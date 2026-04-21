export const BASE_URL = '/api';

export const getHeaders = () => {
  const token = localStorage.getItem('access');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  async login(payload: any) {
    const res = await fetch(`${BASE_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  async register(payload: any) {
    const res = await fetch(`${BASE_URL}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
  },

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);

    const token = localStorage.getItem('access');
    const res = await fetch(`${BASE_URL}/uploads/`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },

  async getRecentSummaries() {
    const res = await fetch(`${BASE_URL}/uploads/`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  },

  async getSummary(id: string) {
    const res = await fetch(`${BASE_URL}/uploads/${id}/`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  }
};
