import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Cadastro.css'; // Pode reusar o Login.css se quiser, pois são iguais

const Cadastro: React.FC = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        ra: '',
        password: '',
        confirmPassword: ''
    });
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.id]: e.target.value});
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return alert('As senhas não conferem.');
        }

        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    ra: formData.ra,
                    password: formData.password
                })
            });
            const data = await response.json();

            if (response.ok) {
                alert('Cadastro realizado! Faça login.');
                navigate('/login');
            } else {
                alert('Erro: ' + data.error);
            }
        } catch (error) {
            alert('Erro de conexão com o servidor.');
        }
    };

    return (
        <div className="auth-container">
            <main>
                <h1 style={{textAlign: 'center'}}>Crie sua Conta</h1>
                <p style={{textAlign: 'center', color: '#777'}}>Faça seu cadastro para acessar os recursos.</p>

                <form className="auth-form" onSubmit={handleRegister}>
                    <div className="form-group">
                        <label htmlFor="fullName">Nome Completo</label>
                        <input type="text" id="fullName" value={formData.fullName} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">E-mail Institucional</label>
                        <input type="email" id="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="ra">RA (Matrícula)</label>
                        <input type="text" id="ra" value={formData.ra} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Criar Senha</label>
                        <input type="password" id="password" value={formData.password} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmar Senha</label>
                        <input type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                    </div>

                    <button type="submit" className="submit-button">Criar Conta</button>
                    
                    <div className="auth-link">
                        <p>Já tem uma conta? <Link to="/login">Faça login</Link></p>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default Cadastro;