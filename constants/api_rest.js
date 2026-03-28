import axios from "axios";

export const API = axios.create({
  baseURL: "http://localhost:8080/selfmd/api",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const AUTH_ROUTES = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
};

export const DATABASE_CRUD_ROUTES = {
  CRIAR: "/databases/criar",
  LISTAR: "/databases/listar",
  ATUALIZAR: (id) => `/databases/atualizar/${id}`,
  EXCLUIR: (id) => `/databases/excluir/${id}`
};

export const TABELA_CRUD_ROUTES = {
  CRIAR: "/tabelas/criar/{databaseId}",
  LISTAR: "/tabelas/listar/{databaseId}",
  ATUALIZAR: (tabelaId) => `/tabelas/atualizar/${tabelaId}`,
  EXCLUIR: (tabelaId) => `/tabelas/excluir/${tabelaId}`
};

export const COLUNA_CRUD_ROUTES = {}

export const DADOS_CRUD_ROUTES = {}

export const REL_CRUD_ROUTES = {}

export const AUT_CRUD_ROUTES = {}