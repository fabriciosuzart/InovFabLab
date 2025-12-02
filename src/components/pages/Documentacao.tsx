import React, { useState } from 'react';
import './Documentacao.css';

// CONTEÚDO DOS TEXTOS (Para o Modal)
const DOCS_CONTENT: Record<string, string> = {
    'procedimento': `
        <h2>Procedimento Oficial de Agendamento</h2>
        <p><strong>1. Introdução</strong><br>Este documento descreve o fluxo para reservar equipamentos no INOVFABLAB de forma correta.</p>
        <p><strong>2. Pré-requisitos</strong><br>• Estar matriculado na instituição.<br>• Possuir cadastro ativo no sistema.<br>• Ter realizado treinamento básico para máquinas perigosas.</p>
        <p><strong>3. Como Agendar</strong><br>Acesse a aba <em>Equipamentos</em>, verifique a disponibilidade (ícone verde) e clique em "Agendar". O sistema bloqueará automaticamente datas passadas e horários fora do expediente.</p>
        <div class="alert-box">⚠️ O laboratório funciona das 08h às 22h.</div>
    `,
    'impressora': `
        <h2>Manual da Impressora 3D Finder</h2>
        <p><strong>Atenção à Segurança:</strong> O bico extrusor atinge 220°C. Não toque durante a operação.</p>
        <p><strong>Passo a Passo:</strong><br>1. Fatie o arquivo no software FlashPrint.<br>2. Salve como .GX em um Pen Drive.<br>3. Insira na máquina, clique em "Build" e selecione o arquivo.</p>
        <p><strong>Dica:</strong> Nivele a mesa antes de começar se a impressão anterior falhou.</p>
    `,
    'laser': `
        <h2 style="color: #dc3545;">Protocolo de Segurança - Cortadora a Laser</h2>
        <p><strong>A REGRA DE OURO:</strong> <span style="color: red; font-weight: bold;">NUNCA</span> deixe a máquina operando sem supervisão. Risco altíssimo de incêndio.</p>
        <p><strong>Materiais Proibidos (Tóxicos/Inflamáveis):</strong><br>❌ PVC ou Vinil (Libera gás cloro mortal)<br>❌ Isopor ou Espuma</p>
        <p><strong>Emergência:</strong> Em caso de chamas, aperte o botão de emergência imediatamente e use o extintor de CO2.</p>
    `
};

const Documentacao: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const openDoc = (key: string) => setSelectedDoc(key);
  const closeDoc = () => setSelectedDoc(null);

  // Função para abrir o PDF em nova aba (Visualização)
  const openPdf = (fileName: string) => {
      // '_blank' força abrir em nova aba, o que geralmente ativa o leitor de PDF do navegador
      window.open(`/${fileName}`, '_blank');
  };

  return (
    <div className="container">
        <main>
            <h1>Documentação e Manuais</h1>
            <p>Guias de uso, manuais técnicos e normas de segurança.</p>
            
            <ul className="doc-list">
                {/* ITEM 1 - Modal */}
                <li className="doc-item" onClick={() => openDoc('procedimento')}>
                    <h3>Procedimento de Agendamento</h3>
                    <button className="read-btn">Ler Agora</button>
                </li>

                {/* ITEM 2 - Modal */}
                <li className="doc-item" onClick={() => openDoc('impressora')}>
                    <h3>Manual Impressora 3D Finder</h3>
                    <button className="read-btn">Ler Agora</button>
                </li>

                {/* ITEM 3 (ALERTA) - Modal */}
                <li className="doc-item alert-item" onClick={() => openDoc('laser')}>
                    <h3 style={{color: '#dc3545'}}>Guia de Segurança - Laser</h3>
                    <button className="read-btn">Ler Agora</button>
                </li>
                
                {/* ITEM 4 - PDF (Abre em nova aba) */}
                <li className="doc-item" onClick={() => openPdf('Termos_de_Uso.pdf')}>
                    <h3>Termos de Uso do Laboratório</h3>
                    {/* Mudamos o texto para deixar claro que vai abrir */}
                    <button className="read-btn">Abrir PDF</button>
                </li>
            </ul>
        </main>

        {/* --- O MODAL (Para os textos rápidos) --- */}
        {selectedDoc && (
            <div className="modal-overlay" onClick={closeDoc}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <button className="close-modal" onClick={closeDoc}>×</button>
                    
                    <div className="modal-body" dangerouslySetInnerHTML={{ __html: DOCS_CONTENT[selectedDoc] }} />
                    
                    <div className="modal-footer">
                        <button className="btn-print" onClick={() => window.print()}>🖨️ Imprimir</button>
                        <button className="btn-ok" onClick={closeDoc}>Entendi</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Documentacao;