import "./Database.scss";
import { useState, useEffect } from "react";
import { Menu } from "../../components/Menu/Menu";
import { useNavigate } from "react-router-dom";
import { API, DATABASE_CRUD_ROUTES } from "../../../constants/api_rest.js";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingAnimation } from "../../components/Animation/LoadingAnimation.jsx";
import { Notificacao } from "../../components/Notificacao/Notificacao.jsx";

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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de Controle de Interface
  const [isCriando, setIsCriando] = useState(false);
  const [databaseParaExcluir, setDatabaseParaExcluir] = useState(null);
  const [databaseParaConvidar, setDatabaseParaConvidar] = useState(null);

  // Estados de Dados
  const [nomeDatabase, setNomeDatabase] = useState("");
  const [databases, setDatabases] = useState([]);
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState("");
  const [emailConvite, setEmailConvite] = useState("");

  // Estado para o seu novo componente de avisos
  const [notifications, setNotifications] = useState([]);

  // Função auxiliar para chamar sua futura Notificação
  const mostrarAviso = (type, title, message) => {
    const id = Date.now();
    setNotifications((prev) => [
      ...prev,
      { id, type, title, message, duration: 5000 },
    ]);
  };

  // Carrega a lista de databases ao iniciar
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    const carregarDatabase = async () => {
      setIsLoading(true);
      try {
        const response = await API.get(DATABASE_CRUD_ROUTES.LISTAR);

        const dados = response.data?.data || [];

        setDatabases(Array.isArray(dados) ? dados : []);
      } catch (err) {
        console.error("Falha ao listar:", err);

        setDatabases([]);

        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } finally {
        setIsLoading(false);
      }
    };
    carregarDatabase();
  }, []);

  // Envia os dados para criar uma nova database no servidor
  const handleSalvar = async () => {
    if (nomeDatabase.trim() === "") {
      mostrarAviso(
        "warning",
        "Atenção",
        "O nome não pode estar vazio!",
      );
      return;
    }
    setLoading(true);
    try {
      const response = await API.post(DATABASE_CRUD_ROUTES.CRIAR, {
        nomeDatabase: nomeDatabase,
      });

      const novaDb = response.data.data;

      setDatabases((prev) => [...(Array.isArray(prev) ? prev : []), novaDb]);

      mostrarAviso("success", "Criada!", "Database criada com sucesso.");
      fecharModais();
    } catch {
      mostrarAviso(
        "error",
        "Erro ao Criar",
        "Não foi possível salvar.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Deleta a database
  const handleDelete = async (id) => {
    try {
      await API.delete(DATABASE_CRUD_ROUTES.EXCLUIR(id));
      setDatabases((prev) => prev.filter((db) => db.id !== id));
      mostrarAviso(
        "info",
        "Excluída",
        "A database foi excluída!",
      );
      fecharModais();
    } catch {
      mostrarAviso("error", "Erro", "Houve um problema ao excluir.");
    }
  };

  // Atualiza o nome da database
  const handleUpdate = async (id, novoNome) => {
    if (!novoNome) return;
    try {
      await API.put(DATABASE_CRUD_ROUTES.ATUALIZAR(id), {
        nomeDatabase: novoNome,
      });
      setDatabases((prev) =>
        prev.map((db) =>
          db.id === id ? { ...db, nomeDatabase: novoNome } : db,
        ),
      );
      mostrarAviso("success", "Atualizado", "O nome foi alterado.");
    } catch {
      mostrarAviso("error", "Falha", "Erro ao tentar atualizar!");
    }
  };

  // Convida o usuario para a database
  const handleEnviarConvite = () => {
    if (!emailConvite || !emailConvite.includes("@")) {
      mostrarAviso("warning", "Aviso", "Insira um e-mail válido!");
      return;
    }
    setLoading(true);
    try {
      // Lógica de API aqui...
      mostrarAviso("success", "Sucesso", "Convite enviado!");
      fecharModais();
    } catch {
      mostrarAviso("error", "Falha", "Não foi possível enviar o convite.");
    } finally {
      setLoading(false);
    }
  };

  const copiarLink = () => {
    const link = `${window.location.origin}/convite/${databaseParaConvidar.id}`;
    navigator.clipboard.writeText(link);
    mostrarAviso("info", "Info", "Link copiado!");
  };

  const fecharModais = () => {
    setDatabaseParaExcluir(null);
    setDatabaseParaConvidar(null);
    setIsCriando(false);
    setNomeDatabase("");
    setConfirmacaoExclusao("");
    setEmailConvite("");
  };

  return (
    <div className="body">
      <AnimatePresence mode="wait">
      <Notificacao
        notifications={notifications}
        setNotifications={setNotifications}
      />
      </AnimatePresence>
      <Menu>
        <div className="container-principal">
          {isLoading ? (
            <LoadingAnimation />
          ) : (
            <>
              <AnimatePresence mode="wait">
                {/* MODAL DE EXCLUSÃO */}
                {databaseParaExcluir && (
                  <motion.div
                    key="modal-exclusao"
                    className="modal-exclusao-container"
                    variants={fadeOutVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <h2>Excluir {databaseParaExcluir.nomeDatabase}?</h2>
                    <p>Confirme digitando o nome exato da database:</p>
                    <input
                      type="text"
                      value={confirmacaoExclusao}
                      onChange={(e) => setConfirmacaoExclusao(e.target.value)}
                      placeholder="Digite o nome para confirmar"
                    />
                    <div className="acoes-exclusao">
                      <button onClick={fecharModais}>
                        <i className="fi fi-sr-trash-undo"></i>
                      </button>
                      <button
                        disabled={
                          confirmacaoExclusao !==
                          databaseParaExcluir.nomeDatabase
                        }
                        onClick={() => handleDelete(databaseParaExcluir.id)}
                      >
                        <i className="fi fi-sr-trash-can-check confirmar-exclusao"></i>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* MODAL DE CONVITE */}
                {databaseParaConvidar && (
                  <motion.div
                    key="modal-convite"
                    className="modal-exclusao-container" // Usando mesma classe para manter layout
                    variants={fadeOutVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <h2>Convidar para {databaseParaConvidar.nomeDatabase}</h2>

                    <div
                      className="link-copy-section"
                      onClick={copiarLink}
                      style={{ cursor: "pointer", marginBottom: "10px" }}
                    >
                      <small>
                        Clique para copiar o link de convite{" "}
                        <i className="fi fi-sr-copy"></i>
                      </small>
                    </div>
                    <input
                      type="email"
                      value={emailConvite}
                      onChange={(e) => setEmailConvite(e.target.value)}
                      placeholder="E-mail do usuário"
                    />
                    <div className="acoes-exclusao">
                      <button onClick={fecharModais}>
                        <i className="fi fi-sr-cross-circle"></i>
                      </button>
                      <button onClick={handleEnviarConvite}>
                        <i className="fi fi-sr-paper-plane"></i>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* TELA DE CRIAÇÃO */}
                {isCriando && !databaseParaExcluir && !databaseParaConvidar && (
                  <motion.div
                    key="form-criacao"
                    className="criar-database"
                    variants={fadeOutVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="card-criacao">
                      <h1 className="card-ttl">Nova Database</h1>
                      <input
                        className="input-nome"
                        type="text"
                        placeholder="Nome da Database"
                        value={nomeDatabase}
                        onChange={(e) => setNomeDatabase(e.target.value)}
                      />
                      <div className="acoes">
                        <button className="cancelar" onClick={fecharModais}>
                          <i className="fi fi-sr-cross-circle"></i>
                        </button>
                        <button
                          className="confirmar"
                          onClick={handleSalvar}
                          disabled={loading}
                        >
                          <i className="fi fi-sr-arrow-circle-right"></i>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* LISTA DE DATABASES */}
                {!isCriando &&
                  !databaseParaExcluir &&
                  !databaseParaConvidar && (
                    <motion.div
                      key="lista"
                      className="lista-container"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {databases.map((db) => (
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
                            <button
                              className="acessar"
                              onClick={() => navigate("/minha-database")}
                            >
                              <i className="fi fi-sr-server-key"></i>
                            </button>
                            <button
                              className="link-convite"
                              onClick={() => setDatabaseParaConvidar(db)}
                            >
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
            </>
          )}
        </div>
      </Menu>
    </div>
  );
}
