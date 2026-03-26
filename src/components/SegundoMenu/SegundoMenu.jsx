import React from "react";
import { useNavigate } from "react-router-dom";
import "./SegundoMenu.scss";

export function SegundoMenu() {
  const navigate = useNavigate();

  return (
    <header className="segundo-menu-layout">
      <div className="smenu-content">
        <div className="smenu-left">
          <button onClick={() => navigate("/database")}>
            <i className="fi fi-rr-arrow-left-from-line back"></i>
          </button>
          <button>
            <i className="fi fi-rr-dashboard"></i>
          </button>
          <button>
            <i className="fi fi-rr-user-robot"></i>
          </button>
        </div>
        <div className="smenu-center">
          <div className="smenu-search">
            <input className="search-bar" type="text" placeholder="Filtre por aqui..." />
          <button className="search-icon">
            <i className="fi fi-rr-search lupa"></i>
          </button>
          </div>
          <button>
            <i className="fi fi-rr-filter"></i>
          </button>
        </div>
        <div className="smenu-right">
          <button>
            <i className="fi fi-rr-bell"></i>
          </button>
          <i className="fi fi-sr-bell-notification-social-media"></i>
          <button>
            <i className="fi fi-rr-folder-link"></i>
          </button>
          <button>
            <i className="fi fi-rr-it-alt"></i>
          </button>
          <button>
            <i className="fi fi-rr-users"></i>
          </button>
        </div>
      </div>
    </header>
  );
}
