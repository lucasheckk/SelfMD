// src/pages/LandingPage.jsx
import "./LandingPage.scss"; 
import ScrollFloat from "../../ReactBitsCodes/ScrollFloat/ScrollFloat.jsx";
import SplitText from "../../ReactBitsCodes/SplitText/SplitText.jsx";
import Lenis from "@studio-freight/lenis";
import { useEffect } from "react";
import { Link } from "react-router-dom";

function LandingPage() {
  // Nome alterado aqui
  useEffect(() => {
    const lenis = new Lenis();
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, []);

  const handleAnimationComplete = () => {
    console.log("Done!");
  };

  return (
    <main className="landing-page-container">
      {/* ─── HEADER / HERO SECTION ─── */}
      <section className="hero-section">
        <div className="hero-content">
          <SplitText
            text="Bem-vindo ao Self MD"
            className="hero-title"
            delay={30}
            duration={1}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={1}
            onLetterAnimationComplete={handleAnimationComplete}
            tag="h1"
          />
          <p className="hero-subtitle">
            O poder de um banco de dados MySQL físico, sem a complexidade de
            escrever uma única linha de código SQL.
          </p>
          <Link
            to="/login"
            className="btn-primario"
            aria-label="Ir para a tela de login"
          >
            Começar a Criar
          </Link>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section className="features-section">
        <h2>Por que usar o Self MD?</h2>
        <div className="features-grid">
          <article className="feature-card">
            <i className="fi fi-rr-table-pivot feature-icon" />
            <h3>Tabelas Dinâmicas</h3>
            <p>
              Crie e gerencie bancos, tabelas e colunas com uma interface visual
              intuitiva. O CRUD completo na ponta do mouse.
            </p>
          </article>

          <article className="feature-card">
            <i className="fi fi-rr-database feature-icon" />
            <h3>MySQL Físico Real</h3>
            <p>
              Não é apenas uma abstração visual. Tudo o que você configura gera
              estruturas reais e seguras no banco de dados.
            </p>
          </article>

          <article className="feature-card">
            <i className="fi fi-rr-magic-wand feature-icon" />
            <h3>Triggers & Procedures</h3>
            <p>
              Automatize lógicas de negócio complexas. Escolha a automação no
              front-end e nós criamos o código por trás das cortinas.
            </p>
          </article>
        </div>
      </section>

      {/* ─── SHOWCASE SECTION ─── */}
      <section className="showcase-section">
        <div className="showcase-header">
          <ScrollFloat
            animationDuration={1}
            ease="back.inOut(2)"
            scrollStart="center bottom+=50%"
            scrollEnd="center center"
            stagger={0.03}
          >
            Poderoso e Simples.
          </ScrollFloat>
        </div>

        {/* Simulação da UI do sistema para o usuário ter um "gostinho" */}
        <div className="mockup-window">
          <div className="mockup-header">
            <span className="dot dot-red"></span>
            <span className="dot dot-yellow"></span>
            <span className="dot dot-green"></span>
          </div>
          <div className="mockup-body">
            <div className="mockup-sidebar"></div>
            <div className="mockup-content">
              <div className="mockup-title">
                Inserir registro na Tabela: Clientes
              </div>
              <div className="mockup-fields">
                <div className="mockup-input">
                  NomeProduto <br />
                  <small>texto</small>
                </div>
                <div className="mockup-input">
                  Quantidade <br />
                  <small>numero_int</small>
                </div>
              </div>
              <div className="mockup-btn">Inserir Registro</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA & FOOTER ─── */}
      <section className="cta-section">
        <h2>Pronto para organizar seus dados?</h2>
        <Link to="/login" className="btn-primario btn-grande">
          Acessar o Self MD
        </Link>
      </section>

      <footer className="landing-footer">
        <p>
          &copy; {new Date().getFullYear()} Self MD. Desenvolvido por{" "}
          <strong>Lucas Felipe Heck</strong>. Todos os direitos reservados.
        </p>
      </footer>
    </main>
  );
}

export default LandingPage;
