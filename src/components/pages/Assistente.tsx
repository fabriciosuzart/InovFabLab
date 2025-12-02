import React, { useState, useRef, useEffect } from 'react';
import './Assistente.css';

interface Message {
  id: string | number; 
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
    { id: 1, sender: 'ai', text: 'Olá! 👋 Sou o assistente do INOVFABLAB. Como posso ajudar?' }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Rolagem automática
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.2;
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last.sender === 'ai' && !last.text) return prev.slice(0, -1);
        return prev;
    });
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = typeof textOverride === 'string' ? textOverride : input;

    if (!textToSend || !textToSend.trim()) return;

    const timestamp = Date.now();
    const aiMsgId = `ai-${timestamp}`;

    // Adiciona mensagens na tela
    setMessages(prev => [...prev, { id: `user-${timestamp}`, sender: 'user', text: textToSend }]);
    setMessages(prev => [...prev, { id: aiMsgId, sender: 'ai', text: '' }]);
    
    setInput('');
    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();

      // Recupera dados do usuário para o Backend
      const userName = localStorage.getItem('userName') || 'Visitante';
      const userId = localStorage.getItem('userId');

      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            message: textToSend,
            userName: userName,
            userId: userId // Essencial para a IA agendar
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.body) throw new Error("Sem resposta");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        setMessages(prev => prev.map(msg => 
            msg.id === aiMsgId ? { ...msg, text: fullText } : msg
        ));
      }

      if (isSpeechEnabled) speak(fullText);

    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error(error);
      setMessages(prev => prev.map(msg => 
        msg.id === aiMsgId ? { ...msg, text: "Erro ao conectar com a IA." } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Navegador sem suporte. Use Chrome.");
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false; 
    recognition.interimResults = true; 

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript); 
      if (event.results[0].isFinal) {
        recognition.stop();
        setIsListening(false);
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
        
        {/* ÁREA DO CHAT */}
        <div className="chat-history">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
                <div className="avatar">
                    {msg.sender === 'ai' ? '🤖' : '👤'}
                </div>
                <div className="message-content">
                  {/* INDICADOR DE PENSANDO */}
                  {msg.sender === 'ai' && msg.text === '' ? (
                      <span className="thinking-indicator">
                        🧠 Pensando...
                      </span>
                  ) : (
                      msg.text
                  )}
                  
                  {/* Botão de ouvir resposta da IA */}
                  {msg.sender === 'ai' && msg.text !== '' && (
                    <button 
                        type="button" 
                        className="speak-btn" 
                        onClick={() => speak(msg.text)} 
                        title="Ouvir"
                    >
                        🔊
                    </button>
                  )}
                </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* ÁREA DE INPUT (Visual Original) */}
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
                placeholder="Digite sua dúvida ou use o microfone..." 
                rows={1}
                disabled={isLoading} 
              />
              
              {isLoading ? (
                <button 
                    type="button" 
                    className="send-btn stop-btn" 
                    onClick={handleStop} 
                    title="Parar"
                >
                  ⏹️
                </button>
              ) : (
                <button 
                    type="button" 
                    className="send-btn" 
                    onClick={() => handleSend()} 
                    disabled={!input.trim()}
                    title="Enviar"
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