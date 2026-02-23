import { useNavigate } from 'react-router-dom';

export function Logon() {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Cadastro</h1>
        <form className="auth-form">
          <input type="text" placeholder="Nome Completo" required />
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Senha" required />
          <input type="password" placeholder="Confirmar Senha" required />
          <button type="submit">Cadastrar</button>
        </form>
        <p>
          Já tem conta? 
          <button onClick={() => navigate('/login')}>
            Faça login
          </button>
        </p>
        <button onClick={() => navigate('/')}>
          Voltar
        </button>
      </div>
    </div>
  );
}
