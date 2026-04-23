import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminTrain: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
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
        if (e.target.files) setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return alert('Selecione um arquivo primeiro.');

        setLoading(true);
        setMessage('O Docling está processando o arquivo... isso pode levar alguns segundos.');

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
            } else {
                setMessage('❌ Erro: ' + data.error);
            }
        } catch (error) {
            setMessage('❌ Erro de conexão com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Painel do Administrador - InovFabLab</h1>
            <h2>Treinamento da Inteligência Artificial (RAG)</h2>
            <p>Faça upload de manuais, regras ou documentos (PDF, DOCX, TXT) para atualizar a base de conhecimento.</p>

            <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <input type="file" onChange={handleFileChange} accept=".pdf,.docx,.txt" />
                <br /><br />
                <button 
                    onClick={handleUpload} 
                    disabled={loading}
                    style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    {loading ? 'Processando...' : 'Iniciar Treinamento'}
                </button>
            </div>

            {message && (
                <div style={{ marginTop: '20px', padding: '15px', borderRadius: '5px', backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da' }}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default AdminTrain;