import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import './Perfil.css';

const Perfil: React.FC = () => {
    const [userData, setUserData] = useState({ name: '', email: '', ra: '' });
    const [appointments, setAppointments] = useState<any[]>([]);
    
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');

    useEffect(() => {
        const name = localStorage.getItem('userName') || 'Usuário';
        const email = localStorage.getItem('userEmail') || 'Não informado';
        const ra = localStorage.getItem('userRA') || 'Não informado';
        const userId = localStorage.getItem('userId');
        
        setUserData({ name, email, ra });

        if (userId) {
            fetchAppointments(userId);
        }
    }, []);

    const fetchAppointments = async (id: string) => {
        try {
            const res = await api.get(`/appointments/${id}`);
            setAppointments(res.data);
        } catch (e) {
            console.error("Erro ao buscar histórico:", e);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPass.length < 6) return alert("A senha deve ter no mínimo 6 caracteres.");
        if (newPass !== confirmPass) return alert("As senhas não coincidem.");
        
        const userId = localStorage.getItem('userId');
        
        try {
            const res = await api.post('/change-password', { userId, newPassword: newPass });
            if (res.status === 200) {
                alert("✅ Senha atualizada!");
                setNewPass(''); 
                setConfirmPass('');
            }
        } catch (e: any) { 
            alert(e.response?.data?.error || "Erro ao trocar senha."); 
        }
    };

    const getStatusColor = (status: string) => {
        if (status === 'APROVADO') return '#10b981'; // green
        if (status === 'RECUSADO') return '#ef4444'; // red
        return '#fbbf24'; // yellow
    };

    return (
        <div className="profile-container">
            <div className="profile-grid">
                
                <div className="profile-card info-card">
                    <div className="avatar-circle">
                        {userData.name.charAt(0).toUpperCase()}
                    </div>
                    <h2>{userData.name}</h2>
                    <div className="info-row"><span>📧 E-mail:</span> <strong>{userData.email}</strong></div>
                    <div className="info-row"><span>🆔 R.A.:</span> <strong>{userData.ra}</strong></div>
                    
                    <hr className="divider"/>
                    
                    <h3>🔐 Trocar Senha</h3>
                    <form onSubmit={handleChangePassword}>
                        <input className="profile-input" type="password" placeholder="Nova Senha" value={newPass} onChange={e => setNewPass(e.target.value)} required />
                        <input className="profile-input" type="password" placeholder="Confirmar Nova Senha" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required />
                        <button type="submit" className="save-btn">Atualizar Senha</button>
                    </form>
                </div>

                <div className="profile-card history-card" style={{ flex: 2 }}>
                    <h3>📅 Minhas Reservas</h3>
                    
                    {appointments.length === 0 ? (
                        <p style={{color: '#666', fontStyle: 'italic'}}>Nenhum agendamento encontrado.</p>
                    ) : (
                        <ul className="history-list" style={{ padding: 0 }}>
                            {appointments.map((appt) => (
                                <li key={appt.id} className="history-item" style={{ borderLeft: `4px solid ${getStatusColor(appt.status)}`, marginBottom: '15px', padding: '15px', background: '#1e293b', borderRadius: '8px', listStyle: 'none' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <strong style={{ fontSize: '1.2rem', color: 'white' }}>{appt.equipment}</strong>
                                        <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: getStatusColor(appt.status), color: appt.status === 'PENDENTE' ? 'black' : 'white' }}>
                                            {appt.status}
                                        </span>
                                    </div>
                                    <div style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '8px' }}>
                                        📅 {appt.date.split('-').reverse().join('/')} ⏰ {appt.startTime}
                                    </div>
                                    {appt.justification && (
                                        <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px' }}>
                                            "{appt.justification}"
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Perfil;
