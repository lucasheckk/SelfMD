import React, { useState, useRef, useEffect } from "react";
import "./System.scss";
import { SegundoMenu } from "../../components/SegundoMenu/SegundoMenu";

export function System() {
  const initialRows = [
    {
      id: 1,
      nome: "Kathryn Murphy",
      email: "tkub@green.com",
      cargo: "Manager",
      cep: "01001-000",
      idade: 28,
    },
    {
      id: 2,
      nome: "Albert Flores",
      email: "littel.jo@block.com",
      cargo: "F&B Team",
      cep: "02002-000",
      idade: 32,
    },
    {
      id: 3,
      nome: "Guy Hawkins",
      email: "lavina.m@marvin.com",
      cargo: "Housekeeping",
      cep: "03003-000",
      idade: 45,
    },
    {
      id: 4,
      nome: "Guy Hawkins",
      email: "lavina.m@marvin.com",
      cargo: "Housekeeping",
      cep: "03003-000",
      idade: 45,
    },
    {
      id: 5,
      nome: "Guy Hawkins",
      email: "lavina.m@marvin.com",
      cargo: "Housekeeping",
      cep: "03003-000",
      idade: 45,
    },
    {
      id: 6,
      nome: "Guy Hawkins",
      email: "lavina.m@marvin.com",
      cargo: "Housekeeping",
      cep: "03003-000",
      idade: 45,
    },
    {
      id: 7,
      nome: "Guy Hawkins",
      email: "lavina.m@marvin.com",
      cargo: "Housekeeping",
      cep: "03003-000",
      idade: 45,
    },
    {
      id: 8,
      nome: "Guy Hawkins",
      email: "lavina.m@marvin.com",
      cargo: "Housekeeping",
      cep: "03003-000",
      idade: 45,
    },
    {
      id: 9,
      nome: "Guy Hawkins",
      email: "lavina.m@marvin.com",
      cargo: "Housekeeping",
      cep: "03003-000",
      idade: 45,
    },
    {
      id: 10,
      nome: "Guy Hawkins",
      email: "lavina.m@marvin.com",
      cargo: "Housekeeping",
      cep: "03003-000",
      idade: 45,
    },
  ];

  const [tabs, setTabs] = useState([
    { id: 1, name: "Sua tabela", rows: initialRows },
  ]);
  const [activeTab, setActiveTab] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);

  const [colWidths, setColWidths] = useState({
    id: 60,
    nome: 70,
    email: 150,
    cargo: 150,
    cep: 120,
    idade: 80,
  });
  const activeTabData = tabs.find((t) => t.id === activeTab);
  const rows = activeTabData?.rows || [];
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef({});

  const toggleSelectAll = () => {
    if (selectedRows.length === rows.length && rows.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(rows.map((row) => row.id));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const addNewTab = () => {
    const tabName = prompt("Digite o nome da nova tabela:");
    if (tabName) {
      const newId = Date.now();
      const newTab = { id: newId, name: tabName, rows: [] };
      setTabs([...tabs, newTab]);
      setActiveTab(newId);
    }
  };

  useEffect(() => {
    const currentTab = tabsRef.current[activeTab];
    if (currentTab) {
      const { offsetLeft, offsetWidth } = currentTab;

      setIndicatorStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      });
    }
  }, [activeTab, tabs]);

  const deleteSelected = () => {
    const updatedRows = rows.filter((row) => !selectedRows.includes(row.id));
    const updatedTabs = tabs.map((tab) =>
      tab.id === activeTab ? { ...tab, rows: updatedRows } : tab,
    );
    setTabs(updatedTabs);
    setSelectedRows([]);
  };

  const handleMouseDown = (e, colName) => {
    const startX = e.pageX;
    const startWidth = colWidths[colName];

    const handleMouseMove = (moveEvent) => {
      // Limite mínimo de 40px para manter 15% de visibilidade mínima
      const newWidth = Math.max(40, startWidth + (moveEvent.pageX - startX));
      setColWidths((prev) => ({ ...prev, [colName]: newWidth }));
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="system-container">
      <SegundoMenu />
      <main className="main-layout">
        <div className="tab-layout">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => (tabsRef.current[tab.id] = el)} // Guarda a ref
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
        <div className="content-area">
          <div className="table-header">
            {(() => {
              const rowCount = activeTabData?.rows?.length || 0;

              return (
                <>
                  <span className="qtd-reg">Registros</span>
                  <span className="row-counter">{rowCount}</span>
                </>
              );
            })()}
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
                  <i className="fi fi-sr-trash"></i>
                  Apagar
                </button>
              </>
            ) : (
              <span className="empty-selection">Nenhum item selecionado</span>
            )}
          </div>
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th className="checkbox-col">
                    <button
                      className="select-all-btn"
                      onClick={toggleSelectAll}
                    >
                      <i
                        className={`fi ${selectedRows.length === rows.length && rows.length > 0 ? "fi-fi-rr-square-minus" : "fi fi-rr-square-plus"}`}
                      ></i>
                    </button>
                  </th>
                  {Object.keys(colWidths).map((col, index, array) => (
                    <th key={col} style={{ width: `${colWidths[col]}px` }}>
                      <div className="cell-content">
                        {col.toUpperCase()}
                        {index < array.length - 1 && (
                          <div
                            className="resizer"
                            onMouseDown={(e) => handleMouseDown(e, col)}
                          />
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="actions-header">
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
              <tbody className="scrollable-body">
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className={
                      selectedRows.includes(row.id) ? "row-selected" : ""
                    }
                  >
                    <td className="checkbox-col">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => toggleSelectRow(row.id)}
                      />
                    </td>
                    <td>{row.id}</td>
                    <td>{row.nome}</td>
                    <td>{row.email}</td>
                    <td>{row.cargo}</td>
                    <td>{row.cep}</td>
                    <td>{row.idade}</td>
                    <td className="actions-cell">
                      <button>
                        <i class="fi fi-rr-file-edit editar"></i>
                      </button>
                      <button>
                        <i class="fi fi-rr-delete-document remover"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
