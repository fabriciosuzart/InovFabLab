import './App.css';
import Navbar from './components/Navbar';
import { Routes, Route } from 'react-router-dom';

import Home from './components/pages/Home';
import Assistente from './components/pages/Assistente';
import Equipamentos from './components/pages/Equipamentos';
import Documentacao from './components/pages/Documentacao';
import Contato from './components/pages/Contato';
import Login from './components/pages/Login';
import Cadastro from './components/pages/Cadastro';
import Agendamento from './components/pages/Agendamento';
import Perfil from './components/pages/Perfil';
import NovaSenha from './components/pages/NovaSenha';

function App() {
  return (
    <>
      <Navbar/>
      <main className="main-content">
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/assistente' element={<Assistente />} />
            <Route path='/equipamentos' element={<Equipamentos />} />
            <Route path='/documentacao' element={<Documentacao />} />
            <Route path='/contato' element={<Contato />} />
            <Route path='/login' element={<Login />} />
            <Route path='/cadastro' element={<Cadastro />} />
            <Route path='/agendamento' element={<Agendamento />} />
            <Route path='/perfil' element={<Perfil />} />
            
            {/* --- ADICIONE ESTA LINHA AQUI --- */}
            <Route path='/nova-senha' element={<NovaSenha />} />
          </Routes>
      </main>
    </>
  )
}

export default App;