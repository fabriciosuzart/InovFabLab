import React, { useState, useEffect } from 'react';
import './Perfil.css';

const Perfil: React.FC = () => {
    // Estado para guardar os dados do usuário
    const [userData, setUserData] = useState({ name: '', email: '', ra: '' });
    
    // Estado para guardar o histórico de agendamentos
    const [appointments, setAppointments] = useState<any[]>([]);
    
    // Estados para a troca de senha
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');

    // Ao carregar a página
    useEffect(() => {
        // Busca os dados salvos no localStorage (pelo Login.tsx)
        const name = localStorage.getItem('userName') || 'Usuário';
        const email = localStorage.getItem('userEmail') || 'Não informado';
        const ra = localStorage.getItem('userRA') || 'Não informado';
        const userId = localStorage.getItem('userId');
        
        // Atualiza o estado
        setUserData({ name, email, ra });

        // Se tiver ID, busca os agendamentos no banco
        if (userId) {
            fetchAppointments(userId);
        }
    }, []);

    // Função para buscar agendamentos no servidor
    const fetchAppointments = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:3000/api/appointments/${id}`);
            const data = await res.json();
            setAppointments(data);
        } catch (e) {
            console.error("Erro ao buscar histórico:", e);
        }
    };

    // Função para trocar a senha
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validações simples
        if (newPass.length < 6) return alert("A senha deve ter no mínimo 6 caracteres.");
        if (newPass !== confirmPass) return alert("As senhas não coincidem.");
        
        const userId = localStorage.getItem('userId');
        
        try {
            const res = await fetch('http://localhost:3000/api/change-password', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ userId, newPassword: newPass })
            });
            
            const data = await res.json();

            if (res.ok) {
                alert("✅ " + data.message);
                setNewPass(''); 
                setConfirmPass('');
            } else {
                alert("❌ Erro: " + data.error);
            }
        } catch (e) { 
            alert("Erro de conexão com o servidor."); 
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-grid">
                
                {/* COLUNA 1: CARTÃO DE DADOS PESSOAIS + SENHA */}
                <div className="profile-card info-card">
                    {/* Avatar com a inicial do nome */}
                    <div className="avatar-circle">
                        {userData.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <h2>{userData.name}</h2>
                    
                    <div className="info-row">
                        <span>📧 E-mail:</span> 
                        <strong>{userData.email}</strong>
                    </div>
                    <div className="info-row">
                        <span>🆔 R.A.:</span> 
                        <strong>{userData.ra}</strong>
                    </div>
                    
                    <hr className="divider"/>
                    
                    <h3>🔐 Trocar Senha</h3>
                    <form onSubmit={handleChangePassword}>
                        <input 
                            className="profile-input" 
                            type="password" 
                            placeholder="Nova Senha" 
                            value={newPass} 
                            onChange={e => setNewPass(e.target.value)} 
                            required
                        />
                        <input 
                            className="profile-input" 
                            type="password" 
                            placeholder="Confirmar Nova Senha" 
                            value={confirmPass} 
                            onChange={e => setConfirmPass(e.target.value)} 
                            required
                        />
                        <button type="submit" className="save-btn">Atualizar Senha</button>
                    </form>
                </div>

                {/* COLUNA 2: HISTÓRICO DE AGENDAMENTOS */}
                <div className="profile-card history-card">
                    <h3>📅 Histórico de Agendamentos</h3>
                    
                    {appointments.length === 0 ? (
                        <p style={{color: '#666', fontStyle: 'italic'}}>Nenhum agendamento encontrado.</p>
                    ) : (
                        <ul className="history-list">
                            {appointments.map((appt) => (
                                <li key={appt.id} className={`history-item ${appt.status}`}>
                                    <div className="h-header">
                                        <strong>{appt.equipment}</strong>
                                        <span className={`status-badge ${appt.status}`}>
                                            {appt.status}
                                        </span>
                                    </div>
                                    <div className="h-date">
                                        {/* Formata a data de YYYY-MM-DD para DD/MM/YYYY */}
                                        {appt.date.split('-').reverse().join('/')} • {appt.startTime} às {appt.endTime}
                                    </div>
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
