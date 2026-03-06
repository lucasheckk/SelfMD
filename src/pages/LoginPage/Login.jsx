import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
import { API, AUTH_ROUTES } from "../../../constants/api.js";
import "./Login.scss";

class Particle {
  constructor(x, y, directionX, directionY, size, ctx, canvas) {
    this.x = x; this.y = y;
    this.directionX = directionX; this.directionY = directionY;
    this.size = size; this.ctx = ctx; this.canvas = canvas;
  }
  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
    this.ctx.fillStyle = '#8E9EAB';
    this.ctx.fill();
  }
  update(mouse) {
    if (this.x > this.canvas.width || this.x < 0) this.directionX *= -1;
    if (this.y > this.canvas.height || this.y < 0) this.directionY *= -1;
    
    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < mouse.radius + this.size) {
      if (mouse.x < this.x && this.x < this.canvas.width - this.size * 10) this.x += 3;
      if (mouse.x > this.x && this.x > this.size * 10) this.x -= 3;
    }
    this.x += this.directionX;
    this.y += this.directionY;
    this.draw();
  }
}

export function Login() {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({ name: "", email: "", password: "" });

  const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
  const handleSignUpChange = (e) => setSignUpData({ ...signUpData, [e.target.name]: e.target.value });
  
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post(AUTH_ROUTES.LOGIN, loginData);
      console.log("Login com sucesso:", response.data);
      // Salve o token se necessário: localStorage.setItem("token", response.data.token);
      navigate("/home");
    } catch (error) {
      alert("Erro no login: " + (error.response?.data?.message || "Verifique seus dados"));
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

  useEffect(() => {
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const mainContainer = document.getElementById('container');

    const handleSignUp = () => mainContainer.classList.add("right-panel-active");
    const handleSignIn = () => mainContainer.classList.remove("right-panel-active");

    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    signUpButton.addEventListener('click', handleSignUp);
    signInButton.addEventListener('click', handleSignIn);
    window.addEventListener('resize', handleResize);
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let particlesArray;
    let mouse = {
        x: null,
        y: null,
        radius: (canvas.height / 80) * (canvas.width / 80)
    };
    let animationId; 

    const init = () => {
      particlesArray = [];
      let numberOfParticles = (canvas.height * canvas.width) / 9000;
      for (let i = 0; i < numberOfParticles * 2; i++) {
        let size = (Math.random() * 3) + 1;
        particlesArray.push(new Particle(Math.random()*innerWidth, Math.random()*innerHeight, (Math.random()*2)-1, (Math.random()*2)-1, size, ctx, canvas));
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
      particlesArray.forEach(p => p.update(mouse));
      connect();
    };
    
    init();
    animate();

    return () => {
      signUpButton.removeEventListener('click', handleSignUp);
      signInButton.removeEventListener('click', handleSignIn);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <>
      <div className="container" id="container">
        <div className="form-container sign-up-container">
          <form onSubmit={handleSignUpSubmit}>
            <h1>Crie sua conta</h1>
            <div className="social-container">
              <a href="#"><i className="fi fi-brands-google"></i></a>
              <a href="#"><i className="fi fi-brands-github"></i></a>
              <a href="#"><i className="fi fi-brands-apple"></i></a>
            </div>
            <input name="name" type="text" placeholder="Nome" onChange={handleSignUpChange} />
            <input name="email" type="email" placeholder="Email" onChange={handleSignUpChange} />
            <input name="password" type="password" placeholder="Senha" onChange={handleSignUpChange} />
            <button className="form-btn" type="submit">Criar</button>
          </form>
        </div>

        <div className="form-container sign-in-container">
          <form onSubmit={handleLoginSubmit}>
            <h1>Login</h1>
            <div className="social-container">
              <a href="#"><i className="fi fi-brands-google"></i></a>
              <a href="#"><i className="fi fi-brands-github"></i></a>
              <a href="#"><i className="fi fi-brands-apple"></i></a>
            </div>
            <span>ou use sua conta</span>
            <input name="email" type="email" placeholder="Email" onChange={handleLoginChange}/>
            <input name="password" type="password" placeholder="Senha" onChange={handleLoginChange}/>
            <a href="#">Esqueceu sua senha?</a>
            <button type="submit">Login</button>
          </form>
        </div>

        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1 className="white-text">Bem vindo de volta</h1>
              <p>Forneça seus dados para poder ter acesso aos nossos serviços.</p>
              <button className="ghost" id="signIn">Login</button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1 className="white-text">Seja bem vindo</h1>
              <p>Faça o login em sua conta, caso não possua clique no botão abaixo e crie uma.</p>
              <button className="ghost" id="signUp">Criar</button>
            </div>
          </div>
        </div>
      </div>

      <canvas id="canvas1"></canvas>
    </>
  );
}
