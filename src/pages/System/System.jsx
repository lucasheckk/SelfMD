import React, { useState, useRef, useEffect } from "react";
import "./System.scss";
import { SegundoMenu } from "../../components/SegundoMenu/SegundoMenu";

export function System() {
  const [tabs, setTabs] = useState([{ id: 1, name: "Sua tabela", rows: [] }]);
  const [activeTab, setActiveTab] = useState(1);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef({});

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
              const activeTabData = tabs.find((t) => t.id === activeTab);
              const rowCount = activeTabData?.rows?.length || 0;

              return (
                <>
                  {activeTabData?.name}
                  <span className="row-counter">{rowCount}</span>
                </>
              );
            })()}
          </div>
          <div className="selection-bar">
            <button>
              <i class="fi fi-sr-trash"></i>
              Apagar
            </button>
          </div>
          <div className="table-content">

          </div>
        </div>
      </main>
    </div>
  );
}
