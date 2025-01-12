import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { checklists } from '../data/checklists';

function DashboardSummary() {
  const navigate = useNavigate();
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [activeMenu, setActiveMenu] = useState(null);
  const longPressTimer = useRef(null);
  const longPressDelay = 500; // 500ms para considerar pressão longa

  // Função para criar slug do título
  const createSlug = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Função para navegar para a página do checklist
  const handleCardClick = (title) => {
    navigate(`/${createSlug(title)}`);
  };

  // Função para processar os dados
  const processData = () => {
    const processedData = checklists.map(checklist => {
      const tasks = checklist.tasks.map(task => ({
        ...task,
        status: localStorage.getItem(`task-${task.id}-status`) || 'pending',
        notes: localStorage.getItem(`task-${task.id}-notes`) || ''
      }));

      return {
        title: checklist.title,
        icon: checklist.icon,
        totalTasks: tasks.length,
        working: tasks.filter(t => t.status === 'working').length,
        broken: tasks.filter(t => t.status === 'broken').length,
        pending: tasks.filter(t => t.status === 'pending').length,
        withNotes: tasks.filter(t => t.notes?.trim()).length,
        progress: Math.round((tasks.filter(t => t.status === 'working').length / tasks.length) * 100)
      };
    });

    setSummaryData(processedData);
    setLoading(false);
  };

  useEffect(() => {
    setPageLoaded(false);
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Efeito inicial para carregar os dados
  useEffect(() => {
    processData();
  }, []);

  // Listener para mudanças no localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key && (e.key.includes('task-') || e.key.includes('notes-'))) {
        processData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Adiciona um listener customizado para atualizações locais
    window.addEventListener('taskStatusChanged', processData);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('taskStatusChanged', processData);
    };
  }, []);

  const handleResetAll = () => {
    if (window.confirm('Tem certeza que deseja resetar TODAS as páginas para pendente? Isso também removerá todos os comentários.')) {
      try {
        // Reseta todos os status e notas no localStorage
        checklists.forEach(checklist => {
          checklist.tasks.forEach(task => {
            localStorage.setItem(`task-${task.id}-status`, 'pending');
            localStorage.setItem(`task-${task.id}-notes`, '');
          });
        });

        // Atualiza os dados
        processData();
        
        // Dispara evento para forçar atualização em todos os componentes
        window.dispatchEvent(new Event('taskStatusChanged'));
        
        toast.success('Todas as tarefas foram resetadas para pendente');

        // Força um reload da página para garantir que todos os componentes sejam atualizados
        window.location.reload();
      } catch (error) {
        console.error('Erro ao resetar tarefas:', error);
        toast.error('Erro ao resetar tarefas. Tente novamente.');
      }
    }
  };

  // Função para lidar com o início do toque
  const handleTouchStart = (e, page) => {
    e.preventDefault();
    const touch = e.touches[0];
    longPressTimer.current = setTimeout(() => {
      const rect = e.target.getBoundingClientRect();
      setMenuPosition({
        x: touch.clientX,
        y: touch.clientY
      });
      setActiveMenu(page);
    }, longPressDelay);
  };

  // Função para lidar com o fim do toque
  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  // Função para fechar o menu
  const closeMenu = () => {
    setActiveMenu(null);
  };

  // Função para resetar uma página específica
  const handleResetPage = (page) => {
    if (window.confirm(`Tem certeza que deseja resetar a página "${page.title}" para pendente? Isso também removerá todos os comentários.`)) {
      const checklist = checklists.find(c => c.title === page.title);
      if (checklist) {
        checklist.tasks.forEach(task => {
          localStorage.setItem(`task-${task.id}-status`, 'pending');
          localStorage.setItem(`task-${task.id}-notes`, '');
        });
        processData();
        window.dispatchEvent(new Event('taskStatusChanged'));
        toast.success(`A página "${page.title}" foi resetada`);
      }
    }
    closeMenu();
  };

  // Função para copiar estatísticas
  const handleCopyStats = (page) => {
    const stats = `
📊 Estatísticas de ${page.title}:
✅ Funcionando: ${page.working}
❌ Problemas: ${page.broken}
⏳ Pendentes: ${page.pending}
💬 Comentários: ${page.withNotes}
📈 Progresso: ${page.progress}%
    `.trim();

    navigator.clipboard.writeText(stats)
      .then(() => toast.success('Estatísticas copiadas para a área de transferência'))
      .catch(() => toast.error('Erro ao copiar estatísticas'));
    
    closeMenu();
  };

  if (loading) {
    return <div className={`loading ${pageLoaded ? 'loaded' : ''}`}>Carregando resumo...</div>;
  }

  return (
    <div className={`dashboard-page ${pageLoaded ? 'loaded' : ''}`}>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Resumo Geral</h1>
        <button
          className="reset-button"
          onClick={handleResetAll}
          title="Resetar todas as páginas para pendente"
        >
          🔄 Resetar Tudo
        </button>
      </div>
      
      <div className="dashboard-grid">
        {summaryData.map(page => (
          <div 
            key={page.title} 
            className="dashboard-card"
            onClick={() => !activeMenu && handleCardClick(page.title)}
            onTouchStart={(e) => handleTouchStart(e, page)}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchEnd}
            style={{ cursor: 'pointer' }}
            title={`Ir para ${page.title}`}
          >
            <div className="card-header">
              <h2 className="card-title">{page.icon} {page.title}</h2>
              <div className="card-progress">
                <div className="progress-ring">
                  <div className="progress-circle" style={{ 
                    background: `conic-gradient(var(--color-primary) ${page.progress * 3.6}deg, var(--color-background) 0deg)`
                  }}>
                    <span>{page.progress}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-stats">
              <div className="stat-item working">
                <span className="stat-label">Funcionando</span>
                <span className="stat-value">{page.working}</span>
              </div>
              <div className="stat-item broken">
                <span className="stat-label">Problemas</span>
                <span className="stat-value">{page.broken}</span>
              </div>
              <div className="stat-item pending">
                <span className="stat-label">Pendentes</span>
                <span className="stat-value">{page.pending}</span>
              </div>
              <div className="stat-item notes">
                <span className="stat-label">Comentários</span>
                <span className="stat-value">{page.withNotes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeMenu && (
        <>
          <div className={`popup-overlay ${activeMenu ? 'active' : ''}`} onClick={closeMenu} />
          <div 
            className={`popup-menu ${activeMenu ? 'active' : ''}`}
            style={{
              left: `${Math.min(menuPosition.x, window.innerWidth - 220)}px`,
              top: `${Math.min(menuPosition.y, window.innerHeight - 200)}px`
            }}
          >
            <div className="popup-menu-item" onClick={() => handleCardClick(activeMenu.title)}>
              <i>📋</i> Abrir página
            </div>
            <div className="popup-menu-item" onClick={() => handleCopyStats(activeMenu)}>
              <i>📊</i> Copiar estatísticas
            </div>
            <div className="popup-menu-divider" />
            <div className="popup-menu-item danger" onClick={() => handleResetPage(activeMenu)}>
              <i>🔄</i> Resetar página
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardSummary; 