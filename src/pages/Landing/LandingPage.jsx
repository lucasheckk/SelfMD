import "./LandingPage.scss";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import SplitText from "../../ReactBitsCodes/SplitText/SplitText.jsx";
import MagicRings from "../../ReactBitsCodes/MagicRings/MagicRings.jsx";
import StarBorder from "../../ReactBitsCodes/StarBorder/StarBorder.jsx";
import BorderGlow from "../../ReactBitsCodes/BorderGlow/BorderGlow.jsx";
import CardSwap, { Card } from "../../ReactBitsCodes/CardSwap/CardSwap.jsx";

// ═══════════════════════════════════════════════════════════════════════════
// ─── Dados fictícios para a Demo da tabela ao vivo
// ═══════════════════════════════════════════════════════════════════════════
const DEMO_COLUNAS = ["id", "nome", "email", "status", "criado_em"];
const DEMO_ROWS_HERO = [
  {
    id: 1,
    nome: "Ana Souza",
    email: "ana@empresa.com",
    status: "ativo",
    criado_em: "2025-01-10",
  },
  {
    id: 2,
    nome: "Carlos Lima",
    email: "carlos@empresa.com",
    status: "inativo",
    criado_em: "2025-01-12",
  },
  {
    id: 3,
    nome: "Beatriz Reis",
    email: "bea@empresa.com",
    status: "ativo",
    criado_em: "2025-01-15",
  },
  {
    id: 4,
    nome: "Diego Mota",
    email: "diego@empresa.com",
    status: "pendente",
    criado_em: "2025-01-18",
  },
];
const ALL_DEMO_ROWS = [
  ...DEMO_ROWS_HERO,
  {
    id: 5,
    nome: "Fernanda Luz",
    email: "fer@empresa.com",
    status: "ativo",
    criado_em: "2025-02-01",
  },
  {
    id: 6,
    nome: "Rafael Costa",
    email: "rafa@empresa.com",
    status: "pendente",
    criado_em: "2025-02-03",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// ─── Steps do "How It Works"
// ═══════════════════════════════════════════════════════════════════════════
const STEPS = [
  {
    num: "01",
    icon: "fi-sr-database",
    title: "Crie sua Database",
    desc: "Dê um nome e o Self MD provisiona toda a estrutura MySQL automaticamente no servidor.",
    preview: <StepPreviewDatabase />,
  },
  {
    num: "02",
    icon: "fi-sr-table-pivot",
    title: "Defina suas Tabelas",
    desc: "Use o wizard visual para criar colunas, definir tipos, PKs e FKs — sem escrever SQL.",
    preview: <StepPreviewWizard />,
  },
  {
    num: "03",
    icon: "fi-sr-magic-wand",
    title: "Gerencie seus Dados",
    desc: "Insira, edite, filtre e exporte registros. Importe planilhas .xlsx, .csv ou .json.",
    preview: <StepPreviewTable />,
  },
];

const SOBRE_FEATURES = [
  {
    icon: "fi fi-sr-delete-document",
    title: "Sem SQL",
    desc: "Nunca escreva uma query manualmente. A interface faz tudo por você.",
  },
  {
    icon: "fi fi-sr-badge-check",
    title: "Banco Real",
    desc: "Suas tabelas existem de verdade em MySQL, não é uma simulação.",
  },
  {
    icon: "fi fi-sr-website-speed",
    title: "Rápido",
    desc: "Do zero a uma tabela funcional em menos de 60 segundos.",
  },
  {
    icon: "fi fi-sr-heart",
    title: "Para Todos",
    desc: "Funciona para quem conhece ou não o MySQL.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// ─── Preview do Step "Database"
// ═══════════════════════════════════════════════════════════════════════════
function StepPreviewDatabase() {
  const dbs = ["clientes_db", "vendas_2025", "estoque_v2"];
  return (
    <div className="step-preview">
      {dbs.map((db, i) => (
        <motion.div
          key={db}
          className="step-db-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15, duration: 0.4 }}
        >
          <i className="fi fi-sr-database" />
          <span>{db}</span>
          <span className="step-db-badge">MySQL</span>
        </motion.div>
      ))}
      <motion.div
        className="step-db-card step-db-card--new"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <i className="fi fi-rr-plus" />
        <span>Nova database...</span>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── Preview do Step "Wizard"
// ═══════════════════════════════════════════════════════════════════════════
function StepPreviewWizard() {
  const cols = [
    { nome: "id", tipo: "Número Inteiro", badge: "PK" },
    { nome: "nome", tipo: "Texto", badge: null },
    { nome: "email", tipo: "Email", badge: null },
  ];
  return (
    <div className="step-preview">
      <div className="step-wizard-steps">
        {["Nome", "Colunas", "Configs", "Prévia"].map((s, i) => (
          <div key={s} className={`step-dot-mini ${i <= 1 ? "done" : ""}`}>
            {i + 1}
          </div>
        ))}
      </div>
      {cols.map((col, i) => (
        <motion.div
          key={col.nome}
          className="step-col-row"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.12, duration: 0.35 }}
        >
          <span className="step-col-name">{col.nome}</span>
          <span className="step-col-type">{col.tipo}</span>
          {col.badge && <span className="step-col-badge">{col.badge}</span>}
        </motion.div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── Preview do Step "Tabela com dados"
// ═══════════════════════════════════════════════════════════════════════════
function StepPreviewTable() {
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    if (visible >= DEMO_ROWS_HERO.length) return;
    const t = setTimeout(() => setVisible((v) => v + 1), 400);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div className="step-preview">
      <div className="mini-table">
        <div className="mini-table-head">
          {["nome", "email", "status"].map((c) => (
            <span key={c}>{c.toUpperCase()}</span>
          ))}
        </div>
        <AnimatePresence>
          {DEMO_ROWS_HERO.slice(0, visible).map((row) => (
            <motion.div
              key={row.id}
              className="mini-table-row"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span>{row.nome}</span>
              <span className="mini-email">{row.email}</span>
              <span className={`mini-status mini-status--${row.status}`}>
                {row.status}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── Tech Stack — agora funciona como FOOTER da página
// ═══════════════════════════════════════════════════════════════════════════
const TECH_ICONS = [
  {
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon@v2.15.1/icons/react/react-original.svg",
    label: "React",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon@v2.15.1/icons/nodejs/nodejs-original.svg",
    label: "Node.js",
  },
  {
    src: "https://img.icons8.com/external-tal-revivo-color-tal-revivo/96/external-java-is-a-general-purpose-programming-language-that-is-class-based-logo-color-tal-revivo.png",
    label: "Java",
  },
  {
    src: "https://img.icons8.com/color/48/javascript--v1.png",
    label: "JavaScript",
  },
  {
    src: "https://img.icons8.com/external-tal-revivo-shadow-tal-revivo/96/external-mysql-an-open-source-relational-database-management-system-logo-shadow-tal-revivo.png",
    label: "MySQL",
  },
  { src: "https://img.icons8.com/fluency/96/docker.png", label: "Docker" },
  {
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon@v2.15.1/icons/sass/sass-original.svg",
    label: "SASS",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon@v2.15.1/icons/spring/spring-original.svg",
    label: "Spring Boot",
  },
  { src: "https://img.icons8.com/color/48/vite.png", label: "Vite" },
  {
    src: "https://img.icons8.com/external-tal-revivo-color-tal-revivo/96/external-github-with-cat-logo-an-online-community-for-software-development-logo-color-tal-revivo.png",
    label: "GitHub",
  },
  {
    src: "https://cdn.brandfetch.io/idDJv1mfrb/w/1080/h/1080/theme/dark/icon.png?c=1bxid64Mup7aczewSAYMX&t=1753779057992",
    label: "Framer Motion",
  },
  {
    src: "https://img.icons8.com/external-tanah-basah-glyph-tanah-basah/96/external-flaticon-social-media-tanah-basah-glyph-tanah-basah.png",
    label: "Flaticon",
  },
  {
    src: "https://img.icons8.com/color/96/icons8-new-logo.png",
    label: "Icons8",
  },
];

function TechStack() {
  const items = [...TECH_ICONS, ...TECH_ICONS];

  return (
    <footer className="lp-tech-stack" aria-label="Tecnologias e rodapé">
      {/* Marquee de ícones */}
      <div className="lp-tech-footer-top">
        <div className="lp-tech-label">Construído com</div>
        <div className="lp-tech-track-wrapper">
          <div className="lp-tech-track">
            {items.map((tech, i) => (
              <div className="lp-tech-item" key={i}>
                {tech.src ? (
                  <img
                    src={tech.src}
                    alt={tech.label}
                    className="lp-tech-img"
                  />
                ) : (
                  <span className="lp-tech-badge">
                    <i className={`fi ${tech.icon}`} />
                    {tech.text}
                  </span>
                )}
                {tech.label && (
                  <span className="lp-tech-name">{tech.label}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── Demo Sandbox — Fluxo de 3 passos com estado local
// ─── ATENÇÃO: Nada aqui é salvo no banco de dados.
// ─── MUDANÇA: StarBorder agora envolve o card INTEIRO (não só a tabela).
// ═══════════════════════════════════════════════════════════════════════════
function DemoSandbox() {
  const [passo, setPasso] = useState(1);
  const [nomeTabela, setNomeTabela] = useState("");
  const [nomeColuna, setNomeColuna] = useState("");
  const [tipoColuna, setTipoColuna] = useState("Texto");
  const [valorInput, setValorInput] = useState("");
  const [registros, setRegistros] = useState([]);
  const [selecionados, setSelecionados] = useState([]);

  const confirmarNomeTabela = () => {
    if (nomeTabela.trim()) setPasso(2);
  };

  const confirmarColuna = () => {
    if (nomeColuna.trim()) setPasso(3);
  };

  const inserirRegistro = () => {
    if (!valorInput.trim()) return;
    setRegistros((prev) => [
      ...prev,
      { id: Date.now(), [nomeColuna]: valorInput.trim() },
    ]);
    setValorInput("");
  };

  const toggleSelecionado = (id) =>
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const apagarSelecionados = () => {
    setRegistros((prev) => prev.filter((r) => !selecionados.includes(r.id)));
    setSelecionados([]);
  };

  const resetar = () => {
    setPasso(1);
    setNomeTabela("");
    setNomeColuna("");
    setValorInput("");
    setRegistros([]);
    setSelecionados([]);
  };

  // ── StarBorder envolve o card INTEIRO agora ───────────────────────────
  return (
    <StarBorder
      as="div"
      color="#0bcd5f"
      speed="7s"
      thickness={1.5}
      className="sandbox-star-outer"
    >
      <div className="sandbox-card">
        {/* Barra de passos */}
        <div className="sandbox-steps-bar">
          {[
            { n: 1, label: "Nomear tabela" },
            { n: 2, label: "Criar coluna" },
            { n: 3, label: "Inserir dados" },
          ].map(({ n, label }, i) => (
            <div
              key={n}
              className={`sandbox-step ${passo >= n ? "done" : ""} ${passo === n ? "active" : ""}`}
            >
              <span className="sandbox-step-dot">
                {passo > n ? <i className="fi fi-rr-check" /> : n}
              </span>
              <span className="sandbox-step-label">{label}</span>
              {i < 2 && (
                <div
                  className={`sandbox-step-line ${passo > n ? "done" : ""}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Corpo do passo */}
        <div className="sandbox-body">
          {/* ── PASSO 1: Nome da tabela ── */}
          {passo === 1 && (
            <motion.div
              className="sandbox-pane"
              key="p1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <h3 className="sandbox-pane-title">
                Como vamos chamar sua tabela?
              </h3>
              <p className="sandbox-pane-desc">
                Insira abaixo e clique em próximo
              </p>
              <div className="sandbox-input-row">
                <input
                  className="sandbox-input"
                  type="text"
                  maxLength={15}
                  placeholder="ex: clientes"
                  value={nomeTabela}
                  onChange={(e) => setNomeTabela(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && confirmarNomeTabela()}
                  autoFocus
                />
                <button
                  className="sandbox-btn-primary"
                  onClick={confirmarNomeTabela}
                  disabled={!nomeTabela.trim()}
                >
                  Próximo
                </button>
              </div>
            </motion.div>
          )}

          {/* ── PASSO 2: Criar coluna ── */}
          {passo === 2 && (
            <motion.div
              className="sandbox-pane"
              key="p2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <h3 className="sandbox-pane-title">
                Defina uma coluna para{" "}
                <strong className="sandbox-highlight">"{nomeTabela}"</strong>
              </h3>
              <p className="sandbox-pane-desc">
                Escolha o nome e o tipo de dado. Você poderá adicionar mais
                colunas dentro do sistema.
              </p>
              <div className="sandbox-input-row">
                <input
                  className="sandbox-input"
                  type="text"
                  maxLength={15}
                  placeholder="ex: nome_completo"
                  value={nomeColuna}
                  onChange={(e) => setNomeColuna(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && confirmarColuna()}
                  autoFocus
                />
                <select
                  className="sandbox-select"
                  value={tipoColuna}
                  onChange={(e) => setTipoColuna(e.target.value)}
                >
                  <option>Texto</option>
                  <option>Número Inteiro</option>
                  <option>Email</option>
                  <option>Data</option>
                </select>
                <button
                  className="sandbox-btn-primary"
                  onClick={confirmarColuna}
                  disabled={!nomeColuna.trim()}
                >
                  Próximo
                </button>
              </div>
            </motion.div>
          )}

          {/* ── PASSO 3: Inserir dados e ver tabela ── */}
          {passo === 3 && (
            <motion.div
              className="sandbox-pane"
              key="p3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <h3 className="sandbox-pane-title">
                Insira dados em{" "}
                <strong className="sandbox-highlight">"{nomeTabela}"</strong>
              </h3>
              <p className="sandbox-pane-desc">
                Digite um valor para a coluna {nomeColuna}.
              </p>

              {/* Formulário de inserção */}
              <div className="sandbox-input-row">
                <input
                  className="sandbox-input"
                  type="text"
                  placeholder={`Valor para "${nomeColuna}"...`}
                  value={valorInput}
                  onChange={(e) => setValorInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && inserirRegistro()}
                />
                <button
                  className="sandbox-btn-primary"
                  onClick={inserirRegistro}
                  disabled={!valorInput.trim()}
                >
                  <i className="fi fi-rr-plus" /> Inserir
                </button>
              </div>

              {/* Barra de seleção */}
              <div
                className={`sandbox-selection-bar ${selecionados.length > 0 ? "active" : ""}`}
              >
                {selecionados.length > 0 ? (
                  <>
                    <span>{selecionados.length} item(s) selecionado(s)</span>
                    <button
                      className="sandbox-btn-danger"
                      onClick={apagarSelecionados}
                    >
                      <i className="fi fi-rr-trash" /> Apagar
                    </button>
                  </>
                ) : (
                  <span>
                    Nenhum item selecionado — clique na linha para selecionar
                  </span>
                )}
              </div>

              {/* ── Tabela SEM StarBorder interno — o border externo já cobre o card inteiro ── */}
              <div className="sandbox-table-wrap">
                <table className="sandbox-table">
                  <thead>
                    <tr>
                      <th className="sandbox-th-check" />
                      <th>ID</th>
                      <th>{nomeColuna.toUpperCase()}</th>
                      <th className="sandbox-th-type">{tipoColuna}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {registros.map((reg, i) => {
                        const sel = selecionados.includes(reg.id);
                        return (
                          <motion.tr
                            key={reg.id}
                            className={sel ? "sandbox-row-selected" : ""}
                            initial={{
                              opacity: 0,
                              backgroundColor: "rgba(11,205,95,0.15)",
                            }}
                            animate={{
                              opacity: 1,
                              backgroundColor: sel
                                ? "rgba(11,205,95,0.15)"
                                : "rgba(11,205,95,0)",
                            }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.4 }}
                            onClick={() => toggleSelecionado(reg.id)}
                            style={{ cursor: "pointer" }}
                          >
                            <td className="sandbox-td-check">
                              <span
                                className={`sandbox-checkbox ${sel ? "checked" : ""}`}
                              >
                                {sel && <i className="fi fi-sr-check" />}
                              </span>
                            </td>
                            <td>{i + 1}</td>
                            <td>{reg[nomeColuna]}</td>
                            <td className="sandbox-td-type">
                              <span className="sandbox-type-badge">
                                {tipoColuna}
                              </span>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                    {registros.length === 0 && (
                      <tr>
                        <td colSpan={4} className="sandbox-empty">
                          Nenhum registro ainda — insira o primeiro acima!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <button
                className="sandbox-btn-ghost sandbox-reset"
                onClick={resetar}
              >
                <i className="fi fi-rr-refresh" /> Recomeçar do zero
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </StarBorder>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── Live Table Demo (seção de showcase)
// ═══════════════════════════════════════════════════════════════════════════
function LiveTableDemo() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i >= ALL_DEMO_ROWS.length) {
        clearInterval(interval);
        return;
      }
      setRows((prev) => [...prev, ALL_DEMO_ROWS[i]]);
      i++;
    }, 350);
    return () => clearInterval(interval);
  }, []);

  return (
    <StarBorder
      as="div"
      color="#0bcd5f"
      speed="9s"
      thickness={2}
      className="demo-star-border"
    >
      <motion.div
        className="demo-system-card"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="demo-tab-bar">
          {["clientes", "produtos", "pedidos"].map((t, i) => (
            <span key={t} className={`demo-tab ${i === 0 ? "active" : ""}`}>
              {t}
            </span>
          ))}
          <span className="demo-tab-plus">
            <i className="fi fi-rr-plus" />
          </span>
        </div>

        <div className="demo-table-header">
          <span className="demo-reg-label">Registros</span>
          <span className="demo-reg-count">{rows.length}</span>
          <div className="demo-header-actions">
            <button className="demo-action-btn">
              <i className="fi fi-sr-add-document" /> Inserir registro
            </button>
            <button className="demo-action-btn">
              <i className="fi fi-sr-pencil" /> Renomear tabela
            </button>
            <button className="demo-action-btn demo-action-btn--danger">
              <i className="fi fi-sr-remove-folder" /> Excluir tabela
            </button>
          </div>
        </div>

        <div className="demo-selection-bar">
          <span>Nenhum item selecionado</span>
        </div>

        <div className="demo-table-wrap">
          <table className="demo-table">
            <thead>
              <tr>
                <th className="demo-check-col" />
                {DEMO_COLUNAS.map((c) => (
                  <th key={c}>
                    <div className="demo-th-content">
                      <span>{c.toUpperCase()}</span>
                      <i className="fi fi-rr-menu-dots-vertical demo-th-dots" />
                    </div>
                  </th>
                ))}
                <th className="demo-actions-col">
                  <i className="fi fi-rr-refresh" />
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {rows &&
                  rows.map((row) => {
                    if (!row?.id) return null;
                    return (
                      <motion.tr
                        key={row.id}
                        initial={{
                          opacity: 0,
                          backgroundColor: "rgba(11,205,95,0.12)",
                        }}
                        animate={{
                          opacity: 1,
                          backgroundColor: "rgba(11,205,95,0)",
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <td className="demo-check-col">
                          <span className="demo-checkbox" />
                        </td>
                        <td>{row.id}</td>
                        <td>{row.nome || "---"}</td>
                        <td className="demo-td-clip">{row.email || "---"}</td>
                        <td>
                          <span
                            className={`demo-badge demo-badge--${row.status || "default"}`}
                          >
                            {row.status || "N/A"}
                          </span>
                        </td>
                        <td>{row.criado_em || "---"}</td>
                        <td className="demo-actions-col">
                          <div className="demo-row-actions">
                            <i className="fi fi-rr-file-edit" />
                            <i className="fi fi-rr-delete-document" />
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
              </AnimatePresence>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="demo-empty-cell">
                    Carregando registros...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </StarBorder>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── Componente Principal
// ═══════════════════════════════════════════════════════════════════════════
export function LandingPage() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const lenis = new Lenis();
    let rafId;
    const raf = (t) => {
      lenis.raf(t);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <main className="lp-root">
      {/* ── NAVBAR ──────────────────────────────────────────────────────── */}
      <nav className="lp-nav">
        <span className="lp-nav-brand">
          <img
            src="../../../public/Self_md-logo-removebg-preview.png"
            alt="Logo da Self MD"
          />{" "}
          Self MD
        </span>
        <div className="lp-nav-links">
          <a href="#sobre">Sobre</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#demo">Demonstração</a>
          <a href="#sistema-real">Sistema real</a>
          <Link to="/login" className="lp-nav-cta">
            Entrar
          </Link>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ── SEÇÃO 1: HERO ─────────────────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className="lp-hero" id="hero">
        <div className="lp-hero-rings">
          <MagicRings
            color="#0bcd5f"
            colorTwo="#0bcd5f"
            speed={0.6}
            ringCount={5}
            attenuation={8}
            baseRadius={0.3}
            radiusStep={0.12}
            opacity={1}
            followMouse
            mouseInfluence={0.04}
            parallax={0.04}
          />
        </div>

        <div className="lp-hero-inner">
          <motion.span
            className="lp-hero-badge"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <i className="fi fi-sr-bolt" /> Sistema No-Code
          </motion.span>

          <SplitText
            text="Self Management Database"
            className="lp-hero-title"
            tag="h1"
            delay={18}
            duration={0.9}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 50, filter: "blur(4px)" }}
            to={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            threshold={0.1}
            textAlign="center"
          />

          <motion.p
            className="lp-hero-sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.0 }}
          >
            Uma plataforma visual que transforma necessidade em realidade, com
            apenas alguns cliques, voce cria e gerencia sua propria base de
            dados, sem utilizar SQL.
          </motion.p>

          <motion.div
            className="lp-hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.2 }}
          >
            <Link to="/login" className="lp-btn lp-btn--primary">
              Criar meu banco agora
            </Link>
            <a href="#demo" className="lp-btn lp-btn--ghost">
              Ver demonstração
            </a>
          </motion.div>

          <motion.div
            className="lp-hero-stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            {[
              { val: "Segurança", label: "Blindado contra ameaças" },
              { val: "Interface", label: "Moderna e responsiva" },
              { val: "Integração", label: "com APIs" },
            ].map((s) => (
              <div className="lp-hero-stat" key={s.label}>
                <strong>{s.val}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── SEÇÃO 2: O QUE É SELF MD ────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="lp-sobre" id="sobre">
        <div className="lp-sobre-inner">
          <div className="lp-sobre-text">
            <motion.div
              className="lp-section-label lp-section-label--left"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              O que é a Self MD?
            </motion.div>

            <motion.h2
              className="lp-section-title lp-section-title--left"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Sistema de gerenciamento de banco de dados
            </motion.h2>

            <motion.p
              className="lp-sobre-desc lp-sobre-desc--left"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.2 }}
            >
              O <strong>Self MD</strong> (Self Management Database) é um sistema
              No-Code, todas as funcionalidades presentes no MySQL você encontra
              aqui. Você cria a sua database, tabelas, colunas, insere dados,
              gerencia, tudo através de uma interface visual intuitiva, tudo é
              gerado dentro do MySQL.
            </motion.p>
          </div>

          <motion.div
            className="lp-sobre-swap"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <CardSwap
              width={340}
              height={240}
              cardDistance={50}
              verticalDistance={65}
              delay={4000}
              easing="elastic"
              pauseOnHover
            >
              {SOBRE_FEATURES.map((item, i) => (
                <Card key={i} customClass="lp-sobre-swap-card">
                  <i className={`fi ${item.icon} lp-sobre-swap-icon`} />
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </Card>
              ))}
            </CardSwap>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ── SEÇÃO 3: COMO FUNCIONA ─────────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className="lp-steps" id="como-funciona">
        <div className="lp-steps-inner">
          <div className="lp-steps-left">
            <motion.div
              className="lp-section-label lp-section-label--left"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              Como funciona
            </motion.div>
            <motion.h2
              className="lp-section-title lp-section-title--left"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              De zero ao banco em três passos
            </motion.h2>

            <div className="lp-steps-list">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.num}
                  className={`lp-step-item-outer ${activeStep === i ? "active" : ""}`}
                  onClick={() => setActiveStep(i)}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                >
                  <BorderGlow
                    backgroundColor={activeStep === i ? "#ffffff" : "#f9f9f9"}
                    glowColor="130 75 47"
                    colors={["#0bcd5f", "#c8f5dd", "#07a34c"]}
                    borderRadius={14}
                    glowRadius={22}
                    glowIntensity={0.75}
                    fillOpacity={0.22}
                  >
                    <div className="lp-step-item-inner">
                      <div className="lp-step-num">{step.num}</div>
                      <div className="lp-step-text">
                        <h3>{step.title}</h3>
                        <p>{step.desc}</p>
                      </div>
                    </div>
                  </BorderGlow>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="lp-steps-right">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                className="lp-step-preview-card"
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.97 }}
                transition={{ duration: 0.35 }}
              >
                <div className="lp-step-card-header">
                  <div className="lp-window-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="lp-step-card-title">
                    <i className={`fi ${STEPS[activeStep].icon}`} />
                    {STEPS[activeStep].title}
                  </span>
                </div>
                <div className="lp-step-card-body">
                  {STEPS[activeStep].preview}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ── SEÇÃO 4: DEMO INTERATIVA (Test Drive) ──────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className="lp-demo-section" id="demo">
        <motion.div
          className="lp-section-label"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          Test Drive
        </motion.div>
        <motion.h2
          className="lp-section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Experimente antes de criar sua conta
        </motion.h2>
        <motion.p
          className="lp-demo-sub"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Crie uma tabela, adicione uma coluna e insira dados — tudo aqui mesmo.
          Nenhum cadastro necessário.
        </motion.p>

        {/* DemoSandbox já tem o StarBorder interno envolvendo o card inteiro */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <DemoSandbox />
        </motion.div>

        {/* Showcase da tabela ao vivo */}
        <div className="lp-demo-showcase-header" id="sistema-real">
          <motion.div
            className="lp-section-label"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Sistema Real
          </motion.div>
          <motion.h3
            className="lp-demo-showcase-title"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            É exatamente assim que parece dentro do Self MD
          </motion.h3>
        </div>
        <LiveTableDemo />
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ── SEÇÃO 5: CTA FINAL — redesenhado ─────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className="lp-cta">
        {/* Orbs decorativos (CSS puro, sem JS) */}
        <div className="lp-cta-orb lp-cta-orb--1" aria-hidden="true" />
        <div className="lp-cta-orb lp-cta-orb--2" aria-hidden="true" />
        <div className="lp-cta-orb lp-cta-orb--3" aria-hidden="true" />

        <motion.div
          className="lp-cta-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65 }}
        >
          <motion.div
            className="lp-cta-badge"
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <i className="fi fi-sr-rocket-lunch" />
            Pronto para começar?
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            Assuma o controle dos seus dados{" "}
            <span className="lp-cta-heading-accent"> agora!</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
          >
            Chega de planilhas espalhadas, JSON perdido ou SQL que ninguém
            entende. O Self MD organiza tudo com a interface que você viu acima,
            gerando um banco MySQL real a cada clique.
          </motion.p>

          <motion.div
            className="lp-cta-btn-group"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.32 }}
          >
            <Link to="/login" className="lp-cta-btn lp-cta-btn--primary">
              <i className="fi fi-sr-database" />
              Comece gratuitamente
              <i className="fi fi-rr-arrow-right" />
            </Link>
          </motion.div>

          <motion.div
            className="lp-cta-features"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.42 }}
          >
            {[
              "Sem gastar 1 centavo",
              "Estrutura MySQL real",
              "Começa em 60 segundos",
            ].map((f) => (
              <span key={f} className="lp-cta-feature-item">
                <i className="fi fi-sr-check-circle" />
                {f}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── TECH STACK como FOOTER — final da página ──────────────────── */}
      <TechStack />
    </main>
  );
}
