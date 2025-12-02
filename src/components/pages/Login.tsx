import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {
  // Estados do Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);
  
  // Estados do Modal de Nova Senha
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();

  // --- 1. FUNÇÃO DE LOGIN ---
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
        // Salva token e dados
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.name);
        localStorage.setItem('userId', data.id);
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('userRA', data.ra);

        // VERIFICAÇÃO DA SENHA TEMPORÁRIA
        if (data.isTempPassword === 1) {
            // Se for temporária, NÃO redireciona. Abre o Modal.
            setShowChangePasswordModal(true);
        } else {
            // Se for normal, entra no sistema
            alert('Bem-vindo, ' + data.name + '!');
            navigate('/');
        }
      } else {
        alert('Erro: ' + data.error);
      }
    } catch (error) { alert('Erro de conexão.'); }
  };

  // --- 2. FUNÇÃO DE TROCAR SENHA (NO MODAL) ---
  const handleChangePassword = async () => {
      if (newPassword !== confirmPassword) return alert("As senhas não coincidem.");
      if (newPassword.length < 6) return alert("A senha deve ter no mínimo 6 caracteres.");

      const userId = localStorage.getItem('userId');

      try {
          // Usa a senha 'password' (que ele usou para logar) como a 'currentPassword'
          const res = await fetch('http://localhost:3000/api/change-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  userId, 
                  currentPassword: password, // Pega do estado do login
                  newPassword 
              })
          });
          
          if (res.ok) {
              alert("✅ Senha atualizada com sucesso! Entrando...");
              setShowChangePasswordModal(false);
              navigate('/'); // Redireciona para a Home
          } else {
              alert("Erro ao atualizar senha.");
          }
      } catch (error) { alert("Erro de conexão."); }
  };

  // --- 3. RECUPERAR SENHA (EMAIL) ---
  const handleRecover = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const res = await fetch('http://localhost:3000/api/reset-password', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ email })
          });
          const d = await res.json();
          if(res.ok) { alert(d.message); setIsRecovering(false); }
          else alert(d.error);
      } catch (e) { alert("Erro de conexão"); }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-image-panel"></div>
        <div className="login-content">
          {!isRecovering ? (
            <>
                <h1 className="login-title">Log in</h1>
                <form className="login-form" onSubmit={handleLogin}>
                    <div className="login-field"><label>E-mail</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
                    <div className="login-field"><label>Senha</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
                        <div className="forgot-password-container"><button type="button" className="forgot-password-link" onClick={()=>setIsRecovering(true)}>Esqueceu a senha?</button></div>
                    </div>
                    <button type="submit" className="login-button">Entrar</button>
                    <p className="signup-text">Não tem cadastro? <Link to="/cadastro" className="signup-link">Cadastre-se</Link></p>
                </form>
            </>
          ) : (
            <>
                <h1 className="login-title">Recuperar</h1>
                <p>Informe seu e-mail para receber uma senha temporária.</p>
                <form className="login-form" onSubmit={handleRecover}>
                    <div className="login-field"><label>E-mail</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
                    <button type="submit" className="login-button">Enviar</button>
                    <button type="button" className="back-to-login-btn" onClick={()=>setIsRecovering(false)}>Voltar</button>
                </form>
            </>
          )}
        </div>
      </div>

      {/* --- O MODAL DE TROCA DE SENHA (POPUP) --- */}
      {showChangePasswordModal && (
        <div className="modal-overlay">
            <div className="modal-content change-pass-modal">
                <h2 style={{color: '#d32f2f', marginTop: 0}}>⚠️ Troca Obrigatória</h2>
                <p>Você acessou com uma senha temporária. Defina sua nova senha abaixo:</p>
                
                <div className="login-field" style={{marginBottom: '15px'}}>
                    <label>Nova Senha</label>
                    <input 
                        type="password" 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)} 
                        placeholder="Mínimo 6 caracteres"
                    />
                </div>
                <div className="login-field" style={{marginBottom: '20px'}}>
                    <label>Confirmar Nova Senha</label>
                    <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)} 
                        placeholder="Digite novamente"
                    />
                </div>

                <button onClick={handleChangePassword} className="login-button" style={{width: '100%', background: '#28a745'}}>
                    Salvar e Acessar
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default Login;