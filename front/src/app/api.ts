export const BASE_URL = '/api';

const parseError = async (res: Response, fallbackMessage: string) => {
  try {
    const data = await res.json();
    const fieldErrors = Object.entries(data).reduce<Record<string, string>>((acc, [key, value]) => {
      if (typeof value === 'string') {
        acc[key] = value;
      } else if (Array.isArray(value)) {
        acc[key] = value.join(' ');
      }

      return acc;
    }, {});
    const firstValue = Object.values(fieldErrors)[0];
    const message =
      data.error_message ||
      data.error ||
      data.detail ||
      firstValue;

    const error = new Error(typeof message === 'string' ? message : fallbackMessage) as Error & {
      fieldErrors?: Record<string, string>;
    };

    if (Object.keys(fieldErrors).length > 0) {
      error.fieldErrors = fieldErrors;
    }

    throw error;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(fallbackMessage);
  }
};

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
    if (!res.ok) await parseError(res, 'Login failed');
    return res.json();
  },

  async register(payload: any) {
    const res = await fetch(`${BASE_URL}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) await parseError(res, 'Registration failed');
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
    if (!res.ok) await parseError(res, 'Upload failed');
    return res.json();
  },

  async getRecentSummaries() {
    const res = await fetch(`${BASE_URL}/uploads/`, {
      headers: getHeaders()
    });
    if (!res.ok) await parseError(res, 'Failed to fetch');
    return res.json();
  },

  async getSummary(id: string) {
    const res = await fetch(`${BASE_URL}/uploads/${id}/`, {
      headers: getHeaders()
    });
    if (!res.ok) await parseError(res, 'Failed to fetch');
    return res.json();
  },

  async updateSummary(id: string, payload: { title?: string; summary?: string }) {
    const res = await fetch(`${BASE_URL}/uploads/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) await parseError(res, 'Failed to update summary');
    return res.json();
  },

  async deleteSummary(id: string) {
    const res = await fetch(`${BASE_URL}/uploads/${id}/`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) await parseError(res, 'Failed to delete summary');
    return res;
  }
};
