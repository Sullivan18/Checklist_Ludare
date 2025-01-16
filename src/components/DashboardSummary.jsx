import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { checklists } from '../data/checklists';
import { supabase } from '../supabaseClient';

function DashboardSummary({ profileId }) {
  const navigate = useNavigate();
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [activeMenu, setActiveMenu] = useState(null);
  const longPressTimer = useRef(null);
  const longPressDelay = 500;
  const [selectedProfile, setSelectedProfile] = useState('all');
  const [profiles, setProfiles] = useState([]);

  // Buscar lista de perfis disponíveis
  useEffect(() => {
    if (profileId === 'admin') {
      async function fetchProfiles() {
        try {
          const { data, error } = await supabase
            .from('tasks')
            .select('profile_id')
            .not('profile_id', 'eq', 'admin');
          
          if (error) throw error;
          
          // Extrair perfis únicos
          const uniqueProfiles = [...new Set(data.map(item => item.profile_id))];
          setProfiles(['all', ...uniqueProfiles.sort()]);
        } catch (error) {
          console.error('Erro ao buscar perfis:', error);
        }
      }
      fetchProfiles();
    }
  }, [profileId]);

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

  // Função para processar os dados do Supabase
  const processData = async () => {
    try {
      let tasksData;
      
      if (profileId === 'admin') {
        if (selectedProfile === 'all') {
          // Buscar dados de todos os perfis
          const { data, error } = await supabase
            .from('tasks')
            .select('*');
          
          if (error) throw error;
          tasksData = data;
        } else {
          // Buscar dados apenas do perfil selecionado
          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('profile_id', selectedProfile);
          
          if (error) throw error;
          tasksData = data;
        }
      } else {
        // Para perfis normais, buscar apenas seus dados
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('profile_id', profileId);
        
        if (error) throw error;
        tasksData = data;
      }

      const processedData = checklists.map(checklist => {
        const tasks = checklist.tasks.map(task => {
          if (profileId === 'admin') {
            // Para admin, agrupar por perfil e mostrar todas as marcações
            const tasksByProfile = {};
            const taskEntries = tasksData.filter(t => 
              t.task_id === task.id && 
              t.page_title === checklist.title
            );

            // Agrupar por perfil
            taskEntries.forEach(entry => {
              if (!tasksByProfile[entry.profile_id]) {
                tasksByProfile[entry.profile_id] = [];
              }
              tasksByProfile[entry.profile_id].push(entry);
            });

            return {
              ...task,
              profileStatuses: Object.entries(tasksByProfile).map(([profile, entries]) => ({
                profileId: profile,
                status: entries[0].status,
                notes: entries[0].notes
              }))
            };
          } else {
            // Para perfis normais, manter a lógica atual
            const savedTask = tasksData?.find(t => 
              t.task_id === task.id && 
              t.page_title === checklist.title &&
              t.profile_id === profileId
            );
            return {
              ...task,
              status: savedTask?.status || 'pending',
              notes: savedTask?.notes || ''
            };
          }
        });

        const workingTasks = tasks.filter(t => t.status === 'working').length;
        const baseTotalTasks = tasks.length;

        // Calcular média da página por perfil
        const profileAverages = {};
        if (profileId === 'admin') {
          tasks.forEach(task => {
            task.profileStatuses?.forEach(ps => {
              if (!profileAverages[ps.profileId]) {
                profileAverages[ps.profileId] = {
                  working: 0,
                  total: 0
                };
              }
              profileAverages[ps.profileId].total++;
              if (ps.status === 'working') {
                profileAverages[ps.profileId].working++;
              }
            });
          });

          // Converter para porcentagens
          Object.keys(profileAverages).forEach(profile => {
            profileAverages[profile] = Math.round(
              (profileAverages[profile].working / profileAverages[profile].total) * 100
            );
          });
        }

        // Calcular média geral da página baseada no total de tarefas funcionando
        const totalPossibleTasks = baseTotalTasks * Object.keys(profileAverages).length; // Total de tarefas x número de perfis
        const totalWorkingTasks = tasks.reduce((sum, task) => {
          return sum + task.profileStatuses?.filter(ps => ps.status === 'working').length || 0;
        }, 0);
        const averageProgress = totalPossibleTasks > 0 ? Math.round((totalWorkingTasks / totalPossibleTasks) * 100) : 0;

        return {
          title: checklist.title,
          icon: checklist.icon,
          totalTasks: baseTotalTasks,
          working: tasks.filter(t => t.status === 'working').length,
          broken: tasks.filter(t => t.status === 'broken').length,
          pending: tasks.filter(t => t.status === 'pending').length,
          withNotes: tasks.filter(t => t.notes?.trim()).length,
          progress: profileId === 'admin' ? averageProgress : Math.round((workingTasks / baseTotalTasks) * 100),
          tasks: profileId === 'admin' ? tasks : undefined,
          profileAverages: profileId === 'admin' ? profileAverages : undefined
        };
      });

      setSummaryData(processedData);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do dashboard');
      setLoading(false);
    }
  };

  useEffect(() => {
    setPageLoaded(false);
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    processData();
  }, [selectedProfile, profileId]);

  useEffect(() => {
    window.addEventListener('taskStatusChanged', processData);
    return () => window.removeEventListener('taskStatusChanged', processData);
  }, [selectedProfile, profileId]);

  // Resetar todas as páginas
  const handleResetAll = async () => {
    try {
      if (profileId === 'admin') {
        // Para admin, confirmar antes de resetar todos os perfis
        if (!confirm('Tem certeza que deseja resetar os dados de TODOS os perfis?')) {
          return;
        }
        // Deletar dados de todos os perfis
        const { error } = await supabase
          .from('tasks')
          .delete()
          .not('profile_id', 'eq', 'admin');

        if (error) throw error;
      } else {
        // Para perfis normais, resetar apenas seus próprios dados
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('profile_id', profileId);

        if (error) throw error;
      }

      // Atualiza os dados
      processData();
      
      // Dispara evento para forçar atualização em todos os componentes
      window.dispatchEvent(new Event('taskStatusChanged'));
      
      toast.success(profileId === 'admin' 
        ? 'Todas as tarefas de todos os perfis foram resetadas'
        : 'Todas as suas tarefas foram resetadas para pendente'
      );
    } catch (error) {
      console.error('Erro ao resetar tarefas:', error);
      toast.error('Erro ao resetar tarefas. Tente novamente.');
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

  // Resetar uma página específica
  const handleResetPage = async (page) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('page_title', page.title)
        .eq('profile_id', profileId);

      if (error) throw error;

      processData();
      window.dispatchEvent(new Event('taskStatusChanged'));
      toast.success(`A página "${page.title}" foi resetada`);
      closeMenu();
    } catch (error) {
      console.error('Erro ao resetar página:', error);
      toast.error('Erro ao resetar página. Tente novamente.');
    }
  };

  // Função para copiar estatísticas
  const handleCopyStats = (page) => {
    const stats = `
📊 Estatísticas de ${page.title}:
✅ Funcionando: ${page.working}
❌ Problemas: ${page.broken}
⏳ Pendentes: ${page.pending}
💬 Comentários: ${page.withNotes}
�� Progresso: ${page.progress}%
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
        <h1 className="dashboard-title">
          {profileId === 'admin' ? 'Dashboard Administrativo' : 'Resumo Geral'}
        </h1>
        
        {/* Seletor de Perfil para Admin */}
        {profileId === 'admin' && (
          <div className="profile-selector">
            <select 
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
              className="profile-select"
            >
              {profiles.map(profile => (
                <option key={profile} value={profile}>
                  {profile === 'all' ? 'Todos os Perfis' : `Perfil ${profile}`}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          className="reset-button"
          onClick={handleResetAll}
          title="Resetar todas as páginas para pendente"
        >
          🔄 Resetar Tudo
        </button>
      </div>
      
      {/* Mostrar título do dashboard atual */}
      {profileId === 'admin' && selectedProfile !== 'all' && (
        <div className="selected-profile-header">
          <h2>Dashboard do Perfil {selectedProfile}</h2>
        </div>
      )}

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
              <span className="card-icon">{page.icon}</span>
              <h2 className="card-title">{page.title}</h2>
            </div>
            
            <div className="card-stats">
              <div className="stat-item" title="Funcionando">
                ✅ {page.working}
              </div>
              <div className="stat-item" title="Com Problemas">
                ❌ {page.broken}
              </div>
              <div className="stat-item" title="Pendentes">
                ⏳ {page.pending}
              </div>
              {page.withNotes > 0 && (
                <div className="stat-item" title="Com Comentários">
                  💬 {page.withNotes}
                </div>
              )}
            </div>

            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${page.progress}%` }}
              />
            </div>
            
            <div className="progress-info">
              {profileId === 'admin' && selectedProfile === 'all' ? (
                <div className="progress-total">Média Geral: {page.progress}%</div>
              ) : (
                <div className="progress-total">Total Concluído: {page.progress}%</div>
              )}
            </div>

            {profileId === 'admin' && page.tasks && (
              <div className="admin-details">
                {page.tasks.filter(t => t.profileStatuses?.length > 0).map(task => (
                  <div key={task.id} className="admin-task-item">
                    <div className="task-name">{task.text || task.name}</div>
                    <div className="task-profiles">
                      {task.profileStatuses.map(ps => (
                        <div key={ps.profileId} className="profile-status">
                          <span className="task-status">
                            {ps.status === 'working' ? '✅' : ps.status === 'broken' ? '❌' : '⏳'}
                          </span>
                          <span className="task-profile">
                            {ps.profileId}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {page.profileAverages && (
                  <div className="profile-averages">
                    <h3>Média por Perfil:</h3>
                    <div className="averages-grid">
                      {Object.entries(page.profileAverages).map(([profile, percent]) => (
                        <div key={profile} className="profile-average">
                          <span className="profile-id"> {profile}:</span>
                          <span className="average-percent">{percent}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Menu de Contexto */}
      {activeMenu && (
        <div 
          className="popup-menu"
          style={{
            position: 'fixed',
            left: menuPosition.x,
            top: menuPosition.y,
          }}
        >
          <div className="popup-menu-item" onClick={() => handleCardClick(activeMenu)}>
            <i>📝</i> Abrir Página
          </div>
          <div className="popup-menu-item" onClick={() => handleCopyStats(activeMenu)}>
            <i>📋</i> Copiar Estatísticas
          </div>
          {profileId !== 'admin' && (
            <div className="popup-menu-item" onClick={() => handleResetPage(activeMenu)}>
              <i>🔄</i> Resetar Página
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DashboardSummary; 