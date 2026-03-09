import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from '../src/App';
import { Login } from '../src/pages/LoginPage/Login';
import { Home } from '../src/pages/Home/Home';
import { Remind } from '../src/pages/Remind/Remind';

export function RoutesConfig() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/remind" element={<Remind />} />
      </Routes>
    </BrowserRouter>
  );
}