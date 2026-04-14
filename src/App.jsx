import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/Landing/LandingPage.jsx';
import { Login } from './pages/Login/Login.jsx'; 
import { Database } from './pages/Database/Database';
import { System } from './pages/System/System.jsx';
import { Pricing } from './pages/Pricing/Pricing.jsx';
import "./styles/App.scss";

function App() {
  return (
    <Router>
      <Routes>
        {/* Quando a URL for "/", mostra a Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Quando a URL for "/login", mostra o Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Quando a URL for "/database", mostra as Databases */}
        <Route path="/database" element={<Database />} />

        {/* Quando a URL for "/system", mostra o Sistema */}
        <Route path="/system" element={<System />} />

        <Route path='/upgrade' element={<Pricing />} />
      </Routes>
    </Router>
  );
}

export default App;