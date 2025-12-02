import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Equipamentos.css';

type EquipmentStatus = 'available' | 'in-use' | 'maintenance';

interface Equipment {
  id: number;
  name: string;
  img: string;
  defaultStatus?: EquipmentStatus;
}

const equipamentosData: Equipment[] = [
  { id: 1, name: 'Impressora 3D Finder 01', img: 'impressora_3D_finder.png' },
  { id: 2, name: 'Impressora 3D Finder 02', img: 'impressora_3D_finder.png' },
  { id: 3, name: 'Cortadora a Laser', img: 'cortadora_laser.png' },
  { id: 4, name: 'Prototipadora', img: 'prototipadora.png' },
  { id: 5, name: 'Bambu Lab A1', img: 'Bambu_LAB.png' },
  { id: 6, name: 'X1 Carbon Combo', img: 'x1_carbon.png' },
  { id: 7, name: 'Estação de Solda', img: 'est_solda.png' },
  { id: 8, name: 'Furadeira de Bancada', img: 'furadeira_de_bancada.png' },
  { id: 9, name: 'Serra Tico-Tico', img: 'serra-bosch.png' },
  { id: 10, name: 'Máquina de Costura', img: 'maquina_de_costura.png' },
  { id: 11, name: 'Plotter de Recorte', img: 'plotter_de_recorte.png' },
  { id: 12, name: 'Micro Retífica', img: 'micro_retífica.png', defaultStatus: 'maintenance' },
  { id: 13, name: 'Parafusadeira', img: 'Parafusadeira_e_Furadeira_Bateria.png' },
  { id: 14, name: 'Lixadeira Portátil', img: 'Lixadeira_portátil_DEWALT.png' },
  { id: 15, name: 'Scanner 3D', img: 'scanner3d.png' },
];

function getStatusConfig(status: EquipmentStatus) {
  switch (status) {
    case 'available': return { variant: 'available', label: 'Disponível' };
    case 'in-use': return { variant: 'in-use', label: 'Em uso agora' };
    case 'maintenance': return { variant: 'maintenance', label: 'Manutenção' };
    default: return { variant: 'available', label: 'Disponível' };
  }
}

const StatusIcon: React.FC<{ variant: string }> = ({ variant }) => {
  if (variant === 'available') return <svg viewBox="0 0 24 24" className="status-svg"><path d="M6 12.5l3 3L18 8" fill="none" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (variant === 'in-use') return <svg viewBox="0 0 24 24" className="status-svg"><line x1="12" y1="7" x2="12" y2="12" strokeWidth="3.5" strokeLinecap="round" /><line x1="12" y1="12" x2="16" y2="14" strokeWidth="3.5" strokeLinecap="round" /></svg>;
  return <svg viewBox="0 0 24 24" className="status-svg"><line x1="7" y1="7" x2="17" y2="17" strokeWidth="3.5" strokeLinecap="round" /><line x1="17" y1="7" x2="7" y2="17" strokeWidth="3.5" strokeLinecap="round" /></svg>;
};

const Equipamentos: React.FC = () => {
  const [busyList, setBusyList] = useState<string[]>([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/equipment-status');
        const data = await res.json();
        setBusyList(data.busy || []);
      } catch (error) { console.error(error); }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="equipment-page">
      <div className="equipment-header">
        <h1>Equipamentos</h1>
        <p>Confira a disponibilidade e agende.</p>
      </div>
      <div className="equipment-grid">
        {equipamentosData.map((item) => {
          let currentStatus: EquipmentStatus = 'available';
          if (item.defaultStatus) currentStatus = item.defaultStatus;
          else if (busyList.includes(item.name)) currentStatus = 'in-use';

          const config = getStatusConfig(currentStatus);
          const isAvailable = currentStatus === 'available';

          return (
            <div key={item.id} className="equipment-card">
              <div className="equipment-image-wrapper">
                <img src={`/${item.img}`} alt={item.name} onError={(e) => (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/300'} />
              </div>
              <h3 className="equipment-name">{item.name}</h3>
              <div className={`equipment-status ${config.variant}`}>
                <div className={`status-icon ${config.variant}`}><StatusIcon variant={config.variant} /></div>
                <span className="status-label">{config.label}</span>
              </div>
              {isAvailable ? (
                <Link to="/agendamento" state={{ preSelectedEquipment: item.name }} className="equipment-button primary">Agendar</Link>
              ) : (
                <button disabled className="equipment-button disabled-button">Indisponível</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default Equipamentos;