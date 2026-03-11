import "./Menu.scss";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Menu({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    if (isMenuOpen) {
      // Se está fechando, espera a animação de 0.3s (do CSS)
      setIsMenuOpen(false);
      setTimeout(() => setIsRendered(false), 300); 
    } else {
      // Se está abrindo, mostra o elemento e depois aplica a classe .open
      setIsRendered(true);
      setTimeout(() => setIsMenuOpen(true), 50); // Delay curto para o navegador reconhecer
    }
  };

  return (
    <nav>
      <div className="menu-superior">
        <button
          className="menu-toggle"
          onClick={toggleMenu}
        >
          <i
            key={isMenuOpen ? "close" : "open"}
            className={`${isMenuOpen ? "fi fi-sr-cross" : "fi fi-sr-menu-burger"} icon-animate`}
          ></i>
        </button>
        <div className="menu-direita">
          <button className="aaa">Convidar</button>
          <button className="upgrade-button">Fazer upgrade</button>
          <button className="notific">
            <i className="fi fi-sr-bell"></i>
          </button>
          <button className="user"></button>
        </div>
      </div>

      {isRendered && (
      <div className={`menu ${isMenuOpen ? "open" : ""}`}>
        <ul>
          <li>
            <a onClick={() => navigate('/home')}>
              <i className="fi fi-sr-coins"></i>Database
            </a>
          </li>
          <li>
            <a href="#recente">
              <i className="fi fi-sr-star"></i>Favoritos
            </a>
          </li>
          <li>
            <a href="#favoritos">
              <i class="fi fi-sr-user-headset"></i>Suporte
            </a>
          </li>
          <li>
            <a href="#favoritos">
              <i class="fi fi-sr-usd-circle"></i>Planos
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
      <main className="conteudo-principal">
        {children}
      </main>
    </nav>
  );
}

export default Menu;
