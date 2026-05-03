import React, { useState, useEffect } from 'react';
import './Perfil.css';

const trainingModules = [
    'Impressora 3D Finder',
    'Impressora 3D Bambu LAB',
    'Cortadora a Laser',
    'Prototipadora'
];

interface AdminUser {
    id: string;
    name: string;
    email: string;
    ra?: string | null;
    role?: string;
}

interface EquipmentItem {
    id: string;
    name: string;
    description?: string | null;
    imagePath?: string | null;
    status: string;
}

const Perfil: React.FC = () => {
    // Estado para guardar os dados do usuário
    const [userData, setUserData] = useState({ name: '', email: '', ra: '' });
    const [userRole, setUserRole] = useState('ALUNO');
    
    // Estado para guardar o histórico de agendamentos
    const [appointments, setAppointments] = useState<any[]>([]);
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
    const [equipmentItems, setEquipmentItems] = useState<EquipmentItem[]>([]);
    const [activeTab, setActiveTab] = useState<'agendamentos' | 'usuarios' | 'equipamentos' | 'configuracoes'>('agendamentos');
    const [appointmentFilter, setAppointmentFilter] = useState<'todos' | 'aprovado' | 'pendente' | 'concluido' | 'cancelado'>('todos');
    const [userSearch, setUserSearch] = useState('');
    const [searchFilter, setSearchFilter] = useState<'todos' | 'nome' | 'email' | 'ra'>('todos');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editRa, setEditRa] = useState('');

    const openEditUser = (user: AdminUser) => {
        if (user.role === 'ADMIN') return;
        setEditingUser(user);
        setEditName(user.name);
        setEditEmail(user.email);
        setEditRa(user.ra ?? '');
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingUser(null);
    };

    const handleEditUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            const res = await fetch(`http://localhost:3000/api/users/${editingUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName, email: editEmail, ra: editRa })
            });
            const data = await res.json();
            if (!res.ok) {
                alert('Erro ao salvar usuário: ' + (data.error || 'Falha no servidor'));
                return;
            }
            await fetchAdminUsers();
            closeEditModal();
            alert('Usuário atualizado com sucesso.');
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            alert('Erro de conexão ao salvar usuário.');
        }
    };

    // Ao carregar a página
    useEffect(() => {
        // Busca os dados salvos no localStorage (pelo Login.tsx)
        const name = localStorage.getItem('userName') || 'Usuário';
        const email = localStorage.getItem('userEmail') || 'Não informado';
        const ra = localStorage.getItem('userRA') || 'Não informado';
        const role = localStorage.getItem('userRole') || 'ALUNO';
        const userId = localStorage.getItem('userId');
        
        // Atualiza o estado
        setUserData({ name, email, ra });
        setUserRole(role);

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
            setAppointments(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Erro ao buscar histórico:', e);
        }
    };

    const fetchAdminUsers = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/users');
            const data = await res.json();
            setAdminUsers(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Erro ao buscar usuários do admin:', e);
        }
    };

    const fetchEquipment = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/equipment');
            const data = await res.json();
            setEquipmentItems(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Erro ao buscar equipamentos do admin:', e);
        }
    };

    const isAdmin = userRole === 'ADMIN';

    useEffect(() => {
        if (isAdmin) {
            fetchAdminUsers();
            fetchEquipment();
        }
    }, [isAdmin]);

    const displayRole = isAdmin
        ? 'Administrador'
        : userRole === 'TEACHER' || userRole === 'PROFESSOR'
        ? 'Professor'
        : 'Aluno';

    const totalReservations = appointments.length;
    const semesterHours = 47;
    const projectCount = 4;
    const completedTrainings = [true, true, true, false];

    const filteredAppointments = appointmentFilter === 'todos'
        ? appointments
        : appointments.filter(appt => appt.status?.toLowerCase() === appointmentFilter);

    const filteredUsers = adminUsers.filter(user => {
        const term = userSearch.trim().toLowerCase();
        if (!term) return true;
        if (searchFilter === 'nome') return user.name.toLowerCase().includes(term);
        if (searchFilter === 'email') return user.email.toLowerCase().includes(term);
        if (searchFilter === 'ra') return (user.ra ?? '').toLowerCase().includes(term);
        return (
            user.name.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            (user.ra ?? '').toLowerCase().includes(term)
        );
    });

    const getStatusClass = (status: string) => {
        const normalized = status?.toLowerCase?.();
        if (normalized?.includes('disp')) return 'available';
        if (normalized?.includes('uso')) return 'in-use';
        return 'maintenance';
    };

    const needsTraining = (item: EquipmentItem) => {
        return item.description?.toLowerCase().includes('treino') || item.name?.toLowerCase().includes('cortadora');
    };

    const sortedAppointments = [...appointments].sort((a, b) => {
        const dateA = a.date || '';
        const dateB = b.date || '';
        if (dateA !== dateB) return dateA.localeCompare(dateB);
        return (a.startTime || '').localeCompare(b.startTime || '');
    });

    const upcomingAppointment = sortedAppointments.find(appt => appt.status?.toLowerCase() !== 'cancelado') || sortedAppointments[0];

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentPassword.length < 6 || newPassword.length < 6) return alert('A senha deve ter no mínimo 6 caracteres.');
        if (newPassword !== confirmPassword) return alert('As senhas não coincidem.');

        const userId = localStorage.getItem('userId');
        try {
            const res = await fetch('http://localhost:3000/api/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, currentPassword, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                alert('✅ ' + data.message);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                alert('❌ Erro: ' + data.error);
            }
        } catch (error) {
            alert('Erro de conexão com o servidor.');
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-grid">
                
                {/* COLUNA 1: CARTÃO DE DADOS PESSOAIS*/}
                <div className="profile-card info-card">
                    {/* Avatar com a inicial do nome */}
                    <div className="avatar-circle">
                        {userData.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="profile-heading">
                        <div>
                            <h2>{userData.name}</h2>
                            <span className="role-pill">{displayRole}</span>
                        </div>
                    </div>

                    <div className="info-row">
                        <span>E-mail</span>
                        <strong>{userData.email}</strong>
                    </div>
                    <div className="info-row2">
                        <span>R.A.</span>
                        <strong>{userData.ra}</strong>
                    </div>

                    <hr className="divider" />

                    {!isAdmin && (
                        <>
                            <p className="semestre-label">Uso neste Semestre</p>
                            <div className="stats-grid">
                                <div className="stats-card">
                                    <span>Reservas</span>
                                    <strong>{totalReservations}</strong>
                                </div>
                                <div className="stats-card">
                                    <span>Horas</span>
                                    <strong>{semesterHours}h</strong>
                                </div>
                                <div className="stats-card">
                                    <span>Projetos</span>
                                    <strong>{projectCount}</strong>
                                </div>
                            </div>

                            <div className="training-header">
                                <h3 className="training-title">Treinamentos</h3>
                                <h3 className="training-counter">{completedTrainings.filter(Boolean).length}/{trainingModules.length}</h3>
                            </div>
                            <ul className="training-list">
                                {trainingModules.map((training, index) => (
                                    <li key={training} className={completedTrainings[index] ? 'done' : 'pending'}>
                                        <span className="training-dot" style={{color: completedTrainings[index] ? '#10b981' : '#ef4444'}}>●</span>
                                        <span>{training}</span>
                                        {completedTrainings[index] && <span className="training-check">✓</span>}
                                    </li>
                                ))}
                            </ul>
                            <p className="training-note">Necessário para reservar certos equipamentos.</p>
                        </>
                    )}

                </div>

                {/* COLUNA 2: AGENDAMENTOS / CONFIGURAÇÕES */}
                <div className="profile-card right-panel">
                    <div className="panel-tabs">
                        <button
                            type="button"
                            className={`panel-tab ${activeTab === 'agendamentos' ? 'active' : ''}`}
                            onClick={() => setActiveTab('agendamentos')}
                        >
                            Agendamentos
                            <span className="tab-badge">{appointments.length}</span>
                        </button>
                        {isAdmin && (
                            <>
                                <button
                                    type="button"
                                    className={`panel-tab ${activeTab === 'usuarios' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('usuarios')}
                                >
                                    Usuários
                                </button>
                                <button
                                    type="button"
                                    className={`panel-tab ${activeTab === 'equipamentos' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('equipamentos')}
                                >
                                    Equipamentos
                                </button>
                            </>
                        )}
                        <button
                            type="button"
                            className={`panel-tab ${activeTab === 'configuracoes' ? 'active' : ''}`}
                            onClick={() => setActiveTab('configuracoes')}
                        >
                            Configurações
                        </button>
                    </div>

                    {activeTab === 'agendamentos' ? (
                        <div className="panel-content">
                            {upcomingAppointment ? (
                                <div className="upcoming-card">
                                    <div className="upcoming-date">
                                        <strong>{new Date(upcomingAppointment.date).getDate().toString().padStart(2, '0')}</strong>
                                        <span>{new Date(upcomingAppointment.date).toLocaleDateString('pt-BR', { month: 'short', weekday: 'short' })}</span>
                                    </div>
                                    <div className="upcoming-meta">
                                        <span className="upcoming-label">Próximo agendamento</span>
                                        <strong>{upcomingAppointment.equipment || 'Agendamento'}</strong>
                                        <p>{upcomingAppointment.startTime || '---'} – {upcomingAppointment.endTime || '---'} • {upcomingAppointment.location || upcomingAppointment.room || 'Sala não informada'}</p>
                                    </div>
                                    <div className="upcoming-actions">
                                        <button type="button" className="secondary-btn">Ver detalhes</button>
                                        <button type="button" className="ghost-btn">Reagendar</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-card">Nenhum agendamento encontrado.</div>
                            )}

                            <div className="filter-row">
                                {['todos', 'aprovado', 'pendente', 'concluido', 'cancelado'].map(status => (
                                    <button
                                        key={status}
                                        type="button"
                                        className={`filter-chip ${appointmentFilter === status ? 'active' : ''}`}
                                        onClick={() => setAppointmentFilter(status as any)}
                                    >
                                        {status === 'todos' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                ))}
                            </div>

                            <ul className="schedule-list">
                                {filteredAppointments.length === 0 ? (
                                    <li className="schedule-empty">Nenhum agendamento para este filtro.</li>
                                ) : (
                                    filteredAppointments.map(appt => (
                                        <li key={appt.id} className="schedule-item">
                                            <div>
                                                <strong>{appt.equipment}</strong>
                                                <p>{appt.date ? appt.date.split('-').reverse().join('/') : 'Data não informada'} • {appt.startTime || '??:??'} - {appt.endTime || '??:??'}</p>
                                            </div>
                                            <div className="schedule-meta">
                                                <span className={`status-badge ${appt.status}`}>{appt.status}</span>
                                                <div className="schedule-actions">
                                                    <button type="button" className="secondary-btn">Reagendar</button>
                                                    <button type="button" className="ghost-btn danger">Cancelar</button>
                                                </div>
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    ) : activeTab === 'usuarios' ? (
                        <div className="panel-content admin-users-panel">
                            <div className="admin-panel-header">
                                <div>
                                    <h2>Usuários</h2>
                                    <p>{adminUsers.length} de {adminUsers.length} usuários</p>
                                </div>
                            </div>

                            <div className="search-row">
                                <input
                                    type="text"
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    placeholder="Buscar por nome, e-mail ou R.A..."
                                />
                            </div>

                            <div className="filter-row users-filter-row">
                                {['todos', 'nome', 'email', 'ra'].map(filter => (
                                    <button
                                        key={filter}
                                        type="button"
                                        className={`filter-chip ${searchFilter === filter ? 'active' : ''}`}
                                        onClick={() => setSearchFilter(filter as any)}
                                    >
                                        {filter === 'todos' ? 'Todos' : filter === 'nome' ? 'Nome' : filter === 'email' ? 'E-mail' : 'R.A.'}
                                    </button>
                                ))}
                            </div>

                            <div className="user-table-wrapper">
                                <table className="user-table">
                                    <thead>
                                        <tr>
                                            <th>Usuário</th>
                                            <th>E-mail</th>
                                            <th>R.A.</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map(user => (
                                            <tr key={user.id}>
                                                <td className="user-name-cell">
                                                    {user.name}
                                                </td>
                                                <td>{user.email}</td>
                                                <td>{user.ra}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="ghost-btn small"
                                                        onClick={() => openEditUser(user)}
                                                        disabled={user.role === 'ADMIN'}
                                                        title={user.role === 'ADMIN' ? 'Perfis de administrador não podem ser editados' : 'Editar usuário'}
                                                    >
                                                        <span className="button-icon" aria-hidden="true">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M4 17.25V21h3.75L17.81 10.94l-3.75-3.75L4 17.25Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                <path d="M14.06 4.93994c.39-.39 1.02-.39 1.41 0l2.54 2.54c.39.39.39 1.02 0 1.41l-1.83 1.83-3.75-3.75 1.63-1.63Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                        </span>
                                                        Editar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : activeTab === 'equipamentos' ? (
                        <div className="panel-content admin-equipment-panel">
                            <div className="admin-panel-header">
                                <div>
                                    <h2>Equipamentos</h2>
                                    <p>{equipmentItems.length} de {equipmentItems.length} equipamentos cadastrados</p>
                                </div>
                            </div>

                            <div className="equipment-grid">
                                {equipmentItems.map(item => (
                                    <div key={item.id} className="equipment-card">
                                        <div className="equipment-image">Imagem</div>
                                        <div className="equipment-body">
                                            <strong>{item.name}</strong>
                                            <p>{item.description || 'Sem descrição disponível'}</p>
                                            <div className="equipment-meta-row">
                                                <span className={`status-pill ${getStatusClass(item.status)}`}>
                                                    {item.status}
                                                </span>
                                                {needsTraining(item) && <span className="equipment-tag">treino</span>}
                                            </div>
                                            <button type="button" className="ghost-btn small">
                                                <span className="button-icon" aria-hidden="true">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M4 17.25V21h3.75L17.81 10.94l-3.75-3.75L4 17.25Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M14.06 4.93994c.39-.39 1.02-.39 1.41 0l2.54 2.54c.39.39.39 1.02 0 1.41l-1.83 1.83-3.75-3.75 1.63-1.63Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </span>
                                                Editar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div className="add-equipment-card">
                                    <button type="button" className="add-equipment-button">+ Adicionar equipamento</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="panel-content settings-panel">
                            <div className="settings-card">
                                <h3>Dados pessoais</h3>
                                <div className="settings-grid">
                                    <div className="profile-photo">
                                        <span>{userData.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div className="settings-fields">
                                        <label>Nome completo</label>
                                        <input type="text" value={userData.name} readOnly />
                                        <label>E-mail</label>
                                        <input type="email" value={userData.email} readOnly />
                                        <label>R.A. (somente leitura)</label>
                                        <input type="text" value={userData.ra} readOnly />
                                        <label>Telefone</label>
                                        <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 9 0000-0000" />
                                    </div>
                                </div>
                                <div className="settings-actions">
                                    <button type="button" className="ghost-btn">Trocar foto</button>
                                    <button type="button" className="secondary-btn">Salvar alterações</button>
                                </div>
                            </div>

                            <div className="settings-card">
                                <div className="settings-header">
                                    <h3>Trocar senha</h3>
                                    <span>Segurança</span>
                                </div>
                                <form onSubmit={handlePasswordUpdate} className="password-form">
                                    <label>Senha atual</label>
                                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                                    <label>Nova senha</label>
                                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                                    <label>Confirmar nova senha</label>
                                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                                    <div className="password-help">
                                        <span>mín. 8 caracteres</span>
                                        <span>1 letra maiúscula</span>
                                        <span>1 número</span>
                                        <span>1 símbolo especial</span>
                                    </div>
                                    <button type="submit" className="secondary-btn">Atualizar senha</button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isEditModalOpen && editingUser && (
                <div className="modal-overlay" onClick={closeEditModal}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3>Editar usuário</h3>
                                <p>Somente perfis de professor e aluno podem ser alterados.</p>
                            </div>
                            <button type="button" className="modal-close" onClick={closeEditModal}>×</button>
                        </div>
                        <form className="edit-user-form" onSubmit={handleEditUserSubmit}>
                            <label>Nome completo</label>
                            <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required />

                            <label>E-mail</label>
                            <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} required />

                            <label>R.A.</label>
                            <input type="text" value={editRa} onChange={e => setEditRa(e.target.value)} />

                            <div className="modal-actions">
                                <button type="button" className="ghost-btn" onClick={closeEditModal}>Cancelar</button>
                                <button type="submit" className="secondary-btn">Salvar alterações</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Perfil;
