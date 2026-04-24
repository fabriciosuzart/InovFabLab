import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Equipamentos.css';

const equipamentosData = [
  { id: 1, name: 'Impressora 3D Finder 01', status: 'available', img: 'impressora_3D_finder_01.jpg' },
  { id: 2, name: 'Impressora 3D Finder 02', status: 'available', img: 'impressora_3D_finder_02.jpg' },
  { id: 3, name: 'Cortadora a Laser', status: 'in-use', img: 'cortadora_a_laser.jpeg' },
  { id: 4, name: 'Prototipadora', status: 'in-use', img: 'prototipadora.png' },
  { id: 5, name: 'Bambu Lab A1', status: 'available', img: 'Bambu_LAB_01.png' },
  { id: 6, name: 'Bambu Lab A2', status: 'available', img: 'Bambu_LAB_02.png' },
  { id: 7, name: 'Micro Retífica', status: 'available', img: 'micro_retífica.jpg' },
  { id: 8, name: 'Plotter de Recorte', status: 'in-use', img: 'plotter_de_recorte.jpg' },
  { id: 9, name: 'X1 Carbon Combo', status: 'available', img: 'X1_CARBON_COMBO_IMPRESSORA_3D.jpg' },
  { id: 10, name: 'Estação de Solda 01', status: 'available', img: 'ESTACAO_DE_SOLDA.jpg' },
  { id: 11, name: 'Estação de Solda 02', status: 'available', img: 'ESTACAO_DE_SOLDA.jpg' },
  { id: 12, name: 'Furadeira de Bancada', status: 'in-use', img: 'furadeira_de_bancada.jpg' },
  { id: 13, name: 'Serra Tico-Tico', status: 'in-use', img: 'Serra_tico-tico_bosch.jpg' },
  { id: 14, name: 'Máquina de Costura', status: 'available', img: 'maquina_de_costura.jpg' },
  { id: 15, name: 'Parafusadeira', status: 'available', img: 'Parafusadeira_e_Furadeira_Bateria.jpg' },
  { id: 16, name: 'Lixadeira Portátil', status: 'available', img: 'Lixadeira_portátil_DEWALT.jpg' },
];

const Equipamentos: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('default');

  const filteredItems = equipamentosData
    .filter(item => filterStatus === 'all' ? true : item.status === filterStatus)
    .sort((a, b) => {
      if (sortOrder === 'alphabetical') return a.name.localeCompare(b.name);
      return a.id - b.id;
    });

  return (
    <div className="equipment-page">
      
      {/* Cabeçalho Premium */}
      <header className="page-header">
        <div className="header-title">
            <h1>Laboratório de Equipamentos</h1>
            <p>Descubra as ferramentas para dar vida às suas ideias.</p>
        </div>

        <div className="filter-controls">
            <select onChange={(e) => setFilterStatus(e.target.value)} value={filterStatus}>
                <option value="all">Todos os Equipamentos</option>
                <option value="available">🟢 Disponíveis Hoje</option>
                <option value="in-use">🟠 Em Manutenção/Uso</option>
            </select>
            
            <select onChange={(e) => setSortOrder(e.target.value)} value={sortOrder}>
                <option value="default">Relevância</option>
                <option value="alphabetical">Ordem Alfabética (A-Z)</option>
            </select>
        </div>
      </header>

      {/* Catálogo de Equipamentos */}
      <div className="equipment-grid">
        {filteredItems.map(item => (
          <div key={item.id} className="card">
            
            <div className="card-image">
                <img src={`/${item.img}`} alt={item.name} onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/300x200?text=S/IMAGEM'} />
                
                <span className={`status-badge ${item.status}`}>
                    {item.status === 'available' ? '● Disponível' : '● Em Uso'}
                </span>
            </div>
            
            <div className="card-content">
                <h3>{item.name}</h3>
                
                <Link to="/agendamento" className="schedule-button">
                    Reservar Horário
                </Link>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default Equipamentos;