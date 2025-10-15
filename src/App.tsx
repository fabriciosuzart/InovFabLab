import './App.css';
import Navbar from './components/Navbar';
import { Routes, Route } from 'react-router-dom';
import Home from './components/pages/Home';
import Assistente from './components/pages/Assistente';
import Equipamentos from './components/pages/Equipamentos';
import Documentacao from './components/pages/Documentação';
import Contato from './components/pages/Contato';

function App() {
  return (
    <>
      <Navbar/>
      <main>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/assistente' element={<Assistente />} />
            <Route path='/equipamentos' element={<Equipamentos />} />
            <Route path='/documentacao' element={<Documentacao />} />
            <Route path='/contato' element={<Contato />} />
          </Routes>
      </main>
    </>
  )
}

export default App
