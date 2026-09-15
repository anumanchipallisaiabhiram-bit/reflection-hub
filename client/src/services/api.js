const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, "");
const API_BASE_URL = cleanBaseUrl.endsWith("/api") ? cleanBaseUrl : `${cleanBaseUrl}/api`;

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "An error occurred");
  }

  return data;
};

export const authService = {
  register: (userData) =>
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  googleLogin: (credential) =>
    apiFetch("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    }),
};

export const journalService = {
  getJournals: () => apiFetch("/journals"),
  createJournal: (journalData) =>
    apiFetch("/journals", {
      method: "POST",
      body: JSON.stringify(journalData),
    }),
  getJournalById: (id) => apiFetch(`/journals/${id}`),
  updateJournal: (id, journalData) =>
    apiFetch(`/journals/${id}`, {
      method: "PUT",
      body: JSON.stringify(journalData),
    }),
  deleteJournal: (id) =>
    apiFetch(`/journals/${id}`, {
      method: "DELETE",
    }),
  generateAIReflection: (id) =>
    apiFetch(`/journals/${id}/ai-reflection`, {
      method: "POST",
    }),
  sendAIChatMessage: (message, history = []) =>
    apiFetch("/journals/ai-chat", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    }),
};
