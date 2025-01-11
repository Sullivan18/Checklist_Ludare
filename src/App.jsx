import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ChecklistBase from './components/ChecklistBase';
import DashboardSummary from './components/DashboardSummary';
import LudareLogo from './components/LudareLogo';
import { checklists } from './data/checklists';
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
  return (
    <Router>
      <div className="app-container">
        <Toaster position="top-right" />
        <nav className="sidebar">
          <div className="sidebar-header">
            <LudareLogo />
            <h1>Checklist</h1>
          </div>

          <div className="nav-section">
            <h2 className="nav-section-title">Geral</h2>
            <NavLink to="/dashboard" className="nav-link">
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
              >
                {checklist.icon} {checklist.title}
              </NavLink>
            ))}
          </div>
        </nav>

        <main className="main-content">
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
        </main>
      </div>
    </Router>
  );
}

export default App; 