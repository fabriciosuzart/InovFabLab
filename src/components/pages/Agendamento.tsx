import React, { useState } from 'react';
import './Agendamento.css';

// Lista completa de equipamentos para garantir que todos apareçam
const equipmentList = [
  "Impressora 3D Finder 01",
  "Impressora 3D Finder 02",
  "Cortadora a Laser",
  "Prototipadora",
  "Bambu Lab A1",
  "Bambu Lab A2",
  "Micro Retífica",
  "Plotter de Recorte",
  "X1 Carbon Combo - Impressora 3D",
  "Estação de Solda 01",
  "Estação de Solda 02",
  "Furadeira de Bancada",
  "Serra Tico-Tico",
  "Máquina de Costura",
  "Parafusadeira e Furadeira a Bateria",
  "Lixadeira Portátil DEWALT"
];

const Agendamento: React.FC = () => {
    const [equipment, setEquipment] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
            alert("Você precisa fazer login antes de agendar!");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, equipment, date, time })
            });
            
            if (response.ok) {
                alert(`Agendamento confirmado para ${equipment} no dia ${date} às ${time}!`);
                setEquipment('');
                setDate('');
                setTime('');
            } else {
                alert('Erro ao agendar. Tente novamente.');
            }
        } catch (error) {
            alert('Erro de conexão com o servidor.');
        }
    };

    return (
        <div className="container agendamento-page">
            <div className="schedule-card">
                <div className="schedule-header">
                    <h1>Agendamento Manual</h1>
                    <p>Reserve o equipamento desejado para garantir seu uso.</p>
                </div>

                <form className="schedule-form" onSubmit={handleSchedule}>
                    <div className="form-group">
                        <label htmlFor="equipment">Selecione o Equipamento</label>
                        <div className="select-wrapper">
                            <select 
                                id="equipment" 
                                value={equipment} 
                                onChange={e => setEquipment(e.target.value)} 
                                required
                            >
                                <option value="" disabled>-- Escolha um item --</option>
                                {/* Gera a lista automaticamente baseado no array lá de cima */}
                                {equipmentList.map((item, index) => (
                                    <option key={index} value={item}>{item}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="scheduleDate">Data de Uso</label>
                            <input 
                                type="date" 
                                id="scheduleDate" 
                                value={date} 
                                onChange={e => setDate(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="scheduleTime">Horário de Início</label>
                            <input 
                                type="time" 
                                id="scheduleTime" 
                                value={time} 
                                onChange={e => setTime(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    <button type="submit" className="submit-button">
                        Confirmar Agendamento
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Agendamento;