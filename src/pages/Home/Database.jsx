import "./Database.scss";
import { useState } from "react";
import { useEffect, useRef } from "react";
import { Menu } from "../../components/Menu/Menu";
import { API, CRUD_ROUTES } from "../../../constants/api_rest.js";
import { DotLottie } from "@lottiefiles/dotlottie-web";
import { motion, AnimatePresence } from "framer-motion";


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
  const [isCriando, setIsCriando] = useState(false);
  const [nomeDatabase, setNomeDatabase] = useState("");
  const [databases, setDatabases] = useState([]);
  const [excluindoId, setExcluindoId] = useState(null);
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState("");
  const [lottieInstance, setLottieInstance] = useState(null);

  const LoadingAnimation = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const dotLottie = new DotLottie({
      autoplay: true,
      loop: true,
      canvas: canvasRef.current,
      src: "../../assets/Animation/LoadingAnimation.lottie",
    });
    return () => dotLottie.destroy();
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "30px",
        height: "30px",
        display: loading ? "block" : "none",
      }}
    />
  );
};

  useEffect(() => {
    const carregarDatabase = async () => {
      const usuarioId = localStorage.getItem("usuarioId");
      if (!usuarioId) return;

      try {
        const { data } = await API.get(CRUD_ROUTES.LISTAR(usuarioId));
        setDatabases(data);
      } catch (err) {
        console.error("Falha ao listar:", err);
      }
    };
    carregarDatabase();
  }, []);

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

  const handleDelete = async (id) => {
    try {
      await API.delete(CRUD_ROUTES.EXCLUIR(id));
      setDatabases((prev) => prev.filter((db) => db.id !== id));
      setExcluindoId(null);
      setAviso("");
    } catch (err) {
      console.error(err);
      setAviso("Erro ao excluir a database.");
    }
  };

  const handleUpdate = async (id, novoNome) => {
    try {
      await API.put(CRUD_ROUTES.ATUALIZAR(id), { nome: novoNome });

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

  return (
    <div className="body">
      <Menu>
        <div className="container-principal">
          {/* 1. Modal de Exclusão (Sempre o primeiro a ser verificado) */}
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
                  <button onClick={() => setExcluindoId(null)}>Cancelar</button>
                  <button
                    disabled={confirmacaoExclusao !== excluindoId}
                    onClick={() => handleDelete(excluindoId)}
                  >
                    Excluir
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 2. Conteúdo Principal (Lista ou Criação) */}
          {!excluindoId && (
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
                      autoFocus
                    />
                    <div className="acoes">
                      <button
                        className="cancelar"
                        onClick={() => setIsCriando(false)}
                      >
                        <i className="fi fi-sr-cross-circle"></i>
                      </button>
                      <button
                        className="confirmar"
                        onClick={handleSalvar}
                        disabled={loading}
                      >
                        <LoadingAnimation isLoading={loading} />

                        {!loading && (
                          <i className="fi fi-sr-arrow-circle-right"></i>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                /* LISTA DE DATABASES + BOTÃO PLUS */
                <motion.div key="lista" className="lista-container">
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
                          onClick={() => setExcluindoId(db.id)}
                        >
                          <i className="fi fi-sr-trash-xmark"></i>
                        </button>
                        <button className="favoritar">
                          <i class="fi fi-sr-star"></i>
                        </button>
                        <button className="acessar">
                          <i className="fi fi-sr-server-key"></i>
                        </button>
                        <button className="link-convite">
                          <i className="fi fi-sr-user-link"></i>
                        </button>
                      </div>
                    </div>
                  ))}

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
