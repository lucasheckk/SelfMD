import axios from 'axios';

export const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json"
  }
});

export const AUTH_ROUTES = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register"
};