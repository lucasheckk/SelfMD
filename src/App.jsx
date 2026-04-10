import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/Landing/LandingPage';
import Login from './pages/Login/Login'; 
import System from './pages/Database/Database'; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Quando a URL for "/", mostra a Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Quando a URL for "/login", mostra o Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Quando a URL for "/database", mostra o Sistema */}
        <Route path="/database" element={<System />} />
      </Routes>
    </Router>
  );
}

export default App;