import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminTrain.css';

const AdminTrain: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
    const navigate = useNavigate();

    // Proteção de Rota: Só entra se for ADMIN
    useEffect(() => {
        const role = localStorage.getItem('userRole');
        if (role !== 'ADMIN') {
            alert('Acesso negado. Apenas administradores podem treinar a IA.');
            navigate('/');
        }
    }, [navigate]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setMessage(`Arquivo selecionado: ${e.target.files[0].name}`);
            setMessageType('info');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage('Selecione um arquivo primeiro.');
            setMessageType('error');
            return;
        }

        setLoading(true);
        setMessage('⚙️ O Docling está processando o arquivo... isso pode levar alguns segundos.');
        setMessageType('info');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:3000/api/train', {
                method: 'POST',
                body: formData, // Envia como FormData para o Multer entender
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('✅ IA Treinada com sucesso! O sistema já aprendeu o conteúdo.');
                setMessageType('success');
            } else {
                setMessage('❌ Erro: ' + data.error);
                setMessageType('error');
            }
        } catch (error) {
            setMessage('❌ Erro de conexão com o servidor.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-container">
            
            <div className="admin-header">
                <h1>Painel do Administrador</h1>
                <p>Treinamento e Atualização da Inteligência Artificial (RAG)</p>
            </div>

            <div className="admin-panel">
                <div style={{textAlign: 'center', color: '#cbd5e1', marginBottom: '10px'}}>
                    Faça upload de manuais, regras ou documentos (PDF, DOCX, TXT) <br/>para atualizar a base de conhecimento do assistente virtual.
                </div>
                
                <div className="file-upload-wrapper">
                    <input 
                        type="file" 
                        className="file-upload-input" 
                        onChange={handleFileChange} 
                        accept=".pdf,.docx,.txt" 
                    />
                </div>
                
                <button 
                    className="train-button"
                    onClick={handleUpload} 
                    disabled={loading}
                >
                    {loading ? 'Processando...' : 'Iniciar Treinamento da IA'}
                </button>
            </div>

            {message && (
                <div className={`alert-box alert-${messageType}`}>
                    {message}
                </div>
            )}
            
        </div>
    );
};

export default AdminTrain;