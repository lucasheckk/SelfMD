import { Navigate } from 'react-router-dom';

export function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");

  // Se houver token, renderiza o componente (Database), caso contrário, redireciona
  return token ? children : <Navigate to="/login" />;
}