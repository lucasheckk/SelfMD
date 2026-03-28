import React, { useState, useRef, useEffect, useCallback } from "react";
import "./System.scss";
import { SegundoMenu } from "../../components/SegundoMenu/SegundoMenu";
import { Notificacao } from "../../components/Notificacao/Notificacao";
import { TourGuide } from "../../components/TourGuide/TourGuide";
import { API, TABELA_CRUD_ROUTES, COLUNA_CRUD_ROUTES, DADOS_CRUD_ROUTES } from "../../../constants/api_rest.js";

// ─── Constantes ──────────────────────────────────────────────────────────────
const TIPOS_DADO = ["Texto", "Número", "Data", "Booleano", "Lista", "JSON"];

const CONFIG_OPCOES = [
  { key: "naoNulo",    label: "Não nulo" },
  { key: "unico",      label: "Único" },
  { key: "indexado",   label: "Indexado" },
  { key: "autoIncrem", label: "Auto-incremento" },
];

const NOME_MAX = 15;

const COLUNA_VAZIA = () => ({
  id:         Date.now() + Math.random(),
  nome:       "",
  primaryKey: false,
  tipoDado:   "",
  config:     { naoNulo: false, unico: false, indexado: false, autoIncrem: false },
});

// ─── Chave do localStorage para controlar se o tour já foi visto ─────────────
const TOUR_SEEN_KEY = "system_tour_seen";

// ─── Componente Principal ────────────────────────────────────────────────────
export function System() {
  const MIN_COL_WIDTH   = 60;
  const CHECKBOX_WIDTH  = 50;
  const ID_WIDTH        = 70;
  const ACTIONS_WIDTH   = 60;

  // ── Estado global ──────────────────────────────────────────────────────────
  const [tabs,          setTabs]          = useState([]);
  const [activeTab,     setActiveTab]     = useState(null);
  const [selectedRows,  setSelectedRows]  = useState([]);
  const [colWidths,     setColWidths]     = useState({});
  const [notifications, setNotifications] = useState([]);

  // ── Tour ───────────────────────────────────────────────────────────────────
  const [tourActive, setTourActive] = useState(false);

  // ── Estado do wizard de criação ────────────────────────────────────────────
  const [wizardOpen,    setWizardOpen]    = useState(false);
  const [wizardStep,    setWizardStep]    = useState(1);
  const [nomeTabela,    setNomeTabela]    = useState("");
  const [colunas,       setColunas]       = useState([COLUNA_VAZIA()]);
  const [loadingCreate, setLoadingCreate] = useState(false);

  const tabsRef = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const activeTabData = tabs.find((t) => t.id === activeTab);
  const rows          = activeTabData?.rows || [];
  const resizableCols = Object.keys(colWidths);

  const totalTableWidth =
    CHECKBOX_WIDTH +
    ID_WIDTH +
    resizableCols.reduce((acc, col) => acc + colWidths[col], 0) +
    ACTIONS_WIDTH;

  // ─── Notificações ──────────────────────────────────────────────────────────
  const pushNotification = useCallback((type, title, message, duration = 4000) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, title, message, duration }]);
  }, []);

  // ─── Indicador de tab ──────────────────────────────────────────────────────
  useEffect(() => {
    const el = tabsRef.current[activeTab];
    if (el) setIndicatorStyle({ left: `${el.offsetLeft}px`, width: `${el.offsetWidth}px` });
  }, [activeTab, tabs]);

  // ─── Seleção ──────────────────────────────────────────────────────────────
  const toggleSelectAll = () => {
    if (selectedRows.length === rows.length && rows.length > 0) setSelectedRows([]);
    else setSelectedRows(rows.map((r) => r.id));
  };

  const toggleSelectRow = (id) =>
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const deleteSelected = () => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTab
          ? { ...tab, rows: tab.rows.filter((r) => !selectedRows.includes(r.id)) }
          : tab
      )
    );
    setSelectedRows([]);
  };

  // ─── Resize coluna ────────────────────────────────────────────────────────
  const handleMouseDown = (e, colName) => {
    e.preventDefault();
    const startX     = e.pageX;
    const startWidth = colWidths[colName];
    const MAX        = 580;

    document.body.style.cursor     = "col-resize";
    document.body.style.userSelect = "none";

    const onMove = (ev) => {
      const w = Math.max(MIN_COL_WIDTH, Math.min(startWidth + (ev.pageX - startX), MAX));
      setColWidths((prev) => ({ ...prev, [colName]: w }));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor     = "default";
      document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  // ─── Wizard helpers ───────────────────────────────────────────────────────
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

  const handleProximo = () => {
    const nome = nomeTabela.trim();
    if (!nome) {
      pushNotification("warning", "Nome obrigatório", "Informe um nome para a tabela antes de continuar.");
      return;
    }
    if (nome.length > NOME_MAX) {
      pushNotification("error", "Nome muito longo", `O nome não pode ultrapassar ${NOME_MAX} caracteres.`);
      return;
    }
    setWizardStep(2);
  };

  // ─── Coluna helpers ───────────────────────────────────────────────────────
  const addColuna = () => setColunas((prev) => [...prev, COLUNA_VAZIA()]);

  const removeColuna = (id) =>
    setColunas((prev) => prev.filter((c) => c.id !== id));

  const updateColuna = (id, field, value) =>
    setColunas((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );

  const updateConfig = (id, key, checked) =>
    setColunas((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, config: { ...c.config, [key]: checked } } : c
      )
    );

  // ─── Criar tabela (API) ───────────────────────────────────────────────────
  const handleCriarTabela = async () => {
    const colsValidas = colunas.filter((c) => c.nome.trim() && c.tipoDado);
    if (colsValidas.length === 0) {
      pushNotification("warning", "Sem colunas", "Adicione pelo menos uma coluna com nome e tipo definidos.");
      return;
    }

    const payload = {
      nome: nomeTabela.trim(),
      colunas: colsValidas.map((c) => ({
        nome:       c.nome.trim(),
        primaryKey: c.primaryKey,
        tipoDado:   c.tipoDado,
        config:     c.config,
      })),
    };

    setLoadingCreate(true);
    try {
      const res = await fetch(TABELA_CRUD_ROUTES.CRIAR, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      const newWidths = {};
      colsValidas.forEach((c) => { newWidths[c.nome.trim()] = 150; });

      const newTab = {
        id:   data?.id || Date.now(),
        name: payload.nome,
        rows: [],
        cols: colsValidas,
      };

      setTabs((prev) => [...prev, newTab]);
      setActiveTab(newTab.id);
      setColWidths(newWidths);
      setSelectedRows([]);
      closeWizard();
      pushNotification("success", "Tabela criada!", `A tabela "${payload.nome}" foi criada com sucesso.`);
    } catch (err) {
      console.error(err);
      pushNotification("error", "Erro ao criar tabela", "Não foi possível conectar-se à API. Verifique sua conexão ou tente novamente.");
    } finally {
      setLoadingCreate(false);
    }
  };

  // ─── Tour: abre automaticamente na primeira visita ────────────────────────
  // O tour só abre quando há pelo menos uma tabela criada (para que os
  // seletores da tabela existam no DOM). Se não houver tabelas, o botão
  // "Clique aqui" do empty-state abre o tour manualmente.
  const handleStartTour = () => setTourActive(true);

  const handleFinishTour = useCallback(() => {
    setTourActive(false);
    localStorage.setItem(TOUR_SEEN_KEY, "1");
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="system-container">
      <SegundoMenu />
      <Notificacao notifications={notifications} setNotifications={setNotifications} />

      {/* Tour sobrepõe tudo */}
      {tourActive && <TourGuide onFinish={handleFinishTour} />}

      <main className="main-layout">

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
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
          {tabs.length > 0 && <div className="tab-indicator" style={indicatorStyle} />}
          <button className="new-tab-btn" onClick={openWizard} title="Nova tabela">
            <i className="fi fi-rr-plus"></i>
          </button>
        </div>

        {/* ── Conteúdo ────────────────────────────────────────────────────── */}
        <div className="content-area">

          {tabs.length === 0 ? (
            /* ── Empty state ────────────────────────────────────────────── */
            <div className="empty-state">
              <h2 className="empty-title">Primeira vez? Não se preocupe!</h2>
              <p className="empty-desc">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); handleStartTour(); }}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Clique aqui
                </a>{" "}
                para criar sua primeira tabela e começar a usar o sistema.
              </p>
            </div>
          ) : (
            <>
              {/* ── Header ─────────────────────────────────────────────── */}
              <div className="table-header">
                <span className="qtd-reg">Registros</span>
                <span className="row-counter">{activeTabData?.rows?.length || 0}</span>

                {/* Botão de tour — sempre disponível quando há tabelas */}
                <button
                  className="tour-trigger-btn"
                  onClick={handleStartTour}
                  title="Ver tour do sistema"
                >
                  <i className="fi fi-rr-map-marker-question"></i>
                  Tour
                </button>
              </div>

              {/* ── Selection bar ──────────────────────────────────────── */}
              <div className={`selection-bar ${selectedRows.length > 0 ? "active-selection" : ""}`}>
                {selectedRows.length > 0 ? (
                  <>
                    <span>{selectedRows.length} item(s) selecionado(s)</span>
                    <button className="delete-selection-btn" onClick={deleteSelected}>
                      <i className="fi fi-sr-trash"></i>
                      Apagar
                    </button>
                  </>
                ) : (
                  <span className="empty-selection">Nenhum item selecionado</span>
                )}
              </div>

              {/* ── Tabela ─────────────────────────────────────────────── */}
              <div className="table-scroll-area">
                <div className="table-wrapper">
                  <table className="custom-table" style={{ width: `${totalTableWidth}px` }}>
                    <colgroup>
                      <col style={{ width: `${CHECKBOX_WIDTH}px` }} />
                      <col style={{ width: `${ID_WIDTH}px` }} />
                      {resizableCols.map((col) => (
                        <col key={col} style={{ width: `${colWidths[col]}px` }} />
                      ))}
                      <col style={{ width: `${ACTIONS_WIDTH}px` }} />
                    </colgroup>

                    <thead>
                      <tr>
                        <th className="checkbox-col sticky-col sticky-checkbox">
                          <button className="select-all-btn" onClick={toggleSelectAll}>
                            <i className={`fi ${
                              selectedRows.length === rows.length && rows.length > 0
                                ? "fi-rr-square-minus"
                                : "fi-rr-square-plus"
                            }`}></i>
                          </button>
                        </th>
                        <th className="id-col sticky-col sticky-id">
                          <div className="cell-content">ID</div>
                        </th>
                        {resizableCols.map((col) => (
                          <th key={col} className="resizable-col">
                            <div className="cell-content">
                              <span className="col-label">{col.toUpperCase()}</span>
                              <button
                                className="resizer-btn"
                                onMouseDown={(e) => handleMouseDown(e, col)}
                                title="Redimensionar coluna"
                              >
                                <i className="fi fi-sr-arrows-alt-h"></i>
                              </button>
                            </div>
                          </th>
                        ))}
                        <th className="actions-header sticky-col sticky-actions">
                          <div className="actions-cell-content">
                            <button title="Configurar Colunas">
                              <i className="fi fi-rr-settings"></i>
                            </button>
                            <button title="Excluir Colunas">
                              <i className="fi fi-rr-cross-circle"></i>
                            </button>
                          </div>
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {rows.length === 0 ? (
                        <tr>
                          <td colSpan={3 + resizableCols.length} className="empty-rows-cell">
                            <span>Nenhum registro ainda. Adicione o primeiro!</span>
                          </td>
                        </tr>
                      ) : (
                        rows.map((row) => (
                          <tr
                            key={row.id}
                            className={selectedRows.includes(row.id) ? "row-selected" : ""}
                          >
                            <td className="checkbox-col sticky-col sticky-checkbox">
                              <button className="custom-checkbox" onClick={() => toggleSelectRow(row.id)}>
                                <i className={`fi ${
                                  selectedRows.includes(row.id)
                                    ? "fi-sr-angle-square-right"
                                    : "fi-rr-square"
                                }`}></i>
                              </button>
                            </td>
                            <td className="id-cell sticky-col sticky-id">{row.id}</td>
                            {resizableCols.map((col) => (
                              <td key={col} className="data-cell">{row[col]}</td>
                            ))}
                            <td className="actions-cell sticky-col sticky-actions">
                              <div className="actions-container">
                                <button><i className="fi fi-rr-file-edit editar"></i></button>
                                <button><i className="fi fi-rr-delete-document remover"></i></button>
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

      {/* ── Wizard Overlay ──────────────────────────────────────────────────── */}
      {wizardOpen && (
        <div className="wizard-overlay" onClick={closeWizard}>
          <div className="wizard-card" onClick={(e) => e.stopPropagation()}>

            <div className="wizard-header">
              <div className="wizard-steps">
                <span className={`step-dot ${wizardStep >= 1 ? "done" : ""}`}>1</span>
                <span className="step-line" />
                <span className={`step-dot ${wizardStep >= 2 ? "done" : ""}`}>2</span>
              </div>
              <button className="wizard-close" onClick={closeWizard}>
                <i className="fi fi-rr-cross"></i>
              </button>
            </div>

            {wizardStep === 1 && (
              <div className="wizard-body">
                <h2 className="wizard-title">Nova tabela</h2>
                <p className="wizard-subtitle">Dê um nome claro e objetivo para identificar sua tabela.</p>

                <div className="wizard-field">
                  <label htmlFor="nomeTabela">Nome da tabela</label>
                  <input
                    id="nomeTabela"
                    type="text"
                    autoFocus
                    maxLength={NOME_MAX + 1}
                    placeholder="ex: clientes, produtos, pedidos..."
                    value={nomeTabela}
                    onChange={(e) => setNomeTabela(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleProximo()}
                    className={nomeTabela.length > NOME_MAX ? "input-error" : ""}
                  />
                  <span className={`char-counter ${nomeTabela.length > NOME_MAX ? "over" : ""}`}>
                    {nomeTabela.length}/{NOME_MAX}
                  </span>
                </div>

                <div className="wizard-footer">
                  <button className="btn-secondary" onClick={closeWizard}>Cancelar</button>
                  <button className="btn-primary" onClick={handleProximo}>
                    Próximo
                    <i className="fi fi-rr-arrow-right"></i>
                  </button>
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="wizard-body wizard-body--cols">
                <div className="wizard-step2-header">
                  <div>
                    <h2 className="wizard-title">Definir colunas</h2>
                    <p className="wizard-subtitle">Configure as colunas da tabela <strong>"{nomeTabela}"</strong>.</p>
                  </div>
                  <button className="btn-add-col" onClick={addColuna} title="Adicionar coluna">
                    <i className="fi fi-rr-plus"></i>
                    Coluna
                  </button>
                </div>

                <div className="cols-list">
                  <div className="cols-grid cols-grid-header">
                    <span>Nome</span>
                    <span className="center">PK</span>
                    <span>Tipo de dado</span>
                    <span>Configurações</span>
                    <span></span>
                  </div>

                  {colunas.map((col) => (
                    <div key={col.id} className="cols-grid cols-grid-row">
                      <input
                        type="text"
                        placeholder="nome_coluna"
                        value={col.nome}
                        maxLength={64}
                        onChange={(e) => updateColuna(col.id, "nome", e.target.value)}
                        className="col-input"
                      />

                      <div className="center">
                        <button
                          className={`pk-btn ${col.primaryKey ? "pk-active" : ""}`}
                          onClick={() => updateColuna(col.id, "primaryKey", !col.primaryKey)}
                          title="Primary Key"
                        >
                          <i className={`fi ${col.primaryKey ? "fi-sr-key" : "fi-rr-key"}`}></i>
                        </button>
                      </div>

                      <div className="tipo-options">
                        {TIPOS_DADO.map((tipo) => (
                          <button
                            key={tipo}
                            className={`tipo-btn ${col.tipoDado === tipo ? "tipo-active" : ""}`}
                            onClick={() => updateColuna(col.id, "tipoDado", tipo)}
                          >
                            {tipo}
                          </button>
                        ))}
                      </div>

                      <div className="config-options">
                        {CONFIG_OPCOES.map((opt) => (
                          <label key={opt.key} className={`config-label ${col.config[opt.key] ? "config-active" : ""}`}>
                            <input
                              type="checkbox"
                              checked={col.config[opt.key]}
                              onChange={(e) => updateConfig(col.id, opt.key, e.target.checked)}
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>

                      <button
                        className="col-remove-btn"
                        onClick={() => removeColuna(col.id)}
                        title="Remover coluna"
                        disabled={colunas.length === 1}
                      >
                        <i className="fi fi-rr-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="wizard-footer">
                  <button className="btn-secondary" onClick={() => setWizardStep(1)}>
                    <i className="fi fi-rr-arrow-left"></i>
                    Voltar
                  </button>
                  <button
                    className="btn-primary"
                    onClick={handleCriarTabela}
                    disabled={loadingCreate}
                  >
                    {loadingCreate ? (
                      <span className="btn-spinner"></span>
                    ) : (
                      <>
                        <i className="fi fi-rr-check"></i>
                        Criar tabela
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