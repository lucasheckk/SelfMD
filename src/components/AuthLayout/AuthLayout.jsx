import { useEffect } from "react";
import "./AuthLayout.scss";

class Particle {
  constructor(x, y, directionX, directionY, size, ctx, canvas) {
    this.x = x;
    this.y = y;
    this.directionX = directionX;
    this.directionY = directionY;
    this.size = size;
    this.ctx = ctx;
    this.canvas = canvas;
    this.density = Math.random() * 30 + 1; // Para movimentos variados
  }
  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
    this.ctx.fillStyle = "#8E9EAB";
    this.ctx.fill();
  }
  update(mouse) {
    // Movimento básico
    this.x += this.directionX;
    this.y += this.directionY;

    // Rebate nas bordas
    if (this.x > this.canvas.width || this.x < 0) this.directionX *= -1;
    if (this.y > this.canvas.height || this.y < 0) this.directionY *= -1;

    // Interação suave com o mouse (Repulsão)
    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;
    let distanceSq = dx * dx + dy * dy; // Distância ao quadrado (mais rápido)
    let forceDirectionX = dx / Math.sqrt(distanceSq || 1);
    let forceDirectionY = dy / Math.sqrt(distanceSq || 1);

    // Distância máxima de interação (ex: 100px)
    let maxDistance = mouse.radius;
    let force = (maxDistance - Math.sqrt(distanceSq)) / maxDistance;

    if (distanceSq < mouse.radius * mouse.radius) {
      this.x -= forceDirectionX * force * 5; // O "5" controla a força do empurrão
      this.y -= forceDirectionY * force * 5;
    }

    this.draw();
  }
}

export function AuthLayout({
  children,
  hideRightSide = false,
  overlayContent = null,
}) {
  useEffect(() => {
    const signUpButton = document.getElementById("signUp");
    const signInButton = document.getElementById("signIn");
    const mainContainer = document.getElementById("container");

    const handleSignUp = () =>
      mainContainer.classList.add("right-panel-active");
    const handleSignIn = () =>
      mainContainer.classList.remove("right-panel-active");

    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");

    let particlesArray;
    let animationId;

    // Objeto do mouse agora será atualizado
    let mouse = {
      x: null,
      y: null,
      radius: (window.innerHeight / 80) * (window.innerWidth / 80),
    };

    const handleMouseMove = (event) => {
      mouse.x = event.x;
      mouse.y = event.y;
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      mouse.radius = (canvas.height / 80) * (canvas.width / 80);
      init(); // Reinicia as partículas para preencher o novo tamanho
    };

    // Configuração inicial do canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const init = () => {
      particlesArray = [];
      let numberOfParticles = (canvas.height * canvas.width) / 9000;

      const speedFactor = 0.4;

      for (let i = 0; i < numberOfParticles * 2; i++) {
        let size = Math.random() * 3 + 1;
        particlesArray.push(
          new Particle(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            (Math.random() * 2 - 1) * speedFactor, // Ajuste aqui
            (Math.random() * 2 - 1) * speedFactor, // Ajuste aqui
            size,
            ctx,
            canvas,
          ),
        );
      }
    };

    const connect = () => {
      let opacityValue = 1;
      const maxDistance = 150; // Distância máxima para desenhar a linha
      const maxDistanceSq = maxDistance * maxDistance;

      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          let dx = particlesArray[a].x - particlesArray[b].x;
          let dy = particlesArray[a].y - particlesArray[b].y;
          let distSq = dx * dx + dy * dy;

          if (distSq < maxDistanceSq) {
            // Opacidade baseada na distância (mais perto = mais forte)
            opacityValue = 1 - Math.sqrt(distSq) / maxDistance;
            ctx.strokeStyle = `rgba(142, 158, 171, ${opacityValue})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesArray.forEach((p) => p.update(mouse));
      connect();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);
    signUpButton?.addEventListener("click", handleSignUp);
    signInButton?.addEventListener("click", handleSignIn);

    init();
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      signUpButton?.removeEventListener("click", handleSignUp);
      signInButton?.removeEventListener("click", handleSignIn);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <>
      <div className="login-page-wrapper">
        <div className="container" id="container">
          {children}

          <div className="overlay-container">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <h1 className="titulo">Seja bem vindo</h1>
                <p className="texto">
                  Caso já possua uma conta, clique no botão abaixe e faça o
                  login.
                </p>
                <button className="ghost" id="signIn">
                  Login
                </button>
              </div>

              <div className="overlay-panel overlay-right">
                {overlayContent
                  ? overlayContent
                  : !hideRightSide && (
                      <>
                        <h1 className="titulo">Seja bem vindo</h1>
                        <p className="texto">
                          Faça o login em sua conta, caso não possua clique no
                          botão abaixo para criar.
                        </p>
                        <button className="ghost" id="signUp">
                          Criar
                        </button>
                      </>
                    )}
              </div>
            </div>
          </div>
        </div>
        <canvas id="canvas1"></canvas>
      </div>
    </>
  );
}

export default AuthLayout;
