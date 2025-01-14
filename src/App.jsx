import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect, Suspense } from 'react';
import ChecklistBase from './components/ChecklistBase';
import DashboardSummary from './components/DashboardSummary';
import LudareLogo from './components/LudareLogo';
import { checklists } from './data/checklists';
import ludareLogo from '/dist/assets/ludare.png';
import './App.css';

// Função para converter título em slug
const createSlug = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    // Adiciona ou remove a classe no body para controlar o scroll
    if (!menuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
    // Remove os estilos ao fechar o menu
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
  };

  // Pull to refresh
  const onTouchStart = (e) => {
    setTouchStart(e.touches[0].clientY);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchEnd - touchStart;
    const isTopOfPage = window.scrollY === 0;

    if (distance > 100 && isTopOfPage) {
      setIsRefreshing(true);
      window.location.reload();
    }
  };

  return (
    <Router>
      <div 
        className="app-container"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <Toaster position="top-right" />
        
        {/* Pull to Refresh Indicator */}
        <div className={`pull-to-refresh ${isRefreshing ? 'active' : ''}`}>
          <span>↓ Puxe para atualizar</span>
        </div>
        
        {/* Logo Mobile */}
        <div className={`mobile-logo ${menuOpen ? 'menu-open' : ''}`}>
          <img src={ludareLogo} alt="Ludare" />
        </div>
        
        {/* Menu Hamburguer */}
        <button 
          className={`hamburger-button ${menuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Menu"
        >
          <span className="hamburger-icon"></span>
        </button>

        {/* Overlay para fechar o menu */}
        <div 
          className={`sidebar-overlay ${menuOpen ? 'active' : ''}`}
          onClick={closeMenu}
        ></div>

        {/* Sidebar */}
        <nav className={`sidebar ${menuOpen ? 'active' : ''}`}>
          <div className="sidebar-header">
            <LudareLogo />
            <h1>Checklist</h1>
          </div>

          <div className="nav-section">
            <h2 className="nav-section-title">Geral</h2>
            <NavLink 
              to="/dashboard" 
              className="nav-link"
              onClick={closeMenu}
            >
              📊 Resumo Geral
            </NavLink>
          </div>

          <div className="nav-section">
            <h2 className="nav-section-title">Checklists</h2>
            {checklists.map(checklist => (
              <NavLink
                key={checklist.title}
                to={`/${createSlug(checklist.title)}`}
                className="nav-link"
                onClick={closeMenu}
              >
                {checklist.icon} {checklist.title}
              </NavLink>
            ))}
          </div>
        </nav>

        <main className="main-content">
          <Suspense fallback={<div className="skeleton">Carregando...</div>}>
            <Routes>
              <Route path="/dashboard" element={<DashboardSummary />} />
              {checklists.map(checklist => (
                <Route
                  key={checklist.title}
                  path={`/${createSlug(checklist.title)}`}
                  element={<ChecklistBase title={checklist.title} initialTasks={checklist.tasks} />}
                />
              ))}
              <Route path="/" element={<DashboardSummary />} />
            </Routes>
          </Suspense>
        </main>

        {/* Bottom Navigation */}
        <nav className="bottom-nav">
          <NavLink 
            to="/dashboard" 
            className="bottom-nav-item"
          >
            📊 Resumo
          </NavLink>
          {checklists.map(checklist => (
            <NavLink 
              key={checklist.title}
              to={`/${createSlug(checklist.title)}`} 
              className="bottom-nav-item"
            >
              {checklist.icon}
            </NavLink>
          ))}
        </nav>
      </div>
    </Router>
  );
}

export default App; 