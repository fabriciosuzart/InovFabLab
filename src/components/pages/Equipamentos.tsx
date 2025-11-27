import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Equipamentos.css';

type EquipmentStatus = 'available' | 'in-use' | 'maintenance';
type EquipmentType = '3d-printer' | 'laser-cutter' | 'prototyping' | 'other';

interface Equipment {
  id: number;
  name: string;
  status: EquipmentStatus;
  img: string;
  type: EquipmentType;
}

// LISTA DE EQUIPAMENTOS
const equipamentosData: Equipment[] = [
  { id: 1, name: 'Impressora 3D Finder', status: 'available', img: 'impressora_3D_finder.png', type: '3d-printer' },
  { id: 2, name: 'Cortadora a Laser', status: 'available', img: 'cortadora_laser.png', type: "laser-cutter" },
  { id: 3, name: 'Prototipadora', status: 'in-use', img: 'prototipadora.png', type: 'prototyping' },
  { id: 4, name: 'Bambu Lab A1', status: 'available', img: 'Bambu_LAB.png', type: '3d-printer' },
  { id: 5, name: 'Micro Retífica', status: 'maintenance', img: 'micro_retífica.png', type: 'other' },
  { id: 6, name: 'Plotter de Recorte', status: 'in-use', img: 'plotter_de_recorte.png', type: 'other' },
  { id: 7, name: 'X1 Carbon Combo', status: 'available', img: 'x1_carbon.png', type: '3d-printer' },
  { id: 8, name: 'Estação de Solda', status: 'available', img: 'est_solda.png', type: 'other' },
  { id: 10, name: 'Furadeira de Bancada', status: 'in-use', img: 'furadeira_de_bancada.png', type: 'other' },
  { id: 11, name: 'Serra Tico-Tico', status: 'in-use', img: 'serra-bosch.png', type: 'other' },
  { id: 12, name: 'Máquina de Costura', status: 'available', img: 'maquina_de_costura.png', type: 'other' },
  { id: 13, name: 'Parafusadeira', status: 'available', img: 'Parafusadeira_e_Furadeira_Bateria.png', type: 'other' },
  { id: 14, name: 'Lixadeira Portátil', status: 'available', img: 'Lixadeira_portátil_DEWALT.png', type: 'other' },
  { id: 15, name: 'Scanner 3D', status: 'available', img: 'scanner3d.png', type: 'other' },
];

/* STATUS */
function getStatusConfig(status: EquipmentStatus) {
  switch (status) {
    case 'available':
      return {
        variant: 'available' as EquipmentStatus,
        label: 'Disponível para uso',
      };
    case 'in-use':
      return {
        variant: 'in-use' as EquipmentStatus,
        label: 'Em uso, aguarde',
      };
    case 'maintenance':
      return {
        variant: 'maintenance' as EquipmentStatus,
        label: 'Máquina em manutenção',
      };
    default:
      return {
        variant: 'available' as EquipmentStatus,
        label: 'Disponível para uso',
      };
  }
}

// Ícones em SVG para cada status
//DISPONÍVEL
const StatusIcon: React.FC<{ variant: EquipmentStatus }> = ({ variant }) => {
  if (variant === 'available') {
    return (
      <svg viewBox="0 0 24 24" className="status-svg">
        <path
          d="M6 12.5l3 3L18 8"
          fill="none"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  //EM USO
  if (variant === 'in-use') {
    return (
      <svg viewBox="0 0 24 24" className="status-svg">
        <line
          x1="12"
          y1="7"
          x2="12"
          y2="12"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <line
          x1="12"
          y1="12"
          x2="16"
          y2="14"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // MANUTENÇÃO
  return (
    <svg viewBox="0 0 24 24" className="status-svg">
      <line
        x1="7"
        y1="7"
        x2="17"
        y2="17"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <line
        x1="17"
        y1="7"
        x2="7"
        y2="17"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

// Regra provisória de treinamento:
//  - 3D, Laser e Prototipadora exigem treinamento.
//  - Por enquanto, o usuário NÃO tem treinamento só na Cortadora a Laser.
//  - Quando conectar no back, é só trocar essa função.
function userHasTraining(equipment: Equipment): boolean {
  const needsTraining =
    equipment.type === '3d-printer' ||
    equipment.type === 'laser-cutter' ||
    equipment.type === 'prototyping';

  if (!needsTraining) return true;

  if (equipment.name === 'Cortadora a Laser') return false;

  return true;
}

const Equipamentos: React.FC = () => {
  return (
    <div className="equipment-page">
      <div className="equipment-header">
        <div>
          <h1>Equipamentos do InovFabLab</h1>
          <p>Confira a disponibilidade das máquinas e agende seu uso ou treinamento.</p>
        </div>
      </div>

      <div className="equipment-grid">
        {equipamentosData.map((item) => {
          const statusCfg = getStatusConfig(item.status);
          const hasTraining = userHasTraining(item);
          const buttonLabel = hasTraining ? 'Agendar' : 'Agendar treinamento';
          const buttonClass = hasTraining ? 'primary' : 'training';
          const isMaintenance = item.status === 'maintenance';

          return (
            <div key={item.id} className="equipment-card">
              <div className="equipment-image-wrapper">
                <img
                  src={`/${item.img}`}
                  alt={item.name}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://via.placeholder.com/300x200?text=Sem+Imagem';
                  }}
                />
              </div>

              <h3 className="equipment-name">{item.name}</h3>

              <div className="equipment-status">
                <div className={`status-icon ${statusCfg.variant}`}>
                  <StatusIcon variant={statusCfg.variant} />
                </div>
                <div className="status-text">
                  <span className="status-label">{statusCfg.label}</span>
                </div>
              </div>

                {isMaintenance ? (
                  <button
                    type="button"
                    className="equipment-button disabled-button"
                  >
                    {buttonLabel}
                  </button>
                ) : (
                  <Link
                    to="/agendamento"
                    className={`equipment-button ${buttonClass}`}
                  >
                    {buttonLabel}
                  </Link>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Equipamentos;