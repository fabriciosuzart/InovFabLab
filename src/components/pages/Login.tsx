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
    <div className="login-page">
      <div className="login-card">
        {/* Lado esquerdo – imagem cinza (depois você troca por uma imagem real) */}
        <div className="login-image-panel">
          {/* Se quiser usar <img>, pode colocar aqui */}
          {/* <img src="/caminho/da/imagem.png" alt="InovFabLab" /> */}
        </div>

        {/* FORMULÁRIO */}
        <div className="login-content">
          <h1 className="login-title">Log in</h1>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-field">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Inserir e-mail"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Senha</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Inserir senha"
                required
              />
            </div>

            <button type="submit" className="login-button">
              Login
            </button>

            <p className="signup-text">
              Não possui cadastro?{' '}
              <Link to="/cadastro" className="signup-link">
                Cadastre-se agora!
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;