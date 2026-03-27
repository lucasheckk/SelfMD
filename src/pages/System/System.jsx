import React, { useState, useRef, useEffect } from "react";
import "./System.scss";
import { SegundoMenu } from "../../components/SegundoMenu/SegundoMenu";

export function System() {
  const initialRows = [
    { id: 1,  nome: "Kathryn Murphy", email: "tkub@green.com",     cargo: "Manager",      cep: "01001-000", idade: 28 },
    { id: 2,  nome: "Albert Flores",  email: "littel.jo@block.com", cargo: "F&B Team",     cep: "02002-000", idade: 32 },
    { id: 3,  nome: "Guy Hawkins",    email: "lavina.m@marvin.com", cargo: "Housekeeping", cep: "03003-000", idade: 45 },
    { id: 4,  nome: "Guy Hawkins",    email: "lavina.m@marvin.com", cargo: "Housekeeping", cep: "03003-000", idade: 45 },
    { id: 5,  nome: "Guy Hawkins",    email: "lavina.m@marvin.com", cargo: "Housekeeping", cep: "03003-000", idade: 45 },
    { id: 6,  nome: "Guy Hawkins",    email: "lavina.m@marvin.com", cargo: "Housekeeping", cep: "03003-000", idade: 45 },
    { id: 7,  nome: "Guy Hawkins",    email: "lavina.m@marvin.com", cargo: "Housekeeping", cep: "03003-000", idade: 45 },
    { id: 8,  nome: "Guy Hawkins",    email: "lavina.m@marvin.com", cargo: "Housekeeping", cep: "03003-000", idade: 45 },
    { id: 9,  nome: "Guy Hawkins",    email: "lavina.m@marvin.com", cargo: "Housekeeping", cep: "03003-000", idade: 45 },
    { id: 10, nome: "Guy Hawkins",    email: "lavina.m@marvin.com", cargo: "Housekeeping", cep: "03003-000", idade: 45 },
    { id: 11, nome: "Albert Flores",  email: "littel.jo@block.com", cargo: "F&B Team",     cep: "02002-000", idade: 32 },
    { id: 12, nome: "Albert Flores",  email: "littel.jo@block.com", cargo: "F&B Team",     cep: "02002-000", idade: 32 },
    { id: 13, nome: "Albert Flores",  email: "littel.jo@block.com", cargo: "F&B Team",     cep: "02002-000", idade: 32 },
    { id: 14, nome: "Albert Flores",  email: "littel.jo@block.com", cargo: "F&B Team",     cep: "02002-000", idade: 32 },
  ];

  const MIN_COL_WIDTH = 60;

  // Larguras fixas das colunas imutáveis — espelham as variáveis SCSS
  const CHECKBOX_WIDTH = 50;
  const ID_WIDTH       = 70;
  const ACTIONS_WIDTH  = 60;

  const [tabs, setTabs] = useState([{ id: 1, name: "Sua tabela", rows: initialRows }]);
  const [activeTab, setActiveTab]     = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);

  const [colWidths, setColWidths] = useState({
    nome:  150,
    email: 150,
    cargo: 150,
    cep:   120,
    idade: 100,
  });

  const activeTabData = tabs.find((t) => t.id === activeTab);
  const rows          = activeTabData?.rows || [];

  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef({});

  /* ─── Seleção ─────────────────────────────────────────────────────────── */
  const toggleSelectAll = () => {
    if (selectedRows.length === rows.length && rows.length > 0) setSelectedRows([]);
    else setSelectedRows(rows.map((r) => r.id));
  };

  const toggleSelectRow = (id) =>
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  /* ─── Tabs ────────────────────────────────────────────────────────────── */
  const addNewTab = () => {
    const tabName = prompt("Digite o nome da nova tabela:");
    if (tabName) {
      const newId = Date.now();
      setTabs((prev) => [...prev, { id: newId, name: tabName, rows: [] }]);
      setActiveTab(newId);
    }
  };

  useEffect(() => {
    const el = tabsRef.current[activeTab];
    if (el) setIndicatorStyle({ left: `${el.offsetLeft}px`, width: `${el.offsetWidth}px` });
  }, [activeTab, tabs]);

  /* ─── Deletar selecionados ───────────────────────────────────────────── */
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

  /* ─── Redimensionar coluna ───────────────────────────────────────────── */
  const handleMouseDown = (e, colName) => {
    e.preventDefault();
    e.stopPropagation();

    const startX     = e.pageX;
    const startWidth = colWidths[colName];

    const onMove = (ev) => {
      const newWidth = Math.max(MIN_COL_WIDTH, startWidth + (ev.pageX - startX));
      setColWidths((prev) => ({ ...prev, [colName]: newWidth }));
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup",   onUp);
      document.body.style.cursor     = "default";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup",   onUp);
  };

  const resizableCols = Object.keys(colWidths); // ["nome","email","cargo","cep","idade"]

  // Largura total da tabela calculada em JS para forçar table-layout:fixed
  // sem que o browser redistribua o espaço e "engula" o ícone de NOME
  const totalTableWidth =
    CHECKBOX_WIDTH +
    ID_WIDTH +
    resizableCols.reduce((acc, col) => acc + colWidths[col], 0) +
    ACTIONS_WIDTH;

  return (
    <div className="system-container">
      <SegundoMenu />
      <main className="main-layout">

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
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
          <div className="tab-indicator" style={indicatorStyle} />
          <button className="new-tab-btn" onClick={addNewTab}>
            <i className="fi fi-rr-plus"></i>
          </button>
        </div>

        {/* ── Conteúdo ──────────────────────────────────────────────────── */}
        <div className="content-area">

          <div className="table-header">
            <span className="qtd-reg">Registros</span>
            <span className="row-counter">{activeTabData?.rows?.length || 0}</span>
          </div>

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

          <div className="table-scroll-area">
            <div className="table-wrapper">
              {/*
                style={{ width }} força a tabela a ter exatamente o tamanho somado
                das colunas. Com table-layout:fixed no CSS, o browser respeita as
                larguras definidas em cada th e nunca "engole" o ícone de NOME.
              */}
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

                    {/* Checkbox — fixo esquerda, sem resizer */}
                    <th className="checkbox-col sticky-col sticky-checkbox">
                      <button className="select-all-btn" onClick={toggleSelectAll}>
                        <i className={`fi ${
                          selectedRows.length === rows.length && rows.length > 0
                            ? "fi-rr-square-minus"
                            : "fi-rr-square-plus"
                        }`}></i>
                      </button>
                    </th>

                    {/* ID — fixo, sem resizer */}
                    <th className="id-col sticky-col sticky-id">
                      <div className="cell-content">ID</div>
                    </th>

                    {/* Colunas do usuário — TODAS com resizer */}
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

                    {/* Ações — fixo direita, sem resizer */}
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
                  {rows.map((row) => (
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
                  ))}
                </tbody>

              </table>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}