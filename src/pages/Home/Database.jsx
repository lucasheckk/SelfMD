import "./Database.scss";
import { useState } from "react";
import { useEffect } from "react";
import { Menu } from "../../components/Menu/Menu";
import { API, CRUD_ROUTES } from "../../../constants/api_rest.js";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingAnimation } from "../../components/Animation/LoadingAnimation.jsx";

const fadeOutVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

export function Database() {
  const [aviso, setAviso] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCriando, setIsCriando] = useState(false);
  const [nomeDatabase, setNomeDatabase] = useState("");
  const [databases, setDatabases] = useState([]);
  const [databaseParaExcluir, setDatabaseParaExcluir] = useState(null);
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState("");

  // Carrega a lista de databases ao iniciar o componente
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    const carregarDatabase = async () => {
      setIsLoading(true);
      try {
        const { data } = await API.get(CRUD_ROUTES.LISTAR);
        setDatabases(data);
      } catch (err) {
        console.error("Falha ao listar:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
            window.location.href = "/login";
        }
      }finally {
        setIsLoading(false); 
      }
    };
    carregarDatabase();
  }, []);

  // Envia os dados para criar uma nova database no servidor
  const handleSalvar = async () => {
    if (nomeDatabase.trim() === "") {
      setAviso("Preencha o nome da database!");
      return;
    }
    setLoading(true);
    try {
      const response = await API.post(CRUD_ROUTES.CRIAR, {
        nomeDatabase: nomeDatabase,
      });
      setDatabases((prev) => [...prev, response.data]);
      setIsCriando(false);
      setNomeDatabase("");
      setAviso("");
    } catch (err) {
      console.log(err);
      setAviso("Erro ao criar database.");
    } finally {
      setLoading(false);
    }
  };

  // Deleta a database
  const handleDelete = async (id) => {
    try {
      await API.delete(CRUD_ROUTES.EXCLUIR(id));
      setDatabases((prev) => prev.filter((db) => db.id !== id));
      setDatabaseParaExcluir(null);
      setConfirmacaoExclusao("");
      setAviso("");
    } catch (err) {
      console.error(err);
      setAviso("Erro ao excluir a database.");
    }
  };

  // Atualiza o nome da database
  const handleUpdate = async (id, novoNome) => {
    try {
      await API.put(CRUD_ROUTES.ATUALIZAR(id), { nomeDatabase: novoNome });

      setDatabases((prev) =>
        prev.map((db) =>
          db.id === id ? { ...db, nomeDatabase: novoNome } : db,
        ),
      );
      setAviso("");
    } catch (err) {
      console.error(err);
      setAviso("Erro ao atualizar a database.");
    }
  };

  const handleCancelarCriacao = () => {
    setIsCriando(false);
    setNomeDatabase("");
    setAviso("");
  };

  return (
    <div className="body">
      <Menu>
        <div className="container-principal">
          {isLoading ? (
             <LoadingAnimation /> 
          ) : (
            <>
          {/* 1. Modal de Exclusão (Sempre o primeiro a ser verificado) */}
          <AnimatePresence mode="wait">
            {isCriando ? (
            {databaseParaExcluir && (
              <motion.div
                key="modal-exclusao"
                className="modal-exclusao-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <h2>Excluir {databaseParaExcluir.nomeDatabase}?</h2>
                <input
                  type="text"
                  value={confirmacaoExclusao}
                  onChange={(e) => setConfirmacaoExclusao(e.target.value)}
                  placeholder="Digite o nome para confirmar"
                />
                <div className="acoes-exclusao">
                  <button onClick={() => setDatabaseParaExcluir(null)}>
                    <i class="fi fi-sr-trash-undo"></i>
                  </button>
                  <button
                    disabled={
                      confirmacaoExclusao !== databaseParaExcluir.nomeDatabase
                    }
                    onClick={() => handleDelete(databaseParaExcluir.id)}
                  >
                    <i className="fi fi-sr-trash-can-check confirmar-exclusao"></i>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 2. Conteúdo Principal (Lista ou Criação) */}
          {!databaseParaExcluir && (
            <AnimatePresence mode="wait">
              {isCriando ? (
                <motion.div key="form" className="criar-database">
                  <motion.div
                    className="card-criacao"
                    variants={fadeOutVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <h1 className="card-ttl">Nova Database</h1>
                    <input
                      className="input-nome"
                      type="text"
                      placeholder="Nome"
                      value={nomeDatabase}
                      onChange={(e) => setNomeDatabase(e.target.value)}
                    />
                    <div className="acoes">
                      <button
                        className="cancelar"
                        onClick={handleCancelarCriacao}
                      >
                        <i className="fi fi-sr-cross-circle"></i>
                      </button>
                      <button className="confirmar" onClick={handleSalvar}>
                        <i className="fi fi-sr-arrow-circle-right"></i>
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                // LISTA DE DATABASES
                <motion.div key="lista" className="lista-container">
                  {databases.length > 0 ? (
                  {databases?.map((db) => (
                    <div key={db.id} className="card-sucesso">
                      <div className="card-header">
                        <div className="titulo-wrapper">
                          <h2>{db.nomeDatabase}</h2>
                          <i
                            className="fi fi-sr-pencil atualizar"
                            onClick={() =>
                              handleUpdate(
                                db.id,
                                prompt("Novo nome:", db.nomeDatabase),
                              )
                            }
                          ></i>
                        </div>
                      </div>

                      <div className="botoes-container">
                        <button
                          className="excluir"
                          onClick={() => setDatabaseParaExcluir(db)}
                        >
                          <i className="fi fi-sr-trash-xmark"></i>
                        </button>
                        <button className="favoritar">
                          <i className="fi fi-sr-star"></i>
                        </button>
                        <button className="acessar">
                          <i className="fi fi-sr-server-key"></i>
                        </button>
                        <button className="link-convite">
                          <i className="fi fi-sr-user-link"></i>
                        </button>
                      </div>
                    </div>
                  
                  ) : ( 
                  <p>Nenhuma database encontrada.</p>)}
                  <div
                    className="criar-database-icone"
                    onClick={() => setIsCriando(true)}
                    style={{ cursor: "pointer" }}
                  >
                    <i className="fi fi-sr-layer-plus"></i>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </Menu>
    </div>
  );
}
