import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const navigate = useNavigate();

  // Verifica se tem alguém logado ao carregar a página
  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
        setUserName(storedName);
    }
  }, []);

  // Função de Logout
  const handleLogout = () => {
      localStorage.clear(); // Limpa token e dados do navegador
      setUserName(null);
      navigate('/login'); // Redireciona para login
  };

  return (
    <div className="home-container">
        {/* --- BARRA SUPERIOR (HEADER) ATUALIZADO COM PERFIL --- */}
        <header style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderBottom: '1px solid #eee' }}>
            <div className="logo" style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#004aad'}}>INOVFABLAB</div>
            <div>
                {userName ? (
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <span style={{ color: '#555' }}>
                            Olá, 
                            {/* Link clicável para o Perfil */}
                            <Link to="/perfil" style={{ 
                                textDecoration: 'none', 
                                color: '#004aad', 
                                fontWeight: 'bold', 
                                marginLeft: '5px' 
                            }}>
                                {userName}
                            </Link>!
                        </span>
                        <button 
                            onClick={handleLogout} 
                            style={{ 
                                padding: '8px 12px', 
                                cursor: 'pointer', 
                                background: '#dc3545', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px',
                                fontWeight: 'bold' 
                            }}
                        >
                            Sair
                        </button>
                    </div>
                ) : (
                    <Link to="/login" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>Fazer Login</Link>
                )}
            </div>
        </header>

        <main className="home-main">
            <h1>Bem-vindo ao INOVFABLAB!</h1>
            <p className="subtitle">O seu espaço para criar, inovar e construir o futuro.</p>

            {/* BOTÕES DE NAVEGAÇÃO (Incluindo Documentação) */}
            <div className="tabs">
                <Link to="/assistente" className="tab-button active">Falar com IA</Link>
                <Link to="/agendamento" className="tab-button active">Agendar Uso</Link>
                <Link to="/equipamentos" className="tab-button active">Ver Equipamentos</Link>
                <Link to="/documentacao" className="tab-button active">Documentação</Link>
                <Link to="/contato" className="tab-button active">Fale Conosco</Link>
            </div>

            {/* --- CONTEÚDO ORIGINAL RESTAURADO --- */}
            
            <div className="content-box">
                <h3>O que é o INOVFABLAB?</h3>
                <p>Somos um laboratório de fabricação digital (FabLab) onde a criatividade encontra as ferramentas para se transformar em realidade. Aqui, estudantes, pesquisadores e entusiastas podem desenvolver projetos, prototipar ideias e aprender na prática.</p>
            </div>

            <h2>Sua Jornada para Criar</h2>
            <div className="journey-grid">
                <div className="content-box">
                    <h3>1. Cadastre-se e Treine</h3>
                    <p>O primeiro passo é se cadastrar. Após o cadastro, explore nossa lista de documentações e manuais para os equipamentos que você deseja usar, como impressoras 3D e cortadoras a laser.</p>
                </div>
                
                <div className="content-box">
                    <h3>2. Valide e Agende</h3>
                    <p>Depois de conhecer as regras, verifique a disponibilidade dos equipamentos na aba "Equipamentos" e faça seu agendamento inteligente escolhendo o horário que melhor se adapta a você.</p>
                </div>
                
                <div className="content-box">
                    <h3>3. Crie e Compartilhe</h3>
                    <p>Com o acesso liberado, o laboratório é seu! Utilize o assistente virtual para tirar dúvidas em tempo real enquanto produz seus protótipos e inovações.</p>
                </div>
            </div>
            
            <h2>Conheça o Espaço</h2>
            <div className="video-container">
                <iframe 
                src="https://www.youtube.com/embed/KLfAyKi_aK4" 
                title="YouTube video player" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen>
                </iframe>
            </div>

            <h2>Aviso Importante</h2>
            <div className="content-box">
                <ul className="rules-list">
                    <li>É obrigatório deixar um documento de identificação na recepção para utilizar qualquer equipamento.</li>
                    <li>Chegue com no mínimo 10 minutos de antecedência para preparar seu material e fazer o login.</li>
                    <li>Reservas possuem tolerância de 10 minutos de atraso. Após esse período, o horário será disponibilizado.</li>
                    <li>É estritamente proibida a entrada com bermuda, chinelos, saias, vestidos ou regatas, visando a sua segurança.</li>
                    <li>O INOVFABLAB não se responsabiliza por objetos ou materiais pessoais deixados no laboratório.</li>
                </ul>
            </div>

            <p className="slogan">Somos todos INOVFABLAB, Somos todos UNISANTA!</p>

        </main>
    </div>
  );
};

export default Home;