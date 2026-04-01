import React, { useState, useRef, useEffect, useCallback } from "react";
import "./System.scss";
import { SegundoMenu } from "../../components/SegundoMenu/SegundoMenu";
import { Notificacao } from "../../components/Notificacao/Notificacao";
import { TourGuide } from "../../components/TourGuide/TourGuide";
import { TABELA_CRUD_ROUTES } from "../../../constants/api_rest.js";

// ═══════════════════════════════════════════════════════════════════════════
// ─── Constantes de tipo ────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

const GRUPOS_TIPOS = {
  Texto: ["Texto", "Descrição", "Email", "Link"],
  Numérico: ["Número Decimal", "Número Inteiro", "CPF", "Telefone", "Moeda"],
  Tempo: ["Hora", "Data", "Data / Hora"],
  Seleção: ["Lista Única", "Lista Múltipla", "Booleano"],
  Avançado: ["Arquivo", "Cálculo"],
};

const GRUPO_ICONS = {
  Texto: "fi-rr-text",
  Numérico: "fi-rr-calculator",
  Tempo: "fi-rr-calendar",
  Seleção: "fi-rr-list",
  Avançado: "fi-rr-settings-sliders",
};

// ─── Categoria de config por tipo ─────────────────────────────────────────
const getTipoCategoria = (tipo) => {
  if (["Texto", "Email", "Link", "CPF", "Telefone"].includes(tipo))
    return "textoCurto";
  if (tipo === "Descrição") return "textoLongo";
  if (["Número Inteiro", "Número Decimal", "Moeda"].includes(tipo))
    return "numerico";
  if (["Hora", "Data", "Data / Hora"].includes(tipo)) return "temporal";
  if (["Lista Única", "Lista Múltipla"].includes(tipo)) return "selecao";
  if (tipo === "Booleano") return "booleano";
  if (tipo === "Arquivo") return "arquivo";
  if (tipo === "Cálculo") return "calculo";
  return null;
};

const CONFIGS_POR_CATEGORIA = {
  textoCurto: [
    "naoVazio",
    "unico",
    "valorPadrao",
    "alcanceMaximo",
    "mascara",
    "indice",
  ],
  textoLongo: ["naoVazio", "valorPadrao", "alcanceMaximo"],
  numerico: [
    "naoVazio",
    "valorPadrao",
    "valorMinimo",
    "valorMaximo",
    "autoIncremento",
    "indice",
  ],
  temporal: ["naoVazio", "valorPadrao", "indice"],
  selecao: ["naoVazio", "valorPadrao", "opcoes"],
  booleano: ["naoVazio", "valorPadrao"],
  arquivo: ["naoVazio"],
  calculo: ["naoVazio", "indice"],
};

const CONFIG_META = {
  naoVazio: { label: "Não vazio", tipo: "toggle" },
  unico: { label: "Único", tipo: "toggle" },
  autoIncremento: { label: "Auto-incremento", tipo: "toggle" },
  indice: { label: "Índice", tipo: "toggle" },
  valorPadrao: { label: "Valor padrão", tipo: "text" },
  alcanceMaximo: { label: "Alcance máximo", tipo: "number" },
  valorMinimo: { label: "Valor mínimo", tipo: "number" },
  valorMaximo: { label: "Valor máximo", tipo: "number" },
  mascara: { label: "Máscara", tipo: "text" },
  opcoes: { label: "Opções", tipo: "tags" },
};

const CONFIG_PADRAO = {
  naoVazio: false,
  unico: false,
  valorPadrao: "",
  alcanceMaximo: "",
  valorMinimo: "",
  valorMaximo: "",
  autoIncremento: false,
  indice: false,
  mascara: "",
  opcoes: [],
};

const NOME_MAX = 15;
const TOUR_SEEN_KEY = "system_tour_seen";

const COLUNA_VAZIA = () => ({
  id: Date.now() + Math.random(),
  nome: "",
  identificacao: null, // null | "pk" | "fk"
  fkTabela: null,
  fkColuna: null,
  grupo: null,
  tipoDado: null,
  config: { ...CONFIG_PADRAO, opcoes: [] },
});

// ═══════════════════════════════════════════════════════════════════════════
// ─── Sub-componente: input de opções (tags) ────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function OpcoesInput({ opcoes, onChange }) {
  const [inputVal, setInputVal] = useState("");

  const add = () => {
    const v = inputVal.trim();
    if (v && !opcoes.includes(v)) {
      onChange([...opcoes, v]);
      setInputVal("");
    }
  };

  return (
    <div className="opcoes-input">
      <div className="opcoes-tags">
        {opcoes.length === 0 && (
          <span className="opcoes-placeholder">Nenhuma opção adicionada</span>
        )}
        {opcoes.map((op, i) => (
          <span key={i} className="opcao-tag">
            {op}
            <button
              type="button"
              onClick={() => onChange(opcoes.filter((_, j) => j !== i))}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="opcoes-add">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Nova opção... (Enter para adicionar)"
        />
        <button type="button" className="opcoes-add-btn" onClick={add}>
          +
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── Componente Principal ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

export function System() {
  const MIN_COL_WIDTH = 60;
  const CHECKBOX_WIDTH = 50;
  const ID_WIDTH = 70;
  const ACTIONS_WIDTH = 60;

  // ── Estado global ─────────────────────────────────────────────────────────
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [colWidths, setColWidths] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [tourActive, setTourActive] = useState(false);

  // ── Wizard ────────────────────────────────────────────────────────────────
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1); // 1 | 2 | 3
  const [nomeTabela, setNomeTabela] = useState("");
  const [colunas, setColunas] = useState([COLUNA_VAZIA()]);
  const [loadingCreate, setLoadingCreate] = useState(false);

  const tabsRef = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const activeTabData = tabs.find((t) => t.id === activeTab);
  const rows = activeTabData?.rows || [];
  const resizableCols = Object.keys(colWidths);

  const totalTableWidth =
    CHECKBOX_WIDTH +
    ID_WIDTH +
    resizableCols.reduce((acc, col) => acc + colWidths[col], 0) +
    ACTIONS_WIDTH;

  // ── Notificações ──────────────────────────────────────────────────────────
  const pushNotification = useCallback(
    (type, title, message, duration = 4000) => {
      setNotifications((prev) => [
        ...prev,
        { id: Date.now(), type, title, message, duration },
      ]);
    },
    [],
  );

  // ── Indicador de tab ──────────────────────────────────────────────────────
  useEffect(() => {
    const el = tabsRef.current[activeTab];
    if (el)
      setIndicatorStyle({
        left: `${el.offsetLeft}px`,
        width: `${el.offsetWidth}px`,
      });
  }, [activeTab, tabs]);

  // ── Seleção de linhas ─────────────────────────────────────────────────────
  const toggleSelectAll = () => {
    if (selectedRows.length === rows.length && rows.length > 0)
      setSelectedRows([]);
    else setSelectedRows(rows.map((r) => r.id));
  };
  const toggleSelectRow = (id) =>
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const deleteSelected = () => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTab
          ? {
              ...tab,
              rows: tab.rows.filter((r) => !selectedRows.includes(r.id)),
            }
          : tab,
      ),
    );
    setSelectedRows([]);
  };

  // ── Resize coluna ─────────────────────────────────────────────────────────
  const handleMouseDown = (e, colName) => {
    e.preventDefault();
    const startX = e.pageX,
      startWidth = colWidths[colName],
      MAX = 580;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    const onMove = (ev) => {
      const w = Math.max(
        MIN_COL_WIDTH,
        Math.min(startWidth + (ev.pageX - startX), MAX),
      );
      setColWidths((prev) => ({ ...prev, [colName]: w }));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  // ─── Wizard helpers ────────────────────────────────────────────────────────
  const openWizard = () => {
    setNomeTabela("");
    setColunas([COLUNA_VAZIA()]);
    setWizardStep(1);
    setWizardOpen(true);
  };
  const closeWizard = () => {
    setWizardOpen(false);
    setWizardStep(1);
  };

  // Passo 1 → 2
  const handleStep1Proximo = () => {
    const nome = nomeTabela.trim();
    if (!nome) {
      pushNotification(
        "warning",
        "Nome obrigatório",
        "Informe um nome para a tabela.",
      );
      return;
    }
    if (nome.length > NOME_MAX) {
      pushNotification(
        "error",
        "Nome muito longo",
        `Máximo de ${NOME_MAX} caracteres.`,
      );
      return;
    }
    setWizardStep(2);
  };

  // Passo 2 → 3
  const handleStep2Proximo = () => {
    const invalidas = colunas.filter((c) => !c.nome.trim() || !c.tipoDado);
    if (invalidas.length > 0) {
      pushNotification(
        "warning",
        "Colunas incompletas",
        "Todas as colunas precisam de nome e tipo de dado.",
      );
      return;
    }
    setWizardStep(3);
  };

  // ─── Coluna helpers ────────────────────────────────────────────────────────
  const addColuna = () => setColunas((prev) => [...prev, COLUNA_VAZIA()]);
  const removeColuna = (id) =>
    setColunas((prev) => prev.filter((c) => c.id !== id));

  const updateColuna = (id, field, value) =>
    setColunas((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );

  const updateConfig = (id, key, value) =>
    setColunas((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, config: { ...c.config, [key]: value } } : c,
      ),
    );

  // ─── PK ────────────────────────────────────────────────────────────────────
  const handleTogglePK = (id) => {
    setColunas((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (c.identificacao === "pk") {
          // desligar
          return {
            ...c,
            identificacao: null,
            grupo: null,
            tipoDado: null,
            config: { ...CONFIG_PADRAO, opcoes: [] },
          };
        }
        // ligar: auto-config
        return {
          ...c,
          identificacao: "pk",
          fkTabela: null,
          fkColuna: null,
          grupo: "Numérico",
          tipoDado: "Número Inteiro",
          config: {
            ...CONFIG_PADRAO,
            opcoes: [],
            naoVazio: true,
            autoIncremento: true,
            valorPadrao: "0",
          },
        };
      }),
    );
  };

  // ─── FK ────────────────────────────────────────────────────────────────────
  const handleToggleFK = (id) => {
    setColunas((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (c.identificacao === "fk") {
          return {
            ...c,
            identificacao: null,
            fkTabela: null,
            fkColuna: null,
            grupo: null,
            tipoDado: null,
            config: { ...CONFIG_PADRAO, opcoes: [] },
          };
        }
        return {
          ...c,
          identificacao: "fk",
          fkTabela: null,
          fkColuna: null,
          grupo: null,
          tipoDado: null,
        };
      }),
    );
  };

  const getPKsDeTabela = (tabelaId) => {
    const tab = tabs.find((t) => String(t.id) === String(tabelaId));
    if (!tab?.cols) return [];
    return tab.cols.filter((c) => c.identificacao === "pk");
  };

  const handleFKTabelaChange = (colId, tabelaId) => {
    setColunas((prev) =>
      prev.map((c) =>
        c.id !== colId
          ? c
          : {
              ...c,
              fkTabela: tabelaId,
              fkColuna: null,
              grupo: null,
              tipoDado: null,
            },
      ),
    );
  };

  const handleFKColunaChange = (colId, colNome) => {
    const col = colunas.find((c) => c.id === colId);
    if (!col) return;
    const tab = tabs.find((t) => String(t.id) === String(col.fkTabela));
    const pkCol = tab?.cols?.find((c) => c.nome === colNome);
    if (!pkCol) return;
    setColunas((prev) =>
      prev.map((c) =>
        c.id !== colId
          ? c
          : {
              ...c,
              fkColuna: colNome,
              grupo: pkCol.grupo,
              tipoDado: pkCol.tipoDado,
              config: {
                ...pkCol.config,
                opcoes: [...(pkCol.config?.opcoes ?? [])],
              },
            },
      ),
    );
  };

  const handleGrupoChange = (id, grupo) =>
    setColunas((prev) =>
      prev.map((c) => (c.id === id ? { ...c, grupo, tipoDado: null } : c)),
    );

  const handleTipoChange = (id, tipo) =>
    setColunas((prev) =>
      prev.map((c) => (c.id === id ? { ...c, tipoDado: tipo } : c)),
    );

  // ─── Criar tabela (API) ────────────────────────────────────────────────────
  const handleCriarTabela = async () => {
    const colsValidas = colunas.filter((c) => c.nome.trim() && c.tipoDado);
    if (colsValidas.length === 0) {
      pushNotification(
        "warning",
        "Sem colunas",
        "Adicione pelo menos uma coluna com nome e tipo definidos.",
      );
      return;
    }

    const payload = {
      nome: nomeTabela.trim(),
      colunas: colsValidas.map((c) => ({
        nome: c.nome.trim(),
        identificacao: c.identificacao,
        fkTabela: c.fkTabela,
        fkColuna: c.fkColuna,
        tipoDado: c.tipoDado,
        config: c.config,
      })),
    };

    setLoadingCreate(true);
    try {
      const res = await fetch(TABELA_CRUD_ROUTES.CRIAR, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const newWidths = {};
      colsValidas.forEach((c) => {
        newWidths[c.nome.trim()] = 150;
      });

      const newTab = {
        id: data?.id || Date.now(),
        name: payload.nome,
        rows: [],
        cols: colsValidas,
      };

      setTabs((prev) => [...prev, newTab]);
      setActiveTab(newTab.id);
      setColWidths(newWidths);
      setSelectedRows([]);
      closeWizard();
      pushNotification(
        "success",
        "Tabela criada!",
        `A tabela "${payload.nome}" foi criada com sucesso.`,
      );
    } catch (err) {
      console.error(err);
      pushNotification(
        "error",
        "Erro ao criar tabela",
        "Não foi possível conectar-se à API.",
      );
    } finally {
      setLoadingCreate(false);
    }
  };

  // ─── Tour ──────────────────────────────────────────────────────────────────
  const handleFinishTour = useCallback(() => {
    setTourActive(false);
    localStorage.setItem(TOUR_SEEN_KEY, "1");
  }, []);

  // ─── Render ────────────────────────────────────────────────────────────────

  // classe do card wizard por passo
  const wizardCardClass = [
    "wizard-card",
    wizardStep === 2 ? "wizard-card--step2" : "",
    wizardStep === 3 ? "wizard-card--step3" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="system-container">
      <SegundoMenu />
      <Notificacao
        notifications={notifications}
        setNotifications={setNotifications}
      />
      {tourActive && <TourGuide onFinish={handleFinishTour} />}

      <main className="main-layout">
        {/* ── Tabs ──────────────────────────────────────────────────────────── */}
        <div className="tab-layout">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => (tabsRef.current[tab.id] = el)}
              className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </button>
          ))}
          {tabs.length > 0 && (
            <div className="tab-indicator" style={indicatorStyle} />
          )}
          <button
            className="new-tab-btn"
            onClick={openWizard}
            title="Nova tabela"
          >
            <i className="fi fi-rr-plus" />
          </button>
        </div>

        {/* ── Conteúdo ──────────────────────────────────────────────────────── */}
        <div className="content-area">
          {tabs.length === 0 ? (
            <div className="empty-state">
              <h2 className="empty-title">Primeira vez? Não se preocupe!</h2>
              <p className="empty-desc">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setTourActive(true);
                  }}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Clique aqui
                </a>{" "}
                para criar sua primeira tabela e começar a usar o sistema.
              </p>
            </div>
          ) : (
            <>
              <div className="table-header">
                <span className="qtd-reg">Registros</span>
                <span className="row-counter">
                  {activeTabData?.rows?.length || 0}
                </span>
                <button
                  className="tour-trigger-btn"
                  onClick={() => setTourActive(true)}
                  title="Tour"
                >
                  <i className="fi fi-rr-map-marker-question" />
                  Tour
                </button>
              </div>

              <div
                className={`selection-bar ${selectedRows.length > 0 ? "active-selection" : ""}`}
              >
                {selectedRows.length > 0 ? (
                  <>
                    <span>{selectedRows.length} item(s) selecionado(s)</span>
                    <button
                      className="delete-selection-btn"
                      onClick={deleteSelected}
                    >
                      <i className="fi fi-sr-trash" /> Apagar
                    </button>
                  </>
                ) : (
                  <span className="empty-selection">
                    Nenhum item selecionado
                  </span>
                )}
              </div>

              <div className="table-scroll-area">
                <div className="table-wrapper">
                  <table
                    className="custom-table"
                    style={{ width: `${totalTableWidth}px` }}
                  >
                    <colgroup>
                      <col style={{ width: `${CHECKBOX_WIDTH}px` }} />
                      <col style={{ width: `${ID_WIDTH}px` }} />
                      {resizableCols.map((col) => (
                        <col
                          key={col}
                          style={{ width: `${colWidths[col]}px` }}
                        />
                      ))}
                      <col style={{ width: `${ACTIONS_WIDTH}px` }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th className="checkbox-col sticky-col sticky-checkbox">
                          <button
                            className="select-all-btn"
                            onClick={toggleSelectAll}
                          >
                            <i
                              className={`fi ${selectedRows.length === rows.length && rows.length > 0 ? "fi-rr-square-minus" : "fi-rr-square-plus"}`}
                            />
                          </button>
                        </th>
                        <th className="id-col sticky-col sticky-id">
                          <div className="cell-content">ID</div>
                        </th>
                        {resizableCols.map((col) => (
                          <th key={col} className="resizable-col">
                            <div className="cell-content">
                              <span className="col-label">
                                {col.toUpperCase()}
                              </span>
                              <button
                                className="resizer-btn"
                                onMouseDown={(e) => handleMouseDown(e, col)}
                              >
                                <i className="fi fi-sr-arrows-alt-h" />
                              </button>
                            </div>
                          </th>
                        ))}
                        <th className="actions-header sticky-col sticky-actions">
                          <div className="actions-cell-content">
                            <button title="Configurar Colunas">
                              <i className="fi fi-rr-settings" />
                            </button>
                            <button title="Excluir Colunas">
                              <i className="fi fi-rr-cross-circle" />
                            </button>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3 + resizableCols.length}
                            className="empty-rows-cell"
                          >
                            <span>
                              Nenhum registro ainda. Adicione o primeiro!
                            </span>
                          </td>
                        </tr>
                      ) : (
                        rows.map((row) => (
                          <tr
                            key={row.id}
                            className={
                              selectedRows.includes(row.id)
                                ? "row-selected"
                                : ""
                            }
                          >
                            <td className="checkbox-col sticky-col sticky-checkbox">
                              <button
                                className="custom-checkbox"
                                onClick={() => toggleSelectRow(row.id)}
                              >
                                <i
                                  className={`fi ${selectedRows.includes(row.id) ? "fi-sr-angle-square-right" : "fi-rr-square"}`}
                                />
                              </button>
                            </td>
                            <td className="id-cell sticky-col sticky-id">
                              {row.id}
                            </td>
                            {resizableCols.map((col) => (
                              <td key={col} className="data-cell">
                                {row[col]}
                              </td>
                            ))}
                            <td className="actions-cell sticky-col sticky-actions">
                              <div className="actions-container">
                                <button>
                                  <i className="fi fi-rr-file-edit editar" />
                                </button>
                                <button>
                                  <i className="fi fi-rr-delete-document remover" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════════════════
          WIZARD OVERLAY
          ══════════════════════════════════════════════════════════════════ */}
      {wizardOpen && (
        <div className="wizard-overlay" onClick={closeWizard}>
          <div className={wizardCardClass} onClick={(e) => e.stopPropagation()}>
            {/* ── Cabeçalho ─────────────────────────────────────────────── */}
            <div className="wizard-header">
              <div className="wizard-steps">
                {[1, 2, 3].map((n, i) => (
                  <React.Fragment key={n}>
                    <span
                      className={`step-dot ${wizardStep >= n ? "done" : ""}`}
                    >
                      {n}
                    </span>
                    {i < 2 && (
                      <span
                        className={`step-line ${wizardStep > n ? "step-line--done" : ""}`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="wizard-step-label">
                {wizardStep === 1 && "Nome da tabela"}
                {wizardStep === 2 && "Colunas"}
                {wizardStep === 3 && "Configurações"}
              </div>
              <button className="wizard-close" onClick={closeWizard}>
                <i className="fi fi-rr-cross" />
              </button>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                PASSO 1 — Nome
                ══════════════════════════════════════════════════════════ */}
            {wizardStep === 1 && (
              <div className="wizard-body">
                <div>
                  <h2 className="wizard-title">Nova tabela</h2>
                  <p className="wizard-subtitle">
                    Dê um nome claro e objetivo para identificar sua tabela.
                  </p>
                </div>

                <div className="wizard-field">
                  <label htmlFor="nomeTabela">Nome da tabela</label>
                  <input
                    id="nomeTabela"
                    type="text"
                    autoFocus
                    maxLength={NOME_MAX}
                    placeholder="ex: clientes, produtos, pedidos..."
                    value={nomeTabela}
                    onChange={(e) => setNomeTabela(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleStep1Proximo()}
                    className={
                      nomeTabela.length > NOME_MAX ? "input-error" : ""
                    }
                  />
                  <span
                    className={`char-counter ${nomeTabela.length > NOME_MAX ? "over" : ""}`}
                  >
                    {nomeTabela.length}/{NOME_MAX}
                  </span>
                </div>

                <div className="wizard-footer">
                  <button className="btn-secondary" onClick={closeWizard}>
                    Cancelar
                  </button>
                  <button className="btn-primary" onClick={handleStep1Proximo}>
                    Próximo <i className="fi fi-rr-arrow-right" />
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                PASSO 2 — Colunas
                ══════════════════════════════════════════════════════════ */}
            {wizardStep === 2 && (
              <div className="wizard-body wizard-body--cols">
                <div className="wizard-step2-header">
                  <div>
                    <h2 className="wizard-title">Definir colunas</h2>
                    <p className="wizard-subtitle">
                      Configure cada coluna da tabela{" "}
                      <strong>"{nomeTabela}"</strong>.
                    </p>
                  </div>
                  <button className="btn-add-col" onClick={addColuna}>
                    <i className="fi fi-rr-plus" /> Coluna
                  </button>
                </div>

                <div className="cols-list">
                  {colunas.map((col, idx) => {
                    const fkDisabled = tabs.length === 0;

                    return (
                      <div key={col.id} className="col-card">
                        <div className="col-card-top">
                          <span className="col-num">#{idx + 1}</span>

                          <input
                            type="text"
                            className="col-nome-input"
                            placeholder="Ex: id, nome, email..."
                            value={col.nome}
                            maxLength={15}
                            onChange={(e) =>
                              updateColuna(col.id, "nome", e.target.value)
                            }
                          />

                          {/* Identificação */}
                          <div className="col-ident">
                            <span className="col-ident-label">
                              Identificação
                            </span>
                            <div className="col-ident-btns">
                              <button
                                type="button"
                                title="Chave Primária (PK)"
                                className={`ident-btn ident-btn--pk ${col.identificacao === "pk" ? "ident-btn--active" : ""}`}
                                onClick={() => handleTogglePK(col.id)}
                              >
                                <i className="fi fi-sr-key" />
                                <span>Chave Primária</span>
                              </button>
                              <button
                                type="button"
                                title={
                                  fkDisabled
                                    ? "Crie ao menos uma tabela para usar FK"
                                    : "Chave Estrangeira (FK)"
                                }
                                className={`ident-btn ident-btn--fk ${col.identificacao === "fk" ? "ident-btn--active" : ""} ${fkDisabled ? "ident-btn--disabled" : ""}`}
                                onClick={() =>
                                  !fkDisabled && handleToggleFK(col.id)
                                }
                                disabled={fkDisabled}
                              >
                                <i className="fi fi-rr-link" />
                                <span>Chave Estrangeira</span>
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="col-remove-btn"
                            onClick={() => removeColuna(col.id)}
                            disabled={colunas.length === 1}
                            title="Remover coluna"
                          >
                            <i className="fi fi-rr-trash" />
                            <span>Excluir</span>
                          </button>
                        </div>

                        {/* ─ FK selector ─ */}
                        {col.identificacao === "fk" && (
                          <div className="col-fk-panel">
                            <i className="fi fi-rr-link col-fk-icon" />
                            <select
                              className="fk-select"
                              value={col.fkTabela || ""}
                              onChange={(e) =>
                                handleFKTabelaChange(col.id, e.target.value)
                              }
                            >
                              <option value="">Selecione a tabela...</option>
                              {tabs.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name}
                                </option>
                              ))}
                            </select>

                            {col.fkTabela && (
                              <select
                                className="fk-select"
                                value={col.fkColuna || ""}
                                onChange={(e) =>
                                  handleFKColunaChange(col.id, e.target.value)
                                }
                              >
                                <option value="">
                                  Selecione a chave primária...
                                </option>
                                {getPKsDeTabela(col.fkTabela).map((pk) => (
                                  <option key={pk.nome} value={pk.nome}>
                                    {pk.nome}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        )}

                        {/* ─ Tipo de dado ─ */}
                        {col.identificacao === "pk" ? (
                          <div className="col-tipo-auto">
                            <i className="fi fi-rr-magic-wand" />
                            <span>Tipo definido automaticamente:</span>
                            <span className="col-tipo-badge">
                              Número Inteiro
                            </span>
                          </div>
                        ) : col.identificacao === "fk" ? (
                          col.tipoDado ? (
                            <div className="col-tipo-auto">
                              <i className="fi fi-rr-magic-wand" />
                              <span>Tipo herdado da chave primária:</span>
                              <span className="col-tipo-badge">
                                {col.tipoDado}
                              </span>
                            </div>
                          ) : (
                            <div className="col-tipo-auto col-tipo-auto--waiting">
                              <i className="fi fi-rr-info" />
                              <span>
                                Selecione a tabela e a chave primária acima para
                                herdar o tipo.
                              </span>
                            </div>
                          )
                        ) : (
                          <div className="col-tipo-section">
                            {/* Grupos */}
                            <div className="grupo-tabs">
                              {Object.keys(GRUPOS_TIPOS).map((g) => (
                                <button
                                  key={g}
                                  type="button"
                                  className={`grupo-tab ${col.grupo === g ? "grupo-tab--active" : ""}`}
                                  onClick={() => handleGrupoChange(col.id, g)}
                                >
                                  <i className={`fi ${GRUPO_ICONS[g]}`} />
                                  {g}
                                </button>
                              ))}
                            </div>

                            {/* Tipos do grupo */}
                            {col.grupo && (
                              <div className="tipo-pills">
                                {GRUPOS_TIPOS[col.grupo].map((t) => (
                                  <button
                                    key={t}
                                    type="button"
                                    className={`tipo-pill ${col.tipoDado === t ? "tipo-pill--active" : ""}`}
                                    onClick={() => handleTipoChange(col.id, t)}
                                  >
                                    {t}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="wizard-footer">
                  <button
                    className="btn-secondary"
                    onClick={() => setWizardStep(1)}
                  >
                    <i className="fi fi-rr-arrow-left" /> Voltar
                  </button>
                  <button className="btn-primary" onClick={handleStep2Proximo}>
                    Próximo <i className="fi fi-rr-arrow-right" />
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                PASSO 3 — Configurações
                ══════════════════════════════════════════════════════════ */}
            {wizardStep === 3 && (
              <div className="wizard-body wizard-body--cfg">
                <div>
                  <h2 className="wizard-title">Configurações das colunas</h2>
                  <p className="wizard-subtitle">
                    Ajuste as opções de cada coluna conforme necessário.
                  </p>
                </div>

                <div className="cfg-list">
                  {colunas
                    .filter((c) => c.nome.trim() && c.tipoDado)
                    .map((col) => {
                      const cat = getTipoCategoria(col.tipoDado);
                      const cfgs = cat ? CONFIGS_POR_CATEGORIA[cat] : [];
                      const toggles = cfgs.filter(
                        (k) => CONFIG_META[k]?.tipo === "toggle",
                      );
                      const inputs = cfgs.filter((k) =>
                        ["text", "number"].includes(CONFIG_META[k]?.tipo),
                      );
                      const hasTags = cfgs.includes("opcoes");

                      return (
                        <div key={col.id} className="cfg-card">
                          {/* Cabeçalho */}
                          <div className="cfg-card-header">
                            <span className="cfg-col-nome">{col.nome}</span>
                            <div className="cfg-col-meta">
                              {col.identificacao === "pk" && (
                                <span className="badge-pk">Chave Primária</span>
                              )}
                              {col.identificacao === "fk" && (
                                <span className="badge-fk">Chave Estrangeira</span>
                              )}
                              <span className="cfg-col-tipo">
                                {col.tipoDado}
                              </span>
                            </div>
                          </div>

                          {cfgs.length === 0 ? (
                            <p className="cfg-empty">
                              Nenhuma configuração disponível para este tipo.
                            </p>
                          ) : (
                            <div className="cfg-body">
                              {/* Toggles */}
                              {toggles.length > 0 && (
                                <div className="cfg-toggles">
                                  {toggles.map((key) => (
                                    <label
                                      key={key}
                                      className={`cfg-toggle ${col.config[key] ? "cfg-toggle--on" : ""}`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={!!col.config[key]}
                                        onChange={(e) =>
                                          updateConfig(
                                            col.id,
                                            key,
                                            e.target.checked,
                                          )
                                        }
                                      />
                                      <span className="cfg-toggle-dot" />
                                      {CONFIG_META[key].label}
                                    </label>
                                  ))}
                                </div>
                              )}

                              {/* Inputs de texto/número */}
                              {inputs.length > 0 && (
                                <div className="cfg-inputs">
                                  {inputs.map((key) => (
                                    <div key={key} className="cfg-input-field">
                                      <label>{CONFIG_META[key].label}</label>
                                      <input
                                        type={
                                          CONFIG_META[key].tipo === "number"
                                            ? "number"
                                            : "text"
                                        }
                                        value={col.config[key]}
                                        onChange={(e) =>
                                          updateConfig(
                                            col.id,
                                            key,
                                            e.target.value,
                                          )
                                        }
                                        placeholder={"Defina um " +CONFIG_META[key].label}
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Tags para opções */}
                              {hasTags && (
                                <div className="cfg-opcoes">
                                  <label>Opções disponíveis</label>
                                  <OpcoesInput
                                    opcoes={col.config.opcoes}
                                    onChange={(v) =>
                                      updateConfig(col.id, "opcoes", v)
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>

                <div className="wizard-footer">
                  <button
                    className="btn-secondary"
                    onClick={() => setWizardStep(2)}
                  >
                    <i className="fi fi-rr-arrow-left" /> Voltar
                  </button>
                  <button
                    className="btn-primary"
                    onClick={handleCriarTabela}
                    disabled={loadingCreate}
                  >
                    {loadingCreate ? (
                      <span className="btn-spinner" />
                    ) : (
                      <>
                        Criar tabela <i className="fi fi-rr-check" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
