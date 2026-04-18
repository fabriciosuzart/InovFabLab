import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Hook para mudar de página

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (response.ok) {
        // Salva o token e dados do usuário
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userId', data.id); // Importante para o agendamento
        
        alert('Bem-vindo, ' + data.name + '!');
        navigate('/'); // Redireciona para a Home
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
        <h1>Faça seu Login</h1>
        <p className="subtitle">Acesse sua conta para gerenciar seus agendamentos.</p>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">E-mail Institucional</label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="seu.nome@unisanta.br" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Digite sua senha" 
              required 
            />
          </div>

          <button type="submit" className="submit-button">Entrar</button>
          
          <div className="auth-link">
            <p>Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link></p>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Login;