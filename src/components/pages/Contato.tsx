import React from 'react';
import './Contato.css';

const Contato: React.FC = () => {
  return (
    <div className="contact-page-container">
        <main>
            <h1 style={{textAlign: 'center'}}>Entre em Contato</h1>
            <p style={{textAlign: 'center', color: '#777', marginBottom: '30px'}}>Tem alguma dúvida ou sugestão? Preencha o formulário abaixo.</p>

            <form className="contact-form">
                <div className="form-group">
                    <label htmlFor="nome">Nome Completo</label>
                    <input type="text" id="nome" required />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Seu E-mail</label>
                    <input type="email" id="email" required />
                </div>
                <div className="form-group">
                    <label htmlFor="assunto">Assunto</label>
                    <input type="text" id="assunto" required />
                </div>
                <div className="form-group">
                    <label htmlFor="mensagem">Mensagem</label>
                    <textarea id="mensagem" rows={6} required></textarea>
                </div>
                <button type="submit" className="submit-button">Enviar Mensagem</button>
            </form>
        </main>
    </div>
  );
};

export default Contato;