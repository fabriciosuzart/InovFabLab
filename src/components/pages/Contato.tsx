import React from 'react';
import './Contato.css';

const Contato: React.FC = () => {
  return (
    <div className="contato-container">
        <main style={{width: '100%'}}>
            <h1>Entre em Contato</h1>
            <p>Tem alguma dúvida, sugestão ou precisa de ajuda com um projeto?<br/>Preencha o formulário abaixo e nossa equipe responderá em breve.</p>

            <form className="contato-form">
                <div>
                    <label htmlFor="nome">Nome Completo</label>
                    <input type="text" id="nome" placeholder="Seu nome" required />
                </div>
                
                <div>
                    <label htmlFor="email">E-mail Institucional</label>
                    <input type="email" id="email" placeholder="nome@unisanta.br" required />
                </div>
                
                <div>
                    <label htmlFor="assunto">Assunto</label>
                    <select id="assunto" required style={{width: '100%', padding: '14px 20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0, 0, 0, 0.2)', color: '#f8fafc', fontSize: '1rem'}}>
                        <option value="" style={{color: '#000'}}>Selecione um motivo...</option>
                        <option value="duvida" style={{color: '#000'}}>Dúvida Geral</option>
                        <option value="projeto" style={{color: '#000'}}>Ajuda com Projeto</option>
                        <option value="equipamento" style={{color: '#000'}}>Problema em Equipamento</option>
                        <option value="sugestao" style={{color: '#000'}}>Sugestão</option>
                    </select>
                </div>
                
                <div>
                    <label htmlFor="mensagem">Mensagem</label>
                    <textarea id="mensagem" placeholder="Descreva como podemos te ajudar..." required></textarea>
                </div>
                
                <button type="submit">Enviar Mensagem</button>
            </form>

            <div className="contato-info">
                <div className="info-box">
                    <h3>📍 Onde Estamos</h3>
                    <p>Laboratório InovFabLab<br/>Universidade Santa Cecília (Unisanta)</p>
                </div>
                <div className="info-box">
                    <h3>🕒 Horário</h3>
                    <p>Segunda a Sexta<br/>08:00 às 21:00</p>
                </div>
            </div>
            
        </main>
    </div>
  );
};

export default Contato;