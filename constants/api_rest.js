import axios from 'axios';

export const API = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json"
  }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AUTH_ROUTES = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register"
};

export const CRUD_ROUTES = {
  CRIAR: "/databases",
  USUARIO: (id) => `/usuario/${id}`
};