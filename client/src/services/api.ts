class CategoryAPIService {
  private baseURL: string;
  private token?: string;

  constructor(baseURL: string, token?: string) {
    this.baseURL = baseURL;
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  async getCategories() {
    return this.request("/categories");
  }

  async createCategory(data: FormData) {
    return fetch(`${this.baseURL}/categories`, {
      method: "POST",
      body: data,
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    }).then(res => {
      if (!res.ok) throw new Error("Failed to create category");
      return res.json();
    });
  }

  async updateCategory(id: number, data: FormData) {
    return fetch(`${this.baseURL}/categories/${id}`, {
      method: "PUT",
      body: data,
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    }).then(res => {
      if (!res.ok) throw new Error("Failed to update category");
      return res.json();
    });
  }

  async deleteCategory(id: number) {
    return this.request(`/categories/${id}`, {
      method: "DELETE",
    });
  }
}

export const categoryAPI = new CategoryAPIService(
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  import.meta.env.VITE_API_TOKEN
);

// import { BACKEND_API_URL } from '@/config';

const BACKEND_API_URL= "http://localhost:3000/api"

/**
 * A utility to handle API requests, including file uploads.
 * It sends data as multipart/form-data.
 *
 * @param endpoint - The API endpoint (e.g., '/pdfs').
 * @param data - The form data object.
 * @param method - The HTTP method ('POST' or 'PUT').
 * @param pdfId - The ID of the PDF to update (for PUT requests).
 * @returns The JSON response from the server.
 */
export const apiSubmit = async (
  endpoint: string,
  data: Record<string, any>,
  method: 'POST' | 'PUT',
  pdfId?: string
): Promise<any> => {
  const formData = new FormData();

  // Append all data fields to the FormData object
  for (const key in data) {
    if (data[key] !== undefined && data[key] !== null) {
      // Handle file objects separately
      if (data[key] instanceof File) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, String(data[key]));
      }
    }
  }

  const url = pdfId ? `${BACKEND_API_URL}${endpoint}/${pdfId}` : `${BACKEND_API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method,
      body: formData,
      // 'Content-Type' is set automatically by the browser for FormData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'An unknown error occurred.');
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${method} ${url}):`, error);
    throw error;
  }
};