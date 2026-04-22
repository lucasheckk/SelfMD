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
    config: {
      naoNulo: false,
      unico: false,
      indexado: false,
      autoIncrem: false,
    },
  },
  {
    nome: "cpf",
    primaryKey: false,
    tipoDado: "Número",
    config: {
      naoNulo: false,
      unico: false,
      indexado: false,
      autoIncrem: false,
    },
  },
  {
    nome: "data_nascimento",
    primaryKey: false,
    tipoDado: "Data",
    config: {
      naoNulo: false,
      unico: false,
      indexado: false,
      autoIncrem: false,
    },
  },
  {
    nome: "conta_ativada",
    primaryKey: false,
    tipoDado: "Booleano",
    config: {
      naoNulo: false,
      unico: false,
      indexado: false,
      autoIncrem: false,
    },
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
  {
    id: 1,
    nome: "Ana Lima",
    cpf: "123.456.789-00",
    data_nasc: "1995-03-12",
    ativo: "Sim",
  },
  {
    id: 2,
    nome: "Bruno Costa",
    cpf: "987.654.321-00",
    data_nasc: "1988-07-25",
    ativo: "Não",
  },
  {
    id: 3,
    nome: "Carla Souza",
    cpf: "456.123.789-00",
    data_nasc: "2001-11-04",
    ativo: "Sim",
  },
];

const DEMO_COLS = ["id", "nome", "cpf", "data_nasc", "ativo"];

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Demo: Abas de tabelas — fiel ao .tab-layout do System
// ═══════════════════════════════════════════════════════════════════════════════
function DemoTabs() {
  const [active, setActive] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: "12px",
    width: "80px",
  });
  const tabRefs = useRef({});
  const tabs = ["usuarios", "produtos", "pedidos"];

  useEffect(() => {
    const el = tabRefs.current[active];
    if (el) {
      setIndicatorStyle({
        left: `${el.offsetLeft}px`,
        width: `${el.offsetWidth}px`,
      });
    }
  }, [active]);

  return (
    <div className="demo-feature-card demo-feature-card--system">
      {/* Replica o .tab-layout */}
      <div className="demo-system-tabs">
        {tabs.map((t, i) => (
          <button
            key={t}
            ref={(el) => (tabRefs.current[i] = el)}
            className={`demo-system-tab-item ${active === i ? "active" : ""}`}
            onClick={() => setActive(i)}
          >
            {t}
          </button>
        ))}
        <div className="demo-system-tab-indicator" style={indicatorStyle} />
        <button className="demo-system-new-tab-btn" title="Nova tabela">
          <i className="fi fi-rr-plus" />
        </button>
      </div>

      {/* Mini prévia do conteúdo */}
      <div className="demo-system-tab-content">
        <span className="demo-system-tab-hint">
          Tabela ativa: <strong>{tabs[active]}</strong>
        </span>
        <div className="demo-system-mini-rows">
          {[1, 2, 3].map((n) => (
            <div key={n} className="demo-system-mini-row">
              <span className="demo-system-mini-cell demo-system-mini-cell--id">
                {n}
              </span>
              <span className="demo-system-mini-cell" style={{ flex: 2 }} />
              <span className="demo-system-mini-cell" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Demo: Cabeçalho da tabela — fiel ao .table-header do System
// ═══════════════════════════════════════════════════════════════════════════════
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
    <div className="demo-feature-card demo-feature-card--system">
      {/* Replica o .table-header */}
      <div className="demo-system-table-header">
        <span className="demo-system-qtd-reg">Registros</span>
        <span className="demo-system-row-counter">{count}</span>
        <div className="demo-system-header-right">
          <button className="demo-system-action-header-btn">
            <i className="fi fi-sr-add-document" /> Inserir registro
          </button>
          <button className="demo-system-action-header-btn">
            <i className="fi fi-sr-pencil" /> Renomear tabela
          </button>
          <button className="demo-system-apagar-tabela-btn">
            <i className="fi fi-sr-remove-folder" /> Excluir tabela
          </button>
        </div>
      </div>
      <div className="demo-system-record-hint">
        <i className="fi fi-rr-info" />
        <span>
          O contador atualiza em tempo real conforme você adiciona ou remove
          registros.
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Demo: Barra de seleção — fiel ao .selection-bar do System
// ═══════════════════════════════════════════════════════════════════════════════
function DemoSelectionBar() {
  const [selected, setSelected] = useState(0);
  const total = 3;

  return (
    <div className="demo-feature-card demo-feature-card--system">
      <div className="demo-system-sel-controls">
        <button
          className="demo-sel-btn"
          onClick={() => setSelected((s) => Math.max(0, s - 1))}
          disabled={selected === 0}
        >
          −
        </button>
        <span className="demo-system-sel-hint">Simule a seleção de linhas</span>
        <button
          className="demo-sel-btn"
          onClick={() => setSelected((s) => Math.min(total, s + 1))}
          disabled={selected === total}
        >
          +
        </button>
      </div>

      {/* Replica exatamente o .selection-bar com as classes reais */}
      <div
        className={`demo-system-selection-bar ${selected > 0 ? "demo-system-selection-bar--active" : ""}`}
      >
        {selected > 0 ? (
          <>
            <span>{selected} item(s) selecionado(s)</span>
            <div className="demo-system-selection-actions">
              <button
                className={`demo-system-selection-action-btn demo-system-selection-action-btn--edit ${selected !== 1 ? "demo-system-selection-action-btn--disabled" : ""}`}
                disabled={selected !== 1}
              >
                <i className="fi fi-sr-file-edit" /> Atualizar
              </button>
              <span className="demo-system-selection-action-divider" />
              <button className="demo-system-selection-action-btn demo-system-selection-action-btn--delete">
                <i className="fi fi-sr-trash" /> Excluir
              </button>
            </div>
          </>
        ) : (
          <span className="demo-system-empty-selection">
            Nenhum item selecionado
          </span>
        )}
      </div>

      <div className="demo-system-sel-note">
        "Atualizar" só fica disponível com <strong>exatamente 1</strong> item
        selecionado
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Helper: linha da tabela de demo
// ═══════════════════════════════════════════════════════════════════════════════
function DemoTableShell({
  selectedRows = [],
  onToggle,
  onToggleAll,
  highlightCheckbox,
  highlightSticky,
  highlightActions,
}) {
  const allSelected = selectedRows.length === DEMO_ROWS.length;

  return (
    <div className="demo-system-table-shell">
      <div className="demo-system-table-scroll">
        <table className="demo-system-custom-table">
          <colgroup>
            <col style={{ width: "50px" }} />
            <col style={{ width: "44px" }} /> {/* ID sticky */}
            <col style={{ width: "130px" }} />
            <col style={{ width: "130px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "80px" }} />
            <col style={{ width: "60px" }} />
          </colgroup>
          <thead>
            <tr>
              {/* Checkbox col */}
              <th
                className={`demo-system-th demo-system-checkbox-col ${highlightCheckbox ? "demo-system-th--highlight" : ""}`}
              >
                <button
                  className="demo-system-select-all-btn"
                  onClick={onToggleAll}
                >
                  <i
                    className={`fi ${allSelected && DEMO_ROWS.length > 0 ? "fi-rr-square-minus" : "fi-rr-square-plus"}`}
                  />
                </button>
              </th>
              {/* ID — sticky */}
              <th
                className={`demo-system-th demo-system-th-id ${highlightSticky ? "demo-system-th--highlight" : ""}`}
              >
                <div className="demo-system-cell-content">
                  <span className="demo-system-col-label">ID</span>
                </div>
              </th>
              {/* Demais colunas */}
              {["NOME", "CPF", "DATA_NASC", "ATIVO"].map((col) => (
                <th key={col} className="demo-system-th">
                  <div className="demo-system-cell-content">
                    <div className="demo-system-col-label-group">
                      <span className="demo-system-col-label">{col}</span>
                    </div>
                    <button className="demo-system-resizer-handle">
                      <i className="fi-sr-arrows-from-line" />
                    </button>
                  </div>
                </th>
              ))}
              {/* Actions */}
              <th
                className={`demo-system-th demo-system-actions-header ${highlightActions ? "demo-system-th--highlight" : ""}`}
              >
                <div className="demo-system-actions-cell-content">
                  <button title="Recarregar">
                    <i className="fi fi-rr-refresh" />
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {DEMO_ROWS.map((row) => {
              const isSel = selectedRows.includes(row.id);
              return (
                <tr
                  key={row.id}
                  className={isSel ? "demo-system-row-selected" : ""}
                >
                  <td
                    className={`demo-system-td demo-system-checkbox-col ${highlightCheckbox ? "demo-system-td--highlight" : ""}`}
                  >
                    <button
                      className="demo-system-custom-checkbox"
                      onClick={() => onToggle(row.id)}
                    >
                      <i
                        className={`fi ${isSel ? "fi-sr-angle-square-right" : "fi-rr-square"}`}
                      />
                    </button>
                  </td>
                  <td
                    className={`demo-system-td demo-system-td-id ${highlightSticky ? "demo-system-td--highlight" : ""}`}
                  >
                    {row.id}
                  </td>
                  <td className="demo-system-td">{row.nome}</td>
                  <td className="demo-system-td">{row.cpf}</td>
                  <td className="demo-system-td">{row.data_nasc}</td>
                  <td className="demo-system-td">{row.ativo}</td>
                  <td
                    className={`demo-system-td demo-system-actions-cell ${highlightActions ? "demo-system-td--highlight" : ""}`}
                  >
                    <div className="demo-system-actions-container">
                      <button>
                        <i className="fi fi-rr-pencil" />
                      </button>
                      <button>
                        <i className="fi fi-rr-trash" />
                      </button>
                    </div>
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

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Demo: Checkbox de seleção
// ═══════════════════════════════════════════════════════════════════════════════
function DemoCheckbox() {
  const [selected, setSelected] = useState([]);
  const ids = DEMO_ROWS.map((r) => r.id);

  const toggleAll = () =>
    setSelected(selected.length === ids.length ? [] : [...ids]);
  const toggleOne = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <div className="demo-feature-card demo-feature-card--system">
      <DemoTableShell
        selectedRows={selected}
        onToggle={toggleOne}
        onToggleAll={toggleAll}
        highlightCheckbox
      />
      <div className="demo-system-checkbox-legend">
        <button className="demo-system-legend-btn" onClick={toggleAll}>
          {selected.length === ids.length
            ? "Desmarcar todos"
            : "Selecionar todos"}
        </button>
        <div className="demo-system-legend-individual">
          {DEMO_ROWS.map((r) => (
            <button
              key={r.id}
              className={`demo-system-legend-btn demo-system-legend-btn--sm ${selected.includes(r.id) ? "demo-system-legend-btn--active" : ""}`}
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

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Demo: Coluna ID sticky
// ═══════════════════════════════════════════════════════════════════════════════
function DemoStickyID() {
  const [scrolled, setScrolled] = useState(false);

  return (
    <div className="demo-feature-card demo-feature-card--system">
      <div
        className={`demo-system-sticky-wrapper ${scrolled ? "demo-system-sticky-wrapper--scrolled" : ""}`}
      >
        <DemoTableShell
          selectedRows={[]}
          onToggle={() => {}}
          onToggleAll={() => {}}
          highlightSticky
        />
      </div>
      <div className="demo-system-sticky-hint">
        <button
          className={`demo-scroll-toggle ${scrolled ? "demo-scroll-toggle--active" : ""}`}
          onClick={() => setScrolled((s) => !s)}
        >
          <i className={`fi fi-rr-arrow-${scrolled ? "left" : "right"}`} />
          {scrolled ? "← Voltar" : "Simular scroll →"}
        </button>
        <span className="demo-system-sticky-note">
          {scrolled
            ? "O ID permanece fixo enquanto o restante rola"
            : "Clique para ver o ID fixado durante o scroll horizontal"}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Demo: Colunas redimensionáveis
// ═══════════════════════════════════════════════════════════════════════════════
function DemoResizableCols() {
  const [width, setWidth] = useState(130);

  return (
    <div className="demo-feature-card demo-feature-card--system">
      {/* Header da tabela com a coluna redimensionável destacada */}
      <div className="demo-system-table-shell">
        <div className="demo-system-table-scroll">
          <table className="demo-system-custom-table">
            <colgroup>
              <col style={{ width: "50px" }} />
              <col style={{ width: "44px" }} />
              <col style={{ width: `${width}px` }} />
              <col style={{ width: "130px" }} />
              <col style={{ width: "100px" }} />
              <col style={{ width: "60px" }} />
            </colgroup>
            <thead>
              <tr>
                <th className="demo-system-th demo-system-checkbox-col">
                  <button className="demo-system-select-all-btn">
                    <i className="fi fi-rr-square-plus" />
                  </button>
                </th>
                <th className="demo-system-th demo-system-th-id">
                  <div className="demo-system-cell-content">
                    <span className="demo-system-col-label">ID</span>
                  </div>
                </th>
                {/* Coluna NOME destacada — com handle visível */}
                <th className="demo-system-th demo-system-th--highlight">
                  <div className="demo-system-cell-content">
                    <div className="demo-system-col-label-group">
                      <span className="demo-system-col-label">NOME</span>
                    </div>
                    <button className="demo-system-resizer-handle demo-system-resizer-handle--active">
                      <i className="fi-sr-arrows-from-line" />
                    </button>
                  </div>
                </th>
                <th className="demo-system-th">
                  <div className="demo-system-cell-content">
                    <span className="demo-system-col-label">CPF</span>
                    <button className="demo-system-resizer-handle">
                      <i className="fi-sr-arrows-from-line" />
                    </button>
                  </div>
                </th>
                <th className="demo-system-th">
                  <div className="demo-system-cell-content">
                    <span className="demo-system-col-label">ATIVO</span>
                    <button className="demo-system-resizer-handle">
                      <i className="fi-sr-arrows-from-line" />
                    </button>
                  </div>
                </th>
                <th className="demo-system-th demo-system-actions-header">
                  <div className="demo-system-actions-cell-content">
                    <button>
                      <i className="fi fi-rr-refresh" />
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {DEMO_ROWS.map((row) => (
                <tr key={row.id}>
                  <td className="demo-system-td demo-system-checkbox-col">
                    <button className="demo-system-custom-checkbox">
                      <i className="fi fi-rr-square" />
                    </button>
                  </td>
                  <td className="demo-system-td demo-system-td-id">{row.id}</td>
                  <td
                    className="demo-system-td demo-system-td--highlight"
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.nome}
                  </td>
                  <td className="demo-system-td">{row.cpf}</td>
                  <td className="demo-system-td">{row.ativo}</td>
                  <td className="demo-system-td demo-system-actions-cell">
                    <div className="demo-system-actions-container">
                      <button>
                        <i className="fi fi-rr-pencil" />
                      </button>
                      <button>
                        <i className="fi fi-rr-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Controle do slider */}
      <div className="demo-system-resize-controls">
        <span className="demo-system-resize-label">
          <i className="fi-sr-arrows-from-line" /> Largura da coluna NOME:
        </span>
        <input
          type="range"
          min={60}
          max={240}
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          className="demo-resize-slider"
        />
        <span className="demo-system-resize-value">{width}px</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Demo: Ações do cabeçalho — dropdown fiel ao .col-header-dropdown
// ═══════════════════════════════════════════════════════════════════════════════
function DemoHeaderActions() {
  const [menuOpen, setMenuOpen] = useState(null);

  return (
    <div className="demo-feature-card demo-feature-card--system">
      <div className="demo-system-table-shell">
        <div className="demo-system-table-scroll">
          <table className="demo-system-custom-table">
            <colgroup>
              <col style={{ width: "50px" }} />
              <col style={{ width: "44px" }} />
              <col style={{ width: "130px" }} />
              <col style={{ width: "130px" }} />
              <col style={{ width: "100px" }} />
              <col style={{ width: "60px" }} />
            </colgroup>
            <thead>
              <tr>
                <th className="demo-system-th demo-system-checkbox-col">
                  <button className="demo-system-select-all-btn">
                    <i className="fi fi-rr-square-plus" />
                  </button>
                </th>
                <th className="demo-system-th demo-system-th-id">
                  <div className="demo-system-cell-content">
                    <span className="demo-system-col-label">ID</span>
                  </div>
                </th>
                {["NOME", "CPF", "ATIVO"].map((col) => (
                  <th
                    key={col}
                    className="demo-system-th"
                    style={{ overflow: "visible" }}
                  >
                    <div className="demo-system-cell-content">
                      <div className="demo-system-col-label-group">
                        <span className="demo-system-col-label">{col}</span>
                        {/* Menu de coluna — replica .col-header-menu */}
                        <div
                          className="demo-system-col-header-menu"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className={`demo-system-col-header-menu-btn ${menuOpen === col ? "demo-system-col-header-menu-btn--active" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpen(menuOpen === col ? null : col);
                            }}
                          >
                            <i className="fi fi-rr-menu-dots-vertical" />
                          </button>
                          {/* Dropdown — replica .col-header-dropdown */}
                          {menuOpen === col && (
                            <div className="demo-system-col-dropdown">
                              <button
                                className="demo-system-col-dropdown-item"
                                onClick={() => setMenuOpen(null)}
                              >
                                <i className="fi fi-sr-settings" /> Configurar
                              </button>
                              <button
                                className="demo-system-col-dropdown-item demo-system-col-dropdown-item--danger"
                                onClick={() => setMenuOpen(null)}
                              >
                                <i className="fi fi-sr-trash" /> Excluir
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <button className="demo-system-resizer-handle">
                        <i className="fi-sr-arrows-from-line" />
                      </button>
                    </div>
                  </th>
                ))}
                <th className="demo-system-th demo-system-actions-header demo-system-th--highlight">
                  <div className="demo-system-actions-cell-content">
                    <button>
                      <i className="fi fi-rr-refresh" />
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {DEMO_ROWS.map((row) => (
                <tr key={row.id}>
                  <td className="demo-system-td demo-system-checkbox-col">
                    <button className="demo-system-custom-checkbox">
                      <i className="fi fi-rr-square" />
                    </button>
                  </td>
                  <td className="demo-system-td demo-system-td-id">{row.id}</td>
                  <td className="demo-system-td">{row.nome}</td>
                  <td className="demo-system-td">{row.cpf}</td>
                  <td className="demo-system-td">{row.ativo}</td>
                  <td className="demo-system-td demo-system-actions-cell demo-system-td--highlight">
                    <div className="demo-system-actions-container">
                      <button>
                        <i className="fi fi-rr-pencil" />
                      </button>
                      <button>
                        <i className="fi fi-rr-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="demo-system-caption">
        Clique no <strong>⋮</strong> de qualquer coluna para configurar ou
        excluir. O <strong>↺</strong> recarrega os dados do servidor.
      </p>
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
    type: "spotlight",
    selector: ".new-tab-btn",
    placement: "bottom-left",
    title: "Criar nova tabela",
    description:
      'Clique neste "+" para abrir o assistente de criação. Você define o nome e as colunas em poucos passos.',
  },
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
    title: "Cabeçalho da tabela",
    description:
      "O cabeçalho mostra quantos registros existem e os botões para inserir, renomear ou excluir a tabela.",
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
      "O menu ⋮ no cabeçalho de cada coluna permite configurar ou excluir. Cada linha também tem ações de edição e exclusão.",
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
      if (i >= target.length) {
        clearInterval(iv);
        setDone(true);
      }
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
          <span className={`demo-cursor ${blink ? "demo-cursor-on" : ""}`}>
            |
          </span>
        </div>
        <div className="demo-char-track">
          <div
            className="demo-char-fill"
            style={{
              width: `${Math.min((typed.length / charMax) * 100, 100)}%`,
            }}
          />
        </div>
        <span className="demo-char-hint">
          {typed.length} / {charMax} caracteres
        </span>
      </div>
      <div className="demo-wizard-footer">
        <span className="demo-btn-fake demo-btn-fake--ghost">Cancelar</span>
        <span
          className={`demo-btn-fake demo-btn-fake--primary ${done ? "demo-btn-pulse" : ""}`}
        >
          Próximo →
        </span>
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
        <span className="demo-badge">
          Prévia · tabela: <strong>usuarios</strong>
        </span>
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
              <span
                className={`demo-pk-icon ${col.primaryKey ? "demo-pk-icon--on" : ""}`}
              >
                <i
                  className={`fi ${col.primaryKey ? "fi-sr-key" : "fi-rr-key"}`}
                />
              </span>
            </div>
            <div className="demo-pills-wrap">
              {TODOS_TIPOS.map((t) => (
                <span
                  key={t}
                  className={`demo-pill ${col.tipoDado === t ? "demo-pill--on" : ""}`}
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="demo-pills-wrap">
              {Object.entries(col.config).map(([key, val]) => (
                <span
                  key={key}
                  className={`demo-pill ${val ? "demo-pill--on" : ""}`}
                >
                  {CONFIG_LABELS[key]}
                </span>
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

  const isDemoType = [
    "demo-step1",
    "demo-step2",
    "demo-tabs",
    "demo-record-count",
    "demo-selection-bar",
    "demo-checkbox",
    "demo-sticky-id",
    "demo-resize",
    "demo-header-actions",
  ].includes(current.type);

  const isWide = [
    "demo-step2",
    "demo-tabs",
    "demo-record-count",
    "demo-selection-bar",
    "demo-checkbox",
    "demo-sticky-id",
    "demo-resize",
    "demo-header-actions",
  ].includes(current.type);

  const measureTarget = useCallback((s) => {
    const ts = TOUR_STEPS[s];
    if (ts.type !== "spotlight" || !ts.selector) {
      setRect(null);
      return;
    }
    const el = document.querySelector(ts.selector);
    if (!el) {
      setRect(null);
      return;
    }
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

  useEffect(() => {
    if (!tooltipRef.current) return;
    const tip = tooltipRef.current.getBoundingClientRect();
    const pad = 16;

    if (!rect || current.placement === "center" || isDemoType) {
      setTooltipPos({
        top: window.innerHeight / 2 - tip.height / 2,
        left: window.innerWidth / 2 - tip.width / 2,
      });
      return;
    }

    let top = 0,
      left = 0;
    const placement = current.placement;

    switch (placement) {
      case "bottom":
        top = rect.top + rect.height + pad;
        left = rect.left + rect.width / 2 - tip.width / 2;
        break;
      case "bottom-left":
        top = rect.top + rect.height + pad;
        left = rect.left;
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

  const goNext = () => {
    if (isLast) {
      onFinish();
      return;
    }
    setStep((s) => s + 1);
  };
  const goPrev = () => {
    if (!isFirst) setStep((s) => s - 1);
  };

  const R = 10,
    P = 8;
  const buildClip = () => {
    if (!rect) return null;
    const x = rect.left - P,
      y = rect.top - P;
    const w = rect.width + P * 2,
      h = rect.height + P * 2;
    return (
      `M ${x + R} ${y} H ${x + w - R} Q ${x + w} ${y} ${x + w} ${y + R} ` +
      `V ${y + h - R} Q ${x + w} ${y + h} ${x + w - R} ${y + h} ` +
      `H ${x + R} Q ${x} ${y + h} ${x} ${y + h - R} ` +
      `V ${y + R} Q ${x} ${y} ${x + R} ${y} Z`
    );
  };
  const clip = buildClip();

  const getArrowClass = () => {
    if (isDemoType || current.placement === "center") return "";
    if (current.placement === "bottom-left")
      return "tooltip-arrow tooltip-arrow--bottom-left";
    return `tooltip-arrow tooltip-arrow--${current.placement}`;
  };

  return (
    <div className="tour-backdrop">
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

      <div
        ref={tooltipRef}
        className={[
          "tour-tooltip",
          visible ? "tour-tooltip--visible" : "",
          getArrowClass(),
          isDemoType ? "tour-tooltip--demo" : "",
          isWide ? "tour-tooltip--wide" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ top: tooltipPos.top, left: tooltipPos.left }}
      >
        <div className="tour-progress">
          {TOUR_STEPS.map((_, i) => (
            <span
              key={i}
              className={`tour-progress-dot ${i === step ? "active" : i < step ? "done" : ""}`}
            />
          ))}
        </div>

        <div className="tour-text-block">
          <h3 className="tour-title">{current.title}</h3>
          <p className="tour-desc">{current.description}</p>
        </div>

        {current.type === "demo-step1" && <DemoStep1 key={`demo1-${step}`} />}
        {current.type === "demo-step2" && <DemoStep2 key={`demo2-${step}`} />}
        {current.type === "demo-tabs" && <DemoTabs key={`dtabs-${step}`} />}
        {current.type === "demo-record-count" && (
          <DemoRecordCount key={`drec-${step}`} />
        )}
        {current.type === "demo-selection-bar" && (
          <DemoSelectionBar key={`dsel-${step}`} />
        )}
        {current.type === "demo-checkbox" && (
          <DemoCheckbox key={`dchk-${step}`} />
        )}
        {current.type === "demo-sticky-id" && (
          <DemoStickyID key={`dstk-${step}`} />
        )}
        {current.type === "demo-resize" && (
          <DemoResizableCols key={`drsz-${step}`} />
        )}
        {current.type === "demo-header-actions" && (
          <DemoHeaderActions key={`dhdr-${step}`} />
        )}

        <div className="tour-footer">
          <button className="tour-btn-cancel" onClick={onFinish}>
            Pular tour
          </button>
          <div className="tour-nav">
            <button
              className="tour-btn-nav tour-btn-prev"
              onClick={goPrev}
              disabled={isFirst}
            >
              <i className="fi fi-rr-arrow-left" /> Voltar
            </button>
            <button className="tour-btn-nav tour-btn-next" onClick={goNext}>
              {isLast ? (
                <>
                  <i className="fi fi-rr-check" /> Começar
                </>
              ) : (
                <>
                  Avançar <i className="fi fi-rr-arrow-right" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
