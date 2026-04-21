import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ExcelJS from "exceljs";
import "./System.scss";
import { SegundoMenu } from "../../components/SegundoMenu/SegundoMenu";
import { Notificacao } from "../../components/Notificacao/Notificacao";
import { TourGuide } from "../../components/TourGuide/TourGuide";
import { motion, AnimatePresence } from "framer-motion";
import {
  API,
  TABELA_CRUD_ROUTES,
  COLUNA_CRUD_ROUTES,
  DADOS_CRUD_ROUTES,
  REL_CRUD_ROUTES,
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

// ─── Utilitários de Formatação ──────────────────────────────────────────────
const sanitizarIdentificador = (str) => {
  if (!str) return "";
  return str
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/\s+/g, "_") // Espaços viram underscores
    .replace(/[^a-zA-Z0-9_]/g, "") // Remove caracteres especiais
    .toLowerCase();
};

// ═══════════════════════════════════════════════════════════════════════════
// ─── Constantes de tipo
// ═══════════════════════════════════════════════════════════════════════════

const GRUPOS_TIPOS = {
  Texto: ["Texto", "Lista"],
  Numérico: ["Decimal", "Inteiro"],
  Tempo: ["Hora", "Data", "Data/Hora"],
  Avançado: ["Cálculo", "Boleano"],
};

const MAPA_TIPOS_API = {
  Texto: "texto",
  Decimal: "numero_dec",
  Inteiro: "numero_int",
  bigint: "bigint",
  Hora: "hora",
  Data: "data",
  "Data/Hora": "data_hora",
  Lista: "lista",
  Boleano: "boleano",
  Cálculo: "calculo",
};

const MAPA_API_PARA_TIPO = Object.fromEntries(
  Object.entries(MAPA_TIPOS_API).map(([label, api]) => [api, label]),
);

// ── Nomes amigáveis para exibição ao usuário ──────────────────────────────────
const MAPA_TIPO_AMIGAVEL = {
  texto: "Texto",
  numero_dec: "Decimal",
  numero_int: "Inteiro",
  hora: "Hora",
  data: "Data",
  data_hora: "Data e Hora",
  lista: "Lista",
  boleano: "Booleano",
  calculo: "Cálculo",
};

const getNomeTipoAmigavel = (tipo) =>
  MAPA_TIPO_AMIGAVEL[(tipo || "").toLowerCase()] || tipo;

const GRUPO_ICONS = {
  Texto: "fi-sr-text",
  Numérico: "fi-sr-calculator",
  Tempo: "fi-sr-calendar",
  Avançado: "fi-sr-settings-sliders",
};

const MASCARA_TEMPORAL_AUTO = {
  Data: "dMy",
  Hora: "Hms",
  "Data/Hora": "dMy|Hms",
};

const getTipoCategoria = (tipo) => {
  if (tipo === "Texto") return "texto";
  if (["Inteiro", "Decimal"].includes(tipo)) return "numerico";
  if (["Hora", "Data", "Data e Hora"].includes(tipo)) return "temporal";
  if (tipo === "Boleano") return "boleano";
  if (tipo === "Cálculo") return "calculo";
  if (tipo === "Lista") return "lista";
  return null;
};

const CONFIGS_POR_CATEGORIA = {
  texto: ["naoVazio", "alcanceMaximo", "unico"],
  numerico: ["naoVazio", "unico", "indice"],
  temporal: ["naoVazio"],
  boleano: ["labelTrue", "labelFalse"],
  calculo: ["naoVazio", "indice"],
  lista: ["naoVazio", "mascaraLista"],
};

const CONFIG_META = {
  naoVazio: { label: "Não vazio", tipo: "toggle" },
  unico: { label: "Único", tipo: "toggle" },
  autoIncremento: { label: "Auto-incremento", tipo: "toggle" },
  indice: { label: "Índice", tipo: "toggle" },
  labelTrue: { label: "Rótulo para 'Verdadeiro'", tipo: "text" },
  labelFalse: { label: "Rótulo para 'Falso'", tipo: "text" },
  alcanceMaximo: { label: "Alcance máximo", tipo: "number" },
  mascaraLista: { label: "Itens da lista", tipo: "select" },
};

const CONFIG_PADRAO = {
  naoVazio: false,
  unico: false,
  alcanceMaximo: "",
  autoIncremento: false,
  indice: false,
  labelTrue: "Verdadeiro",
  labelFalse: "Falso",
};

const mapConfigParaApi = (configForm, tipoDado) => {
  const configFinal = {};

  if (configForm.naoVazio) configFinal.not_null = true;
  if (configForm.unico) configFinal.unique = true;
  if (configForm.indice) configFinal.index = true;
  if (configForm.alcanceMaximo)
    configFinal.max_length = configForm.alcanceMaximo;

  if (tipoDado === "calculo") {
    configFinal.operador = configForm.operador || "+";

    const nomeCol1 = configForm.op1?.coluna;
    const nomeCol2 = configForm.op2?.coluna;
    configFinal.colunasOrigem = [nomeCol1, nomeCol2].filter(Boolean);

    configFinal.op1 = configForm.op1;
    configFinal.op2 = configForm.op2;
  }

  if (["data", "hora", "data_hora"].includes(tipoDado)) {
    if (tipoDado === "data") configFinal.mascaraData = "DD/MM/YYYY";
    if (tipoDado === "hora") configFinal.mascaraData = "HH:MM:SS";
    if (tipoDado === "data_hora")
      configFinal.mascaraData = "DD/MM/YYYY HH:MM:SS";
  }

  if (tipoDado === "boleano") {
    configFinal.options = [
      configForm.labelTrue || "Sim",
      configForm.labelFalse || "Não",
    ];
  }

  if (tipoDado === "lista") {
    if (Array.isArray(configForm.itensLista)) {
      configFinal.mascaraLista = configForm.itensLista.filter(
        (i) => i.trim() !== "",
      );
    } else if (Array.isArray(configForm.mascaraLista)) {
      configFinal.mascaraLista = configForm.mascaraLista;
    } else if (
      typeof configForm.mascaraLista === "string" &&
      configForm.mascaraLista.trim() !== ""
    ) {
      configFinal.mascaraLista = configForm.mascaraLista
        .split(";")
        .filter((i) => i.trim() !== "");
    } else {
      configFinal.mascaraLista = [];
    }
  }

  return configFinal;
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
  tipoDado: "Inteiro",
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
// ─── Validação de dados por tipo
// ═══════════════════════════════════════════════════════════════════════════

const validarCampo = (valor, col) => {
  const v = String(valor ?? "").trim();
  if (col.identificacao === "pk") return null;
  if (col.config?.naoVazio && v === "")
    return `O campo "${col.nome}" é obrigatório.`;
  if (v === "") return null;
  switch (col.tipoDado) {
    case "Inteiro":
      if (!/^-?\d+$/.test(v))
        return `"${col.nome}" deve ser um número inteiro.`;
      if (
        col.config?.alcanceMaximo &&
        v.length > Number(col.config.alcanceMaximo)
      )
        return `"${col.nome}" excede o alcance máximo de ${col.config.alcanceMaximo} caracteres.`;
      break;
    case "Decimal":
      if (!/^-?\d+([.,]\d+)?$/.test(v))
        return `"${col.nome}" deve ser um número decimal (ex: 3,14).`;
      break;
    case "Hora":
      if (!/^\d{2}:\d{2}(:\d{2})?$/.test(v))
        return `"${col.nome}" deve seguir o formato HH:MM ou HH:MM:SS.`;
      break;
    case "Data":
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v) && !/^\d{2}\/\d{2}\/\d{4}$/.test(v))
        return `"${col.nome}" deve ser uma data válida.`;
      break;
    case "Data e Hora":
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
    case "Inteiro":
      return "0";
    case "Decimal":
      return "0,00";
    case "Hora":
      return "HH:MM";
    case "Data":
      return "AAAA-MM-DD";
    case "Data e Hora":
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
  const MIN_COL_WIDTH = 100;
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

  // ── Renomear tabela ───────────────────────────────────────────────────────
  const [renomearOpen, setRenomearOpen] = useState(false);
  const [novoNomeTabela, setNovoNomeTabela] = useState("");
  const [erroRenomear, setErroRenomear] = useState("");

  // ── Excluir coluna ────────────────────────────────────────────────────────
  const [colunaParaExcluir, setColunaParaExcluir] = useState(null);
  const [confirmacaoExclusaoColuna, setConfirmacaoExclusaoColuna] =
    useState("");

  // ── Configurar coluna ─────────────────────────────────────────────────────
  const [colunaParaConfigurar, setColunaParaConfigurar] = useState(null);
  const [configEdicao, setConfigEdicao] = useState(null);
  const [loadingSalvarConfig, setLoadingSalvarConfig] = useState(false);

  // ── Inserir dados ─────────────────────────────────────────────────────────
  const [inserirOpen, setInserirOpen] = useState(false);
  const [inserirRows, setInserirRows] = useState([
    { id: Date.now(), data: {} },
  ]);
  const [inserirErros, setInserirErros] = useState({});
  const [loadingInserir, setLoadingInserir] = useState(false);
  const [inserirTab, setInserirTab] = useState("manual");
  const [importFile, setImportFile] = useState(null);
  const [importDragOver, setImportDragOver] = useState(false);
  const [importPreview, setImportPreview] = useState([]);

  // ── Atualizar dados ───────────────────────────────────────────────────────
  const [atualizarOpen, setAtualizarOpen] = useState(false);
  const [atualizarRowId, setAtualizarRowId] = useState(null);
  const [atualizarRowData, setAtualizarRowData] = useState({});
  const [atualizarErros, setAtualizarErros] = useState({});
  const [loadingAtualizar, setLoadingAtualizar] = useState(false);

  // ── Confirmação de exclusão de registros ──────────────────────────────────
  const [confirmarDeletarOpen, setConfirmarDeletarOpen] = useState(false);
  const [confirmarDeletarNome, setConfirmarDeletarNome] = useState("");
  const [confirmarDeletarCiente, setConfirmarDeletarCiente] = useState(false);

  // ── Dropdown do cabeçalho de coluna ──────────────────────────────────────
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const [headerMenuAberto, setHeaderMenuAberto] = useState(null);

  // ── Referência para as abas ───────────────────────────────────────────────
  const tabsRef = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const activeTabData = tabs.find((t) => t.id === activeTab);
  const colsParaInserir =
    activeTabData?.cols?.filter((c) => c.identificacao !== "pk") || [];
  const rows = Array.isArray(activeTabData?.rows) ? activeTabData.rows : [];
  const resizableCols = (activeTabData?.cols || []).map((c) => c.nome);
  const totalTableWidth =
    CHECKBOX_WIDTH +
    resizableCols.reduce((acc, col) => acc + (colWidths[col] || 150), 0) +
    ACTIONS_WIDTH;

  const getGrupoPorTipo = (tipoDado) => {
    for (const [grupo, tipos] of Object.entries(GRUPOS_TIPOS)) {
      if (tipos.includes(tipoDado)) return grupo;
    }
    return null;
  };

  const handleFinishTour = useCallback(() => {
    setTourActive(false);
    localStorage.setItem(TOUR_SEEN_KEY, "1");
  }, []);

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

  // ── Fechar dropdown ao clicar fora ────────────────────────────────────────
  useEffect(() => {
    if (!headerMenuAberto) return;
    const fechar = () => setHeaderMenuAberto(null);
    document.addEventListener("click", fechar);
    return () => document.removeEventListener("click", fechar);
  }, [headerMenuAberto]);

  // ── Carregar tabelas ─────────────────────────
  const carregarDados = useCallback(async () => {
    const idDb = idDoDatabaseAtual || localStorage.getItem("lastDbId");
    if (!idDb) return;

    try {
      const response = await API.get(TABELA_CRUD_ROUTES.LISTAR(idDb));

      const listaVindaDoBanco =
        response.data.dados ||
        (Array.isArray(response.data) ? response.data : []);

      const tabelasFormatadas = listaVindaDoBanco.map((tab) => ({
        id: tab.id,
        name: tab.nomeTabela,
        rows: Array.isArray(tab.dados) ? tab.dados : [],
        cols: (tab.colunas || []).map((col) => ({
          id: col.id,
          nome: col.nomeColuna,
          tipoDado: col.tipoDado,
          identificacao: col.isPrimaryKey ? "pk" : null,
          config: col.config || {},
        })),
      }));

      setTabs(tabelasFormatadas);

      setActiveTab((prevActive) => {
        if (!prevActive && tabelasFormatadas.length > 0) {
          return tabelasFormatadas[0].id;
        }
        return prevActive;
      });
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      pushNotification(
        "error",
        "Erro",
        err.response?.data?.message || "Falha ao sincronizar.",
      );
    }
  }, [idDoDatabaseAtual, pushNotification]);

  // ── Carregar dados de uma tabela específica (persistência) ────────────────
  const carregarDadosTabela = useCallback(
    async (tabelaId) => {
      if (!tabelaId) return;
      try {
        const res = await API.get(DADOS_CRUD_ROUTES.LISTAR(tabelaId));
        console.log("Dados recebidos da API:", res.data);
        setTabs((prev) => {
          return prev.map((tab) => {
            if (tab.id === tabelaId) {
              return { ...tab, rows: res.data?.rows || [] };
            }
            return tab;
          });
        });
      } catch (err) {
        pushNotification(
          "error",
          "Erro",
          err.response?.data?.message || "Falha ao carregar dados.",
        );
      }
    },
    [pushNotification],
  );

  useEffect(() => {
    if (idDoDatabaseAtual) localStorage.setItem("lastDbId", idDoDatabaseAtual);
    carregarDados();
  }, [idDoDatabaseAtual, carregarDados]);

  // ── Recarrega dados sempre que trocar de aba ──────────────────────────────
  useEffect(() => {
    if (activeTab) carregarDadosTabela(activeTab);
  }, [activeTab, carregarDadosTabela]);

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

  useEffect(() => {
    if (!localStorage.getItem(TOUR_SEEN_KEY)) {
      const t = setTimeout(() => setTourActive(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

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

  // ── Abre modal de confirmação de exclusão de registros ────────────────────
  const openConfirmarDeletar = () => {
    setConfirmarDeletarNome("");
    setConfirmarDeletarCiente(false);
    setConfirmarDeletarOpen(true);
  };

  // ── Deleta de fato (chamado só pelo modal) ────────────────────────────────
  const handleDeletarSelecionados = async () => {
    try {
      await Promise.all(
        selectedRows.map((rowId) =>
          API.delete(DADOS_CRUD_ROUTES.REMOVER(activeTab, rowId)),
        ),
      );
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
      pushNotification(
        "success",
        "Removido!",
        `${selectedRows.length} registro(s) excluído(s) com sucesso.`,
      );
      setSelectedRows([]);
      setConfirmarDeletarOpen(false);
    } catch (err) {
      pushNotification(
        "error",
        "Erro ao excluir",
        err.response?.data?.message || "Falha ao remover registro(s).",
      );
    }
  };

  // ── Abrir modal de atualização ────────────────────────────────────────────
  const openAtualizar = () => {
    if (selectedRows.length !== 1) return;
    const row = rows.find((r) => r.id === selectedRows[0]);
    if (!row) return;
    setAtualizarRowId(row.id);
    setAtualizarRowData({ ...row });
    setAtualizarErros({});
    setAtualizarOpen(true);
  };

  const handleAtualizarRowChange = (colNome, valor) => {
    const col = colsParaInserir.find((c) => c.nome === colNome);
    if (col?.tipoDado === "calculo") return;
    setAtualizarRowData((prev) => ({ ...prev, [colNome]: valor }));
    if (col) {
      const erro = validarCampo(valor, col);
      setAtualizarErros((prev) => ({ ...prev, [colNome]: erro }));
    }
  };

  const handleAtualizarSubmit = async () => {
    let hasError = false;
    const novosErros = {};
    colsParaInserir.forEach((col) => {
      const valor = atualizarRowData[col.nome] ?? "";
      const erro = validarCampo(valor, col);
      if (erro) {
        novosErros[col.nome] = erro;
        hasError = true;
      }
    });

    if (hasError) {
      setAtualizarErros(novosErros);
      pushNotification(
        "warning",
        "Campos inválidos",
        "Corrija os erros antes de salvar.",
      );
      return;
    }

    setLoadingAtualizar(true);
    try {
      const payload = {};
      colsParaInserir.forEach((col) => {
        if (col.tipoDado !== "calculo")
          payload[col.nome] = atualizarRowData[col.nome] ?? "";
      });

      const res = await API.put(
        DADOS_CRUD_ROUTES.ATUALIZAR(activeTab, atualizarRowId),
        payload,
      );
      const registroAtualizado = res.data;

      setTabs((prev) =>
        prev.map((tab) =>
          tab.id !== activeTab
            ? tab
            : {
                ...tab,
                rows: tab.rows.map((r) =>
                  r.id === atualizarRowId ? { ...r, ...registroAtualizado } : r,
                ),
              },
        ),
      );

      pushNotification(
        "success",
        "Atualizado!",
        "Registro atualizado com sucesso.",
      );
      setAtualizarOpen(false);
      setSelectedRows([]);
    } catch (err) {
      pushNotification(
        "error",
        "Erro ao atualizar",
        err.response?.data?.message || "Falha ao atualizar registro.",
      );
    } finally {
      setLoadingAtualizar(false);
    }
  };

  const atualizarFormValido =
    colsParaInserir
      .filter((c) => c.config?.naoVazio && c.tipoDado !== "calculo")
      .every(
        (c) => (atualizarRowData[c.nome] ?? "").toString().trim() !== "",
      ) && Object.values(atualizarErros).every((e) => !e);

  // ── Resize coluna ─────────────────────────────────────────────────────────
  const getMinColWidth = (colName) => {
    const charsVisiveis = Math.ceil(colName.length * 0.3);
    return Math.max(50, charsVisiveis * 9 + 28);
  };

  const handleMouseDown = (e, colName) => {
    e.preventDefault();
    const startX = e.pageX;
    const startWidth = colWidths[colName] || 150;
    const minWidth = getMinColWidth(colName);
    const onMove = (ev) => {
      const w = Math.max(minWidth, startWidth + (ev.pageX - startX));
      setColWidths((prev) => ({ ...prev, [colName]: w }));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
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

  const handleStep3Proximo = () => setWizardStep(4);

  // ── Coluna helpers ────────────────────────────────────────────────────────
  const addColuna = () => setColunas((prev) => [...prev, COLUNA_VAZIA()]);
  const removeColuna = (id) =>
    setColunas((prev) =>
      prev.length <= 1 ? prev : prev.filter((c) => c.id !== id),
    );
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
          tipoDado: "Inteiro",
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
        if (MASCARA_TEMPORAL_AUTO[tipo])
          newConfig.mascara = MASCARA_TEMPORAL_AUTO[tipo];
        if (tipo !== "Cálculo") delete newConfig.calculo;
        if (tipo !== "Lista") delete newConfig.mascaraLista;
        return { ...c, tipoDado: tipo, config: newConfig };
      }),
    );
  };

  // ── Criar tabela + colunas ────────────────────────────────────────────────
  const handleCriarTabela = async () => {
    const nomeTabelaLimpo = sanitizarIdentificador(nomeTabela);

    const tabelaJaExiste = tabs.some(
      (t) => t.name && sanitizarIdentificador(t.name) === nomeTabelaLimpo,
    );

    if (tabelaJaExiste) {
      pushNotification(
        "warning",
        "Nome duplicado",
        `Já existe uma tabela chamada "${nomeTabelaLimpo}".`,
      );
      return;
    }

    const colsValidas = colunas.filter((c) => c.nome.trim() && c.tipoDado);
    if (colsValidas.length === 0) {
      pushNotification(
        "warning",
        "Sem colunas",
        "Adicione pelo menos uma coluna.",
      );
      return;
    }

    setLoadingCreate(true);
    let idTabelaCriada = null;

    try {
      const resTabela = await API.post(
        TABELA_CRUD_ROUTES.CRIAR(idDoDatabaseAtual),
        { nomeTabela: nomeTabelaLimpo },
      );

      idTabelaCriada = resTabela.data.id;

      const payloadColunas = colsValidas.map((col) => {
        const isPk = col.identificacao === "pk";
        const isFk = col.identificacao === "fk";
        const tipoApi = MAPA_TIPOS_API[col.tipoDado] || "texto";

        let configFinal = mapConfigParaApi(col.config, tipoApi);

        if (isPk) {
          configFinal = {
            ...configFinal,
            auto_increment: true,
            not_null: true,
          };
        }

        return {
          nomeColuna: sanitizarIdentificador(col.nome),
          tipoDado: isPk || isFk ? "bigint" : tipoApi,
          isPrimaryKey: isPk,
          isForeignKey: isFk,
          tabelaId: idTabelaCriada,
          config: configFinal,
        };
      });

      const resColunas = await API.post(
        COLUNA_CRUD_ROUTES.CRIAR,
        payloadColunas,
      );
      const colunasSalvasNoBanco = resColunas.data.dados || resColunas.data;

      await API.post(TABELA_CRUD_ROUTES.SINCRONIZAR(idTabelaCriada));

      const colunasFkNoWizard = colsValidas.filter(
        (c) => c.identificacao === "fk",
      );

      for (const colFk of colunasFkNoWizard) {
        const colunaOrigemNoBanco = colunasSalvasNoBanco.find(
          (c) => c.nomeColuna === sanitizarIdentificador(colFk.nome),
        );

        if (colunaOrigemNoBanco && colFk.fkTabela && colFk.fkColunaId) {
          await API.post(REL_CRUD_ROUTES.CRIAR, {
            idTabelaOrigem: idTabelaCriada,
            idColunaOrigem: colunaOrigemNoBanco.id,
            idTabelaDestino: colFk.fkTabela,
            idColunaDestino: colFk.fkColunaId,
          });
        }
      }

      await carregarDados();
      setActiveTab(idTabelaCriada);
      closeWizard();
      pushNotification("success", "Sucesso!", `Tabela "${nomeTabela}" criada.`);
    } catch (err) {
      if (idTabelaCriada) {
        try {
          await API.delete(TABELA_CRUD_ROUTES.EXCLUIR(idTabelaCriada));
        } catch (cleanupErr) {
          console.error("Erro no cleanup:", cleanupErr);
        }
      }

      const msgErro =
        err.response?.data?.mensagem ||
        err.response?.data?.message ||
        err.message;
      pushNotification("error", "Falha na operação", msgErro);
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
      const msg = error.response?.data?.message || "";

      if (msg.toLowerCase().includes("foreign key")) {
        pushNotification(
          "error",
          "Impossível excluir",
          "Esta tabela é referenciada em outras tabelas. Remova o relacionamento primeiro.",
        );
      } else {
        pushNotification(
          "error",
          "Erro",
          error.response?.data?.message || "Erro ao excluir tabela.",
        );
      }
    }
  };

  const handleEditarTabela = async (idTabela, novoNome) => {
    const nomeSanitizado = sanitizarIdentificador(novoNome);
    if (!nomeSanitizado) {
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
        nomeTabela: nomeSanitizado,
      });
      setTabs((prev) =>
        prev.map((t) =>
          t.id === idTabela ? { ...t, name: nomeSanitizado } : t,
        ),
      );
      pushNotification("success", "Sucesso", "Nome da tabela atualizado!");
    } catch (err) {
      pushNotification(
        "error",
        "Erro ao atualizar",
        err.response?.data?.message || "Não foi possível renomear a tabela.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Renomear tabela ───────────────────────────────────────────────────────
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

  // ── Coluna helpers ────────────────────────────────────────────────────────
  const colunaTemDados = (colNome) =>
    rows.some((row) => {
      const val = row[colNome];
      return val !== "" && val !== null && val !== undefined;
    });

  const abrirExcluirColuna = (col) => {
    setHeaderMenuAberto(null);
    setColunaParaExcluir(col);
    setConfirmacaoExclusaoColuna("");
  };

  const handleExcluirColuna = async () => {
    try {
      await API.delete(COLUNA_CRUD_ROUTES.EXCLUIR(colunaParaExcluir.id));
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === activeTab
            ? {
                ...tab,
                cols: tab.cols.filter((c) => c.id !== colunaParaExcluir.id),
              }
            : tab,
        ),
      );
      pushNotification(
        "success",
        "Coluna excluída!",
        `"${colunaParaExcluir.nome}" foi removida da tabela.`,
      );
      setColunaParaExcluir(null);
      setConfirmacaoExclusaoColuna("");
    } catch (err) {
      pushNotification(
        "error",
        "Erro ao excluir",
        err.response?.data?.message || "Não foi possível excluir a coluna.",
      );
    }
  };

  const abrirConfigurarColuna = (col) => {
    setHeaderMenuAberto(null);
    const tipoDadoDisplay = MAPA_API_PARA_TIPO[col.tipoDado] || col.tipoDado;
    setConfigEdicao({
      nome: col.nome,
      grupo: getGrupoPorTipo(tipoDadoDisplay),
      tipoDado: tipoDadoDisplay,
      identificacao: col.identificacao,
      fkTabela: col.fkTabela || null,
      fkColunaId: col.fkColunaId || null,
      config: { ...CONFIG_PADRAO, ...col.config },
    });
    setColunaParaConfigurar(col);
  };

  const handleConfigEdicaoGrupo = (grupo) =>
    setConfigEdicao((prev) => ({ ...prev, grupo, tipoDado: null }));

  const handleConfigEdicaoTipo = (tipo) => {
    setConfigEdicao((prev) => {
      const newConfig = { ...prev.config };
      if (MASCARA_TEMPORAL_AUTO[tipo])
        newConfig.mascara = MASCARA_TEMPORAL_AUTO[tipo];
      if (tipo !== "Cálculo") delete newConfig.calculo;
      if (tipo !== "Lista") delete newConfig.mascaraLista;
      return { ...prev, tipoDado: tipo, config: newConfig };
    });
  };

  const handleConfigEdicaoFKTabela = (tabelaId) => {
    const idNum = parseInt(tabelaId, 10);
    setConfigEdicao((prev) => ({
      ...prev,
      fkTabela: idNum,
      fkColunaId: null,
      grupo: null,
      tipoDado: null,
    }));
  };

  const handleConfigEdicaoFKColuna = (pkColId) => {
    const tab = tabs.find(
      (t) => String(t.id) === String(configEdicao?.fkTabela),
    );
    const pkCol = tab?.cols?.find((c) => c.id === pkColId);
    if (!pkCol) return;

    const tipoDadoDisplay =
      MAPA_API_PARA_TIPO[pkCol.tipoDado] || pkCol.tipoDado;

    setConfigEdicao((prev) => ({
      ...prev,
      fkColunaId: pkColId,
      grupo: getGrupoPorTipo(tipoDadoDisplay),
      tipoDado: tipoDadoDisplay,
    }));
  };

  const handleConfigEdicaoRemoverFK = () =>
    setConfigEdicao((prev) => ({
      ...prev,
      identificacao: null,
      fkTabela: null,
      fkColunaId: null,
      grupo: null,
      tipoDado: null,
    }));

  const updateConfigEdicaoConfig = (key, value) =>
    setConfigEdicao((prev) => ({
      ...prev,
      config: { ...prev.config, [key]: value },
    }));

  const handleSalvarConfiguracao = async () => {
    if (!configEdicao.nome.trim()) {
      pushNotification(
        "warning",
        "Nome obrigatório",
        "A coluna precisa ter um nome.",
      );
      return;
    }
    if (configEdicao.nome.length > NOME_MAX) {
      pushNotification(
        "error",
        "Nome muito longo",
        `Máximo de ${NOME_MAX} caracteres.`,
      );
      return;
    }
    const nomeJaExiste = activeTabData.cols.some(
      (c) =>
        c.id !== colunaParaConfigurar.id &&
        c.nome.toLowerCase() === configEdicao.nome.trim().toLowerCase(),
    );
    if (nomeJaExiste) {
      pushNotification(
        "warning",
        "Nome duplicado",
        "Já existe outra coluna com este nome.",
      );
      return;
    }
    if (!configEdicao.tipoDado) {
      pushNotification(
        "warning",
        "Tipo obrigatório",
        "Selecione um tipo de dado para a coluna.",
      );
      return;
    }

    setLoadingSalvarConfig(true);
    try {
      const tipoDadoApi =
        MAPA_TIPOS_API[configEdicao.tipoDado] || configEdicao.tipoDado;
      const payload = {
        nomeColuna: configEdicao.nome.trim(),
        tipoDado: tipoDadoApi,
        isForeignKey: configEdicao.identificacao === "fk",
        fkTabelaId: configEdicao.fkTabela || null,
        fkColunaId: configEdicao.fkColunaId || null,
        config: mapConfigParaApi(configEdicao.config, tipoDadoApi),
      };
      await API.put(
        COLUNA_CRUD_ROUTES.ATUALIZAR(colunaParaConfigurar.id),
        payload,
      );
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id !== activeTab
            ? tab
            : {
                ...tab,
                cols: tab.cols.map((c) =>
                  c.id !== colunaParaConfigurar.id
                    ? c
                    : {
                        ...c,
                        nome: configEdicao.nome.trim(),
                        tipoDado: tipoDadoApi,
                        identificacao: configEdicao.identificacao,
                        fkTabela: configEdicao.fkTabela,
                        fkColunaId: configEdicao.fkColunaId,
                        config: configEdicao.config,
                      },
                ),
              },
        ),
      );
      pushNotification(
        "success",
        "Configurações salvas!",
        `Coluna "${configEdicao.nome}" atualizada.`,
      );
      setColunaParaConfigurar(null);
      setConfigEdicao(null);
    } catch (err) {
      pushNotification(
        "error",
        "Erro ao salvar",
        err.response?.data?.message || "Não foi possível salvar as alterações.",
      );
    } finally {
      setLoadingSalvarConfig(false);
    }
  };

  // ── Inserir dados ─────────────────────────────────────────────────────────
  const openInserir = () => {
    setInserirRows([{ id: Date.now(), data: {} }]);
    setInserirErros({});
    setInserirTab("manual");
    setImportFile(null);
    setImportPreview([]);
    setInserirOpen(true);
  };

  const handleInserirRowChange = (rowId, colNome, valor) => {
    const col = colsParaInserir.find((c) => c.nome === colNome);
    if (col?.tipoDado === "calculo") return;
    setInserirRows((prev) =>
      prev.map((r) =>
        r.id === rowId ? { ...r, data: { ...r.data, [colNome]: valor } } : r,
      ),
    );
    if (col) {
      const erro = validarCampo(valor, col);
      setInserirErros((prev) => ({
        ...prev,
        [rowId]: { ...(prev[rowId] || {}), [colNome]: erro },
      }));
    }
  };

  const addInserirRow = () =>
    setInserirRows((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), data: {} },
    ]);

  const removeInserirRow = (rowId) => {
    if (inserirRows.length <= 1) return;
    setInserirRows((prev) => prev.filter((r) => r.id !== rowId));
    setInserirErros((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
  };

  const handleFileImport = async (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    const suportados = ["json", "csv", "xlsx", "xls"];
    if (!suportados.includes(ext)) {
      pushNotification(
        "warning",
        "Formato inválido",
        "Use arquivos .json, .csv, .xlsx ou .xls.",
      );
      return;
    }
    try {
      let rows = [];
      if (ext === "json") {
        const text = await file.text();
        const parsed = JSON.parse(text);
        rows = Array.isArray(parsed) ? parsed : [parsed];
      } else if (ext === "csv") {
        const text = await file.text();
        const lines = text.split("\n").filter((l) => l.trim());
        const headers = lines[0]
          .split(",")
          .map((h) => h.trim().replace(/"/g, ""));
        rows = lines.slice(1).map((line) => {
          const vals = line.split(",").map((v) => v.trim().replace(/"/g, ""));
          return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
        });
      } else {
        const buf = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buf);
        const worksheet = workbook.getWorksheet(1);
        const headers = [];
        const firstRow = worksheet.getRow(1);
        firstRow.eachCell((cell, colNumber) => {
          headers[colNumber] = cell.text;
        });
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            const rowData = {};
            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
              const header = headers[colNumber];
              if (header)
                rowData[header] =
                  cell.result !== undefined ? cell.result : cell.value;
            });
            rows.push(rowData);
          }
        });
      }
      if (rows.length === 0) {
        pushNotification(
          "warning",
          "Arquivo vazio",
          "Nenhuma linha encontrada no arquivo.",
        );
        return;
      }
      setImportFile(file);
      setImportPreview(rows);
      pushNotification(
        "success",
        "Arquivo carregado!",
        `${rows.length} linha(s) detectada(s) em "${file.name}".`,
      );
    } catch {
      pushNotification(
        "error",
        "Erro ao ler arquivo",
        "Falha ao processar planilha Excel.",
      );
      setImportFile(null);
      setImportPreview([]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setImportDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileImport(file);
  };

  const handleInserirSubmit = async () => {
    if (inserirTab === "import") {
      if (importPreview.length === 0) {
        pushNotification(
          "warning",
          "Sem dados",
          "Importe um arquivo com dados válidos.",
        );
        return;
      }
      const novosRows = importPreview.map((row) => {
        const novoRow = { id: Date.now() + Math.random() };
        colsParaInserir.forEach((col) => {
          novoRow[col.nome] =
            row[col.nome] ?? row[col.nome.toLowerCase()] ?? "";
        });
        return novoRow;
      });
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === activeTab
            ? { ...tab, rows: [...tab.rows, ...novosRows] }
            : tab,
        ),
      );
      pushNotification(
        "success",
        "Importado!",
        `${novosRows.length} registro(s) importados de "${importFile?.name}".`,
      );
      setInserirOpen(false);
      return;
    }

    let hasError = false;
    const novosErros = {};
    inserirRows.forEach((row) => {
      const rowErros = {};
      colsParaInserir.forEach((col) => {
        const valor = row.data[col.nome] ?? "";
        const erro = validarCampo(valor, col);
        if (erro) {
          rowErros[col.nome] = erro;
          hasError = true;
        }
      });
      if (Object.keys(rowErros).length > 0) novosErros[row.id] = rowErros;
    });

    if (hasError) {
      setInserirErros(novosErros);
      pushNotification(
        "warning",
        "Campos inválidos",
        "Corrija os erros destacados antes de inserir.",
      );
      return;
    }

    setLoadingInserir(true);
    try {
      const payload = inserirRows.map((row) => {
        const objetoLinha = {};
        colsParaInserir.forEach((col) => {
          if (col.tipoDado !== "calculo")
            objetoLinha[col.nome] = row.data[col.nome] ?? "";
        });
        return objetoLinha;
      });
      const response = await API.post(
        DADOS_CRUD_ROUTES.ADICIONAR(activeTab),
        payload,
      );
      const registrosSalvos = response.data;
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === activeTab
            ? { ...tab, rows: [...tab.rows, ...registrosSalvos] }
            : tab,
        ),
      );
      pushNotification(
        "success",
        "Registros salvos!",
        `${registrosSalvos.length} registro(s) adicionado(s) ao banco de dados.`,
      );
      setInserirOpen(false);
    } catch (err) {
      pushNotification(
        "error",
        "Erro ao salvar no banco",
        err.response?.data?.message || err.message,
      );
    } finally {
      setLoadingInserir(false);
    }
  };

  const inserirFormValido =
    inserirTab === "import"
      ? importPreview.length > 0
      : inserirRows.length > 0 &&
        colsParaInserir
          .filter((c) => c.config?.naoVazio)
          .every((c) =>
            inserirRows.every((row) => (row.data[c.nome] ?? "").trim() !== ""),
          ) &&
        Object.values(inserirErros).every((rowErros) =>
          Object.values(rowErros).every((e) => !e),
        );

  const wizardCardClass = [
    "wizard-card",
    wizardStep === 2 ? "wizard-card--step2" : "",
    wizardStep === 3 ? "wizard-card--step3" : "",
    wizardStep === 4 ? "wizard-card--step4" : "",
  ]
    .filter(Boolean)
    .join(" ");

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
          updateConfig(
            col.id,
            "alcanceMaximo",
            String(Math.min(parseInt(raw, 10), 255)),
          );
        }}
        placeholder="1 – 255"
      />
    </div>
  );

  const colsValidasWizard = colunas.filter((c) => c.nome.trim() && c.tipoDado);

  // ── Helper: renderiza um campo de inserção/atualização ────────────────────
  const renderCampoEdicao = (col, valor, erro, onChange) => {
    const temErro = !!erro;
    const tipoDadoNorm = (col.tipoDado || "").toLowerCase();
    const isBoleano = tipoDadoNorm === "boleano";
    const isLista = tipoDadoNorm === "lista";
    const opcoes = col.config?.mascaraLista || col.config?.opcoes || [];
    const isCalculo = tipoDadoNorm === "calculo";
    const isTemporal = ["data", "hora", "data_hora"].includes(tipoDadoNorm);
    const isInteiro =
      tipoDadoNorm === "numero_int" || tipoDadoNorm === "inteiro";
    const isDecimal =
      tipoDadoNorm === "numero_dec" || tipoDadoNorm === "decimal";
    const maxLength = col.config?.alcanceMaximo
      ? Number(col.config.alcanceMaximo)
      : null;

    return (
      <div
        key={col.id}
        className={`insert-field ${temErro ? "insert-field--error" : valor ? "insert-field--ok" : ""} ${isCalculo ? "insert-field--disabled" : ""}`}
      >
        <div className="insert-field-header">
          <div className="insert-field-label-group">
            <label className="insert-field-label">{col.nome}</label>
            {col.config?.naoVazio && !isCalculo && (
              <span className="insert-required">*</span>
            )}
          </div>
          <span className="insert-field-tipo">
            {getNomeTipoAmigavel(col.tipoDado)}
          </span>
        </div>

        {isBoleano ? (
          <div className="insert-bool-group">
            {[
              { val: true, label: col.config?.labelTrue || "Verdadeiro" },
              { val: false, label: col.config?.labelFalse || "Falso" },
            ].map((btn) => (
              <button
                key={String(btn.val)}
                type="button"
                disabled={isCalculo}
                className={`insert-bool-btn ${valor === btn.val ? "insert-bool-btn--active" : ""}`}
                onClick={() => onChange(btn.val)}
              >
                {btn.val === true ? (
                  <i className="fi fi-rr-check" />
                ) : (
                  <i className="fi fi-rr-cross" />
                )}
                {btn.label}
              </button>
            ))}
          </div>
        ) : isLista && opcoes.length > 0 ? (
          <div className="insert-lista-cards">
            {opcoes.map((op) => (
              <button
                key={op}
                type="button"
                disabled={isCalculo}
                className={`insert-lista-card ${valor === op ? "insert-lista-card--active" : ""}`}
                onClick={() => onChange(op)}
              >
                {op}
              </button>
            ))}
          </div>
        ) : isLista && opcoes.length === 0 ? (
          <div className="insert-lista-vazia">
            <i className="fi fi-rr-info" />
            <span>Nenhum item configurado para esta lista.</span>
          </div>
        ) : isTemporal && !isCalculo ? (
          <MaskedTemporalInput
            tipo={tipoDadoNorm}
            value={valor}
            onChange={onChange}
            temErro={temErro}
          />
        ) : (
          <div
            className={`insert-input-wrapper ${maxLength ? "insert-input-wrapper--has-counter" : ""}`}
          >
            <input
              type="text"
              className={`insert-input ${temErro ? "insert-input--error" : valor && !isCalculo ? "insert-input--ok" : ""} ${isCalculo ? "insert-input--disabled" : ""}`}
              value={isCalculo ? "" : valor}
              disabled={isCalculo}
              onChange={(e) => {
                if (isCalculo) return;
                let val = e.target.value;
                if (isInteiro) val = val.replace(/[^\d]/g, "");
                else if (isDecimal) {
                  val = val.replace(/[^0-9,.]/g, "");
                  const partes = val.split(/[,.]/);
                  if (partes.length > 2)
                    val = partes[0] + "," + partes.slice(1).join("");
                }
                if (maxLength && val.length > maxLength)
                  val = val.slice(0, maxLength);
                onChange(val);
              }}
              placeholder={
                isCalculo
                  ? "Calculado automaticamente"
                  : getPlaceholderPorTipo(col)
              }
            />
            {maxLength && !isCalculo && (
              <span
                className={`insert-char-counter ${valor.length >= maxLength ? "insert-char-counter--over" : valor.length > maxLength * 0.75 ? "insert-char-counter--warn" : ""}`}
              >
                {valor.length}/{maxLength}
              </span>
            )}
            {!maxLength && !isCalculo && (
              <>
                {valor && !temErro && (
                  <i className="fi fi-rr-check insert-input-icon insert-input-icon--ok" />
                )}
                {temErro && (
                  <i className="fi fi-rr-cross insert-input-icon insert-input-icon--error" />
                )}
              </>
            )}
          </div>
        )}

        {temErro && (
          <span className="insert-field-error">
            <i className="fi fi-rr-exclamation" /> {erro}
          </span>
        )}
      </div>
    );
  };

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
            <i className="fi-rr-plus" />
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
                    <div className="selection-actions">
                      <button
                        className="selection-action-btn selection-action-btn--edit"
                        onClick={openAtualizar}
                        disabled={selectedRows.length !== 1}
                        title={
                          selectedRows.length !== 1
                            ? "Selecione apenas 1 registro para editar"
                            : "Editar registro"
                        }
                      >
                        <i className="fi fi-sr-file-edit" /> Atualizar
                      </button>
                      <span className="selection-action-divider" />
                      <button
                        className="selection-action-btn selection-action-btn--delete"
                        onClick={openConfirmarDeletar}
                        title="Excluir selecionados"
                      >
                        <i className="fi fi-sr-trash" /> Excluir
                      </button>
                    </div>
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
                        {(activeTabData?.cols || []).map((col) => (
                          <th
                            key={col.nome}
                            className={`resizable-col${col.identificacao === "pk" ? " sticky-col sticky-id" : ""}`}
                          >
                            <div className="cell-content">
                              <div className="col-label-group">
                                <span className="col-label">
                                  {col.nome.toUpperCase()}
                                </span>
                                <div
                                  className="col-header-menu"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    className="col-header-menu-btn"
                                    title="Opções da coluna"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const rect =
                                        e.currentTarget.getBoundingClientRect();
                                      setDropdownPos({
                                        top: rect.bottom + 6,
                                        right: window.innerWidth - rect.right,
                                      });
                                      setHeaderMenuAberto((prev) =>
                                        prev === col.nome ? null : col.nome,
                                      );
                                    }}
                                  >
                                    <i className="fi fi-rr-menu-dots-vertical" />
                                  </button>
                                </div>
                              </div>
                              <button
                                className="resizer-handle"
                                onMouseDown={(e) =>
                                  handleMouseDown(e, col.nome)
                                }
                              >
                                <i className="fi-sr-arrows-from-line" />
                              </button>
                            </div>
                          </th>
                        ))}
                        <th className="actions-header sticky-col sticky-actions">
                          <div className="actions-cell-content">
                            <button
                              title="Recarregar dados"
                              onClick={() =>
                                activeTab && carregarDadosTabela(activeTab)
                              }
                            >
                              <i className="fi fi-rr-refresh" />
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
                            {resizableCols.map((col) => {
                              const isPK =
                                activeTabData?.cols?.find((c) => c.nome === col)
                                  ?.identificacao === "pk";
                              return (
                                <td
                                  key={col}
                                  className={`data-cell${isPK ? " sticky-col sticky-id" : ""}`}
                                >
                                  {row[col]}
                                </td>
                              );
                            })}
                            <td className="actions-cell sticky-col sticky-actions">
                              <div className="actions-container" />
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
        <div className="wizard-overlay">
          <div className={wizardCardClass} onClick={(e) => e.stopPropagation()}>
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
                        <div className="col-card-top">
                          <span className="col-num">#{idx + 1}</span>
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
                                <i className="fi-sr-lock cadeado" />
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
                      const hasListaItens =
                        cfgs.includes("mascaraLista") && !locked;
                      const hasCalculoPanel = cat === "calculo" && !locked;
                      const colunasNumericasWizard = colunas.filter(
                        (c) =>
                          c.id !== col.id &&
                          ["Inteiro", "Decimal"].includes(c.tipoDado) &&
                          c.nome.trim() &&
                          c.identificacao !== "pk" &&
                          c.identificacao !== "fk",
                      );
                      const fkTabelasWizard = colunas
                        .filter((c) => c.identificacao === "fk" && c.fkTabela)
                        .reduce((acc, c) => {
                          if (!acc.find((x) => x.tabelaId === c.fkTabela)) {
                            const tab = tabs.find((t) => t.id === c.fkTabela);
                            acc.push({
                              tabelaId: c.fkTabela,
                              tabelaNome: tab?.name,
                            });
                          }
                          return acc;
                        }, []);

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
                                  {toggles.map((key) => (
                                    <label
                                      key={key}
                                      className={`cfg-toggle ${col.config[key] ? "cfg-toggle--on" : ""} ${locked ? "cfg-toggle--locked" : ""}`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={!!col.config[key]}
                                        disabled={locked}
                                        onChange={(e) =>
                                          !locked &&
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
                                  ))}
                                </div>
                              )}
                              {inputs.length > 0 && (
                                <div className="cfg-inputs">
                                  {inputs.map((key) => {
                                    const bloqueado = locked;
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
                                        <label>{CONFIG_META[key].label}</label>
                                        <input
                                          type="text"
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
                              {hasListaItens && (
                                <div className="cfg-opcoes">
                                  <label>Itens da lista</label>
                                  <ListaItensInput
                                    itens={col.config.mascaraLista ?? []}
                                    onChange={(v) =>
                                      updateConfig(col.id, "mascaraLista", v)
                                    }
                                  />
                                </div>
                              )}
                              {hasCalculoPanel && (
                                <CalculoConfigPanel
                                  key={col.id}
                                  config={col.config}
                                  onChange={(calculoObj) => {
                                    updateConfig(
                                      col.id,
                                      "operador",
                                      calculoObj.operador,
                                    );
                                    updateConfig(col.id, "op1", calculoObj.op1);
                                    updateConfig(col.id, "op2", calculoObj.op2);
                                  }}
                                  colunasNumericas={colunasNumericasWizard}
                                  fkTabelas={fkTabelasWizard}
                                  tabs={tabs}
                                />
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
                        Gerar tabela <i className="fi fi-sr-rocket-lunch" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════ MODAL EXCLUSÃO DE TABELA ═════════════════════════ */}
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
                  Todas as colunas e seus registros vinculados a esta tabela
                  serão permanentemente apagados.
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

      {/* ═══════════════════ MODAL RENOMEAR TABELA ══════════════════════════ */}
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
              </div>

              <div className="modal-tabs-bar">
                <button
                  className={`modal-tab-btn ${inserirTab === "manual" ? "active" : ""}`}
                  onClick={() => setInserirTab("manual")}
                >
                  <i className="fi fi-rr-pencil" /> Inserção manual
                </button>
                <button
                  className={`modal-tab-btn ${inserirTab === "import" ? "active" : ""}`}
                  onClick={() => setInserirTab("import")}
                >
                  <i className="fi fi-rr-cloud-upload" /> Importar arquivo
                </button>
              </div>

              <div className="modal-styled-body modal-insert-body">
                {colsParaInserir.length === 0 ? (
                  <p className="modal-insert-empty">
                    Esta tabela não possui colunas editáveis.
                  </p>
                ) : inserirTab === "manual" ? (
                  <div className="insert-manual-container">
                    {inserirRows.map((row, rowIdx) => (
                      <div key={row.id} className="insert-row-card">
                        <div className="insert-row-header">
                          <span className="row-num">Linha #{rowIdx + 1}</span>
                          <button
                            className="row-remove-btn"
                            onClick={() => removeInserirRow(row.id)}
                            disabled={inserirRows.length <= 1}
                          >
                            <i className="fi fi-rr-trash" /> Remover
                          </button>
                        </div>
                        <div className="insert-row-fields">
                          {colsParaInserir.map((col) =>
                            renderCampoEdicao(
                              col,
                              row.data[col.nome] ?? "",
                              inserirErros[row.id]?.[col.nome],
                              (val) =>
                                handleInserirRowChange(row.id, col.nome, val),
                            ),
                          )}
                        </div>
                      </div>
                    ))}
                    <button className="btn-add-row" onClick={addInserirRow}>
                      <i className="fi fi-rr-plus" /> Adicionar linha
                    </button>
                  </div>
                ) : (
                  <div className="import-container">
                    <div
                      className={`import-drop-area ${importDragOver ? "drag-over" : ""} ${importFile ? "import-drop-area--done" : ""}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setImportDragOver(true);
                      }}
                      onDragLeave={() => setImportDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() =>
                        document.getElementById("import-file-input").click()
                      }
                    >
                      <input
                        id="import-file-input"
                        type="file"
                        accept=".xlsx,.xls,.csv,.json"
                        style={{ display: "none" }}
                        onChange={(e) => handleFileImport(e.target.files[0])}
                      />
                      {importFile ? (
                        <>
                          <div className="import-area-icon import-area-icon--done">
                            <i className="fi fi-sr-check-circle" />
                          </div>
                          <p className="import-area-title">{importFile.name}</p>
                          <p className="import-area-sub">
                            {importPreview.length} linha(s) detectada(s) —
                            clique para trocar
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="import-area-icon">
                            <i className="fi fi-rr-cloud-upload" />
                          </div>
                          <p className="import-area-title">
                            Arraste o arquivo ou clique para selecionar
                          </p>
                          <p className="import-area-sub">
                            Formatos suportados:
                          </p>
                          <div className="import-formats">
                            {[".xlsx", ".xls", ".csv", ".json"].map((f) => (
                              <span
                                key={f}
                                className={`import-fmt-tag ${f.replace(".", "")}`}
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    {importPreview.length > 0 && (
                      <div className="import-preview">
                        <div className="import-preview-header">
                          <p className="import-preview-title">
                            <i className="fi fi-rr-table" /> Pré-visualização (
                            {importPreview.length} linha
                            {importPreview.length !== 1 ? "s" : ""})
                          </p>
                          <button
                            className="import-clear-btn"
                            onClick={() => {
                              setImportFile(null);
                              setImportPreview([]);
                            }}
                          >
                            <i className="fi fi-rr-trash" /> Remover
                          </button>
                        </div>
                        <div className="import-preview-table-wrap">
                          <table className="import-preview-table">
                            <thead>
                              <tr>
                                {colsParaInserir.map((col) => (
                                  <th key={col.id}>{col.nome}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {importPreview.slice(0, 5).map((row, i) => (
                                <tr key={i}>
                                  {colsParaInserir.map((col) => (
                                    <td key={col.id}>
                                      {row[col.nome] ??
                                        row[col.nome.toLowerCase()] ??
                                        "—"}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {importPreview.length > 5 && (
                            <p className="import-preview-more">
                              +{importPreview.length - 5} linha(s) não exibidas
                              na pré-visualização
                            </p>
                          )}
                        </div>
                      </div>
                    )}
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
                      <i className="fi fi-rr-check" />
                      {inserirTab === "import"
                        ? "Importar dados"
                        : inserirRows.length > 1
                          ? `Inserir ${inserirRows.length} registros`
                          : "Inserir registro"}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════ MODAL ATUALIZAR DADOS ══════════════════════ */}
      <AnimatePresence mode="wait">
        {atualizarOpen && (
          <div className="modal-overlay">
            <motion.div
              key="modal-atualizar"
              className="modal-styled modal-styled--insert"
              variants={fadeOutVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="modal-styled-header">
                <div className="modal-styled-icon modal-styled-icon--primary">
                  <i className="fi fi-sr-file-edit" />
                </div>
                <div>
                  <h2 className="modal-styled-title">Atualizar registro</h2>
                  <p className="modal-styled-subtitle">
                    Tabela: {activeTabData?.name}
                  </p>
                </div>
                <button
                  className="modal-styled-close"
                  onClick={() => setAtualizarOpen(false)}
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
                  <div className="insert-row-card">
                    <div className="insert-row-header">
                      <span className="row-num">
                        Editando registro #{atualizarRowId}
                      </span>
                    </div>
                    <div className="insert-row-fields">
                      {colsParaInserir.map((col) =>
                        renderCampoEdicao(
                          col,
                          atualizarRowData[col.nome] ?? "",
                          atualizarErros[col.nome],
                          (val) => handleAtualizarRowChange(col.nome, val),
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-styled-footer">
                <button
                  className="btn-secondary"
                  onClick={() => setAtualizarOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  className="btn-primary"
                  onClick={handleAtualizarSubmit}
                  disabled={!atualizarFormValido || loadingAtualizar}
                >
                  {loadingAtualizar ? (
                    <span className="btn-spinner" />
                  ) : (
                    <>
                      <i className="fi fi-rr-check" /> Salvar alterações
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Dropdown flutuante de coluna ──────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {headerMenuAberto &&
          (() => {
            const colAberta = activeTabData?.cols?.find(
              (c) => c.nome === headerMenuAberto,
            );
            if (!colAberta) return null;
            return (
              <motion.div
                key="col-header-dropdown"
                className="col-header-dropdown col-header-dropdown--portal"
                style={{ top: dropdownPos.top, right: dropdownPos.right }}
                onClick={(e) => e.stopPropagation()}
                variants={fadeOutVariants}
                exit="exit"
              >
                {colAberta.identificacao !== "pk" ? (
                  <>
                    <button
                      className="col-dropdown-item"
                      onClick={() => abrirConfigurarColuna(colAberta)}
                    >
                      <i className="fi fi-sr-settings" /> Configurar
                    </button>
                    <button
                      className="col-dropdown-item col-dropdown-item--danger"
                      onClick={() => abrirExcluirColuna(colAberta)}
                    >
                      <i className="fi fi-sr-trash" /> Excluir
                    </button>
                  </>
                ) : (
                  <span className="col-dropdown-locked">
                    <i className="fi fi-rr-lock" /> Chave primária — bloqueada
                  </span>
                )}
              </motion.div>
            );
          })()}
      </AnimatePresence>

      {/* ═══════════════════ MODAL EXCLUIR COLUNA ══════════════════════════ */}
      <AnimatePresence mode="wait">
        {colunaParaExcluir &&
          (() => {
            const temDados = colunaTemDados(colunaParaExcluir.nome);
            return (
              <div className="modal-overlay">
                <motion.div
                  key="modal-excluir-coluna"
                  className="modal-styled modal-styled--sm"
                  variants={fadeOutVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="modal-styled-header modal-styled-header--danger">
                    <div className="modal-styled-icon">
                      <i className="fi-sr-trash" />
                    </div>
                    <div>
                      <h2 className="modal-styled-title">Excluir coluna</h2>
                      <p className="modal-styled-subtitle">
                        "{colunaParaExcluir.nome}"
                      </p>
                    </div>
                    <button
                      className="modal-styled-close"
                      onClick={() => setColunaParaExcluir(null)}
                    >
                      <i className="fi fi-rr-cross" />
                    </button>
                  </div>
                  <div className="modal-styled-body">
                    {temDados ? (
                      <div className="col-excluir-bloqueado">
                        <div className="col-excluir-bloqueado-icon">
                          <i className="fi fi-sr-shield-exclamation" />
                        </div>
                        <p className="col-excluir-bloqueado-title">
                          Exclusão bloqueada
                        </p>
                        <p className="col-excluir-bloqueado-desc">
                          A coluna <strong>"{colunaParaExcluir.nome}"</strong>{" "}
                          possui registros cadastrados. Remova todos os dados
                          desta coluna antes de excluí-la.
                        </p>
                        <div className="col-excluir-contagem">
                          <i className="fi fi-rr-database" />
                          <span>
                            {
                              rows.filter((r) => {
                                const v = r[colunaParaExcluir.nome];
                                return (
                                  v !== "" && v !== null && v !== undefined
                                );
                              }).length
                            }{" "}
                            registro(s) com dados nesta coluna
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="modal-styled-desc">
                          Esta ação é irreversível. A coluna será apagada
                          permanentemente da tabela!
                        </p>
                        <div className="modal-styled-field">
                          <label>
                            Digite <strong>{colunaParaExcluir.nome}</strong>{" "}
                            para confirmar
                          </label>
                          <input
                            type="text"
                            value={confirmacaoExclusaoColuna}
                            onChange={(e) =>
                              setConfirmacaoExclusaoColuna(e.target.value)
                            }
                            placeholder={colunaParaExcluir.nome}
                            autoFocus
                            className={
                              confirmacaoExclusaoColuna ===
                              colunaParaExcluir.nome
                                ? "input-match"
                                : ""
                            }
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="modal-styled-footer">
                    <button
                      className="btn-secondary"
                      onClick={() => setColunaParaExcluir(null)}
                    >
                      Cancelar
                    </button>
                    {!temDados && (
                      <button
                        className="btn-danger"
                        disabled={
                          confirmacaoExclusaoColuna !== colunaParaExcluir.nome
                        }
                        onClick={handleExcluirColuna}
                      >
                        <i className="fi fi-rr-trash" /> Excluir coluna
                      </button>
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })()}
      </AnimatePresence>

      {/* ═══════════════════ MODAL CONFIGURAR COLUNA ════════════════════════ */}
      <AnimatePresence mode="wait">
        {colunaParaConfigurar && configEdicao && (
          <div className="modal-overlay">
            <motion.div
              key="modal-configurar-coluna"
              className="modal-styled modal-styled--config-col"
              variants={fadeOutVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="modal-styled-header">
                <div className="modal-styled-icon modal-styled-icon--neutral">
                  <i className="fi fi-sr-settings" />
                </div>
                <div>
                  <h2 className="modal-styled-title">Configurar coluna</h2>
                  <p className="modal-styled-subtitle">
                    "{colunaParaConfigurar.nome}"
                  </p>
                </div>
                <button
                  className="modal-styled-close"
                  onClick={() => {
                    setColunaParaConfigurar(null);
                    setConfigEdicao(null);
                  }}
                >
                  <i className="fi fi-rr-cross" />
                </button>
              </div>

              <div className="modal-styled-body config-col-body">
                <div className="config-col-section">
                  <span className="config-col-section-label">
                    <i className="fi fi-rr-id-badge" /> Nome da coluna
                  </span>
                  <div className="col-nome-input-wrapper config-nome-field">
                    <input
                      type="text"
                      className="col-nome-input"
                      id={"input-edicao-nome-col"}
                      value={configEdicao.nome}
                      maxLength={NOME_MAX}
                      onChange={(e) =>
                        setConfigEdicao((prev) => ({
                          ...prev,
                          nome: e.target.value,
                        }))
                      }
                      placeholder="Ex: nome, email, valor..."
                    />
                    <span
                      className={`col-nome-counter-inline ${configEdicao.nome.length >= NOME_MAX ? "col-nome-counter--over" : ""}`}
                    >
                      {configEdicao.nome.length}/{NOME_MAX}
                    </span>
                  </div>
                </div>

                {configEdicao.identificacao === "fk" && (
                  <div className="config-col-section">
                    <div className="config-col-section-header">
                      <span className="config-col-section-label">
                        <i className="fi fi-sr-share" /> Chave estrangeira
                      </span>
                      <button
                        className="config-col-remover-fk"
                        onClick={handleConfigEdicaoRemoverFK}
                      >
                        <i className="fi fi-rr-unlink" /> Remover relacionamento
                      </button>
                    </div>
                    <div className="col-fk-panel" style={{ padding: 0 }}>
                      <select
                        className="fk-select"
                        value={configEdicao.fkTabela || ""}
                        onChange={(e) =>
                          handleConfigEdicaoFKTabela(e.target.value)
                        }
                      >
                        <option value="">Selecione a tabela...</option>
                        {tabs
                          .filter((t) => t.id !== activeTab)
                          .map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                      </select>
                      {configEdicao.fkTabela && (
                        <select
                          className="fk-select"
                          value={configEdicao.fkColunaId || ""}
                          onChange={(e) =>
                            handleConfigEdicaoFKColuna(parseInt(e.target.value))
                          }
                        >
                          <option value="">
                            Selecione a chave primária...
                          </option>
                          {getPKsDeTabela(configEdicao.fkTabela).map((pk) => (
                            <option key={pk.id} value={pk.id}>
                              {pk.nome}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    {configEdicao.tipoDado && (
                      <div
                        className="col-tipo-auto"
                        style={{ padding: "6px 0 0" }}
                      >
                        <i className="fi fi-rr-magic-wand fk" />
                        <span>
                          Tipo herdado: <strong>{configEdicao.tipoDado}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {configEdicao.identificacao !== "fk" && (
                  <div className="config-col-section">
                    <span className="config-col-section-label">
                      Tipo de dado
                    </span>
                    <div className="grupo-tabs">
                      {Object.keys(GRUPOS_TIPOS).map((g) => (
                        <button
                          key={g}
                          type="button"
                          className={`grupo-tab ${configEdicao.grupo === g ? "grupo-tab--active" : ""}`}
                          onClick={() => handleConfigEdicaoGrupo(g)}
                        >
                          <i className={`fi ${GRUPO_ICONS[g]}`} /> {g}
                        </button>
                      ))}
                    </div>
                    {configEdicao.grupo && (
                      <div className="tipo-pills">
                        {GRUPOS_TIPOS[configEdicao.grupo].map((t) => (
                          <button
                            key={t}
                            type="button"
                            className={`tipo-pill ${configEdicao.tipoDado === t ? "tipo-pill--active" : ""}`}
                            onClick={() => handleConfigEdicaoTipo(t)}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {configEdicao.tipoDado &&
                  (() => {
                    const cat = getTipoCategoria(configEdicao.tipoDado);
                    const cfgs = cat ? CONFIGS_POR_CATEGORIA[cat] : [];
                    const toggles = cfgs.filter(
                      (k) => CONFIG_META[k]?.tipo === "toggle",
                    );
                    const inputs = cfgs.filter((k) =>
                      ["text", "number"].includes(CONFIG_META[k]?.tipo),
                    );
                    const hasListaItens = cfgs.includes("mascaraLista");
                    const hasCalculoPanel = cat === "calculo";
                    const colunasNumericasModal = (
                      activeTabData?.cols || []
                    ).filter(
                      (c) =>
                        c.id !== colunaParaConfigurar?.id &&
                        ["numero_int", "numero_dec"].includes(c.tipoDado) &&
                        c.identificacao !== "pk" &&
                        c.identificacao !== "fk",
                    );
                    const fkTabelasModal = (activeTabData?.cols || [])
                      .filter((c) => c.identificacao === "fk" && c.fkTabela)
                      .reduce((acc, c) => {
                        if (!acc.find((x) => x.tabelaId === c.fkTabela)) {
                          const tab = tabs.find((t) => t.id === c.fkTabela);
                          acc.push({
                            tabelaId: c.fkTabela,
                            tabelaNome: tab?.name,
                          });
                        }
                        return acc;
                      }, []);
                    if (cfgs.length === 0 && !hasCalculoPanel) return null;
                    return (
                      <div className="config-col-section">
                        <span className="config-col-section-label">Opções</span>
                        <div className="cfg-body" style={{ padding: 0 }}>
                          {toggles.length > 0 && (
                            <div className="cfg-toggles">
                              {toggles.map((key) => (
                                <label
                                  key={key}
                                  className={`cfg-toggle ${configEdicao.config[key] ? "cfg-toggle--on" : ""}`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={!!configEdicao.config[key]}
                                    onChange={(e) =>
                                      updateConfigEdicaoConfig(
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
                              ))}
                            </div>
                          )}
                          {inputs.length > 0 && (
                            <div className="cfg-inputs">
                              {inputs.map((key) => {
                                if (key === "alcanceMaximo") {
                                  return (
                                    <div key={key} className="cfg-input-field">
                                      <label>
                                        {CONFIG_META.alcanceMaximo.label}
                                        <span className="cfg-max-hint">
                                          máx. 255
                                        </span>
                                      </label>
                                      <input
                                        type="text"
                                        inputMode="numeric"
                                        value={
                                          configEdicao.config.alcanceMaximo ??
                                          ""
                                        }
                                        onChange={(e) => {
                                          const raw = e.target.value.replace(
                                            /\D/g,
                                            "",
                                          );
                                          if (raw === "") {
                                            updateConfigEdicaoConfig(
                                              "alcanceMaximo",
                                              "",
                                            );
                                            return;
                                          }
                                          updateConfigEdicaoConfig(
                                            "alcanceMaximo",
                                            String(
                                              Math.min(parseInt(raw, 10), 255),
                                            ),
                                          );
                                        }}
                                        placeholder="1 – 255"
                                      />
                                    </div>
                                  );
                                }
                                return (
                                  <div key={key} className="cfg-input-field">
                                    <label>{CONFIG_META[key].label}</label>
                                    <input
                                      type="text"
                                      value={configEdicao.config[key] ?? ""}
                                      onChange={(e) =>
                                        updateConfigEdicaoConfig(
                                          key,
                                          e.target.value,
                                        )
                                      }
                                      placeholder={`Defina ${CONFIG_META[key].label.toLowerCase()}`}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {hasListaItens && (
                            <div className="cfg-opcoes">
                              <label>Itens da lista</label>
                              <ListaItensInput
                                itens={configEdicao.config.mascaraLista ?? []}
                                onChange={(v) =>
                                  updateConfigEdicaoConfig("mascaraLista", v)
                                }
                              />
                            </div>
                          )}
                          {hasCalculoPanel && (
                            <CalculoConfigPanel
                              config={configEdicao.config}
                              onChange={(calculoObj) => {
                                Object.entries(calculoObj).forEach(
                                  ([key, value]) => {
                                    updateConfigEdicaoConfig(key, value);
                                  },
                                );
                              }}
                              colunasNumericas={colunasNumericasModal}
                              fkTabelas={fkTabelasModal}
                              tabs={tabs}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })()}
              </div>

              <div className="modal-styled-footer">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setColunaParaConfigurar(null);
                    setConfigEdicao(null);
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="btn-primary"
                  onClick={handleSalvarConfiguracao}
                  disabled={
                    loadingSalvarConfig ||
                    !configEdicao.nome.trim() ||
                    !configEdicao.tipoDado
                  }
                >
                  {loadingSalvarConfig ? (
                    <span className="btn-spinner" />
                  ) : (
                    <>
                      <i className="fi fi-rr-check" /> Salvar alterações
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* ═══════════════ MODAL CONFIRMAR EXCLUSÃO DE REGISTROS ═════════════════ */}
      <AnimatePresence mode="wait">
        {confirmarDeletarOpen && (
          <div className="modal-overlay">
            <motion.div
              key="modal-confirmar-deletar"
              className="modal-styled modal-styled--sm"
              variants={fadeOutVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="modal-styled-header modal-styled-header--danger">
                <div className="modal-styled-icon">
                  <i className="fi fi-sr-trash" />
                </div>
                <div>
                  <h2 className="modal-styled-title">Excluir registros</h2>
                  <p className="modal-styled-subtitle">
                    {selectedRows.length} registro(s) selecionado(s)
                  </p>
                </div>
                <button
                  className="modal-styled-close"
                  onClick={() => setConfirmarDeletarOpen(false)}
                >
                  <i className="fi fi-rr-cross" />
                </button>
              </div>

              <div className="modal-styled-body">
                <p className="modal-styled-desc">
                  Esta ação é irreversível. Os dados serão permanentemente
                  removidos do banco de dados.
                </p>

                <div className="modal-styled-field">
                  <label>
                    Digite <strong>{activeTabData?.name}</strong> para confirmar
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={confirmarDeletarNome}
                    onChange={(e) => setConfirmarDeletarNome(e.target.value)}
                    placeholder={activeTabData?.name}
                    className={
                      confirmarDeletarNome === activeTabData?.name
                        ? "input-match"
                        : ""
                    }
                  />
                </div>

                <label className="confirmar-deletar-ciente">
                  <div className="ciente-checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={confirmarDeletarCiente}
                      onChange={(e) =>
                        setConfirmarDeletarCiente(e.target.checked)
                      }
                    />
                    <span className="ciente-checkbox-dot" />
                  </div>
                  <span className="ciente-label">
                    Estou ciente que os registros serão removidos
                    permanentemente
                  </span>
                </label>
              </div>

              <div className="modal-styled-footer">
                <button
                  className="btn-secondary"
                  onClick={() => setConfirmarDeletarOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  className="btn-danger"
                  disabled={
                    confirmarDeletarNome !== activeTabData?.name ||
                    !confirmarDeletarCiente
                  }
                  onClick={handleDeletarSelecionados}
                >
                  <i className="fi fi-rr-trash" /> Excluir{" "}
                  {selectedRows.length > 1
                    ? `${selectedRows.length} registros`
                    : "registro"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── ListaItensInput ──────────────────────────────────────────────────────────
function ListaItensInput({ itens, onChange }) {
  const [inputVal, setInputVal] = useState("");
  const add = () => {
    const v = inputVal.trim();
    if (v && !itens.includes(v)) {
      onChange([...itens, v]);
      setInputVal("");
    }
  };
  return (
    <div className="lista-itens-input">
      <div className="lista-itens-tags">
        {itens.length === 0 && (
          <span className="lista-itens-placeholder">
            Nenhum item adicionado
          </span>
        )}
        {itens.map((item, i) => (
          <span key={i} className="lista-item-tag">
            {item}
            <button
              type="button"
              onClick={() => onChange(itens.filter((_, j) => j !== i))}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="lista-itens-add">
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
          placeholder="Novo item... (Enter para adicionar)"
        />
        <button type="button" className="lista-itens-add-btn" onClick={add}>
          +
        </button>
      </div>
    </div>
  );
}

// ─── MaskedTemporalInput ──────────────────────────────────────────────────────
function MaskedTemporalInput({ tipo, value, onChange, temErro }) {
  const CONFIGS = {
    data: {
      placeholder: "DD/MM/AAAA",
      maxDigits: 8,
      separators: { 2: "/", 4: "/" },
    },
    hora: {
      placeholder: "HH:MM:SS",
      maxDigits: 6,
      separators: { 2: ":", 4: ":" },
    },
    data_hora: {
      placeholder: "DD/MM/AAAA HH:MM",
      maxDigits: 12,
      separators: { 2: "/", 4: "/", 8: " ", 10: ":" },
    },
  };
  const cfg = CONFIGS[tipo] || CONFIGS.data;

  const formatDigits = (d) => {
    if (!d) return "";
    let result = "";
    for (let i = 0; i < d.length; i++) {
      result += d[i];
      if (cfg.separators[i + 1] !== undefined && i + 1 < d.length)
        result += cfg.separators[i + 1];
    }
    return result;
  };

  const digitsToDbValue = (d) => {
    if (!d || d.length < cfg.maxDigits) return "";
    switch (tipo) {
      case "data":
        return `${d.slice(4, 8)}-${d.slice(2, 4)}-${d.slice(0, 2)}`;
      case "hora":
        return `${d.slice(0, 2)}:${d.slice(2, 4)}:${d.slice(4, 6)}`;
      case "data_hora":
        return `${d.slice(4, 8)}-${d.slice(2, 4)}-${d.slice(0, 2)} ${d.slice(8, 10)}:${d.slice(10, 12)}`;
      default:
        return "";
    }
  };

  const [digits, setDigits] = useState(() =>
    (value || "").replace(/\D/g, "").slice(0, cfg.maxDigits),
  );
  const isComplete = digits.length === cfg.maxDigits;

  const applyChange = (newDigits) => {
    setDigits(newDigits);
    onChange(digitsToDbValue(newDigits));
  };
  const handleChange = (e) =>
    applyChange(e.target.value.replace(/\D/g, "").slice(0, cfg.maxDigits));
  const handleKeyDown = (e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      applyChange(digits.slice(0, -1));
    }
  };

  const handleNow = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    let d = "";
    if (tipo === "data")
      d = `${pad(now.getDate())}${pad(now.getMonth() + 1)}${now.getFullYear()}`;
    else if (tipo === "hora")
      d = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    else
      d = `${pad(now.getDate())}${pad(now.getMonth() + 1)}${now.getFullYear()}${pad(now.getHours())}${pad(now.getMinutes())}`;
    applyChange(d);
  };

  const isClockOnly = tipo === "hora";

  return (
    <div
      className={`temporal-input-wrapper ${isComplete && !temErro ? "temporal--ok" : temErro ? "temporal--error" : ""}`}
    >
      <input
        type="text"
        className="temporal-input"
        value={formatDigits(digits)}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={cfg.placeholder}
        inputMode="numeric"
        autoComplete="off"
      />
      <div className="temporal-actions">
        {isComplete && !temErro && (
          <i className="fi fi-rr-check temporal-icon temporal-icon--ok" />
        )}
        {temErro && (
          <i className="fi fi-rr-cross temporal-icon temporal-icon--error" />
        )}
        <button
          type="button"
          className="temporal-now-btn"
          onClick={handleNow}
          title={isClockOnly ? "Hora atual" : "Data/hora atual"}
        >
          <i className={`fi fi-rr-${isClockOnly ? "clock" : "calendar"}`} />
        </button>
      </div>
    </div>
  );
}

// ─── CalculoConfigPanel ───────────────────────────────────────────────────────
const OPERADORES = [
  { symbol: "+", label: "Soma" },
  { symbol: "-", label: "Subtração" },
  { symbol: "*", label: "Multiplicação" },
  { symbol: "/", label: "Divisão" },
  { symbol: "%", label: "Resto de Divisão" },
  { symbol: "^", label: "Potenciação" },
];

const DEFAULT_CALCULO = {
  operador: "+",
  op1: { tipo: "local", coluna: "", tabelaId: null },
  op2: { tipo: "local", coluna: "", tabelaId: null },
};

const merge = (saved) => ({
  ...DEFAULT_CALCULO,
  ...(saved ?? {}),
  op1: { ...DEFAULT_CALCULO.op1, ...(saved?.op1 ?? {}) },
  op2: { ...DEFAULT_CALCULO.op2, ...(saved?.op2 ?? {}) },
});

function CalculoConfigPanel({
  config,
  onChange,
  colunasNumericas,
  fkTabelas,
  tabs,
}) {
  const [calculo, setCalculo] = useState(() => merge(config.calculo));

  const [prevConfigCalculo, setPrevConfigCalculo] = useState(config.calculo);

  if (config.calculo !== prevConfigCalculo) {
    setPrevConfigCalculo(config.calculo);
    setCalculo(merge(config.calculo));
  }

  const commit = useCallback(
    (next) => {
      setCalculo(next);
      onChange(next);
    },
    [onChange],
  );

  const updateCalculo = (updates) => commit({ ...calculo, ...updates });

  const updateOp = (opKey, updates) => {
    const current = calculo[opKey] ?? {
      tipo: "local",
      coluna: "",
      tabelaId: null,
    };
    commit({ ...calculo, [opKey]: { ...current, ...updates } });
  };

  const expressaoCompleta = calculo.op1?.coluna && calculo.op2?.coluna;

  const renderOperandSection = (opKey, label) => {
    const op = calculo[opKey] ?? {
      tipo: "local",
      coluna: "",
      tabelaId: null,
    };
    const hasFK = fkTabelas.length > 0;
    const tabelaExt = op.tabelaId
      ? tabs.find((t) => t.id === op.tabelaId)
      : null;
    const colunasExt = (tabelaExt?.cols ?? []).filter((c) =>
      ["numero_int", "numero_dec"].includes(c.tipoDado),
    );
    const colsToShow = op.tipo === "local" ? colunasNumericas : colunasExt;

    return (
      <div className="calculo-operand-section">
        <span className="calculo-operand-label">{label}</span>

        {hasFK && (
          <div className="calculo-source-tabs">
            <button
              type="button"
              className={`calculo-source-btn ${op.tipo === "local" ? "calculo-source-btn--active" : ""}`}
              onClick={() =>
                updateOp(opKey, { tipo: "local", coluna: "", tabelaId: null })
              }
            >
              <i className="fi fi-rr-table" /> Esta tabela
            </button>
            <button
              type="button"
              className={`calculo-source-btn ${op.tipo === "externo" ? "calculo-source-btn--active" : ""}`}
              onClick={() =>
                updateOp(opKey, {
                  tipo: "externo",
                  coluna: "",
                  tabelaId: null,
                })
              }
            >
              <i className="fi fi-rr-link" /> Tabela relacionada
            </button>
          </div>
        )}

        {op.tipo === "externo" && (
          <div className="calculo-card-grid">
            {fkTabelas.map((fk) => (
              <button
                key={fk.tabelaId}
                type="button"
                className={`calculo-card ${op.tabelaId === fk.tabelaId ? "calculo-card--active" : ""}`}
                onClick={() =>
                  updateOp(opKey, { tabelaId: fk.tabelaId, coluna: "" })
                }
              >
                <i className="fi fi-rr-table calculo-card-icon" />
                <span className="calculo-card-nome">{fk.tabelaNome}</span>
              </button>
            ))}
          </div>
        )}

        {(op.tipo === "local" || (op.tipo === "externo" && op.tabelaId)) &&
          (colsToShow.length === 0 ? (
            <p className="calculo-empty-hint">
              <i className="fi fi-rr-info" />
              {op.tipo === "externo" && !op.tabelaId
                ? "Selecione a tabela acima"
                : "Nenhuma coluna numérica disponível"}
            </p>
          ) : (
            <div className="calculo-card-grid">
              {colsToShow.map((col) => (
                <button
                  key={col.id ?? col.nome}
                  type="button"
                  className={`calculo-card ${op.coluna === col.nome ? "calculo-card--active" : ""}`}
                  onClick={() => updateOp(opKey, { coluna: col.nome })}
                >
                  <span className="calculo-card-nome">{col.nome}</span>
                  <span className="calculo-card-tipo">
                    {getNomeTipoAmigavel(col.tipoDado)}
                  </span>
                </button>
              ))}
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="calculo-config">
      <div>
        <span className="calculo-section-label">Operador aritmético</span>
        <div className="calculo-operadores">
          {OPERADORES.map(({ symbol, label }) => (
            <button
              key={symbol}
              type="button"
              title={label}
              className={`calculo-op-btn ${calculo.operador === symbol ? "calculo-op-btn--active" : ""}`}
              onClick={() => updateCalculo({ operador: symbol })}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>

      <div className="calculo-operandos">
        {renderOperandSection("op1", "Operando 1")}

        <div className="calculo-op-divider" />

        {renderOperandSection("op2", "Operando 2")}
      </div>

      {expressaoCompleta && (
        <div className="calculo-preview-expr">
          <i className="fi fi-rr-function" />
          <code>
            {calculo.op1.tipo === "externo" && calculo.op1.tabelaId
              ? `${tabs.find((t) => t.id === calculo.op1.tabelaId)?.name}.${calculo.op1.coluna}`
              : calculo.op1.coluna}
            {` ${calculo.operador} `}
            {calculo.op2.tipo === "externo" && calculo.op2.tabelaId
              ? `${tabs.find((t) => t.id === calculo.op2.tabelaId)?.name}.${calculo.op2.coluna}`
              : calculo.op2.coluna}
          </code>
          <span className="calculo-preview-note">
            Calculado quando ambas as colunas estiverem preenchidas no registro
          </span>
        </div>
      )}
    </div>
  );
}
