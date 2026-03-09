import "./Menu.scss"
import { useState } from "react";

export function Menu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav>
      <div className="menu-superior">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <i

            key={isMenuOpen ? "close" : "open"}
            className={`${isMenuOpen ? "fi fi-sr-cross" : "fi fi-sr-menu-burger"} icon-animate`}
          ></i>
        </button>
      </div>

      <div className={`menu ${isMenuOpen ? "open" : ""}`}>
        <ul>
          <li>
            <i className="fi fi-sr-coins"></i>
            <a href="#database">Database</a>
          </li>
          <li>
            <i className="fi fi-sr-clock"></i>
            <a href="#recente">Recente</a>
          </li>
          <li>
            <i className="fi fi-sr-star"></i>
            <a href="#favoritos">Favoritos</a>
          </li>
          <li>
            <i className="fi fi-sr-document"></i>
            <a href="#documentos">Documentos</a>
          </li>
          <li>
            <i className="fi fi-sr-settings"></i>
            <a href="#configuracoes">Configurações</a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Menu;