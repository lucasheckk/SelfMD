import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "../src/App";
import { Login } from "../src/pages/LoginPage/Login";
import { Database } from "../src/pages/Home/Database";
import { Remind } from "../src/pages/Remind/Remind";
import { PrivateRoute } from "../constants/private_routes";
import { System } from "../src/pages/System/System";

export function RoutesConfig() {
  return (
    <BrowserRouter>
      <Routes>

        // Rotas comuns
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/remind" element={<Remind />} />

        // Rotas protegidas
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
