import './App.css';
import Navbar from './components/Navbar';
import { Routes, Route } from 'react-router-dom';

// --- IMPORTAÇÃO DAS PÁGINAS ---
import Home from './components/pages/Home';
import Assistente from './components/pages/Assistente';
import Equipamentos from './components/pages/Equipamentos';
import Documentacao from './components/pages/Documentacao'; 
import Contato from './components/pages/Contato';
import Login from './components/pages/Login';
import Cadastro from './components/pages/Cadastro';
import Agendamento from './components/pages/Agendamento';
import AdminTrain from './components/pages/AdminTrain'; // <-- Nova tela do Admin 23/04/2026

function App() {
  return (
    <>
      <Navbar/>
      <main className="main-content">
          <Routes>
            {/* Rotas Públicas */}
            <Route path='/' element={<Home />} />
            <Route path='/assistente' element={<Assistente />} />
            <Route path='/equipamentos' element={<Equipamentos />} />
            <Route path='/documentacao' element={<Documentacao />} />
            <Route path='/contato' element={<Contato />} />
            
            {/* Rotas do Sistema */}
            <Route path='/login' element={<Login />} />
            <Route path='/cadastro' element={<Cadastro />} />
            <Route path='/agendamento' element={<Agendamento />} />
            
            {/* Rotas de Administração */}
            <Route path='/admin' element={<AdminTrain />} />
          </Routes>
      </main>
    </>
  )
}

export default App;