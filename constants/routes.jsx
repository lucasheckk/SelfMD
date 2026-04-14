import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "../src/App";
import { Login } from "../src/pages/Login/Login";
import { Database } from "../src/pages/Database/Database";
import { Remind } from "../src/pages/Remind/Remind";
import { PrivateRoute } from "../constants/private_routes";
import { System } from "../src/pages/System/System";
import { Pricing } from "../src/pages/Pricing/Pricing";

export function RoutesConfig() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Rotas comuns */}
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/remind" element={<Remind />} />
        <Route path="/upgrade" element={<Menu><Pricing /></Menu>} />

        {/* Rotas protegidas */}
        <Route
          path="/database"
          element={
            <PrivateRoute>
              <Database />
            </PrivateRoute>
          }
        />
        <Route
          path="/system"
          element={
            <PrivateRoute>
              <System />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
