import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { API, AUTH_ROUTES } from "../../../constants/api_rest.js";
import "./Login.scss";
import { AuthLayout } from "../../components/AuthLayout/AuthLayout";

export function Login() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: "", senha: "" });
  const [signUpData, setSignUpData] = useState({
    email: "",
    senha: "",
  });

  const handleLoginChange = (e) =>
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  const handleSignUpChange = (e) =>
    setSignUpData({ ...signUpData, [e.target.name]: e.target.value });

  const handleLoginSubmit = async (e) => {
  e.preventDefault();
  console.log("Enviando dados:", loginData); // Veja se o JSON está saindo certo

  try {
    const response = await API.post(AUTH_ROUTES.LOGIN, loginData);
    console.log("Resposta da API:", response); // Veja o que o back-end respondeu
    
    // Se o login funcionar, o navigate será chamado
    navigate("/home"); 
  } catch (error) {
    console.error("Erro capturado:", error.response || error);
    alert("Erro: " + (error.response?.data?.message || "Erro de conexão"));
  }
};

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post(AUTH_ROUTES.REGISTER, signUpData);
      console.log("Cadastro com sucesso:", response.data);
      navigate("/home");
    } catch (error) {
      console.error("Erro no cadastro:", error.response?.data);
    }
  };

  return (
    <AuthLayout>
      <div className="form-container sign-up-container">
        <form className="form-login" onSubmit={handleSignUpSubmit}>
          <h1 className="crie-conta">Crie sua conta</h1>
          <div className="social-container">
            <a href="#">
              <i className="fi fi-brands-google"></i>
            </a>
            <a href="#">
              <i className="fi fi-brands-github"></i>
            </a>
            <a href="#">
              <i className="fi fi-brands-apple"></i>
            </a>
          </div>
          <div className="grupo-input">
            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleSignUpChange}
            />
            <input
              name="senha"
              type="password"
              placeholder="Senha"
              onChange={handleSignUpChange}
            />
          </div>
          <button className="form-btn" type="submit">
            Criar
          </button>
        </form>
      </div>

      <div className="form-container sign-in-container">
        <form className="form-cadastro" onSubmit={handleLoginSubmit}>
          <h1>Login</h1>
          <div className="social-container">
            <a href="#">
              <i className="fi fi-brands-google"></i>
            </a>
            <a href="#">
              <i className="fi fi-brands-github"></i>
            </a>
            <a href="#">
              <i className="fi fi-brands-apple"></i>
            </a>
          </div>
          <div className="grupo-input">
            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleLoginChange}
            />
            <input
              name="senha"
              type="password"
              placeholder="Senha"
              onChange={handleLoginChange}
            />
            <a className="remind" onClick={() => navigate("/remind")}>
              Esqueceu sua senha?
            </a>
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    </AuthLayout>
  );
}
