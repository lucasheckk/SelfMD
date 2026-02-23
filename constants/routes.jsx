import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from '../src/App';
import { Login } from '../src/Pages/Login/Login';
import { Logon } from '../src/Pages/Logon/Logon';
import { Home } from '../src/Pages/Home/Home';

export function RoutesConfig() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logon" element={<Logon />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}