import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Agendamento.css';

// Lista completa de equipamentos para garantir que todos apareçam
const equipmentList = [
  { name: "Impressora 3D Finder 01", icon: "🖨️" },
  { name: "Impressora 3D Finder 02", icon: "🖨️" },
  { name: "Cortadora a Laser", icon: "⚡" },
  { name: "Prototipadora", icon: "🔧" },
  { name: "Bambu Lab A1", icon: "🖨️" },
  { name: "Bambu Lab A2", icon: "🖨️" },
  { name: "Micro Retífica", icon: "🔩" },
  { name: "Plotter de Recorte", icon: "✂️" },
  { name: "X1 Carbon Combo - Impressora 3D", icon: "🖨️" },
  { name: "Estação de Solda 01", icon: "🔥" },
  { name: "Estação de Solda 02", icon: "🔥" },
  { name: "Furadeira de Bancada", icon: "🔩" },
  { name: "Serra Tico-Tico", icon: "🪚" },
  { name: "Máquina de Costura", icon: "🧵" },
  { name: "Parafusadeira e Furadeira a Bateria", icon: "🔧" },
  { name: "Lixadeira Portátil DEWALT", icon: "🛠️" },
];

const Agendamento: React.FC = () => {
    const [equipment, setEquipment] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    // Trava de login: redireciona se não estiver autenticado
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        } else {
            setIsLoggedIn(true);
        }
    }, [navigate]);

    // Não renderiza nada enquanto verifica autenticação
    if (!isLoggedIn) return null;

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
        <div className="agendamento-page">
            <div className="schedule-card">
                <div className="schedule-header">
                    <h1>📅 Agendar Equipamento</h1>
                    <p>Reserve o equipamento desejado para garantir seu uso no laboratório.</p>
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
                                {equipmentList.map((item, index) => (
                                    <option key={index} value={item.name}>{item.icon} {item.name}</option>
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