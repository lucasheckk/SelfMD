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
  }
  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
    this.ctx.fillStyle = "#8E9EAB";
    this.ctx.fill();
  }
  update(mouse) {
    if (this.x > this.canvas.width || this.x < 0) this.directionX *= -1;
    if (this.y > this.canvas.height || this.y < 0) this.directionY *= -1;

    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < mouse.radius + this.size) {
      if (mouse.x < this.x && this.x < this.canvas.width - this.size * 10)
        this.x += 3;
      if (mouse.x > this.x && this.x > this.size * 10) this.x -= 3;
    }
    this.x += this.directionX;
    this.y += this.directionY;
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

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particlesArray;
    let mouse = {
      x: null,
      y: null,
      radius: (canvas.height / 80) * (canvas.width / 80),
    };
    let animationId;

    const init = () => {
      particlesArray = [];
      let numberOfParticles = (canvas.height * canvas.width) / 9000;
      for (let i = 0; i < numberOfParticles * 2; i++) {
        let size = Math.random() * 3 + 1;
        particlesArray.push(
          new Particle(
            Math.random() * innerWidth,
            Math.random() * innerHeight,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            size,
            ctx,
            canvas,
          ),
        );
      }
    };

    const connect = () => {
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          let dx = particlesArray[a].x - particlesArray[b].x;
          let dy = particlesArray[a].y - particlesArray[b].y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < (canvas.width / 7) * (canvas.height / 7)) {
            let opacityValue = 1 - distance / 150;
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

    init();
    animate();

    signUpButton?.addEventListener("click", handleSignUp);
    signInButton?.addEventListener("click", handleSignIn);

    return () => {
      signUpButton?.removeEventListener("click", handleSignUp);
      signInButton?.removeEventListener("click", handleSignIn);
      window.removeEventListener("resize", handleResize);
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
                <p className="texto">Caso já possua uma conta, clique no botão abaixe e faça o login.</p>
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
                        <p className="texto">Faça o login em sua conta, caso não possua clique no botão abaixo para criar.</p>
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
