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
  const [excluindoId, setExcluindoId] = useState(null);
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState("");

  const handleSalvar = async () => {
    if (nomeDatabase.trim() === "") {
      setAviso("Preencha o nome da database!");
      return;
    }

    setLoading(true);
    try {
      const response = await API.post(CRUD_ROUTES.CRIAR, {
        nome: nomeDatabase,
      });
      if (response.status === 201 || response.status === 200) {
        setDatabaseSalva(nomeDatabase);
        setIsCriando(false);
        setAviso("");
      }
    } catch (err) {
      console.error(err);
      setAviso(
        err.response?.status === 403
          ? "Sessão expirada. Faça login novamente."
          : "Erro ao conectar com o servidor.",
      );
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
              {excluindoId && (
                <motion.div
                  key="modal-exclusao"
                  className="modal-exclusao-container"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <h2>Excluir {excluindoId}?</h2>
                  <input
                    type="text"
                    value={confirmacaoExclusao}
                    onChange={(e) => setConfirmacaoExclusao(e.target.value)}
                    placeholder="Digite o nome para confirmar"
                  />
                  <div className="acoes-exclusao">
                    <button onClick={() => setExcluindoId(null)}>
                      Cancelar
                    </button>
                    <button disabled={confirmacaoExclusao !== excluindoId}>
                      Excluir
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {!excluindoId && (
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
                      <div className="botoes-container">
                        <button className="excluir">
                          <i className="fi fi-sr-trash-xmark"></i>
                        </button>
                        <button className="acessar">
                          <i className="fi fi-sr-server-key"></i>
                        </button>
                        <button className="link-convite">
                          <i className="fi fi-sr-user-link"></i>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : !isCriando ? (
                  <motion.div
                    key="botao-plus"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsCriando(true)}
                    style={{ cursor: "pointer" }}
                    className="criar-database-icone"
                  >
                    <div>
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
                      <AnimatePresence mode="wait">
                        {aviso && (
                          <motion.p
                            key="mensagem-erro"
                            className="mensagem-erro"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                          >
                            {aviso}
                          </motion.p>
                        )}
                      </AnimatePresence>

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
            )}
          </div>
        </div>
      </Menu>
    </div>
  );
}
