import { useNavigate } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Login</h1>
        <form className="auth-form">
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Senha" required />
          <button type="submit">Entrar</button>
        </form>
        <p>
          Não tem conta? 
          <button onClick={() => navigate('/logon')} >
            Cadastre-se
          </button>
        </p>
        <button onClick={() => navigate('/')}>
          Voltar
        </button>
      </div>
    </div>
  );
}
