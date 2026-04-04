import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./System.scss";
import { SegundoMenu } from "../../components/SegundoMenu/SegundoMenu";
import { Notificacao } from "../../components/Notificacao/Notificacao";
import { TourGuide } from "../../components/TourGuide/TourGuide";
import { motion, AnimatePresence } from "framer-motion";
import {
  API,
  TABELA_CRUD_ROUTES,
  COLUNA_CRUD_ROUTES,
} from "../../../constants/api_rest.js";

const fadeOutVariants = {
  hidden: { opacity: 0, scale: 1 },
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

// ═══════════════════════════════════════════════════════════════════════════
// ─── Constantes de tipo
// ═══════════════════════════════════════════════════════════════════════════

const GRUPOS_TIPOS = {
  Texto: ["Texto", "Email", "CPF", "Telefone"],
  Numérico: ["Número Decimal", "Número Inteiro", "Moeda"],
  Tempo: ["Hora", "Data", "Data / Hora"],
  Avançado: ["Booleano", "Cálculo"],
};

// Mapa de tipos do frontend → API
const MAPA_TIPOS_API = {
  Texto: "texto",
  Email: "email",
  "Número Decimal": "numero_dec",
  "Número Inteiro": "numero_int",
  CPF: "cpf",
  Telefone: "telefone",
  Moeda: "moeda",
  Hora: "hora",
  Data: "data",
  "Data / Hora": "data_hora",
  Booleano: "boleano",
  Cálculo: "calculo",
};

const GRUPO_ICONS = {
  Texto: "fi-sr-text",
  Numérico: "fi-sr-calculator",
  Tempo: "fi-sr-calendar",
  Seleção: "fi-sr-list",
  Avançado: "fi-sr-settings-sliders",
};

const MOEDAS = [
  { id: "BRL", label: "Real", simbolo: "R$", mascara: "R$ #.###,##" },
  { id: "USD", label: "Dólar", simbolo: "$", mascara: "$ #,###.##" },
  { id: "EUR", label: "Euro", simbolo: "€", mascara: "€ #.###,##" },
  { id: "GBP", label: "Libra", simbolo: "£", mascara: "£ #,###.##" },
  { id: "JPY", label: "Iene / Yuan", simbolo: "¥", mascara: "¥ #,###" },
];

const MASCARA_AUTO = {
  CPF: "###.###.###-##",
  Telefone: "+## (##) #####-####",
};

// ─── Categoria de config por tipo ─────────────────────────────────────────
const getTipoCategoria = (tipo) => {
  if (["Texto", "Email", "CPF", "Telefone"].includes(tipo)) return "texto";
  if (tipo === "Descrição") return "textoLongo";
  if (["Número Inteiro", "Número Decimal", "Moeda"].includes(tipo))
    return "numerico";
  if (["Hora", "Data", "Data / Hora"].includes(tipo)) return "temporal";
  if (tipo === "Booleano") return "booleano";
  if (tipo === "Cálculo") return "calculo";
  return null;
};

const CONFIGS_POR_CATEGORIA = {
  texto: ["naoVazio", "alcanceMaximo", "unico", "mascara"],

  numerico: [
    "naoVazio",
    "valorPadrao",
    "valorMinimo",
    "valorMaximo",
    "autoIncremento",
    "mascara",
  ],

  temporal: ["naoVazio", "valorPadrao", "indice"],
  booleano: ["naoVazio", "valorPadrao"],
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
};

// Chaves bloqueadas para PK/FK (todas exceto valorPadrao)
// Usa as MESMAS chaves do CONFIG_META / CONFIG_PADRAO
const CONFIGS_BLOQUEADAS_IDENT = [
  "naoVazio",
  "unico",
  "autoIncremento",
  "indice",
  "alcanceMaximo",
  "valorMinimo",
  "valorMaximo",
  "mascara",
];

// ─── CONFIG_PADRAO usa as mesmas chaves camelCase do CONFIG_META ──────────
// Isso garante que col.config[key] funcione corretamente no passo 3
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
};

// ─── Mapeia as chaves camelCase do frontend para snake_case da API ────────
const mapConfigParaApi = (config, tipoDado, isForeignKey) => {
  const isNumeric = ["numero_int", "numero_dec", "moeda"].includes(tipoDado);
  let defaultValue = config.valorPadrao;
  if (defaultValue === "" || defaultValue === null) defaultValue = null;
  else if (isNumeric && !isNaN(defaultValue))
    defaultValue = Number(defaultValue);

  const rawConfig = {
    not_null: config.naoVazio || false,
    unique: config.unico || false,
    auto_increment: config.autoIncremento || false,
    index: config.indice || false,
    mask: config.mascara || "",
    moeda: config.moeda && config.moeda !== "" ? config.moeda : null,
  };

  // Só adiciona se tiver valor válido (não null/undefined/vazio)
  if (defaultValue !== null) rawConfig.default_value = defaultValue;
  if (config.alcanceMaximo !== "" && config.alcanceMaximo !== null)
    rawConfig.max_length = Number(config.alcanceMaximo);
  if (config.valorMinimo !== "" && config.valorMinimo !== null)
    rawConfig.min_value = Number(config.valorMinimo);
  if (config.valorMaximo !== "" && config.valorMaximo !== null)
    rawConfig.max_value = Number(config.valorMaximo);

  return rawConfig;
};

const NOME_MAX = 15;
const TOUR_SEEN_KEY = "system_tour_seen";

const COLUNA_VAZIA = () => ({
  id: Math.random().toString(36).substr(2, 9),
  nome: "",
  identificacao: null,
  fkTabela: null,
  fkColunaId: null,
  grupo: null,
  tipoDado: null,
  config: { ...CONFIG_PADRAO, opcoes: [] },
});

// ═══════════════════════════════════════════════════════════════════════════
// ─── Sub-componente: input de opções (tags)
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
// ─── Componente Principal
// ═══════════════════════════════════════════════════════════════════════════
export function System() {
  const MIN_COL_WIDTH = 60;
  const CHECKBOX_WIDTH = 50;
  const ACTIONS_WIDTH = 60;

  const location = useLocation();
  const navigate = useNavigate();
  const idDoDatabaseAtual = location.state?.dbId;

  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [colWidths, setColWidths] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [tourActive, setTourActive] = useState(false);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [nomeTabela, setNomeTabela] = useState("");
  const [colunas, setColunas] = useState([COLUNA_VAZIA()]);
  const [loadingCreate, setLoadingCreate] = useState(false);

  const [tabelaParaExcluir, setTabelaParaExcluir] = useState(null);
  const [confirmacaoExclusaoTabela, setConfirmacaoExclusaoTabela] =
    useState("");

  const tabsRef = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const activeTabData = tabs.find((t) => t.id === activeTab);
  const rows = activeTabData?.rows || [];
  const resizableCols = activeTabData?.cols?.map((c) => c.nome) || [];
  const totalTableWidth =
    CHECKBOX_WIDTH +
    resizableCols.reduce((acc, col) => acc + colWidths[col], 0) +
    ACTIONS_WIDTH;

  // ── Segurança: redireciona se não há database selecionada ─────────────────
  useEffect(() => {
    if (!idDoDatabaseAtual) navigate("/database");
  }, [idDoDatabaseAtual, navigate]);

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

  // ── Carregar tabelas da database ──────────────────────────────────────────
  const carregarDados = useCallback(async () => {
    const idDb = idDoDatabaseAtual || localStorage.getItem("lastDbId");
    if (!idDb) return;
    try {
      const response = await API.get(TABELA_CRUD_ROUTES.LISTAR(idDb));
      const tabelasFormatadas = response.data.map((tab) => ({
        id: tab.id,
        name: tab.nomeTabela,
        rows: tab.dados || [],
        cols: (tab.colunas || []).map((col) => ({
          id: col.id,
          nome: col.nomeColuna,
          tipoDado: col.tipoDado,
          identificacao: col.isPrimaryKey ? "pk" : null,
        })),
      }));
      setTabs(tabelasFormatadas);
      if (tabelasFormatadas.length > 0 && !activeTab) {
        setActiveTab(tabelasFormatadas[0].id);
      }
    } catch (err) {
      console.error("Erro ao carregar tabelas:", err);
      pushNotification(
        "error",
        "Erro",
        err.response?.data?.message ||
          "Falha ao sincronizar com o banco de dados.",
      );
    }
  }, [idDoDatabaseAtual, activeTab, pushNotification]);

  useEffect(() => {
    if (idDoDatabaseAtual) localStorage.setItem("lastDbId", idDoDatabaseAtual);
    carregarDados();
  }, [idDoDatabaseAtual, carregarDados]);

  useEffect(() => {
    if (activeTab && tabs.length > 0) {
      const tabAtual = tabs.find((t) => t.id === activeTab);
      if (tabAtual) {
        const novasLarguras = {};
        tabAtual.cols.forEach((c) => {
          novasLarguras[c.nome] = 150;
        });
        setColWidths(novasLarguras);
      }
    }
  }, [activeTab, tabs]);

  // ── Seleção ───────────────────────────────────────────────────────────────
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
    const startX = e.pageX;
    const startWidth = colWidths[colName];

    const onMove = (ev) => {
      const newWidth = Math.max(
        MIN_COL_WIDTH,
        startWidth + (ev.pageX - startX),
      );
      setColWidths((prev) => ({
        ...prev,
        [colName]: newWidth,
      }));
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

  // ── Wizard ────────────────────────────────────────────────────────────────
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

  // ── Coluna helpers ────────────────────────────────────────────────────────
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

  // ── PK ───────────────────────────────────────────────────────────────────
  const handleTogglePK = (id) => {
    setColunas((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (c.identificacao === "pk") {
          return {
            ...c,
            identificacao: null,
            grupo: null,
            tipoDado: null,
            config: { ...CONFIG_PADRAO, opcoes: [] },
          };
        }
        return {
          ...c,
          identificacao: "pk",
          fkTabela: null,
          fkColunaId: null,
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

  // ── FK ───────────────────────────────────────────────────────────────────
  const handleToggleFK = (id) => {
    setColunas((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (c.identificacao === "fk") {
          return {
            ...c,
            identificacao: null,
            fkTabela: null,
            fkColunaId: null,
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
    return tab?.cols?.filter((c) => c.identificacao === "pk") ?? [];
  };

  const handleFKTabelaChange = (colId, tabelaId) => {
    const idNum = parseInt(tabelaId, 10);

    setColunas((prev) =>
      prev.map((c) =>
        c.id !== colId
          ? c
          : {
              ...c,
              fkTabela: idNum,
              fkColunaId: null,
              grupo: null,
              tipoDado: null,
            },
      ),
    );
  };

  const handleFKColunaChange = (colId, pkColId, pkColNome) => {
    const col = colunas.find((c) => c.id === colId);
    const tab = tabs.find((t) => String(t.id) === String(col?.fkTabela));
    const pkCol = tab?.cols?.find((c) => c.id === pkColId); // busca por ID
    if (!pkCol) return;
    setColunas((prev) =>
      prev.map((c) =>
        c.id !== colId
          ? c
          : {
              ...c,
              fkColunaId: pkColId,
              fkColunaNome: pkColNome,
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

  // ── Grupo / Tipo com máscaras automáticas ─────────────────────────────────
  const handleGrupoChange = (id, grupo) =>
    setColunas((prev) =>
      prev.map((c) => (c.id === id ? { ...c, grupo, tipoDado: null } : c)),
    );

  const handleTipoChange = (id, tipo) => {
    setColunas((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newConfig = { ...c.config };
        if (MASCARA_AUTO[tipo]) {
          newConfig.mascara = MASCARA_AUTO[tipo];
        } else if (tipo !== "Moeda") {
          newConfig.mascara = "";
          newConfig.moeda = null;
        }
        if (tipo === "Moeda") {
          newConfig.mascara = "";
          newConfig.moeda = null;
        }
        return { ...c, tipoDado: tipo, config: newConfig };
      }),
    );
  };

  // ── Moeda ─────────────────────────────────────────────────────────────────
  const handleMoedaChange = (colId, moedaId) => {
    const moeda = MOEDAS.find((m) => m.id === moedaId);
    if (!moeda) return;
    setColunas((prev) =>
      prev.map((c) =>
        c.id !== colId
          ? c
          : {
              ...c,
              config: { ...c.config, moeda: moedaId, mascara: moeda.mascara },
            },
      ),
    );
  };

  // ── Criar tabela + colunas ────────────────────────────────────────────────
  const handleCriarTabela = async () => {
    const colsValidas = colunas.filter((c) => c.nome.trim() && c.tipoDado);

    if (colsValidas.length === 0) {
      pushNotification(
        "warning",
        "Sem colunas",
        "Adicione pelo menos uma coluna.",
      );
      return;
    }
    if (!idDoDatabaseAtual) {
      pushNotification("error", "Erro", "Database não identificada.");
      return;
    }

    setLoadingCreate(true);
    try {
      // 1. Cria a tabela
      const resTabela = await API.post(
        TABELA_CRUD_ROUTES.CRIAR(idDoDatabaseAtual),
        {
          nomeTabela: nomeTabela.trim(),
        },
      );

      const idTabelaCriada = resTabela.data.id;
      if (!idTabelaCriada)
        throw new Error("ID da tabela não retornado pelo servidor.");

      // 2. Cria as colunas em paralelo, mapeando config para snake_case
      const promises = colsValidas.map((col) => {
        const payload = {
          nomeColuna: col.nome.trim(),
          tipoDado: MAPA_TIPOS_API[col.tipoDado] || col.tipoDado,
          isPrimaryKey: col.identificacao === "pk",
          isForeignKey: col.identificacao === "fk",
          fkTabelaId: col.fkTabela || null,
          fkColunaId: col.fkColunaId || null,
          tabelaId: idTabelaCriada,
          config: mapConfigParaApi(
            col.config,
            MAPA_TIPOS_API[col.tipoDado],
            col.identificacao === "fk",
          ),
        };
        console.log("Payload da coluna:", payload);
        return API.post(COLUNA_CRUD_ROUTES.CRIAR, payload);
      });

      await Promise.all(promises);
      await carregarDados();

      const newTab = {
        id: idTabelaCriada,
        name: nomeTabela.trim(),
        rows: [],
        cols: colsValidas,
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTab(newTab.id);
      closeWizard();
      pushNotification(
        "success",
        "Sucesso!",
        `Tabela "${nomeTabela}" e suas colunas foram criadas.`,
      );
    } catch (err) {
      const errorData = err.response?.data;
      console.error("Erro detalhado:", errorData);
      pushNotification(
        "error",
        "Erro ao salvar",
        errorData?.message || errorData?.errors?.[0]?.message || err.message,
      );
    } finally {
      setLoadingCreate(false);
    }
  };

  // ── Excluir tabela ───────────────────────────────────────────────────────
  const handleExcluirTabela = async (idTabela) => {
    try {
      const response = await API.delete(TABELA_CRUD_ROUTES.EXCLUIR(idTabela));
      if (response.status === 200 || response.status === 204) {
        pushNotification(
          "success",
          "Sucesso!",
          "A tabela e seus dados foram apagados.",
        );
        setTabs((prev) => prev.filter((t) => t.id !== idTabela));
        if (activeTab === idTabela) setActiveTab(null);
        setTabelaParaExcluir(null);
        setConfirmacaoExclusaoTabela("");
      }
    } catch (error) {
      console.error("Erro ao excluir tabela:", error);
      pushNotification(
        "error",
        "Erro",
        error.response?.data?.message || "Erro ao excluir tabela.",
      );
    }
  };

  // ── Tour ──────────────────────────────────────────────────────────────────
  const handleFinishTour = useCallback(() => {
    setTourActive(false);
    localStorage.setItem(TOUR_SEEN_KEY, "1");
  }, []);

  const wizardCardClass = [
    "wizard-card",
    wizardStep === 2 ? "wizard-card--step2" : "",
    wizardStep === 3 ? "wizard-card--step3" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="system-container">
      <SegundoMenu />
      {/* Notificacao declarado UMA única vez */}
      <Notificacao
        notifications={notifications}
        setNotifications={setNotifications}
      />
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

        {/* ── Conteúdo ────────────────────────────────────────────────────── */}
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
                <div className="table-header-right">
                  <button className="action-header-btn">
                    <i className="fi fi-sr-add-document" /> Inserir registro
                  </button>
                  <button className="action-header-btn">
                    <i className="fi fi-sr-refresh" /> Recarregar dados
                  </button>
                  <button className="action-header-btn">
                    <i className="fi fi-sr-pencil" /> Renomear tabela
                  </button>
                  <button
                    className="apagar-tabela-btn"
                    onClick={() => {
                      if (activeTabData) {
                        setTabelaParaExcluir({
                          id: activeTabData.id,
                          nomeTabela: activeTabData.name,
                        });
                        setConfirmacaoExclusaoTabela("");
                      }
                    }}
                  >
                    <i className="fi fi-sr-remove-folder" /> Excluir tabela
                  </button>
                </div>
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
                        {resizableCols.map((col) => (
                          <th
                            key={col}
                            className="resizable-col"
                            style={{ width: `${colWidths[col]}px` }}
                          >
                            <div className="cell-content">
                              <span className="col-label">
                                {col.toUpperCase()}
                              </span>
                              {/* O resizer deve ser o último elemento da div */}
                              <button
                                className="resizer-handle"
                                onMouseDown={(e) => handleMouseDown(e, col)}
                              >
                                {/* Um ícone de barra vertical costuma ser melhor que o de setas */}
                                <div className="resizer-line" />
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
                          {/* O colSpan deve ser 2 (checkbox + ações) + número de colunas dinâmicas */}
                          <td
                            colSpan={2 + resizableCols.length}
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
                            {/* 1. Checkbox */}
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

                            {/* 2. REMOVIDO: a célula de ID fixa que estava aqui foi embora */}

                            {/* 3. Dados dinâmicos */}
                            {resizableCols.map((col) => (
                              <td key={col} className="data-cell">
                                {row[col]}
                              </td>
                            ))}

                            {/* 4. Ações */}
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

      {/* ══════════════════════════ WIZARD ════════════════════════════════ */}
      {wizardOpen && (
        <div className="wizard-overlay" onClick={closeWizard}>
          <div className={wizardCardClass} onClick={(e) => e.stopPropagation()}>
            {/* Cabeçalho */}
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

            {/* ── PASSO 1 ── */}
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

            {/* ── PASSO 2 ── */}
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

                          <div className="col-nome-wrap">
                            <span className="col-nome-label">
                              Nome da coluna
                            </span>
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
                          </div>

                          <div className="col-ident">
                            <span className="col-ident-label">Definição</span>
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
                                <i className="fi fi-sr-share" />
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
                            <i className="fi fi-sr-trash" />
                            <span>Excluir</span>
                          </button>
                        </div>

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
                                value={col.fkColunaId || ""}
                                onChange={(e) => {
                                  const pkId = parseInt(e.target.value);
                                  const pkCol = getPKsDeTabela(
                                    col.fkTabela,
                                  ).find((pk) => pk.id === pkId);
                                  if (pkCol)
                                    handleFKColunaChange(
                                      col.id,
                                      pkCol.id,
                                      pkCol.nome,
                                    );
                                }}
                              >
                                <option value="">
                                  Selecione a chave primária...
                                </option>
                                {getPKsDeTabela(col.fkTabela).map((pk) => (
                                  <option key={pk.id} value={pk.id}>
                                    {pk.nome}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        )}

                        {col.identificacao === "pk" ? (
                          <div className="col-tipo-auto">
                            <i className="fi fi-rr-magic-wand" />
                            <span>
                              Chave primária definida automaticamente!
                            </span>
                          </div>
                        ) : col.identificacao === "fk" ? (
                          col.tipoDado ? (
                            <div className="col-tipo-auto">
                              <i className="fi fi-rr-magic-wand fk" />
                              <span>Chave estrangeira definida!</span>
                            </div>
                          ) : (
                            <div className="col-tipo-auto col-tipo-auto--waiting">
                              <i className="fi fi-rr-info aviso" />
                              <span>
                                Selecione a tabela e a chave primária acima para
                                herdar o tipo.
                              </span>
                            </div>
                          )
                        ) : (
                          <div className="col-tipo-section">
                            <div className="grupo-tabs">
                              {Object.keys(GRUPOS_TIPOS).map((g) => (
                                <button
                                  key={g}
                                  type="button"
                                  className={`grupo-tab ${col.grupo === g ? "grupo-tab--active" : ""}`}
                                  onClick={() => handleGrupoChange(col.id, g)}
                                >
                                  <i className={`fi ${GRUPO_ICONS[g]}`} /> {g}
                                </button>
                              ))}
                            </div>
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
                            {col.tipoDado === "Moeda" && (
                              <div className="moeda-picker">
                                <span className="moeda-picker-label">
                                  Tipo de moeda
                                </span>
                                <div className="moeda-pills">
                                  {MOEDAS.map((m) => (
                                    <button
                                      key={m.id}
                                      type="button"
                                      className={`moeda-pill ${col.config.moeda === m.id ? "moeda-pill--active" : ""}`}
                                      onClick={() =>
                                        handleMoedaChange(col.id, m.id)
                                      }
                                    >
                                      <span className="moeda-simbolo">
                                        {m.simbolo}
                                      </span>
                                      <span className="moeda-label">
                                        {m.label}
                                      </span>
                                    </button>
                                  ))}
                                </div>
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

            {/* ── PASSO 3 ── */}
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
                      const locked =
                        col.identificacao === "pk" ||
                        col.identificacao === "fk";
                      const toggles = cfgs.filter(
                        (k) => CONFIG_META[k]?.tipo === "toggle",
                      );
                      const inputs = cfgs.filter((k) =>
                        ["text", "number"].includes(CONFIG_META[k]?.tipo),
                      );
                      const hasTags = cfgs.includes("opcoes");

                      return (
                        <div
                          key={col.id}
                          className={`cfg-card ${locked ? "cfg-card--locked" : ""}`}
                        >
                          <div className="cfg-card-header">
                            <span className="cfg-col-nome">{col.nome}</span>
                            <div className="cfg-col-meta">
                              {col.identificacao === "pk" && (
                                <span className="badge-pk">Chave Primária</span>
                              )}
                              {col.identificacao === "fk" && (
                                <span className="badge-fk">
                                  Chave Estrangeira
                                </span>
                              )}
                              <span className="cfg-col-tipo">
                                {col.tipoDado}
                              </span>
                            </div>
                          </div>

                          {locked && (
                            <div className="cfg-locked-notice">
                              <i className="fi fi-rr-lock" />
                              <span>
                                As configurações desta coluna são automáticas.
                                Apenas o valor padrão pode ser editado.
                              </span>
                            </div>
                          )}

                          {cfgs.length === 0 ? (
                            <p className="cfg-empty">
                              Nenhuma configuração disponível para este tipo.
                            </p>
                          ) : (
                            <div className="cfg-body">
                              {toggles.length > 0 && (
                                <div className="cfg-toggles">
                                  {toggles.map((key) => {
                                    const isBlocked =
                                      locked &&
                                      CONFIGS_BLOQUEADAS_IDENT.includes(key);
                                    return (
                                      <label
                                        key={key}
                                        className={`cfg-toggle ${col.config[key] ? "cfg-toggle--on" : ""} ${isBlocked ? "cfg-toggle--locked" : ""}`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={!!col.config[key]}
                                          disabled={isBlocked}
                                          onChange={(e) =>
                                            !isBlocked &&
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
                                    );
                                  })}
                                </div>
                              )}

                              {inputs.length > 0 && (
                                <div className="cfg-inputs">
                                  {inputs.map((key) => {
                                    const isBlocked =
                                      locked &&
                                      CONFIGS_BLOQUEADAS_IDENT.includes(key);
                                    const mascaraAuto =
                                      key === "mascara" &&
                                      !!MASCARA_AUTO[col.tipoDado];
                                    const bloqueado = isBlocked || mascaraAuto;
                                    return (
                                      <div
                                        key={key}
                                        className={`cfg-input-field ${bloqueado ? "cfg-input-field--locked" : ""}`}
                                      >
                                        <label>
                                          {CONFIG_META[key].label}
                                          {mascaraAuto && (
                                            <span className="cfg-auto-badge">
                                              auto
                                            </span>
                                          )}
                                        </label>
                                        <input
                                          type="text"
                                          inputMode={
                                            CONFIG_META[key].tipo === "number"
                                              ? "numeric"
                                              : "text"
                                          }
                                          value={col.config[key] ?? ""}
                                          disabled={bloqueado}
                                          onChange={(e) =>
                                            !bloqueado &&
                                            updateConfig(
                                              col.id,
                                              key,
                                              e.target.value,
                                            )
                                          }
                                          placeholder={
                                            bloqueado
                                              ? col.config[key] || "—"
                                              : `Defina ${CONFIG_META[key].label.toLowerCase()}`
                                          }
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {hasTags && !locked && (
                                <div className="cfg-opcoes">
                                  <label>Opções disponíveis</label>
                                  <OpcoesInput
                                    opcoes={col.config.opcoes ?? []}
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

      {/* ══════════════════════ MODAL EXCLUSÃO ════════════════════════════ */}
      <AnimatePresence mode="wait">
        {tabelaParaExcluir && (
          <div className="modal-overlay">
            <motion.div
              key="modal-exclusao-tabela"
              className="modal-exclusao-container"
              variants={fadeOutVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h2>Excluir a tabela {tabelaParaExcluir.nomeTabela}?</h2>
              <p>Essa ação apagará todos os registros vinculados.</p>
              <input
                type="text"
                value={confirmacaoExclusaoTabela}
                onChange={(e) => setConfirmacaoExclusaoTabela(e.target.value)}
                placeholder={`Digite "${tabelaParaExcluir.nomeTabela}" para confirmar`}
                autoFocus
              />
              <div className="acoes-exclusao">
                <button
                  className="btn-cancelar"
                  onClick={() => setTabelaParaExcluir(null)}
                >
                  <i className="fi-rr-trash-undo icon-modal" />
                </button>
                <button
                  className="btn-confirmar"
                  disabled={
                    confirmacaoExclusaoTabela !== tabelaParaExcluir.nomeTabela
                  }
                  onClick={() => handleExcluirTabela(tabelaParaExcluir.id)}
                >
                  <i className="fi-rr-trash-check icon-modal" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
