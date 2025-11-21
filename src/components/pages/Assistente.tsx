import React, { useState, useRef, useEffect } from 'react';
import './Assistente.css';

interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

const Assistente: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'ai', text: 'Olá! 👋 Sou o assistente do Laboratório Inteligente. Como posso ajudar?' }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // --- TEXT TO SPEECH (IA Fala) ---
  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Para falas anteriores
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.2;
    window.speechSynthesis.speak(utterance);
  };

  // --- PARAR TUDO (Rede e Áudio) ---
  const handleStop = () => {
    // 1. Para a fala imediatamente
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }

    // 2. Cancela a requisição para o servidor
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // 3. Atualiza a tela
    setIsLoading(false);
    setMessages(prev => [...prev, { 
      id: Date.now(), 
      sender: 'ai', 
      text: "🛑 Geração interrompida pelo usuário." 
    }]);
  };

  // --- ENVIO DE MENSAGEM ---
  const handleSend = async (textOverride?: string) => {
    const textToSend = typeof textOverride === 'string' ? textOverride : input;

    if (!textToSend || !textToSend.trim()) return;

    const userMessage: Message = { id: Date.now(), sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    
    setInput('');
    setIsLoading(true);

    // Cria controlador de cancelamento
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
        signal: controller.signal
      });

      const data = await response.json();
      const replyText = data.reply || "Não entendi.";

      const aiMessage: Message = { id: Date.now() + 1, sender: 'ai', text: replyText };
      setMessages(prev => [...prev, aiMessage]);
      
      if (isSpeechEnabled) {
        speak(replyText);
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Requisição cancelada.');
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: "⚠️ Erro de conexão com o cérebro local." }]);
      }
    } finally {
      // Só remove o loading se o controller atual for o mesmo que iniciou
      // (Isso evita bugs se o usuário clicar em Parar e depois Enviar muito rápido)
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  // --- SPEECH TO TEXT ---
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Use o Google Chrome para reconhecimento de voz.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false; 
    recognition.interimResults = true; 

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript); 
      if (event.results[0].isFinal) {
        handleSend(transcript);
      }
    };
    recognition.start();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="assistente-container">
      <div className="chat-interface">
        <div className="chat-history">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              <div className="avatar">{msg.sender === 'ai' ? 'IA' : 'VC'}</div>
              <div className="message-content">
                <p>{msg.text}</p>
                {msg.sender === 'ai' && (
                  <button type="button" className="speak-btn" onClick={() => speak(msg.text)} title="Ouvir">🔊</button>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message ai">
              <div className="avatar">IA</div>
              <div className="message-content"><p>Pensando...</p></div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input-area">
          <div className="input-container-limit">
            <div className="input-wrapper">
              
              <button 
                type="button"
                className={`icon-button speech-toggle ${isSpeechEnabled ? 'active' : ''}`}
                onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                title={isSpeechEnabled ? "Desativar fala" : "Ativar fala"}
              >
                {isSpeechEnabled ? '🔊' : '🔇'}
              </button>

              <button 
                type="button"
                className={`icon-button mic-button ${isListening ? 'listening' : ''}`} 
                onClick={startListening}
                disabled={isLoading}
                title="Falar"
              >
                {isListening ? '🛑' : '🎙️'}
              </button>

              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite ou fale..." 
                rows={1}
                disabled={isLoading} 
              />
              
              {isLoading ? (
                <button 
                    type="button" 
                    className="send-btn stop-btn" 
                    onClick={handleStop} 
                    title="Parar resposta"
                >
                  ⏹️
                </button>
              ) : (
                <button 
                    type="button" 
                    className="send-btn" 
                    onClick={() => handleSend()} 
                    disabled={!input.trim()}
                >
                  ➤
                </button>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assistente;