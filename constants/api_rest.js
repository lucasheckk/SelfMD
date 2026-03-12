import axios from 'axios';

export const API = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json"
  }
});

export const AUTH_ROUTES = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register"
};

export const CRUD_ROUTES = {
  DATABASE: "/databases",
  USUARIO: (id) => `/usuario/${id}`
};