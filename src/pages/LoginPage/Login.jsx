import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { API, AUTH_ROUTES } from "../../../constants/api_rest.js";
import "./Login.scss";
import { AuthLayout } from "../../components/AuthLayout/AuthLayout";
import { LoadingAnimation } from "../../components/Animation/LoadingAnimation.jsx";

export function Login() {
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    try {
      const response = await API.post(AUTH_ROUTES.LOGIN, loginData);
      const { mensagem, token, usuarioId } = response.data;

      if (token && token.length > 50) {
        setTimeout(() => {
          localStorage.setItem("token", token);
          localStorage.setItem("usuarioId", usuarioId);
          navigate("/database");
        }, 5000);
      } else {
        setIsLoading(false);
        alert(mensagem || "Falha na autenticação!");
      }
    } catch (error) {
      setIsLoading(false);
      const msg = error.response?.data?.mensagem || "Erro de conexão";
      alert("Falha no login: " + msg);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await API.post(AUTH_ROUTES.REGISTER, signUpData);
      console.log("Cadastro com sucesso:", response.data);

      setTimeout(() => {
        navigate("/database");
      }, 5000);
    } catch (error) {
      setIsLoading(false);
      console.error("Erro no cadastro:", error.response?.data);
      alert(
        "Falha no cadastro: " +
          (error.response?.data?.message || "Erro desconhecido"),
      );
    }
  };

  return (
    <>
      {isLoading && <LoadingAnimation />}
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
    </>
  );
}
