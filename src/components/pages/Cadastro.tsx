import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cadastro.css';

const Cadastro: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    ra: '',
    phone: '',
    institutionalEmail: '',
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    // RA: apenas números e máx. 6 dígitos
    if (id === 'ra') {
      const onlyDigits = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, ra: onlyDigits }));
      return;
    }

    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação RA: exatamente 6 números
    if (formData.ra.length !== 6) {
      alert('O RA deve conter exatamente 6 números.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.institutionalEmail, // vai como e-mail para o back
          ra: formData.ra,
          password: formData.password,
          phone: formData.phone, // por enquanto o back ignora, mas já mandamos
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Cadastro realizado com sucesso!');
        navigate('/login');
      } else {
        alert('Erro: ' + (data.error || 'Erro ao cadastrar.'));
      }
    } catch (error) {
      alert('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        {/* Lado esquerdo – formulário */}
        <div className="signup-content">
          <header className="signup-header">
            <button
              type="button"
              className="back-button"
              onClick={() => navigate('/login')}
            >
              ←
            </button>
            <h1 className="signup-title">Cadastro</h1>
          </header>

          <form className="signup-form" onSubmit={handleRegister}>
            <div className="signup-field">
              <label htmlFor="fullName">Nome</label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Inserir nome completo"
                required
              />
            </div>

            <div className="signup-row">
              <div className="signup-field">
                <label htmlFor="ra">RA</label>
                <input
                  type="text"
                  id="ra"
                  value={formData.ra}
                  onChange={handleChange}
                  placeholder="Inserir RA"
                  required
                />
              </div>

              <div className="signup-field">
                <label htmlFor="phone">Número de telefone</label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Inserir número"
                />
              </div>
            </div>

            <div className="signup-field">
              <label htmlFor="institutionalEmail">E-mail Institucional</label>
              <input
                type="email"
                id="institutionalEmail"
                value={formData.institutionalEmail}
                onChange={handleChange}
                placeholder="Inserir e-mail"
                required
              />
            </div>

            <div className="signup-row">
              <div className="signup-field">
                <label htmlFor="password">Senha</label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Criar senha"
                  required
                />
              </div>

              <div className="signup-field">
                <label htmlFor="confirmPassword">Confirmar senha</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repetir senha"
                  required
                />
              </div>
            </div>

            <button type="submit" className="signup-button">
              Cadastrar
            </button>
          </form>
        </div>

        <div className="signup-image-panel">
          {/* Quando tiver a arte, pode colocar um <img /> aqui */}
          {/* <img src="/images/cadastro-side.jpg" alt="Cadastro InovFabLab" /> */}
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
