import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Agendamento.css';

const equipmentList = [
  "Impressora 3D Finder 01", "Impressora 3D Finder 02", "Cortadora a Laser", 
  "Prototipadora", "Bambu Lab A1", "X1 Carbon Combo", "Estação de Solda", 
  "Furadeira de Bancada", "Serra Tico-Tico", "Máquina de Costura", 
  "Plotter de Recorte", "Parafusadeira", "Lixadeira Portátil", "Scanner 3D"
];

// Gera horários das 08:00 às 22:00 com passo de 5 min
const generateTimeSlots = () => {
    const slots = [];
    let h = 8, m = 0;
    while (h < 22 || (h === 22 && m === 0)) {
        const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        slots.push(timeStr);
        m += 5;
        if (m === 60) { m = 0; h++; }
    }
    return slots;
};

const allSlots = generateTimeSlots();

const Agendamento: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [equipment, setEquipment] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [myAppointments, setMyAppointments] = useState<any[]>([]);
    
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (userId) fetchAgendamentos(userId);
        if (location.state?.preSelectedEquipment) {
            setEquipment(location.state.preSelectedEquipment);
        }
    }, [location]);

    const fetchAgendamentos = async (userId: string) => {
        try {
            const res = await fetch(`http://localhost:3000/api/appointments/${userId}`);
            const data = await res.json();
            setMyAppointments(data);
        } catch (error) { console.error(error); }
    };

    // Calcula duração para mostrar ao usuário
    const getDuration = () => {
        if (!startTime || !endTime) return "";
        const [h1, m1] = startTime.split(':').map(Number);
        const [h2, m2] = endTime.split(':').map(Number);
        const diffMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
        if (diffMinutes <= 0) return "";
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        return `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}min` : ''}`;
    };

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
            alert("🔒 Faça login para agendar!");
            navigate('/login');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, equipment, date, startTime, endTime })
            });
            const data = await response.json();

            if (response.ok) {
                alert(`✅ Agendado com sucesso!`);
                setEquipment(''); setDate(''); setStartTime(''); setEndTime('');
                fetchAgendamentos(userId);
            } else {
                alert(`❌ Erro: ${data.error}`);
            }
        } catch (error) { alert('Erro de conexão.'); }
    };

    const handleCancel = async (id: number) => {
        if (!window.confirm("Cancelar este agendamento?")) return;
        try {
            await fetch(`http://localhost:3000/api/appointments/${id}/cancel`, { method: 'PUT' });
            const userId = localStorage.getItem('userId');
            if(userId) fetchAgendamentos(userId);
        } catch (error) { console.error(error); }
    };

    // Filtra horários de término para serem sempre depois do início
    const availableEndSlots = allSlots.filter(slot => !startTime || slot > startTime);

    return (
        <div className="container agendamento-page">
            
            <div className="layout-grid">
                {/* COLUNA DA ESQUERDA: FORMULÁRIO */}
                <div className="schedule-card form-card">
                    <div className="schedule-header">
                        <h2>Novo Agendamento</h2>
                        <p className="subtitle">Preencha os dados abaixo</p>
                    </div>

                    <form className="schedule-form" onSubmit={handleSchedule}>
                        <div className="form-group">
                            <label>Equipamento</label>
                            <select value={equipment} onChange={e => setEquipment(e.target.value)} required className="styled-input">
                                <option value="" disabled>Selecione o equipamento...</option>
                                {equipmentList.map((item, index) => <option key={index} value={item}>{item}</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Data de Uso</label>
                            <input 
                                type="date" 
                                value={date} 
                                min={today} 
                                onChange={e => setDate(e.target.value)} 
                                required 
                                className="styled-input"
                            />
                        </div>

                        <div className="time-row">
                            <div className="form-group half">
                                <label>Início</label>
                                <select 
                                    value={startTime} 
                                    onChange={e => { setStartTime(e.target.value); setEndTime(''); }} 
                                    required 
                                    className="styled-input"
                                >
                                    <option value="" disabled>--:--</option>
                                    {/* Remove o último horário (22:00) da lista de início */}
                                    {allSlots.slice(0, -1).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="form-group half">
                                <label>Término</label>
                                <select 
                                    value={endTime} 
                                    onChange={e => setEndTime(e.target.value)} 
                                    required 
                                    className="styled-input"
                                    disabled={!startTime}
                                >
                                    <option value="" disabled>--:--</option>
                                    {availableEndSlots.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Feedback visual de duração */}
                        {startTime && endTime && (
                            <div className="duration-badge">
                                ⏱️ Duração estimada: <strong>{getDuration()}</strong>
                            </div>
                        )}

                        <button type="submit" className="submit-button">Confirmar Reserva</button>
                    </form>
                </div>

                {/* COLUNA DA DIREITA: LISTA */}
                <div className="schedule-card list-card">
                    <div className="schedule-header">
                        <h2>Meus Agendamentos</h2>
                    </div>
                    
                    <div className="appointments-wrapper">
                        {myAppointments.length === 0 ? (
                            <div className="empty-state">
                                <span style={{fontSize: '2rem'}}>📅</span>
                                <p>Nenhum agendamento futuro.</p>
                            </div>
                        ) : (
                            <ul className="appointment-list">
                                {myAppointments.map((appt) => (
                                    <li key={appt.id} className={`appt-item ${appt.status === 'Cancelado' ? 'cancelled' : ''}`}>
                                        <div className="appt-info">
                                            <strong>{appt.equipment}</strong>
                                            <span className="appt-date">{appt.date.split('-').reverse().join('/')}</span>
                                            <div className="appt-time">
                                                {appt.startTime} ➝ {appt.endTime}
                                            </div>
                                            <span className={`status-tag ${appt.status.toLowerCase()}`}>{appt.status}</span>
                                        </div>
                                        {appt.status !== 'Cancelado' && (
                                            <button onClick={() => handleCancel(appt.id)} className="cancel-btn" title="Cancelar">
                                                ✕
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Agendamento;