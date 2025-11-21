import React from 'react';
import './Documentacao.css';

const Documentacao: React.FC = () => {
  return (
    <div className="container">
        <main>
            <h1>Documentação e Manuais</h1>
            <p>Acesse os guias de uso e segurança para todos os nossos equipamentos.</p>
            
            <ul className="doc-list">
                <li className="doc-item">
                    <h3>Manual da Impressora 3D Finder</h3>
                    <a href="#" target="_blank" rel="noopener noreferrer">Baixar PDF</a>
                </li>
                <li className="doc-item">
                    <h3>Guia de Segurança da Cortadora a Laser</h3>
                    <a href="#" target="_blank" rel="noopener noreferrer">Baixar PDF</a>
                </li>
                
                {/* --- NOVO ITEM ADICIONADO AQUI --- */}
                <li className="doc-item">
                    <h3>Termos de Uso do Laboratório</h3>
                    {/* Certifique-se que o arquivo 'Termos_de_Uso.pdf' está na pasta 'public' */}
                    <a href="/Termos_de_Uso.pdf" target="_blank" rel="noopener noreferrer">Baixar PDF</a>
                </li>

                 <li className="doc-item">
                    <h3>Procedimento de Agendamento</h3>
                    <a href="#" target="_blank" rel="noopener noreferrer">Ler Online</a>
                </li>
            </ul>
        </main>
    </div>
  );
};

export default Documentacao;