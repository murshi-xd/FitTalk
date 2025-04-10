const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";

import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});
