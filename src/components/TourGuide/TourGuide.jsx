import React, { useState, useEffect, useRef, useCallback } from "react";
import "./TourGuide.scss";

// ─── Dados do exemplo — tabela "usuarios" ─────────────────────────────────────
const DEMO_NOME_TABELA = "usuarios";

const DEMO_COLUNAS = [
  {
    nome: "id",
    primaryKey: true,
    tipoDado: "Número",
    config: { naoNulo: true, unico: false, indexado: false, autoIncrem: true },
  },
  {
    nome: "nome",
    primaryKey: false,
    tipoDado: "Texto",
    config: { naoNulo: false, unico: false, indexado: false, autoIncrem: false },
  },
  {
    nome: "cpf",
    primaryKey: false,
    tipoDado: "Número",
    config: { naoNulo: false, unico: false, indexado: false, autoIncrem: false },
  },
  {
    nome: "data_nascimento",
    primaryKey: false,
    tipoDado: "Data",
    config: { naoNulo: false, unico: false, indexado: false, autoIncrem: false },
  },
  {
    nome: "conta_ativada",
    primaryKey: false,
    tipoDado: "Booleano",
    config: { naoNulo: false, unico: false, indexado: false, autoIncrem: false },
  },
];

const CONFIG_LABELS = {
  naoNulo: "Não nulo",
  unico: "Único",
  indexado: "Indexado",
  autoIncrem: "Auto-incremento",
};

const TODOS_TIPOS = ["Texto", "Número", "Data", "Booleano", "Lista", "JSON"];

// ─── Dados fictícios para demos de tabela ─────────────────────────────────────
const DEMO_ROWS = [
  { id: 1, nome: "Ana Lima", cpf: "123.456.789-00", data_nasc: "1995-03-12", ativo: "Sim" },
  { id: 2, nome: "Bruno Costa", cpf: "987.654.321-00", data_nasc: "1988-07-25", ativo: "Não" },
  { id: 3, nome: "Carla Souza", cpf: "456.123.789-00", data_nasc: "2001-11-04", ativo: "Sim" },
];

const DEMO_COLS_TABLE = ["id", "nome", "cpf", "data_nasc", "ativo"];

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Componentes Demo Reutilizáveis
// ═══════════════════════════════════════════════════════════════════════════════

// Mini tabela base usada pelos demos
function DemoMiniTable({ highlightCol, highlightCheckbox, highlightActions, highlightHeader, selectedRows = [] }) {
  return (
    <div className="demo-table-shell">
      {/* Header da página */}
      <div className={`demo-page-header ${highlightHeader ? "demo-highlight-zone" : ""}`}>
        <div className="demo-page-header-left">
          <span className="demo-label-sm">Registros</span>
          <span className="demo-count">{DEMO_ROWS.length}</span>
        </div>
        <div className="demo-page-header-right">
          <span className="demo-action-btn"><i className="fi fi-sr-add-document" /> Inserir</span>
          <span className="demo-action-btn"><i className="fi fi-sr-pencil" /> Renomear</span>
        </div>
      </div>

      {/* Tabela */}
      <div className="demo-table-wrap">
        <table className="demo-table">
          <thead>
            <tr>
              <th className={`demo-th demo-th-check ${highlightCheckbox ? "demo-highlight-zone" : ""}`}>
                <i className="fi fi-rr-square-plus demo-check-icon" />
              </th>
              {DEMO_COLS_TABLE.map((col) => (
                <th
                  key={col}
                  className={`demo-th ${highlightCol === col ? "demo-highlight-zone" : ""} ${col === "id" ? "demo-th-id" : ""}`}
                >
                  <div className="demo-th-inner">
                    <span>{col.toUpperCase()}</span>
                    {highlightCol === col && (
                      <i className="fi fi-rr-arrows-from-line demo-resize-icon" />
                    )}
                    {col !== "id" && highlightCol !== col && (
                      <i className="fi fi-rr-menu-dots-vertical demo-menu-icon" />
                    )}
                  </div>
                </th>
              ))}
              <th className={`demo-th demo-th-actions ${highlightActions ? "demo-highlight-zone" : ""}`}>
                <i className="fi fi-rr-refresh demo-refresh-icon" />
              </th>
            </tr>
          </thead>
          <tbody>
            {DEMO_ROWS.map((row) => {
              const isSelected = selectedRows.includes(row.id);
              return (
                <tr key={row.id} className={isSelected ? "demo-row-selected" : ""}>
                  <td className={`demo-td demo-td-check ${highlightCheckbox ? "demo-highlight-zone" : ""}`}>
                    <i className={`fi ${isSelected ? "fi-sr-angle-square-right demo-check-active" : "fi-rr-square demo-check-idle"}`} />
                  </td>
                  {DEMO_COLS_TABLE.map((col) => (
                    <td
                      key={col}
                      className={`demo-td ${col === "id" ? "demo-td-id" : ""} ${highlightCol === col ? "demo-highlight-zone" : ""}`}
                    >
                      {row[col]}
                    </td>
                  ))}
                  <td className={`demo-td demo-td-actions ${highlightActions ? "demo-highlight-zone" : ""}`}>
                    <i className="fi fi-rr-pencil demo-row-action" />
                    <i className="fi fi-rr-trash demo-row-action" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Demo: Abas de tabelas ────────────────────────────────────────────────────
function DemoTabs() {
  const [active, setActive] = useState(0);
  const tabs = ["usuarios", "produtos", "pedidos"];

  return (
    <div className="demo-feature-card">
      <div className="demo-tabs-bar">
        {tabs.map((t, i) => (
          <button
            key={t}
            className={`demo-tab ${active === i ? "demo-tab--active" : ""}`}
            onClick={() => setActive(i)}
          >
            {t}
          </button>
        ))}
        <div className="demo-tab-indicator" style={{ left: `${active * 90 + 12}px`, width: "72px" }} />
        <button className="demo-new-tab-btn">
          <i className="fi fi-rr-plus" />
        </button>
      </div>
      <div className="demo-tab-content">
        <div className="demo-tab-table-preview">
          <span className="demo-label-sm" style={{ color: "#aaa" }}>
            Exibindo tabela: <strong style={{ color: "#555" }}>{tabs[active]}</strong>
          </span>
          <div className="demo-mini-rows">
            {[1, 2, 3].map((n) => (
              <div key={n} className="demo-mini-row">
                <span className="demo-mini-cell demo-mini-cell--id">{n}</span>
                <span className="demo-mini-cell" style={{ flex: 2 }} />
                <span className="demo-mini-cell" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Demo: Contador de registros ──────────────────────────────────────────────
function DemoRecordCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let i = 0;
    const target = 142;
    const step = Math.ceil(target / 30);
    const iv = setInterval(() => {
      i = Math.min(i + step, target);
      setCount(i);
      if (i >= target) clearInterval(iv);
    }, 40);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="demo-feature-card">
      <div className="demo-record-header">
        <div className="demo-record-count-group">
          <span className="demo-record-label">Registros</span>
          <span className="demo-record-number">{count}</span>
        </div>
        <div className="demo-record-actions">
          <span className="demo-action-btn"><i className="fi fi-sr-add-document" /> Inserir registro</span>
          <span className="demo-action-btn"><i className="fi fi-sr-pencil" /> Renomear tabela</span>
          <span className="demo-action-btn demo-action-btn--danger"><i className="fi fi-sr-remove-folder" /> Excluir tabela</span>
        </div>
      </div>
      <div className="demo-record-hint">
        <i className="fi fi-rr-info" />
        <span>O contador atualiza em tempo real conforme você adiciona ou remove registros.</span>
      </div>
    </div>
  );
}

// ─── Demo: Barra de seleção ───────────────────────────────────────────────────
function DemoSelectionBar() {
  const [selected, setSelected] = useState(0);
  const total = 3;

  return (
    <div className="demo-feature-card">
      <div className="demo-sel-controls">
        <button
          className="demo-sel-btn"
          onClick={() => setSelected((s) => Math.max(0, s - 1))}
          disabled={selected === 0}
        >−</button>
        <span className="demo-sel-hint">Simule a seleção</span>
        <button
          className="demo-sel-btn"
          onClick={() => setSelected((s) => Math.min(total, s + 1))}
          disabled={selected === total}
        >+</button>
      </div>

      <div className={`demo-sel-bar ${selected > 0 ? "demo-sel-bar--active" : ""}`}>
        {selected > 0 ? (
          <>
            <span>{selected} item(s) selecionado(s)</span>
            <div className="demo-sel-actions">
              <span className={`demo-sel-action ${selected !== 1 ? "demo-sel-action--disabled" : ""}`}>
                <i className="fi fi-sr-file-edit" /> Atualizar
              </span>
              <span className="demo-sel-divider" />
              <span className="demo-sel-action">
                <i className="fi fi-sr-trash" /> Excluir
              </span>
            </div>
          </>
        ) : (
          <span style={{ color: "#aaa", fontSize: "13px" }}>Nenhum item selecionado</span>
        )}
      </div>

      <div className="demo-sel-note">
        <span>Atualizar só fica disponível com <strong>exatamente 1</strong> item selecionado</span>
      </div>
    </div>
  );
}

// ─── Demo: Checkbox de seleção ────────────────────────────────────────────────
function DemoCheckbox() {
  const [selected, setSelected] = useState([]);
  const ids = DEMO_ROWS.map((r) => r.id);
  const allSelected = selected.length === ids.length;

  const toggleAll = () => setSelected(allSelected ? [] : [...ids]);
  const toggleOne = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  return (
    <div className="demo-feature-card">
      <DemoMiniTable selectedRows={selected} highlightCheckbox />
      <div className="demo-checkbox-legend">
        <button className="demo-legend-btn" onClick={toggleAll}>
          {allSelected ? "Desmarcar todos" : "Selecionar todos"}
        </button>
        <div className="demo-legend-individual">
          {DEMO_ROWS.map((r) => (
            <button
              key={r.id}
              className={`demo-legend-btn demo-legend-btn--sm ${selected.includes(r.id) ? "demo-legend-btn--active" : ""}`}
              onClick={() => toggleOne(r.id)}
            >
              #{r.id}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Demo: Coluna ID fixa ─────────────────────────────────────────────────────
function DemoStickyID() {
  const [scrolled, setScrolled] = useState(false);

  return (
    <div className="demo-feature-card">
      <div className="demo-sticky-wrapper">
        <div className={`demo-sticky-table-scroll ${scrolled ? "demo-sticky-table-scroll--scrolled" : ""}`}>
          <table className="demo-table demo-table--sticky-demo">
            <thead>
              <tr>
                <th className="demo-th demo-th-check"><i className="fi fi-rr-square-plus demo-check-icon" /></th>
                <th className="demo-th demo-th-id demo-th-id--sticky demo-highlight-zone">
                  <span>ID</span>
                </th>
                {["nome", "cpf", "email", "telefone", "cidade"].map((c) => (
                  <th key={c} className="demo-th demo-th-scrollable">
                    {c.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEMO_ROWS.map((row) => (
                <tr key={row.id}>
                  <td className="demo-td demo-td-check"><i className="fi fi-rr-square demo-check-idle" /></td>
                  <td className="demo-td demo-td-id demo-td-id--sticky demo-highlight-zone">{row.id}</td>
                  {["nome", "cpf", "email", "tel", "cidade"].map((c, i) => (
                    <td key={i} className="demo-td demo-td-scrollable">
                      <span className="demo-td-placeholder" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="demo-sticky-scroll-hint">
          <button
            className={`demo-scroll-toggle ${scrolled ? "demo-scroll-toggle--active" : ""}`}
            onClick={() => setScrolled((s) => !s)}
          >
            <i className={`fi fi-rr-arrow-${scrolled ? "left" : "right"}`} />
            {scrolled ? "Ver ID fixado" : "Simular scroll →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Demo: Colunas redimensionáveis ──────────────────────────────────────────
function DemoResizableCols() {
  const [width, setWidth] = useState(120);

  return (
    <div className="demo-feature-card">
      <div className="demo-resize-demo">
        <div className="demo-resize-col" style={{ width }}>
          <span className="demo-resize-label">NOME</span>
          <i className="fi fi-sr-arrows-from-line demo-resize-handle-icon" />
        </div>
        <div className="demo-resize-col demo-resize-col--rest">
          <span className="demo-resize-label">CPF</span>
        </div>
      </div>
      <div className="demo-resize-slider-group">
        <span className="demo-label-sm">Arraste para redimensionar:</span>
        <input
          type="range"
          min={60}
          max={240}
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          className="demo-resize-slider"
        />
        <span className="demo-resize-value">{width}px</span>
      </div>
      <div className="demo-resize-rows-preview">
        {DEMO_ROWS.map((r) => (
          <div key={r.id} className="demo-resize-row">
            <div className="demo-resize-cell" style={{ width, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {r.nome}
            </div>
            <div className="demo-resize-cell demo-resize-cell--rest">{r.cpf}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Demo: Ações do cabeçalho ─────────────────────────────────────────────────
function DemoHeaderActions() {
  const [menuOpen, setMenuOpen] = useState(null);

  return (
    <div className="demo-feature-card">
      <div className="demo-table-shell">
        <div className="demo-table-wrap">
          <table className="demo-table">
            <thead>
              <tr>
                <th className="demo-th demo-th-check"><i className="fi fi-rr-square-plus demo-check-icon" /></th>
                {DEMO_COLS_TABLE.filter((c) => c !== "id").slice(0, 3).map((col) => (
                  <th key={col} className="demo-th">
                    <div className="demo-th-inner">
                      <span>{col.toUpperCase()}</span>
                      <div className="demo-col-menu-wrap">
                        <button
                          className={`demo-col-menu-btn ${menuOpen === col ? "demo-col-menu-btn--active" : ""}`}
                          onClick={() => setMenuOpen(menuOpen === col ? null : col)}
                        >
                          <i className="fi fi-rr-menu-dots-vertical" />
                        </button>
                        {menuOpen === col && (
                          <div className="demo-col-dropdown">
                            <div className="demo-col-dropdown-item">
                              <i className="fi fi-sr-settings" /> Configurar
                            </div>
                            <div className="demo-col-dropdown-item demo-col-dropdown-item--danger">
                              <i className="fi fi-sr-trash" /> Excluir
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
                <th className="demo-th demo-th-actions demo-highlight-zone">
                  <i className="fi fi-rr-refresh demo-refresh-icon" />
                </th>
              </tr>
            </thead>
            <tbody>
              {DEMO_ROWS.map((row) => (
                <tr key={row.id}>
                  <td className="demo-td demo-td-check"><i className="fi fi-rr-square demo-check-idle" /></td>
                  {DEMO_COLS_TABLE.filter((c) => c !== "id").slice(0, 3).map((col) => (
                    <td key={col} className="demo-td">{row[col]}</td>
                  ))}
                  <td className="demo-td demo-td-actions demo-highlight-zone">
                    <i className="fi fi-rr-pencil demo-row-action" />
                    <i className="fi fi-rr-trash demo-row-action" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="demo-caption">Clique no <strong>⋮</strong> de qualquer coluna para configurar ou excluir. O <strong>↺</strong> recarrega os dados do servidor.</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Passos do tour
// ═══════════════════════════════════════════════════════════════════════════════

const TOUR_STEPS = [
  {
    type: "center",
    selector: null,
    placement: "center",
    title: "Bem-vindo ao Sistema! 👋",
    description:
      "Vamos fazer um tour rápido para você conhecer o layout e ver como funciona a criação de uma tabela na prática.",
  },
  {
    type: "demo-step1",
    selector: null,
    placement: "center",
    title: "Passo 1 — Nome da tabela",
    description:
      "Ao criar uma tabela, o primeiro passo é definir o nome. Veja um exemplo com a tabela de usuários:",
  },
  {
    type: "demo-step2",
    selector: null,
    placement: "center",
    title: "Passo 2 — Definir colunas",
    description:
      "No segundo passo você configura as colunas: nome, tipo de dado, se é chave primária e outras opções.",
  },
  {
    type: "spotlight",
    selector: ".tab-layout",
    placement: "bottom",
    title: "Abas de tabelas",
    description:
      "Cada aba representa uma tabela do seu banco de dados. Clique em uma aba para visualizar seus registros.",
  },
  {
    // Passo 5 — spotlight no botão "+", seta à esquerda do tooltip
    type: "spotlight",
    selector: ".new-tab-btn",
    placement: "bottom-left",
    title: "Criar nova tabela",
    description:
      'Clique neste "+" para abrir o assistente de criação. Você define o nome e as colunas em poucos passos.',
  },
  // ── A partir daqui: demos visuais, sem depender de DOM real ───────────────
  {
    type: "demo-tabs",
    selector: null,
    placement: "center",
    title: "Navegando entre tabelas",
    description:
      "Quando você tiver tabelas criadas, elas aparecerão como abas. Clique em qualquer uma para alternar — o sistema carrega os dados automaticamente.",
  },
  {
    type: "demo-record-count",
    selector: null,
    placement: "center",
    title: "Contagem de registros",
    description:
      "O cabeçalho da tabela mostra quantos registros existem e os botões para inserir, renomear ou excluir a tabela.",
  },
  {
    type: "demo-selection-bar",
    selector: null,
    placement: "center",
    title: "Barra de seleção",
    description:
      "Ao marcar linhas, a barra de seleção exibe quantos itens estão selecionados e oferece ações em massa.",
  },
  {
    type: "demo-checkbox",
    selector: null,
    placement: "center",
    title: "Seleção de linhas",
    description:
      "Use o checkbox de cada linha para selecioná-la individualmente, ou o botão no cabeçalho para selecionar/desmarcar tudo.",
  },
  {
    type: "demo-sticky-id",
    selector: null,
    placement: "center",
    title: "Coluna ID — sempre visível",
    description:
      "O identificador único de cada registro fica fixado à esquerda. Mesmo ao rolar a tabela horizontalmente, o ID permanece visível.",
  },
  {
    type: "demo-resize",
    selector: null,
    placement: "center",
    title: "Colunas redimensionáveis",
    description:
      "Arraste o ícone de setas no cabeçalho de qualquer coluna para ajustar a largura conforme precisar.",
  },
  {
    type: "demo-header-actions",
    selector: null,
    placement: "center",
    title: "Ações por coluna e por linha",
    description:
      "O menu ⋮ no cabeçalho de cada coluna permite configurar ou excluir. Cada linha também tem ações de edição e exclusão fixadas à direita.",
  },
  {
    type: "center",
    selector: null,
    placement: "center",
    title: "Tudo pronto! 🚀",
    description:
      'Você já conhece o layout e sabe como criar uma tabela. Clique no "+" para começar!',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Demo Step 1 — animação de digitação
// ═══════════════════════════════════════════════════════════════════════════════
function DemoStep1() {
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const [blink, setBlink] = useState(true);
  const charMax = 15;

  useEffect(() => {
    const target = DEMO_NOME_TABELA;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTyped(target.slice(0, i));
      if (i >= target.length) { clearInterval(iv); setDone(true); }
    }, 100);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setBlink((b) => !b), 530);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="demo-wizard">
      <div className="demo-wizard-header">
        <div className="demo-steps-indicator">
          <span className="demo-step-dot demo-step-done">1</span>
          <span className="demo-step-line" />
          <span className="demo-step-dot">2</span>
        </div>
        <span className="demo-badge">Prévia</span>
      </div>
      <div className="demo-wizard-body">
        <p className="demo-field-label">Nome da tabela</p>
        <div className={`demo-input-field ${done ? "demo-input-done" : ""}`}>
          <span className="demo-typed">{typed}</span>
          <span className={`demo-cursor ${blink ? "demo-cursor-on" : ""}`}>|</span>
        </div>
        <div className="demo-char-track">
          <div className="demo-char-fill" style={{ width: `${Math.min((typed.length / charMax) * 100, 100)}%` }} />
        </div>
        <span className="demo-char-hint">{typed.length} / {charMax} caracteres</span>
      </div>
      <div className="demo-wizard-footer">
        <span className="demo-btn-fake demo-btn-fake--ghost">Cancelar</span>
        <span className={`demo-btn-fake demo-btn-fake--primary ${done ? "demo-btn-pulse" : ""}`}>Próximo →</span>
      </div>
    </div>
  );
}

// ─── Demo Step 2 — colunas em cascata ─────────────────────────────────────────
function DemoStep2() {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setRevealed(i);
      if (i >= DEMO_COLUNAS.length) clearInterval(iv);
    }, 300);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="demo-wizard demo-wizard--wide">
      <div className="demo-wizard-header">
        <div className="demo-steps-indicator">
          <span className="demo-step-dot demo-step-done">1</span>
          <span className="demo-step-line demo-step-line--done" />
          <span className="demo-step-dot demo-step-done">2</span>
        </div>
        <span className="demo-badge">Prévia · tabela: <strong>usuarios</strong></span>
      </div>
      <div className="demo-cols-scroll">
        <div className="demo-cols-grid demo-cols-head">
          <span>Nome</span>
          <span className="txt-center">PK</span>
          <span>Tipo de dado</span>
          <span>Configurações</span>
        </div>
        {DEMO_COLUNAS.map((col, idx) => (
          <div
            key={col.nome}
            className={`demo-cols-grid demo-cols-row ${idx < revealed ? "demo-cols-row--in" : ""}`}
          >
            <span className="demo-col-name">{col.nome}</span>
            <div className="txt-center">
              <span className={`demo-pk-icon ${col.primaryKey ? "demo-pk-icon--on" : ""}`}>
                <i className={`fi ${col.primaryKey ? "fi-sr-key" : "fi-rr-key"}`} />
              </span>
            </div>
            <div className="demo-pills-wrap">
              {TODOS_TIPOS.map((t) => (
                <span key={t} className={`demo-pill ${col.tipoDado === t ? "demo-pill--on" : ""}`}>{t}</span>
              ))}
            </div>
            <div className="demo-pills-wrap">
              {Object.entries(col.config).map(([key, val]) => (
                <span key={key} className={`demo-pill ${val ? "demo-pill--on" : ""}`}>{CONFIG_LABELS[key]}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="demo-wizard-footer">
        <span className="demo-btn-fake demo-btn-fake--ghost">← Voltar</span>
        <span className="demo-btn-fake demo-btn-fake--primary demo-btn-pulse">
          <i className="fi fi-rr-check" /> Criar tabela
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── TourGuide principal
// ═══════════════════════════════════════════════════════════════════════════════
export function TourGuide({ onFinish }) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  const current = TOUR_STEPS[step];
  const isFirst = step === 0;
  const isLast = step === TOUR_STEPS.length - 1;

  // Tipos que são demos visuais (não dependem de DOM real)
  const isDemoType = [
    "demo-step1", "demo-step2", "demo-tabs", "demo-record-count",
    "demo-selection-bar", "demo-checkbox", "demo-sticky-id",
    "demo-resize", "demo-header-actions",
  ].includes(current.type);

  const isWide = ["demo-step2", "demo-tabs", "demo-record-count",
    "demo-selection-bar", "demo-checkbox", "demo-sticky-id",
    "demo-resize", "demo-header-actions"].includes(current.type);

  // ── Medir alvo ───────────────────────────────────────────────────────────
  const measureTarget = useCallback((s) => {
    const ts = TOUR_STEPS[s];
    if (ts.type !== "spotlight" || !ts.selector) {
      setRect(null);
      return;
    }
    const el = document.querySelector(ts.selector);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      measureTarget(step);
      setVisible(true);
    }, 130);
    return () => {
      clearTimeout(t);
      setVisible(false);
    };
  }, [step, measureTarget]);

  // ── Posicionar tooltip ───────────────────────────────────────────────────
  useEffect(() => {
    if (!tooltipRef.current) return;
    const tip = tooltipRef.current.getBoundingClientRect();
    const pad = 16;

    // Demos e passos centralizados
    if (!rect || current.placement === "center" || isDemoType) {
      setTooltipPos({
        top: window.innerHeight / 2 - tip.height / 2,
        left: window.innerWidth / 2 - tip.width / 2,
      });
      return;
    }

    let top = 0, left = 0;
    const placement = current.placement;

    switch (placement) {
      case "bottom":
        top = rect.top + rect.height + pad;
        left = rect.left + rect.width / 2 - tip.width / 2;
        break;
      case "bottom-left":
        // Tooltip fica embaixo e alinhado à esquerda do elemento alvo
        top = rect.top + rect.height + pad;
        left = rect.left; // alinha pela esquerda do botão
        break;
      case "top":
        top = rect.top - tip.height - pad;
        left = rect.left + rect.width / 2 - tip.width / 2;
        break;
      case "right":
        top = rect.top + rect.height / 2 - tip.height / 2;
        left = rect.left + rect.width + pad;
        break;
      case "left":
        top = rect.top + rect.height / 2 - tip.height / 2;
        left = rect.left - tip.width - pad;
        break;
      default:
        break;
    }

    top = Math.max(8, Math.min(top, window.innerHeight - tip.height - 8));
    left = Math.max(8, Math.min(left, window.innerWidth - tip.width - 8));
    setTooltipPos({ top, left });
  }, [rect, visible, step, current.placement, isDemoType]);

  // ── Navegação ────────────────────────────────────────────────────────────
  const goNext = () => { if (isLast) { onFinish(); return; } setStep((s) => s + 1); };
  const goPrev = () => { if (!isFirst) setStep((s) => s - 1); };

  // ── Spotlight SVG ─────────────────────────────────────────────────────────
  const R = 10, P = 8;
  const buildClip = () => {
    if (!rect) return null;
    const x = rect.left - P, y = rect.top - P;
    const w = rect.width + P * 2, h = rect.height + P * 2;
    return (
      `M ${x + R} ${y} H ${x + w - R} Q ${x + w} ${y} ${x + w} ${y + R} ` +
      `V ${y + h - R} Q ${x + w} ${y + h} ${x + w - R} ${y + h} ` +
      `H ${x + R} Q ${x} ${y + h} ${x} ${y + h - R} ` +
      `V ${y + R} Q ${x} ${y} ${x + R} ${y} Z`
    );
  };
  const clip = buildClip();

  // Determina a classe da seta
  const getArrowClass = () => {
    if (isDemoType || current.placement === "center") return "";
    if (current.placement === "bottom-left") return "tooltip-arrow tooltip-arrow--bottom-left";
    return `tooltip-arrow tooltip-arrow--${current.placement}`;
  };

  return (
    <div className="tour-backdrop">
      {/* Overlay */}
      <svg
        className="tour-svg"
        width={window.innerWidth}
        height={window.innerHeight}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {clip && <path d={clip} fill="black" />}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={isDemoType ? "rgba(0,0,0,0.84)" : "rgba(0,0,0,0.72)"}
          mask="url(#tour-mask)"
        />
        {clip && (
          <path
            d={clip}
            fill="none"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="2"
            className="tour-ring"
          />
        )}
      </svg>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={[
          "tour-tooltip",
          visible ? "tour-tooltip--visible" : "",
          getArrowClass(),
          isDemoType ? "tour-tooltip--demo" : "",
          isWide ? "tour-tooltip--wide" : "",
        ].filter(Boolean).join(" ")}
        style={{ top: tooltipPos.top, left: tooltipPos.left }}
      >
        {/* Progresso */}
        <div className="tour-progress">
          {TOUR_STEPS.map((_, i) => (
            <span
              key={i}
              className={`tour-progress-dot ${i === step ? "active" : i < step ? "done" : ""}`}
            />
          ))}
        </div>

        {/* Texto */}
        <div className="tour-text-block">
          <h3 className="tour-title">{current.title}</h3>
          <p className="tour-desc">{current.description}</p>
        </div>

        {/* Componentes demo */}
        {current.type === "demo-step1"         && <DemoStep1          key={`demo1-${step}`} />}
        {current.type === "demo-step2"         && <DemoStep2          key={`demo2-${step}`} />}
        {current.type === "demo-tabs"          && <DemoTabs           key={`dtabs-${step}`} />}
        {current.type === "demo-record-count"  && <DemoRecordCount    key={`drec-${step}`} />}
        {current.type === "demo-selection-bar" && <DemoSelectionBar   key={`dsel-${step}`} />}
        {current.type === "demo-checkbox"      && <DemoCheckbox       key={`dchk-${step}`} />}
        {current.type === "demo-sticky-id"     && <DemoStickyID       key={`dstk-${step}`} />}
        {current.type === "demo-resize"        && <DemoResizableCols  key={`drsz-${step}`} />}
        {current.type === "demo-header-actions"&& <DemoHeaderActions  key={`dhdr-${step}`} />}

        {/* Rodapé */}
        <div className="tour-footer">
          <button className="tour-btn-cancel" onClick={onFinish}>Pular tour</button>
          <div className="tour-nav">
            <button className="tour-btn-nav tour-btn-prev" onClick={goPrev} disabled={isFirst}>
              <i className="fi fi-rr-arrow-left" /> Voltar
            </button>
            <button className="tour-btn-nav tour-btn-next" onClick={goNext}>
              {isLast ? <><i className="fi fi-rr-check" /> Começar</> : <>Avançar <i className="fi fi-rr-arrow-right" /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}