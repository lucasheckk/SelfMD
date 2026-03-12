import "./Database.scss";
import { useState } from "react";
import { Menu } from "../../components/Menu/Menu";
import { API, CRUD_ROUTES } from "../../../constants/api_rest.js";
import { motion, AnimatePresence } from "framer-motion";

export function Home() {
  const [aviso, setAviso] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCriando, setIsCriando] = useState(false);
  const [nomeDatabase, setNomeDatabase] = useState("");
  const [databaseSalva, setDatabaseSalva] = useState(null);

  const handleSalvar = async () => {
    if (nomeDatabase.trim() === "") {
      setAviso("Preencha o nome da database!");
      return;
    }

    setLoading(true);
    try {
      const response = await API.post(CRUD_ROUTES.DATABASE, {
        nome: nomeDatabase,
      });
      if (response.status === 201 || response.status === 200) {
        setDatabaseSalva(nomeDatabase);
        setIsCriando(false);
        setAviso("");
      }
    } catch (err) {
      console.error(err);
      setAviso("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="body">
      <Menu>
        <div className="container-principal">
          <div className="criar-database">
            <AnimatePresence mode="wait">
              {databaseSalva ? (
                <motion.div
                  key="sucesso"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="card-sucesso">
                    <h2>{databaseSalva}</h2>
                    <button>Acessar</button>
                  </div>
                </motion.div>
              ) : !isCriando ? (
                <motion.div
                  key="botao-plus"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsCriando(true)}
                >
                  <div
                    onClick={() => setIsCriando(true)}
                    style={{ cursor: "pointer" }}
                  >
                    <i className="fi fi-sr-layer-plus"></i>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="card-criacao"
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.9 }} 
                  transition={{ duration: 0.4 }} 
                >
                  <div className="card-criacao">
                    <h1 className="card-ttl">Nova Database</h1>
                    <input
                      className="input-nome"
                      type="text"
                      placeholder="Nome"
                      value={nomeDatabase}
                      onChange={(e) => setNomeDatabase(e.target.value)}
                      autoFocus
                    />
                    <p className={`mensagem-erro ${aviso ? "visivel" : ""}`}>
                      {aviso || "\u00A0"}
                    </p>
                    <div className="acoes">
                      <button
                        className="cancelar"
                        onClick={() => {
                          setIsCriando(false);
                          setNomeDatabase("");
                          setAviso("");
                        }}
                      >
                        <i className="fi fi-sr-cross-circle"></i>
                      </button>
                      <button
                        className="confirmar"
                        onClick={handleSalvar}
                        disabled={loading}
                      >
                        {loading ? (
                          "..."
                        ) : (
                          <i className="fi fi-sr-arrow-circle-right"></i>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Menu>
    </div>
  );
}
