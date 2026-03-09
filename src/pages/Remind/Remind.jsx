import React from "react";
import { AuthLayout } from "../../components/AuthLayout/AuthLayout";
import "./Remind.scss";
import Logo from "../../../public/logo_baw_btr_reso.png"; 
export function Remind() {
  return (
    <AuthLayout
      hideRightSide={true}
      overlayContent={
        <div className="custom-overlay-image">
          <img src={Logo} alt="Logo preto e branco" style={{ height: "auto", width: "1000px", opacity: 0.2,  }} />
        </div>
      }
    >
      <div className="form-container sign-in-container">
        <form className="form-login">
          <h1 className="ttl">Recupere sua senha</h1>
          <p style={{ color: "#333", marginBottom: "20px" }}>
            Digite seu email para receber as instruções.
          </p>

          <div className="grupo-input">
            <input type="email" placeholder="Email" required />
          </div>

          <button className="btn-enviar" type="submit">
            Enviar
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
