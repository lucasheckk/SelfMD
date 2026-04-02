import "./Database.scss";
import { useState, useEffect, useCallback } from "react";
import { Menu } from "../../components/Menu/Menu";
import { useNavigate } from "react-router-dom";
import { API, DATABASE_CRUD_ROUTES } from "../../../constants/api_rest.js";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingAnimation } from "../../components/Animation/LoadingAnimation.jsx";
import { Notificacao } from "../../components/Notificacao/Notificacao.jsx";

const fadeOutVariants = {
  hidden: {
    opacity: 0,
    scale: 1,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  exit: {
    opacity: 0,
    scale: 1,
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

  // Lógica para definir o limite de acordo com o plano
  const planoBruto = localStorage.getItem("planoAtual") || "FREE";
  const planoUsuario = planoBruto.toUpperCase();

  const limites = {
    FREE: 1,
    PLUS: 2,
    ULTRA: 3,
  };

  const limiteDatabases = limites[planoUsuario] || 1;
  const isLimiteAtingido = databases.length >= limiteDatabases;

  // Estado para o seu novo componente de avisos
  const [notifications, setNotifications] = useState([]);

  const mostrarAviso = (type, title, message) => {
    const id = Date.now();
    setNotifications((prev) => [
      ...prev,
      { id, type, title, message, duration: 5000 },
    ]);
  };

  const fecharModais = () => {
    setDatabaseParaExcluir(null);
    setDatabaseParaConvidar(null);
    setIsCriando(false);
    setNomeDatabase("");
    setConfirmacaoExclusao("");
    setEmailConvite("");
  };

  const carregarDadosDaAPI = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await API.get(DATABASE_CRUD_ROUTES.LISTAR);
      const lista = response.data?.dados || [];
      setDatabases(Array.isArray(lista) ? lista : []);
    } catch (err) {
      console.error("Erro ao carregar:", err);
      mostrarAviso("error", "Erro", "Não foi possível carregar as databases.");
      setDatabases([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carrega a lista de databases ao iniciar
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    carregarDadosDaAPI();
  }, [navigate, carregarDadosDaAPI]);

  // Envia os dados para criar uma nova database no servidor
  const handleSalvar = async () => {
    if (nomeDatabase.trim() === "") {
      mostrarAviso("warning", "Atenção", "O nome não pode estar vazio!");
      return;
    }
    setLoading(true);
    try {
      await API.post(DATABASE_CRUD_ROUTES.CRIAR, { nomeDatabase });
      await carregarDadosDaAPI();
      mostrarAviso("success", "Criada!", "Database criada com sucesso.");
      fecharModais();
    } catch (err) {
      if (err.response?.status === 402) {
        mostrarAviso(
          "warning",
          "Limite Atingido",
          "Atualize para obter mais espaço.",
        );
      } else {
        mostrarAviso("error", "Erro", "Não foi possível salvar.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Deleta a database
  const handleDelete = async (id) => {
    try {
      await API.delete(DATABASE_CRUD_ROUTES.EXCLUIR(id));
      setDatabases((prev) => prev.filter((db) => db.id !== id));
      mostrarAviso("info", "Excluída", "A database foi excluída!");
      fecharModais();
    } catch {
      mostrarAviso("error", "Erro", "Houve um problema ao excluir.");
    }
  };

  // Atualiza o nome da database
  const handleUpdate = async (id, novoNome) => {
    if (!novoNome || novoNome.trim() === "") return;
    try {
      await API.put(DATABASE_CRUD_ROUTES.ATUALIZAR(id), {
        nomeDatabase: novoNome,
      });
      setDatabases((prev) =>
        prev.map((db) =>
          db.id === id ? { ...db, nomeDatabase: novoNome } : db,
        ),
      );
      mostrarAviso("success", "Atualizado", "Nome alterado com sucesso.");
    } catch {
      mostrarAviso("error", "Falha", "Erro ao tentar atualizar.");
    }
  };

  // Convida o usuario para a database
  const handleEnviarConvite = async () => {
    if (!emailConvite || !emailConvite.includes("@")) {
      mostrarAviso("warning", "Aviso", "Insira um e-mail válido!");
      return;
    }
    setLoading(true);
    try {
      // Simulação de chamada de API para convite
      mostrarAviso(
        "success",
        "Sucesso",
        "Convite enviado para " + emailConvite,
      );
      fecharModais();
    } catch {
      mostrarAviso("error", "Falha", "Erro ao enviar convite.");
    } finally {
      setLoading(false);
    }
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
                    className="modal-exclusao-container"
                    variants={fadeOutVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <h2>Convidar para {databaseParaConvidar.nomeDatabase}</h2>
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
                      <button>
                        <i class="fi fi-sr-user-gear"></i>
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
                              onClick={() => navigate("/system", 
                                { state: { dbId: db.id, dbNome: db.nomeDatabase }})}
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

                      {/* BOTÃO DE ADICIONAR DATABASE */}
                      <div
                        className={`criar-database-icone ${isLimiteAtingido ? "desabilitado" : ""}`}
                        onClick={() => {
                          if (!isLimiteAtingido) {
                            setIsCriando(true);
                          } else {
                            mostrarAviso(
                              "warning",
                              "Limite Atingido",
                              "Seu plano (${planoUsuario}) permite apenas ${limiteDatabases} database(s).",
                            );
                          }
                        }}
                        style={{
                          cursor: isLimiteAtingido ? "not-allowed" : "pointer",
                          opacity: isLimiteAtingido ? 0.5 : 1,
                        }}
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
