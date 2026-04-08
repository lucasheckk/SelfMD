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
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ─── Constantes de tipo
// ═══════════════════════════════════════════════════════════════════════════

const GRUPOS_TIPOS = {
  Texto: ["Texto", "Lista"],
  Numérico: ["Número Decimal", "Número Inteiro"],
  Tempo: ["Hora", "Data", "Data / Hora"],
  Avançado: ["Cálculo", "Boleano"],
  Pre_definido: ["Email", "CPF", "Telefone", "Moeda"],
};

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
  Lista: "lista",
  Boleano: "boleano",
  Cálculo: "calculo",
};

const GRUPO_ICONS = {
  Texto: "fi-sr-text",
  Numérico: "fi-sr-calculator",
  Tempo: "fi-sr-calendar",
  Avançado: "fi-sr-settings-sliders",
  Pre_definido: "fi-sr-crown",
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
  if (["Número Inteiro", "Número Decimal", "Moeda"].includes(tipo))
    return "numerico";
  if (["Hora", "Data", "Data / Hora"].includes(tipo)) return "temporal";
  if (["Email", "CPF", "Telefone", "Moeda"].includes(tipo))
    return "pre_definido";
  if (tipo === "Boleano") return "boleano";
  if (tipo === "Cálculo") return "calculo";
  if (tipo === "Lista") return "lista";
  return null;
};

const CONFIGS_POR_CATEGORIA = {
  texto: ["naoVazio", "alcanceMaximo", "unico"],
  numerico: [
    "naoVazio",
    "indice",
    "autoIncremento",
    "valorPadrao",
    "alcanceMaximo",
  ],
  temporal: ["naoVazio", "indice", "mascaraData"],
  boleano: ["naoVazio", "mascara"],
  calculo: ["naoVazio", "indice"],
  lista: ["naoVazio", "mascaraLista"],
};

const CONFIG_META = {
  naoVazio: { label: "Não vazio", tipo: "toggle" },
  unico: { label: "Único", tipo: "toggle" },
  autoIncremento: { label: "Auto-incremento", tipo: "toggle" },
  indice: { label: "Índice", tipo: "toggle" },
  valorPadrao: { label: "Valor padrão", tipo: "text" },
  alcanceMaximo: { label: "Alcance máximo", tipo: "number" },
  mascara: { label: "Máscara", tipo: "text" },
  mascaraLista: { label: "Máscara de itens", tipo: "select" },
  mascaraData: { label: "Formato de data", tipo: "select" },
};

const CONFIG_PADRAO = {
  naoVazio: false,
  unico: false,
  valorPadrao: "",
  alcanceMaximo: "",
  autoIncremento: false,
  indice: false,
  mascara: "",
};

const mapConfigParaApi = (config, tipoDado) => {
  const isNumeric = ["numero_int", "numero_dec", "moeda"].includes(tipoDado);
  let defaultValue = config.valorPadrao;
  if (defaultValue === "" || defaultValue == null) defaultValue = null;
  else if (isNumeric && !isNaN(defaultValue))
    defaultValue = Number(defaultValue);

  const out = {
    not_null: config.naoVazio || false,
    unique: config.unico || false,
    auto_increment: config.autoIncremento || false,
    index: config.indice || false,
    mask: config.mascara || "",
  };
  if (defaultValue !== null) out.default_value = defaultValue;
  if (config.alcanceMaximo !== "" && config.alcanceMaximo != null)
    out.max_length = Number(config.alcanceMaximo);
  return out;
};

const NOME_MAX = 15;
const TOUR_SEEN_KEY = "system_tour_seen";

const PRIMEIRA_COLUNA_PK = () => ({
  id: Math.random().toString(36).substr(2, 9),
  nome: "",
  identificacao: "pk",
  fkTabela: null,
  fkColunaId: null,
  grupo: "Numérico",
  tipoDado: "Número Inteiro",
  config: {
    ...CONFIG_PADRAO,
    naoVazio: true,
    autoIncremento: true,
    indice: true,
  },
});

const COLUNA_VAZIA = () => ({
  id: Math.random().toString(36).substr(2, 9),
  nome: "",
  identificacao: null,
  fkTabela: null,
  fkColunaId: null,
  grupo: null,
  tipoDado: null,
  config: { ...CONFIG_PADRAO },
});

// ═══════════════════════════════════════════════════════════════════════════
// ─── Validação de dados por tipo ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

const validarCampo = (valor, col) => {
  const v = String(valor ?? "").trim();

  if (col.identificacao === "pk") return null; 

  if (col.config?.naoVazio && v === "") {
    return `O campo "${col.nome}" é obrigatório.`;
  }
  if (v === "") return null; 

  switch (col.tipoDado) {
    case "Email":
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
        return `"${col.nome}" deve ser um e-mail válido.`;
      break;
    case "CPF":
      if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v))
        return `"${col.nome}" deve seguir o formato 000.000.000-00.`;
      break;
    case "Telefone":
      if (!/^\+\d{2} \(\d{2}\) \d{4,5}-\d{4}$/.test(v))
        return `"${col.nome}" deve seguir o formato +55 (99) 99999-9999.`;
      break;
    case "Número Inteiro":
      if (!/^-?\d+$/.test(v))
        return `"${col.nome}" deve ser um número inteiro.`;
      if (
        col.config?.alcanceMaximo &&
        v.length > Number(col.config.alcanceMaximo)
      )
        return `"${col.nome}" excede o alcance máximo de ${col.config.alcanceMaximo} caracteres.`;
      break;
    case "Número Decimal":
      if (!/^-?\d+([.,]\d+)?$/.test(v))
        return `"${col.nome}" deve ser um número decimal (ex: 3,14).`;
      break;
    case "Moeda":
      if (!/^[\d.,]+$/.test(v))
        return `"${col.nome}" deve conter apenas dígitos.`;
      break;
    case "Hora":
      if (!/^\d{2}:\d{2}(:\d{2})?$/.test(v))
        return `"${col.nome}" deve seguir o formato HH:MM ou HH:MM:SS.`;
      break;
    case "Data":
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v) && !/^\d{2}\/\d{2}\/\d{4}$/.test(v))
        return `"${col.nome}" deve ser uma data válida.`;
      break;
    case "Data / Hora":
      if (!v.includes("T") && !v.includes(" "))
        return `"${col.nome}" deve incluir data e hora.`;
      break;
    case "Boleano":
      if (!["true", "false", "sim", "não", "1", "0"].includes(v.toLowerCase()))
        return `"${col.nome}" deve ser verdadeiro ou falso.`;
      break;
    default:
      if (
        col.config?.alcanceMaximo &&
        v.length > Number(col.config.alcanceMaximo)
      )
        return `"${col.nome}" excede o alcance máximo de ${col.config.alcanceMaximo} caracteres.`;
  }
  return null;
};

const getPlaceholderPorTipo = (col) => {
  switch (col.tipoDado) {
    case "Email":
      return "exemplo@email.com";
    case "CPF":
      return "000.000.000-00";
    case "Telefone":
      return "+55 (99) 99999-9999";
    case "Número Inteiro":
      return "0";
    case "Número Decimal":
      return "0,00";
    case "Moeda":
      return "0,00";
    case "Hora":
      return "HH:MM";
    case "Data":
      return "AAAA-MM-DD";
    case "Data / Hora":
      return "AAAA-MM-DD HH:MM";
    case "Boleano":
      return "sim / não";
    case "Lista":
      return "Selecione...";
    default:
      return `Digite ${col.nome}...`;
  }
};

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
  const [colunas, setColunas] = useState([PRIMEIRA_COLUNA_PK()]);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loading, setLoading] = useState(false);

  const [tabelaParaExcluir, setTabelaParaExcluir] = useState(null);
  const [confirmacaoExclusaoTabela, setConfirmacaoExclusaoTabela] =
    useState("");

  // ── Estado de renomear tabela ─────────────────────────────────────────────
  const [renomearOpen, setRenomearOpen] = useState(false);
  const [novoNomeTabela, setNovoNomeTabela] = useState("");
  const [erroRenomear, setErroRenomear] = useState("");

  // ── Estado de inserir dados ───────────────────────────────────────────────
  const [inserirOpen, setInserirOpen] = useState(false);
  const [inserirValores, setInserirValores] = useState({});
  const [inserirErros, setInserirErros] = useState({});
  const [loadingInserir, setLoadingInserir] = useState(false);

  const tabsRef = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const activeTabData = tabs.find((t) => t.id === activeTab);
  const rows = activeTabData?.rows || [];
  const resizableCols = activeTabData?.cols?.map((c) => c.nome) || [];
  const totalTableWidth =
    CHECKBOX_WIDTH +
    resizableCols.reduce((acc, col) => acc + (colWidths[col] || 150), 0) +
    ACTIONS_WIDTH;

  // ── Segurança ─────────────────────────────────────────────────────────────
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

  // ── Carregar tabelas ──────────────────────────────────────────────────────
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
          config: col.config || {},
        })),
      }));
      setTabs(tabelasFormatadas);
      if (tabelasFormatadas.length > 0 && !activeTab) {
        setActiveTab(tabelasFormatadas[0].id);
      }
    } catch (err) {
      pushNotification(
        "error",
        "Erro",
        err.response?.data?.message || "Falha ao sincronizar.",
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
    const startX = e.pageX,
      startWidth = colWidths[colName] || 150;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    const onMove = (ev) => {
      const w = Math.max(MIN_COL_WIDTH, startWidth + (ev.pageX - startX));
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

  // ── Wizard ────────────────────────────────────────────────────────────────
  const openWizard = () => {
    setNomeTabela("");
    setColunas([PRIMEIRA_COLUNA_PK()]);
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
    const nomesPreenchidos = colunas
      .map((c) => c.nome.trim().toLowerCase())
      .filter((n) => n !== "");
    const duplicados = nomesPreenchidos.filter(
      (n, i) => nomesPreenchidos.indexOf(n) !== i,
    );
    if (duplicados.length > 0) {
      pushNotification(
        "warning",
        "Nomes duplicados",
        `Já existe outra coluna com o nome "${duplicados[0]}".`,
      );
      return;
    }
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

  const handleStep3Proximo = () => {
    setWizardStep(4);
  };

  // ── Coluna helpers ────────────────────────────────────────────────────────
  const addColuna = () => setColunas((prev) => [...prev, COLUNA_VAZIA()]);
  const removeColuna = (id) =>
    setColunas((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((c) => c.id !== id);
    });
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

  // ── PK ────────────────────────────────────────────────────────────────────
  const handleTogglePK = (id) => {
    const col = colunas.find((c) => c.id === id);
    if (!col) return;
    if (col.identificacao !== "pk") {
      const jaTemPK = colunas.some((c) => c.identificacao === "pk");
      if (jaTemPK) {
        pushNotification(
          "warning",
          "Uma PK por tabela",
          "Só é possível ter uma chave primária por tabela.",
        );
        return;
      }
    }
    setColunas((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (c.identificacao === "pk")
          return {
            ...c,
            identificacao: null,
            grupo: null,
            tipoDado: null,
            config: { ...CONFIG_PADRAO },
          };
        return {
          ...c,
          identificacao: "pk",
          fkTabela: null,
          fkColunaId: null,
          grupo: "Numérico",
          tipoDado: "Número Inteiro",
          config: {
            ...CONFIG_PADRAO,
            naoVazio: true,
            autoIncremento: true,
            valorPadrao: "0",
          },
        };
      }),
    );
  };

  // ── FK ────────────────────────────────────────────────────────────────────
  const handleToggleFK = (id) => {
    setColunas((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (c.identificacao === "fk")
          return {
            ...c,
            identificacao: null,
            fkTabela: null,
            fkColunaId: null,
            grupo: null,
            tipoDado: null,
            config: { ...CONFIG_PADRAO },
          };
        return {
          ...c,
          identificacao: "fk",
          fkTabela: null,
          fkColunaId: null,
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
    const pkCol = tab?.cols?.find((c) => c.id === pkColId);
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
              config: { ...pkCol.config },
            },
      ),
    );
  };

  // ── Grupo / Tipo ──────────────────────────────────────────────────────────
  const handleGrupoChange = (id, grupo) =>
    setColunas((prev) =>
      prev.map((c) => (c.id === id ? { ...c, grupo, tipoDado: null } : c)),
    );

  const handleTipoChange = (id, tipo) => {
    setColunas((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newConfig = { ...c.config };
        if (MASCARA_AUTO[tipo]) newConfig.mascara = MASCARA_AUTO[tipo];
        else if (tipo !== "Moeda") {
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
      const resTabela = await API.post(
        TABELA_CRUD_ROUTES.CRIAR(idDoDatabaseAtual),
        { nomeTabela: nomeTabela.trim() },
      );
      const idTabelaCriada = resTabela.data.id;
      if (!idTabelaCriada)
        throw new Error("ID da tabela não retornado pelo servidor.");

      const payloadColunas = colsValidas.map((col) => ({
        nomeColuna: col.nome.trim(),
        tipoDado: MAPA_TIPOS_API[col.tipoDado] || col.tipoDado,
        isPrimaryKey: col.identificacao === "pk",
        isForeignKey: col.identificacao === "fk",
        fkTabelaId: col.fkTabela || null,
        fkColunaId: col.fkColunaId || null,
        tabelaId: idTabelaCriada,
        config: mapConfigParaApi(col.config, MAPA_TIPOS_API[col.tipoDado]),
      }));

      await API.post(COLUNA_CRUD_ROUTES.CRIAR, payloadColunas);
      await carregarDados();
      setActiveTab(idTabelaCriada);
      closeWizard();
      pushNotification(
        "success",
        "Sucesso!",
        `Tabela "${nomeTabela}" criada com suas colunas.`,
      );
    } catch (err) {
      const errorData = err.response?.data;
      pushNotification(
        "error",
        "Erro ao salvar",
        errorData?.message || err.message,
      );
    } finally {
      setLoadingCreate(false);
    }
  };

  // ── Excluir tabela ────────────────────────────────────────────────────────
  const handleExcluirTabela = async (idTabela) => {
    try {
      const response = await API.delete(TABELA_CRUD_ROUTES.EXCLUIR(idTabela));
      if (response.status === 200 || response.status === 204) {
        pushNotification("success", "Sucesso!", "A tabela foi apagada.");
        setTabs((prev) => prev.filter((t) => t.id !== idTabela));
        if (activeTab === idTabela) setActiveTab(null);
        setTabelaParaExcluir(null);
        setConfirmacaoExclusaoTabela("");
      }
    } catch (error) {
      pushNotification(
        "error",
        "Erro",
        error.response?.data?.message || "Erro ao excluir tabela.",
      );
    }
  };

  const handleEditarTabela = async (idTabela, novoNome) => {
    if (!novoNome.trim()) {
      pushNotification(
        "warning",
        "Atenção",
        "O nome da tabela não pode estar vazio.",
      );
      return;
    }
    setLoading(true);
    try {
      await API.put(TABELA_CRUD_ROUTES.ATUALIZAR(idTabela), {
        nomeTabela: novoNome.trim(),
      });
      setTabs((prev) =>
        prev.map((t) =>
          t.id === idTabela ? { ...t, name: novoNome.trim() } : t,
        ),
      );
      pushNotification("success", "Sucesso", "Nome da tabela atualizado!");
    } catch (err) {
      const errorData = err.response?.data;
      pushNotification(
        "error",
        "Erro ao atualizar",
        errorData?.message || "Não foi possível renomear a tabela.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Renomear tabela (modal) ────────────────────────────────────────────────
  const openRenomear = () => {
    if (!activeTabData) return;
    setNovoNomeTabela(activeTabData.name);
    setErroRenomear("");
    setRenomearOpen(true);
  };

  const handleConfirmarRenomear = async () => {
    const nome = novoNomeTabela.trim();
    if (!nome) {
      setErroRenomear("O nome não pode estar vazio.");
      return;
    }
    if (nome.length > NOME_MAX) {
      setErroRenomear(`Máximo de ${NOME_MAX} caracteres.`);
      return;
    }
    const nomeExistente = tabs.some(
      (t) => t.id !== activeTab && t.name.toLowerCase() === nome.toLowerCase(),
    );
    if (nomeExistente) {
      setErroRenomear("Já existe uma tabela com este nome.");
      return;
    }
    setErroRenomear("");
    await handleEditarTabela(activeTab, nome);
    setRenomearOpen(false);
  };

  // ── Inserir dados ─────────────────────────────────────────────────────────
  const openInserir = () => {
    setInserirValores({});
    setInserirErros({});
    setInserirOpen(true);
  };

  const colsParaInserir =
    activeTabData?.cols?.filter((c) => c.identificacao !== "pk") || [];

  const handleInserirChange = (colNome, valor) => {
    setInserirValores((prev) => ({ ...prev, [colNome]: valor }));
    // Validação em tempo real
    const col = colsParaInserir.find((c) => c.nome === colNome);
    if (col) {
      const erro = validarCampo(valor, col);
      setInserirErros((prev) => ({ ...prev, [colNome]: erro }));
    }
  };

  const handleInserirSubmit = () => {
    // Valida todos os campos
    const novosErros = {};
    let temErro = false;
    colsParaInserir.forEach((col) => {
      const erro = validarCampo(inserirValores[col.nome] ?? "", col);
      if (erro) {
        novosErros[col.nome] = erro;
        temErro = true;
      }
    });
    setInserirErros(novosErros);
    if (temErro) return;

    // Insere o registro localmente (em produção faria API call)
    const novoRow = { id: Date.now() };
    colsParaInserir.forEach((col) => {
      novoRow[col.nome] = inserirValores[col.nome] ?? "";
    });

    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTab ? { ...tab, rows: [...tab.rows, novoRow] } : tab,
      ),
    );
    pushNotification(
      "success",
      "Registro inserido!",
      "Os dados foram adicionados à tabela.",
    );
    setInserirOpen(false);
    setInserirValores({});
    setInserirErros({});
  };

  const inserirFormValido =
    colsParaInserir.length > 0 &&
    Object.values(inserirErros).every((e) => !e) &&
    colsParaInserir
      .filter((c) => c.config?.naoVazio)
      .every((c) => inserirValores[c.nome]?.trim());

  const handleFinishTour = useCallback(() => {
    setTourActive(false);
    localStorage.setItem(TOUR_SEEN_KEY, "1");
  }, []);

  const wizardCardClass = [
    "wizard-card",
    wizardStep === 2 ? "wizard-card--step2" : "",
    wizardStep === 3 ? "wizard-card--step3" : "",
    wizardStep === 4 ? "wizard-card--step4" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // ── Helper: input alcanceMaximo ────────────────────────────────────────────
  const renderAlcanceMaximo = (col, bloqueado) => (
    <div
      key="alcanceMaximo"
      className={`cfg-input-field ${bloqueado ? "cfg-input-field--locked" : ""}`}
    >
      <label>
        {CONFIG_META.alcanceMaximo.label}
        <span className="cfg-max-hint">máx. 255</span>
      </label>
      <input
        type="text"
        inputMode="numeric"
        disabled={bloqueado}
        value={col.config.alcanceMaximo ?? ""}
        onChange={(e) => {
          if (bloqueado) return;
          const raw = e.target.value.replace(/\D/g, "");
          if (raw === "") {
            updateConfig(col.id, "alcanceMaximo", "");
            return;
          }
          const num = Math.min(parseInt(raw, 10), 255);
          updateConfig(col.id, "alcanceMaximo", String(num));
        }}
        placeholder="1 – 255"
      />
    </div>
  );

  // ─── Colunas válidas para o passo 4
  const colsValidasWizard = colunas.filter((c) => c.nome.trim() && c.tipoDado);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="system-container">
      <SegundoMenu />
      <Notificacao
        notifications={notifications}
        setNotifications={setNotifications}
      />
      {tourActive && <TourGuide onFinish={handleFinishTour} />}

      <main className="main-layout">
        {/* ── Tabs ──────────────────────────────────────────────────── */}
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

        {/* ── Conteúdo ──────────────────────────────────────────────── */}
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
                  <button className="action-header-btn" onClick={openInserir}>
                    <i className="fi fi-sr-add-document" /> Inserir registro
                  </button>
                  <button className="action-header-btn">
                    <i className="fi fi-sr-refresh" /> Recarregar dados
                  </button>
                  <button className="action-header-btn" onClick={openRenomear}>
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
                          style={{ width: `${colWidths[col] || 150}px` }}
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
                          <th key={col} className="resizable-col">
                            <div className="cell-content">
                              <span className="col-label">
                                {col.toUpperCase()}
                              </span>
                              <button
                                className="resizer-handle"
                                onMouseDown={(e) => handleMouseDown(e, col)}
                              >
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

      {/* ══════════════════════ WIZARD ════════════════════════════════════ */}
      {wizardOpen && (
        <div className="wizard-overlay" onClick={closeWizard}>
          <div className={wizardCardClass} onClick={(e) => e.stopPropagation()}>
            {/* Cabeçalho */}
            <div className="wizard-header">
              <div className="wizard-steps">
                {[1, 2, 3, 4].map((n, i) => (
                  <React.Fragment key={n}>
                    <span
                      className={`step-dot ${wizardStep >= n ? "done" : ""}`}
                    >
                      {n}
                    </span>
                    {i < 3 && (
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
                {wizardStep === 4 && "Prévia"}
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
                    const isPrimeira = idx === 0;
                    const fkDisabled = tabs.length === 0 || isPrimeira;

                    return (
                      <div key={col.id} className="col-card">
                        {/* Topo: nome + definição + excluir */}
                        <div className="col-card-top">
                          <span className="col-num">#{idx + 1}</span>

                          {/* Nome da coluna — contador DENTRO do input */}
                          <div className="col-nome-wrap">
                            <span className="col-nome-label">
                              NOME DA COLUNA
                            </span>
                            <div className="col-nome-input-wrapper">
                              <input
                                type="text"
                                className="col-nome-input"
                                placeholder="Ex: id, nome, email..."
                                value={col.nome}
                                maxLength={NOME_MAX}
                                onChange={(e) =>
                                  updateColuna(col.id, "nome", e.target.value)
                                }
                              />
                              <span
                                className={`col-nome-counter-inline ${col.nome.length >= NOME_MAX ? "col-nome-counter--over" : ""}`}
                              >
                                {col.nome.length}/{NOME_MAX}
                              </span>
                            </div>
                          </div>

                          {/* Definição: PK e FK */}
                          <div className="col-ident">
                            <span className="col-ident-label">DEFINIÇÃO</span>
                            <div className="col-ident-btns">
                              <button
                                type="button"
                                title="Chave Primária (PK)"
                                className={`ident-btn ident-btn--pk ${col.identificacao === "pk" ? "ident-btn--active" : ""} ${isPrimeira ? "ident-btn--locked-pk" : ""}`}
                                onClick={() =>
                                  !isPrimeira && handleTogglePK(col.id)
                                }
                                disabled={isPrimeira}
                              >
                                <i className="fi fi-sr-key" />
                                <span>Chave Primária</span>
                              </button>
                              <button
                                type="button"
                                title={
                                  fkDisabled
                                    ? isPrimeira
                                      ? "A primeira coluna é sempre PK"
                                      : "Crie ao menos uma tabela para usar FK"
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
                            disabled={isPrimeira || colunas.length === 1}
                            title={
                              isPrimeira
                                ? "A chave primária não pode ser removida"
                                : "Remover coluna"
                            }
                          >
                            <i className="fi fi-sr-trash" />
                            <span>Excluir</span>
                          </button>
                        </div>

                        {/* FK selector */}
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

                        {/* Tipo de dado */}
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
                      if (col.identificacao === "pk") {
                        return (
                          <div key={col.id} className="cfg-card cfg-card--pk">
                            <div className="cfg-card-header">
                              <div className="cfg-col-nome-group">
                                <span className="cfg-col-nome">{col.nome}</span>
                                <span className="cfg-col-desc">
                                  Configuração gerada automaticamente pelo
                                  sistema.
                                </span>
                              </div>
                              <div className="cfg-col-meta">
                                <span className="badge-pk">Chave Primária</span>
                                <i className="fi-sr-lock cadeado"></i>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      const cat = getTipoCategoria(col.tipoDado);
                      const cfgs = cat ? CONFIGS_POR_CATEGORIA[cat] : [];
                      const locked = col.identificacao === "fk";
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
                                    const isBlocked = locked;
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
                                        <span className="cfg-toggle-label">
                                          {CONFIG_META[key].label}
                                        </span>
                                      </label>
                                    );
                                  })}
                                </div>
                              )}
                              {inputs.length > 0 && (
                                <div className="cfg-inputs">
                                  {inputs.map((key) => {
                                    const isBlocked = locked;
                                    const mascaraAuto =
                                      key === "mascara" &&
                                      !!MASCARA_AUTO[col.tipoDado];
                                    const bloqueado = isBlocked || mascaraAuto;
                                    if (key === "alcanceMaximo")
                                      return renderAlcanceMaximo(
                                        col,
                                        bloqueado,
                                      );
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
                                  <OpcoesInputLocal
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
                  <button className="btn-primary" onClick={handleStep3Proximo}>
                    Próximo <i className="fi fi-rr-arrow-right" />
                  </button>
                </div>
              </div>
            )}

            {/* ── PASSO 4 — PRÉVIA DA TABELA ── */}
            {wizardStep === 4 && (
              <div className="wizard-body wizard-body--preview">
                <div>
                  <h2 className="wizard-title">Prévia da tabela</h2>
                  <p className="wizard-subtitle">
                    Confira como a tabela <strong>"{nomeTabela}"</strong> ficará
                    antes de criá-la.
                  </p>
                </div>

                <div className="preview-table-wrapper">
                  <table className="preview-table">
                    <thead>
                      <tr>
                        {colsValidasWizard.map((col) => (
                          <th key={col.id}>
                            <div className="preview-th-content">
                              {col.identificacao === "pk" && (
                                <i className="fi fi-sr-key preview-th-icon preview-th-icon--pk" />
                              )}
                              {col.identificacao === "fk" && (
                                <i className="fi fi-sr-share preview-th-icon preview-th-icon--fk" />
                              )}
                              <span>{col.nome.toUpperCase()}</span>
                              <span className="preview-th-tipo">
                                {col.tipoDado}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* 3 linhas de exemplo */}
                      {[1, 2, 3].map((i) => (
                        <tr key={i}>
                          {colsValidasWizard.map((col) => (
                            <td key={col.id} className="preview-td-empty">
                              <span className="preview-td-dash">—</span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="preview-summary">
                  <div className="preview-summary-item">
                    <i className="fi fi-rr-table" />
                    <span>
                      <strong>{colsValidasWizard.length}</strong> coluna
                      {colsValidasWizard.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {colsValidasWizard.filter((c) => c.identificacao === "pk")
                    .length > 0 && (
                    <div className="preview-summary-item">
                      <i className="fi fi-sr-key preview-summary-pk" />
                      <span>
                        <strong>
                          {
                            colsValidasWizard.filter(
                              (c) => c.identificacao === "pk",
                            ).length
                          }
                        </strong>{" "}
                        chave primária
                      </span>
                    </div>
                  )}
                  {colsValidasWizard.filter((c) => c.identificacao === "fk")
                    .length > 0 && (
                    <div className="preview-summary-item">
                      <i className="fi fi-sr-share preview-summary-fk" />
                      <span>
                        <strong>
                          {
                            colsValidasWizard.filter(
                              (c) => c.identificacao === "fk",
                            ).length
                          }
                        </strong>{" "}
                        chave estrangeira
                      </span>
                    </div>
                  )}
                  {colsValidasWizard.filter((c) => c.config?.naoVazio).length >
                    0 && (
                    <div className="preview-summary-item">
                      <i className="fi fi-rr-exclamation" />
                      <span>
                        <strong>
                          {
                            colsValidasWizard.filter((c) => c.config?.naoVazio)
                              .length
                          }
                        </strong>{" "}
                        campo
                        {colsValidasWizard.filter((c) => c.config?.naoVazio)
                          .length !== 1
                          ? "s"
                          : ""}{" "}
                        obrigatório
                        {colsValidasWizard.filter((c) => c.config?.naoVazio)
                          .length !== 1
                          ? "s"
                          : ""}
                      </span>
                    </div>
                  )}
                </div>

                <div className="wizard-footer">
                  <button
                    className="btn-secondary"
                    onClick={() => setWizardStep(3)}
                  >
                    <i className="fi fi-rr-arrow-left" /> Voltar
                  </button>
                  <button
                    className="btn-primary btn-gerar"
                    onClick={handleCriarTabela}
                    disabled={loadingCreate}
                  >
                    {loadingCreate ? (
                      <span className="btn-spinner" />
                    ) : (
                      <>
                        <i className="fi fi-rr-magic-wand" /> Gerar tabela
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
              className="modal-styled"
              variants={fadeOutVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="modal-styled-header modal-styled-header--danger">
                <div className="modal-styled-icon">
                  <i className="fi fi-sr-remove-folder" />
                </div>
                <div>
                  <h2 className="modal-styled-title">Excluir tabela</h2>
                  <p className="modal-styled-subtitle">
                    "{tabelaParaExcluir.nomeTabela}"
                  </p>
                </div>
              </div>

              <div className="modal-styled-body">
                <p className="modal-styled-desc">
                  Esta ação é irreversível. Todos os registros vinculados serão
                  permanentemente apagados.
                </p>
                <div className="modal-styled-field">
                  <label>
                    Digite <strong>{tabelaParaExcluir.nomeTabela}</strong> para
                    confirmar
                  </label>
                  <input
                    type="text"
                    value={confirmacaoExclusaoTabela}
                    onChange={(e) =>
                      setConfirmacaoExclusaoTabela(e.target.value)
                    }
                    placeholder={`${tabelaParaExcluir.nomeTabela}`}
                    autoFocus
                    className={
                      confirmacaoExclusaoTabela === tabelaParaExcluir.nomeTabela
                        ? "input-match"
                        : ""
                    }
                  />
                </div>
              </div>

              <div className="modal-styled-footer">
                <button
                  className="btn-secondary"
                  onClick={() => setTabelaParaExcluir(null)}
                >
                  Cancelar
                </button>
                <button
                  className="btn-danger"
                  disabled={
                    confirmacaoExclusaoTabela !== tabelaParaExcluir.nomeTabela
                  }
                  onClick={() => handleExcluirTabela(tabelaParaExcluir.id)}
                >
                  <i className="fi fi-rr-trash" /> Excluir tabela
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════ MODAL RENOMEAR ════════════════════════════ */}
      <AnimatePresence mode="wait">
        {renomearOpen && (
          <div className="modal-overlay">
            <motion.div
              key="modal-renomear-tabela"
              className="modal-styled modal-styled--sm"
              variants={fadeOutVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="modal-styled-header">
                <div className="modal-styled-icon modal-styled-icon--neutral">
                  <i className="fi fi-sr-pencil" />
                </div>
                <div>
                  <h2 className="modal-styled-title">Renomear tabela</h2>
                  <p className="modal-styled-subtitle">
                    "{activeTabData?.name}"
                  </p>
                </div>
                <button
                  className="modal-styled-close"
                  onClick={() => setRenomearOpen(false)}
                >
                  <i className="fi fi-rr-cross" />
                </button>
              </div>

              <div className="modal-styled-body">
                <div className="modal-styled-field">
                  <label>Novo nome</label>
                  <div className="modal-input-wrapper">
                    <input
                      type="text"
                      value={novoNomeTabela}
                      onChange={(e) => {
                        setNovoNomeTabela(e.target.value);
                        setErroRenomear("");
                      }}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleConfirmarRenomear()
                      }
                      maxLength={NOME_MAX}
                      autoFocus
                      className={erroRenomear ? "input-error" : ""}
                      placeholder="ex: clientes, produtos..."
                    />
                    <span
                      className={`modal-char-counter ${novoNomeTabela.length >= NOME_MAX ? "over" : ""}`}
                    >
                      {novoNomeTabela.length}/{NOME_MAX}
                    </span>
                  </div>
                  {erroRenomear && (
                    <span className="modal-field-error">
                      <i className="fi fi-rr-exclamation" /> {erroRenomear}
                    </span>
                  )}
                </div>
              </div>

              <div className="modal-styled-footer">
                <button
                  className="btn-secondary"
                  onClick={() => setRenomearOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  className="btn-primary"
                  onClick={handleConfirmarRenomear}
                  disabled={
                    loading ||
                    !novoNomeTabela.trim() ||
                    novoNomeTabela.trim() === activeTabData?.name
                  }
                >
                  {loading ? (
                    <span className="btn-spinner" />
                  ) : (
                    <>
                      <i className="fi fi-rr-check" /> Salvar
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════ MODAL INSERIR DADOS ════════════════════════ */}
      <AnimatePresence mode="wait">
        {inserirOpen && (
          <div className="modal-overlay">
            <motion.div
              key="modal-inserir"
              className="modal-styled modal-styled--insert"
              variants={fadeOutVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="modal-styled-header">
                <div className="modal-styled-icon modal-styled-icon--primary">
                  <i className="fi fi-sr-add-document" />
                </div>
                <div>
                  <h2 className="modal-styled-title">Inserir registro</h2>
                  <p className="modal-styled-subtitle">
                    Tabela: {activeTabData?.name}
                  </p>
                </div>
                <button
                  className="modal-styled-close"
                  onClick={() => setInserirOpen(false)}
                >
                  <i className="fi fi-rr-cross" />
                </button>
              </div>

              <div className="modal-styled-body modal-insert-body">
                {colsParaInserir.length === 0 ? (
                  <p className="modal-insert-empty">
                    Esta tabela não possui colunas editáveis.
                  </p>
                ) : (
                  <div className="modal-insert-fields">
                    {colsParaInserir.map((col) => {
                      const temErro = !!inserirErros[col.nome];
                      const valor = inserirValores[col.nome] ?? "";
                      const isBoleano = col.tipoDado === "Boleano";
                      const isLista = col.tipoDado === "Lista";
                      const opcoes = col.config?.opcoes || [];

                      return (
                        <div
                          key={col.id}
                          className={`insert-field ${temErro ? "insert-field--error" : valor ? "insert-field--ok" : ""}`}
                        >
                          <div className="insert-field-header">
                            <label className="insert-field-label">
                              {col.nome}
                              {col.config?.naoVazio && (
                                <span className="insert-required">*</span>
                              )}
                            </label>
                            <span className="insert-field-tipo">
                              {col.tipoDado}
                            </span>
                          </div>

                          {isBoleano ? (
                            <div className="insert-bool-group">
                              {["sim", "não"].map((v) => (
                                <button
                                  key={v}
                                  type="button"
                                  className={`insert-bool-btn ${valor === v ? "insert-bool-btn--active" : ""}`}
                                  onClick={() =>
                                    handleInserirChange(col.nome, v)
                                  }
                                >
                                  {v === "sim" ? (
                                    <i className="fi fi-rr-check" />
                                  ) : (
                                    <i className="fi fi-rr-cross" />
                                  )}
                                  {v}
                                </button>
                              ))}
                            </div>
                          ) : isLista && opcoes.length > 0 ? (
                            <select
                              className={`insert-select ${temErro ? "insert-input--error" : ""}`}
                              value={valor}
                              onChange={(e) =>
                                handleInserirChange(col.nome, e.target.value)
                              }
                            >
                              <option value="">Selecione...</option>
                              {opcoes.map((op) => (
                                <option key={op} value={op}>
                                  {op}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="insert-input-wrapper">
                              <input
                                type={
                                  col.tipoDado === "Data"
                                    ? "date"
                                    : col.tipoDado === "Hora"
                                      ? "time"
                                      : col.tipoDado === "Data / Hora"
                                        ? "datetime-local"
                                        : "text"
                                }
                                className={`insert-input ${temErro ? "insert-input--error" : valor ? "insert-input--ok" : ""}`}
                                value={valor}
                                onChange={(e) =>
                                  handleInserirChange(col.nome, e.target.value)
                                }
                                placeholder={getPlaceholderPorTipo(col)}
                              />
                              {valor && !temErro && (
                                <i className="fi fi-rr-check insert-input-check" />
                              )}
                            </div>
                          )}

                          {temErro && (
                            <span className="insert-field-error">
                              <i className="fi fi-rr-exclamation" />{" "}
                              {inserirErros[col.nome]}
                            </span>
                          )}
                        </div>
                      );
                    })}
                    <p className="insert-required-note">
                      * campos obrigatórios
                    </p>
                  </div>
                )}
              </div>

              <div className="modal-styled-footer">
                <button
                  className="btn-secondary"
                  onClick={() => setInserirOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  className="btn-primary"
                  onClick={handleInserirSubmit}
                  disabled={!inserirFormValido || loadingInserir}
                >
                  {loadingInserir ? (
                    <span className="btn-spinner" />
                  ) : (
                    <>
                      <i className="fi fi-rr-check" /> Inserir registro
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── OpcoesInput local ───────────────────────────────────────────────────────
function OpcoesInputLocal({ opcoes, onChange }) {
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
