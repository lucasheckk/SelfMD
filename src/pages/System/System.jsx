import React, { useState } from 'react';
import './System.scss';
import { SegundoMenu } from '../../components/SegundoMenu/SegundoMenu'; 

export function System () {
  const [activeTab, setActiveTab] = useState('tabelas'); 
  const [tables, setTables] = useState([]); 
  const [selectedTable, setSelectedTable] = useState([...Array(10)].map((_, i) => ({ id: i + 1, name: `Tabela ${i + 1}` })));

const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="system-container">
      {/* Header estilo Barra Horizontal (Segunda Imagem) */}
      <header className="horizontal-header-card">
        <div className="header-content">
          <div className="grid-icon">
            <span></span><span></span><span></span><span></span>
          </div>
          <h1>Minhas Databases</h1>
        </div>
        <div className="header-actions">
          <button className="upgrade-btn">Fazer upgrade</button>
          <div className="icon-group">
            <div className="notification-icon">
              <div className="dot"></div>
            </div>
            <div className="user-profile-circle"></div>
          </div>
        </div>
      </header>

      <main className="main-layout">
        {/* Menu Estilo Imagem 1 */}
        <aside className="menu-section">
          <SegundoMenu activeTab={activeTab} onTabChange={handleTabChange} />
        </aside>

        {/* Card Branco Central (Vai de cima a baixo) */}
        <section className="content-card-canvas">
          
          {/* Visualização de Seleção de Tabelas (Início) */}
          {activeTab === 'home' && !selectedTable && (
            <div className="grid-tables">
              {tables.map((table) => (
                <div 
                  key={table.id} 
                  className="mini-table-card" 
                  onClick={() => setSelectedTable(table)}
                >
                  <header className="table-top-line"></header>
                  <div className="table-card-body">
                    <span>{table.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Visualização da Tabela Estilo Imagem 3 */}
          {selectedTable && (
            <div className="table-editor-view">
              <button className="back-btn" onClick={() => setSelectedTable(null)}>
                ← Voltar para tabelas
              </button>
              
              <div className="spreadsheet-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th className="resizable" style={{ width: '60px' }}>ID</th>
                      <th className="resizable">Nome da Coluna</th>
                      <th className="resizable">Tipo de Dado</th>
                      <th className="resizable">Configurações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Linhas conforme Imagem 3 (Sem linhas verticais, apenas horizontais) */}
                    <tr>
                      <td>1</td>
                      <td><input type="text" defaultValue="id_usuario" /></td>
                      <td><span className="badge-type">PK / INT</span></td>
                      <td><button className="settings-cell-btn">⚙️</button></td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td><input type="text" placeholder="Novo campo..." /></td>
                      <td>
                        <select className="table-select">
                          <option>VARCHAR</option>
                          <option>TEXT</option>
                          <option>BOOLEAN</option>
                        </select>
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Aqui entrariam as telas de Automação, Usuários, etc., filtradas pelo activeTab */}
        </section>
      </main>
    </div>
  );
}
