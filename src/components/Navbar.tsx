import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // 1. Importe o Link
import './Navbar.css';
import logoImage from '../assets/images/logofablab.png'; 

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const closeMobileMenu = () => setIsMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          <img src={logoImage} alt="InovFabLab Logo" className="logo-image" />
          <span>InovFabLab</span>
        </Link>

        <ul className={isMenuOpen ? "nav-menu active" : "nav-menu"}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={closeMobileMenu}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/assistente" className="nav-link" onClick={closeMobileMenu}>
              Assistente IA
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/equipamentos" className="nav-link" onClick={closeMobileMenu}>
              Equipamentos
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/documentacao" className="nav-link" onClick={closeMobileMenu}>
              Documentação
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/contato" className="nav-link" onClick={closeMobileMenu}>
              Contato
            </Link>
          </li>
        </ul>

        <div className="nav-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <div className={isMenuOpen ? "line1 active" : "line1"}></div>
          <div className={isMenuOpen ? "line2 active" : "line2"}></div>
          <div className={isMenuOpen ? "line3 active" : "line3"}></div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;