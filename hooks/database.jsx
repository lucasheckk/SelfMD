import { useState, useEffect } from 'react';

export const useDatabase = () => {
  const [databases, setDatabases] = useState([]);

  // Carrega ao iniciar
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('minhasDatabases') || '[]');
    setDatabases(saved);
  }, []);

  // Função para adicionar
  const addDatabase = (novaDb) => {
    const updated = [...databases, novaDb];
    setDatabases(updated);
    localStorage.setItem('minhasDatabases', JSON.stringify(updated));
  };

  return { databases, addDatabase };
};