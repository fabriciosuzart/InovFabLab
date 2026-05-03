import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './AdminTrain.css';

const AdminTrain: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'ai' | 'equipment' | 'reservations'>('ai');
    
    // --- ESTADOS PARA IA ---
    const [file, setFile] = useState<File | null>(null);
    const [loadingAI, setLoadingAI] = useState(false);
    const [messageAI, setMessageAI] = useState('');
    const [msgTypeAI, setMsgTypeAI] = useState<'success' | 'error' | 'info'>('info');
    
    // --- ESTADOS PARA EQUIPAMENTOS ---
    const [equipments, setEquipments] = useState<any[]>([]);
    const [eqName, setEqName] = useState('');
    const [eqDesc, setEqDesc] = useState('');
    const [eqStatus, setEqStatus] = useState('DISPONÍVEL');
    const [eqImage, setEqImage] = useState<File | null>(null);
    const [loadingEq, setLoadingEq] = useState(false);
    const [messageEq, setMessageEq] = useState('');

    // --- ESTADOS PARA RESERVAS ---
    const [pendingReservations, setPendingReservations] = useState<any[]>([]);
    const [loadingRes, setLoadingRes] = useState(false);

    const navigate = useNavigate();

    // Proteção de Rota
    useEffect(() => {
        const role = localStorage.getItem('userRole');
        if (role !== 'ADMIN') {
            alert('Acesso negado. Apenas administradores.');
            navigate('/');
        } else {
            fetchEquipments();
            fetchPendingReservations();
        }
    }, [navigate]);

    const fetchEquipments = async () => {
        try {
            const res = await api.get('/equipment');
            setEquipments(res.data);
        } catch (error) {
            console.error("Erro ao buscar equipamentos");
        }
    };

    const fetchPendingReservations = async () => {
        try {
            const res = await api.get('/appointments/pending');
            setPendingReservations(res.data);
        } catch (error) {
            console.error("Erro ao buscar reservas pendentes");
        }
    };

    // --- FUNÇÕES DA IA ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setMessageAI(`Arquivo selecionado: ${e.target.files[0].name}`);
            setMsgTypeAI('info');
        }
    };

    const handleUploadAI = async () => {
        if (!file) return;
        setLoadingAI(true);
        setMessageAI('⚙️ Processando o arquivo... isso pode levar alguns segundos.');
        setMsgTypeAI('info');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/train', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
            if (response.status === 200) {
                setMessageAI('✅ IA Treinada com sucesso!');
                setMsgTypeAI('success');
            }
        } catch (error: any) {
            setMessageAI(error.response?.data?.error || '❌ Erro de conexão.');
            setMsgTypeAI('error');
        } finally {
            setLoadingAI(false);
        }
    };

    // --- FUNÇÕES DE EQUIPAMENTOS ---
    const handleAddEquipment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingEq(true);
        setMessageEq('Salvando equipamento...');

        const formData = new FormData();
        formData.append('name', eqName);
        formData.append('description', eqDesc);
        formData.append('status', eqStatus);
        if (eqImage) formData.append('image', eqImage);

        try {
            const response = await api.post('/equipment', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
            if (response.status === 201) {
                setMessageEq('✅ Equipamento salvo com sucesso!');
                setEqName(''); setEqDesc(''); setEqImage(null);
                fetchEquipments();
            }
        } catch (error: any) {
            setMessageEq(error.response?.data?.error || '❌ Erro ao salvar.');
        } finally {
            setLoadingEq(false);
        }
    };

    // --- FUNÇÕES DE RESERVA ---
    const handleUpdateReservation = async (id: number, status: 'APROVADO' | 'RECUSADO') => {
        setLoadingRes(true);
        try {
            await api.put(`/appointments/${id}/status`, { status });
            fetchPendingReservations(); // Recarrega a lista
        } catch (error: any) {
            alert('Erro ao atualizar reserva.');
        } finally {
            setLoadingRes(false);
        }
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Painel do Administrador</h1>
                <p>Gerencie a Inteligência Artificial, Inventário e Reservas</p>
            </div>

            <div className="admin-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveTab('reservations')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: activeTab === 'reservations' ? '#3b82f6' : '#e2e8f0', color: activeTab === 'reservations' ? 'white' : 'black', cursor: 'pointer' }}>
                    📅 Reservas Pendentes
                    {pendingReservations.length > 0 && <span style={{ background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px', fontSize: '0.8rem' }}>{pendingReservations.length}</span>}
                </button>
                <button onClick={() => setActiveTab('equipment')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: activeTab === 'equipment' ? '#3b82f6' : '#e2e8f0', color: activeTab === 'equipment' ? 'white' : 'black', cursor: 'pointer' }}>
                    🖨️ Equipamentos
                </button>
                <button onClick={() => setActiveTab('ai')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: activeTab === 'ai' ? '#3b82f6' : '#e2e8f0', color: activeTab === 'ai' ? 'white' : 'black', cursor: 'pointer' }}>
                    🧠 Treinamento IA
                </button>
            </div>

            {/* ABA: RESERVAS PENDENTES */}
            {activeTab === 'reservations' && (
                <div className="admin-panel" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ color: 'white', marginTop: 0 }}>Aprovações Pendentes</h2>
                    {pendingReservations.length === 0 ? (
                        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Nenhuma reserva pendente no momento.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {pendingReservations.map(res => (
                                <div key={res.id} style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #fbbf24' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                                        <div style={{ color: '#cbd5e1' }}>
                                            <h3 style={{ margin: '0 0 10px 0', color: 'white' }}>{res.user.name} <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>(RA: {res.user.ra})</span></h3>
                                            <p style={{ margin: '5px 0' }}><strong>Equipamento:</strong> {res.equipment.name}</p>
                                            <p style={{ margin: '5px 0' }}><strong>Data/Hora:</strong> {res.date.split('-').reverse().join('/')} às {res.time}</p>
                                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '6px', marginTop: '10px', fontStyle: 'italic' }}>
                                                "{res.justification}"
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                                            <button disabled={loadingRes} onClick={() => handleUpdateReservation(res.id, 'APROVADO')} style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                                ✅ Aprovar
                                            </button>
                                            <button disabled={loadingRes} onClick={() => handleUpdateReservation(res.id, 'RECUSADO')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                                ❌ Rejeitar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ABA: IA E EQUIPAMENTOS OCULTADAS PARA BREVIDADE NESTE RESUMO (Elas são idênticas ao código anterior) */}
            {activeTab === 'ai' && (
                <div className="admin-panel">
                    <div className="file-upload-wrapper"><input type="file" className="file-upload-input" onChange={handleFileChange} /></div>
                    <button className="train-button" onClick={handleUploadAI}>{loadingAI ? 'Processando...' : 'Treinar IA'}</button>
                    {messageAI && <div className={`alert-box alert-${msgTypeAI}`}>{messageAI}</div>}
                </div>
            )}

            {activeTab === 'equipment' && (
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div className="admin-panel" style={{ flex: '1', minWidth: '300px' }}>
                        <h2 style={{ color: 'white', marginTop: 0 }}>Novo Equipamento</h2>
                        <form onSubmit={handleAddEquipment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div><label style={{color: 'white'}}>Nome:</label><input type="text" value={eqName} onChange={e => setEqName(e.target.value)} required style={{width: '100%', padding: '8px'}} /></div>
                            <div>
                                <label style={{color: 'white'}}>Status:</label>
                                <select value={eqStatus} onChange={e => setEqStatus(e.target.value)} style={{width: '100%', padding: '8px'}}>
                                    <option value="DISPONÍVEL">🟢 Disponível</option>
                                    <option value="EM USO">🟠 Em Uso</option>
                                    <option value="MANUTENÇÃO">🔴 Em Manutenção</option>
                                </select>
                            </div>
                            <div><label style={{color: 'white'}}>Descrição:</label><textarea value={eqDesc} onChange={e => setEqDesc(e.target.value)} rows={4} style={{width: '100%', padding: '8px'}} /></div>
                            <div><label style={{color: 'white'}}>Foto:</label><input type="file" onChange={e => setEqImage(e.target.files ? e.target.files[0] : null)} accept="image/*" style={{color: 'white'}} /></div>
                            <button type="submit" className="train-button" disabled={loadingEq} style={{background: '#10b981'}}>{loadingEq ? 'Salvando...' : 'Cadastrar Equipamento'}</button>
                            {messageEq && <div style={{ color: 'white', marginTop: '10px' }}>{messageEq}</div>}
                        </form>
                    </div>
                    <div className="admin-panel" style={{ flex: '1', minWidth: '300px' }}>
                        <h2 style={{ color: 'white', marginTop: 0 }}>Equipamentos ({equipments.length})</h2>
                        <ul style={{ color: 'white', paddingLeft: '20px', maxHeight: '400px', overflowY: 'auto' }}>
                            {equipments.map(eq => <li key={eq.id}><strong>{eq.name}</strong> - {eq.status}</li>)}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTrain;