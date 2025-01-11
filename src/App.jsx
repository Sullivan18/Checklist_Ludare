import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';

// Importando as páginas
import TvResenha from './pages/TvResenha';
import CriacaoConta from './pages/CriacaoConta';
import Descobrir from './pages/Descobrir';
import Eventos from './pages/Eventos';
import Login from './pages/Login';
import Notificacao from './pages/Notificacao';
import Resenha from './pages/Resenha';
import Perfil from './pages/Perfil';
import FlashDare from './pages/FlashDare';
import Feed from './pages/Feed';

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`nav-link ${isActive ? 'active' : ''}`}>
      {children}
    </Link>
  );
}

function App() {
  return (
    <Router basename="/Checklist_Ludare">
      <div className="app-container">
        <nav className="sidebar">
          <div className="sidebar-header">
            <h1>Checklist Ludare</h1>
          </div>
          
          <div className="nav-section">
            <h2 className="nav-section-title">Principal</h2>
            <NavLink to="/feed">📱 Feed</NavLink>
            <NavLink to="/tv-resenha">📺 TV Resenha</NavLink>
            <NavLink to="/flash-dare">📸 Flash Dare</NavLink>
          </div>

          <div className="nav-section">
            <h2 className="nav-section-title">Social</h2>
            <NavLink to="/resenha">💬 Resenha</NavLink>
            <NavLink to="/descobrir">🔍 Descobrir</NavLink>
            <NavLink to="/eventos">📅 Eventos</NavLink>
          </div>

          <div className="nav-section">
            <h2 className="nav-section-title">Conta</h2>
            <NavLink to="/perfil">👤 Perfil</NavLink>
            <NavLink to="/notificacao">🔔 Notificação</NavLink>
            <NavLink to="/login">🔑 Login</NavLink>
            <NavLink to="/criacao-conta">✨ Criar Conta</NavLink>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/tv-resenha" element={<TvResenha />} />
            <Route path="/criacao-conta" element={<CriacaoConta />} />
            <Route path="/descobrir" element={<Descobrir />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/login" element={<Login />} />
            <Route path="/notificacao" element={<Notificacao />} />
            <Route path="/resenha" element={<Resenha />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/flash-dare" element={<FlashDare />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/" element={<Feed />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 