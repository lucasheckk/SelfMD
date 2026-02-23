import { useNavigate } from 'react-router-dom';

export function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Bem-vindo ao SelfMD</h1>
      <p>Esta é a página inicial após o login</p>
      <button onClick={() => navigate('/')}>Voltar</button>
    </div>
  );
}
