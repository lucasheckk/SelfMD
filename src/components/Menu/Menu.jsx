import "./Menu.scss";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

export function Menu({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [isNotificacaoOpen, setIsNotificacaoOpen] = useState(false);
  const [isNotificacaoRendered, setIsNotificacaoRendered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const nomesAmigaveis = {
    "/database": "Minhas Databases",
    "/suporte": "Suporte",
    "/upgrade": "Planos",          // ← nome amigável adicionado
    "/docs": "Documentos",
    "/config": "Configurações",
  };

  const notific = [
    { id: 100, tipo: "limite", mensagem: "Seu consumo atingiu 90% do limite." },
    { id: 200, tipo: "upgrade", mensagem: "Novo plano Pro disponível!" },
    {
      id: 300,
      tipo: "convite",
      mensagem: "Você recebeu um convite para a database X.",
    },
    { id: 400, tipo: "acesso", mensagem: "Você perdeu acesso à database Y." },
  ];

  const tituloPagina =
    nomesAmigaveis[location.pathname] ||
    location.pathname.replace("/", "").charAt(0).toUpperCase() +
      location.pathname.slice(2);

  const toggleMenu = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
      setTimeout(() => setIsRendered(false), 300);
    } else {
      setIsRendered(true);
      setTimeout(() => setIsMenuOpen(true), 50);
    }
  };

  const toggleNotificacoes = () => {
    if (isNotificacaoOpen) {
      setIsNotificacaoOpen(false);
      setTimeout(() => setIsNotificacaoRendered(false), 300);
    } else {
      setIsNotificacaoRendered(true);
      setTimeout(() => setIsNotificacaoOpen(true), 50);
    }
  };

  return (
    <nav>
      <div className="menu-superior">
        <button className="menu-toggle" onClick={toggleMenu}>
          <i className="fi fi-sr-apps menu-icon"></i>
        </button>
        <div className="where-am-i">
          <p>{tituloPagina}</p>
        </div>
        <div className="menu-direita">
          <button
            className="upgrade-button"
            onClick={() => navigate("/upgrade")}
          >
            Fazer upgrade
          </button>
          <button className="notific" onClick={toggleNotificacoes}>
            <i className="fi fi-sr-bell"></i>
          </button>
          <button className="user">
            <i className="fi fi-sr-user"></i>
          </button>
        </div>
      </div>

      {isRendered && (
        <div className={`menu ${isMenuOpen ? "open" : ""}`}>
          <ul>
            <li>
              <a onClick={() => navigate("/home")}>
                <i className="fi fi-sr-coins"></i>Database
              </a>
            </li>
            <li>
              <a href="#suporte">
                <i className="fi fi-sr-user-headset"></i>Suporte
              </a>
            </li>
            <li>
              <a onClick={() => navigate("/upgrade")}>
                <i className="fi fi-sr-usd-circle"></i>Planos
              </a>
            </li>
            <li>
              <a href="#documentos">
                <i className="fi fi-sr-document"></i>Documentos
              </a>
            </li>
            <li>
              <a href="#configuracoes">
                <i className="fi fi-sr-settings"></i>Configurações
              </a>
            </li>
          </ul>
        </div>
      )}

      {isNotificacaoRendered && (
        <div className={`notificacoes ${isNotificacaoOpen ? "open" : ""}`}>
          <button
            className="fechar-aba"
            onClick={() => {
              setIsNotificacaoOpen(false);
              setTimeout(() => setIsNotificacaoRendered(false), 300);
            }}
          >
            <i className="fi fi-sr-x"></i>
          </button>

          <p className="notific-ttl">Notificações</p>

          <ul className="notific-lista">
            {/* NOTA: o map correto usa notific como array — mantive igual ao original */}
            <li key={notific[0].id} className={`notific-item ${notific[0].tipo}`}>
              <p>{notific[0].mensagem}</p>
            </li>
            <li>
              <p>Item 1</p>
            </li>
            <li>
              <p>Item 1</p>
            </li>
          </ul>
          <a href="">Marcar como lido</a>
        </div>
      )}

      <main className="conteudo-principal">{children}</main>
    </nav>
  );
}

export default Menu;