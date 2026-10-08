const defaultApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const defaultSocketUrl = import.meta.env.VITE_SOCKET_URL || defaultApiUrl;

export const API_BASE_URL = defaultApiUrl.replace(/\/$/, "");
export const API_PREFIX = `${API_BASE_URL}/api`;
export const SOCKET_URL = defaultSocketUrl.replace(/\/$/, "");