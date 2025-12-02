import React, { useState } from 'react';
import './Contato.css';

const Contato: React.FC = () => {
  const [formData, setFormData] = useState({ nome: '', email: '', assunto: '', mensagem: '' });
  const [status, setStatus] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData({...formData, [e.target.id]: e.target.value});
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setStatus('Enviando...');
      
      try {
          const response = await fetch('http://localhost:3000/api/contact', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  // Campos que o backend espera
                  name: formData.nome,
                  email: formData.email,
                  subject: formData.assunto,
                  message: formData.mensagem
              })
          });

          const data = await response.json();

          if (response.ok) {
              alert('✅ Mensagem enviada! Responderemos em breve.');
              setFormData({ nome: '', email: '', assunto: '', mensagem: '' });
              setStatus('');
          } else {
              alert(`❌ Erro: ${data.error}`);
              setStatus('');
          }
      } catch (error) {
          alert('Erro de conexão com o servidor.');
          setStatus('');
      }
  };

  return (
    <div className="contact-page-container">
        <main>
            <h1>Entre em Contato</h1>
            <p className="subtitle">Dúvidas? Mande um e-mail para o laboratório.</p>

            <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="nome">Nome Completo</label>
                    <input 
                        type="text" 
                        id="nome" 
                        value={formData.nome} 
                        onChange={handleChange} 
                        placeholder="Seu nome"
                        required 
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="email">Seu E-mail</label>
                    <input 
                        type="email" 
                        id="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="Ex: aluno@unisanta.br"
                        required 
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="assunto">Assunto</label>
                    <input 
                        type="text" 
                        id="assunto" 
                        value={formData.assunto} 
                        onChange={handleChange} 
                        placeholder="Ex: Dúvida sobre Impressora 3D"
                        required 
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="mensagem">Mensagem</label>
                    <textarea 
                        id="mensagem" 
                        value={formData.mensagem} 
                        onChange={handleChange} 
                        placeholder="Escreva sua mensagem aqui..."
                        required
                    ></textarea>
                </div>
                
                <button type="submit" className="submit-button" disabled={status === 'Enviando...'}>
                    {status === 'Enviando...' ? 'Enviando...' : 'Enviar Mensagem'}
                </button>
            </form>
        </main>
    </div>
  );
};

export default Contato;