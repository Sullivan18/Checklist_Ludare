import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { checklists } from '../data/checklists';

function ChecklistBase({ title, initialTasks = [] }) {
  const [tasks, setTasks] = useState(initialTasks.map(task => ({
    ...task,
    status: 'pending',
    notes: ''
  })));
  const [filter, setFilter] = useState('all');
  const [showNotes, setShowNotes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBanner, setShowBanner] = useState(() => {
    return !localStorage.getItem('infoBannerDismissed');
  });
  const [pageLoaded, setPageLoaded] = useState(false);

  // Encontrar o ícone correspondente ao título
  const pageIcon = checklists.find(c => c.title === title)?.icon || '📋';

  // Efeito para controlar a animação de entrada da página
  useEffect(() => {
    setPageLoaded(false); // Inicia o loading
    
    // Pequeno delay para garantir que a animação seja visível
    const timer = setTimeout(() => {
      setPageLoaded(true); // Remove o loading após o delay
    }, 100);

    return () => clearTimeout(timer);
  }, [title]); // Executa quando o título (página) muda

  const handleDismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('infoBannerDismissed', 'true');
  };

  // Carregar dados do Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Carregando dados para:', title);
        
        const { data, error } = await supabase
          .from('checklists')
          .select('*')
          .eq('title', title)
          .single();

        if (error) {
          console.error('Erro ao carregar dados:', error);
          if (error.code === 'PGRST116') {
            // Caso não encontre dados, vamos criar um novo registro
            const initialTasksData = initialTasks.map(task => ({
              id: task.id,
              text: task.text,
              status: 'pending',
              notes: ''
            }));

            const { data: newData, error: insertError } = await supabase
              .from('checklists')
              .insert([
                { 
                  title, 
                  tasks: JSON.stringify(initialTasksData),
                  updated_at: new Date().toISOString()
                }
              ])
              .select()
              .single();

            if (insertError) throw insertError;
            
            if (newData) {
              setTasks(initialTasksData);
            }
          } else {
            throw error;
          }
          return;
        }

        if (data) {
          console.log('Dados carregados:', data);
          const savedTasks = JSON.parse(data.tasks);
          // Garante que todas as tarefas tenham os campos necessários
          const processedTasks = initialTasks.map(task => {
            const savedTask = savedTasks.find(t => t.id === task.id);
            return {
              id: task.id,
              text: task.text,
              status: savedTask?.status || 'pending',
              notes: savedTask?.notes || ''
            };
          });
          setTasks(processedTasks);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [title, initialTasks]);

  // Salvar dados no Supabase
  useEffect(() => {
    const saveData = async () => {
      try {
        setError(null);
        const dataToSave = tasks.map(({ id, status, notes }) => ({ id, status, notes }));
        console.log('Salvando dados:', { title, tasks: dataToSave });
        
        const { error } = await supabase
          .from('checklists')
          .upsert({ 
            title, 
            tasks: JSON.stringify(dataToSave),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'title'
          });

        if (error) {
          console.error('Erro ao salvar dados:', error);
          setError(error.message);
        } else {
          console.log('Dados salvos com sucesso!');
        }
      } catch (error) {
        console.error('Erro ao salvar dados:', error);
        setError(error.message);
      }
    };

    if (!loading && tasks.length > 0) {
      const debounceTimer = setTimeout(() => {
        saveData();
      }, 1000);

      return () => clearTimeout(debounceTimer);
    }
  }, [tasks, title, loading]);

  const handleStatusChange = (id, newStatus) => {
    console.log('Mudando status:', { id, newStatus });
    setTasks(currentTasks => {
      const newTasks = currentTasks.map(task =>
        task.id === id ? { ...task, status: newStatus } : task
      );
      return newTasks;
    });
  };

  const handleNoteChange = (id, note) => {
    console.log('Mudando nota:', { id, note });
    setTasks(currentTasks => {
      const newTasks = currentTasks.map(task =>
        task.id === id ? { ...task, notes: note } : task
      );
      return newTasks;
    });
  };

  const getProgress = () => {
    const total = tasks.length;
    const working = tasks.filter(t => t.status === 'working').length;
    return Math.round((working / total) * 100);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  if (loading) {
    return <div className={`loading ${pageLoaded ? 'loaded' : ''}`}>Carregando...</div>;
  }

  if (error) {
    return (
      <div className={`error-message ${pageLoaded ? 'loaded' : ''}`}>
        Erro: {error}
        <button onClick={() => window.location.reload()}>Tentar Novamente</button>
      </div>
    );
  }

  return (
    <div className={`checklist-page ${pageLoaded ? 'loaded' : ''}`}>
      {showBanner && (
        <div className="info-banner">
          <div className="info-banner-content">
            <span className="info-icon">💡</span>
            <p>
              Iniciando um novo teste do aplicativo? Para uma melhor experiência, recomendamos: 1) Use o botão "Resetar Tudo" no Dashboard para começar com uma base limpa; 2) Teste todas as funções novamente para garantir o funcionamento correto da plataforma Ludare.
            </p>
            <button className="info-close" onClick={handleDismissBanner}>
              ×
            </button>
          </div>
        </div>
      )}

      <div className="checklist-header">
        <div className="header-top">
          <h2 className="checklist-title">
            <span className="title-icon">{pageIcon}</span>
            {title}
          </h2>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${getProgress()}%` }}></div>
            <span className="progress-text">{getProgress()}% Concluído</span>
          </div>
        </div>

        <div className="header-controls">
          <div className="filter-buttons">
            <button
              className={`filter-button ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Todos ({tasks.length})
            </button>
            <button
              className={`filter-button ${filter === 'working' ? 'active' : ''}`}
              onClick={() => setFilter('working')}
            >
              Funcionando ({tasks.filter(t => t.status === 'working').length})
            </button>
            <button
              className={`filter-button ${filter === 'broken' ? 'active' : ''}`}
              onClick={() => setFilter('broken')}
            >
              Problemas ({tasks.filter(t => t.status === 'broken').length})
            </button>
            <button
              className={`filter-button ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pendentes ({tasks.filter(t => t.status === 'pending').length})
            </button>
          </div>
        </div>
      </div>

      <div className="checklist">
        {filteredTasks.map(task => (
          <div key={task.id} className={`task-item ${task.status}`}>
            <div className="task-content">
              <div className="task-main">
                <span className="task-text">{task.text}</span>
              </div>
              
              <div className="task-actions">
                <div className="status-buttons">
                  <button
                    className={`status-button working ${task.status === 'working' ? 'active' : ''}`}
                    onClick={() => handleStatusChange(task.id, 'working')}
                    title="Funcionando"
                  >
                    ✓
                  </button>
                  <button
                    className={`status-button broken ${task.status === 'broken' ? 'active' : ''}`}
                    onClick={() => handleStatusChange(task.id, 'broken')}
                    title="Com Problemas"
                  >
                    ✕
                  </button>
                  <button
                    className={`status-button pending ${task.status === 'pending' ? 'active' : ''}`}
                    onClick={() => handleStatusChange(task.id, 'pending')}
                    title="Pendente"
                  >
                    ?
                  </button>
                </div>
                <button
                  className={`note-button ${task.notes?.trim() ? 'has-notes' : ''}`}
                  onClick={() => setShowNotes(showNotes === task.id ? null : task.id)}
                  title={task.notes?.trim() ? 'Ver Observações' : 'Adicionar Observações'}
                >
                  📝
                </button>
              </div>
            </div>
            
            {showNotes === task.id && (
              <div className="task-notes">
                <textarea
                  placeholder="Adicione observações sobre esta tarefa..."
                  value={task.notes}
                  onChange={(e) => handleNoteChange(task.id, e.target.value)}
                  rows="3"
                  className="notes-input"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="checklist-summary">
        <div className="summary-chart">
          <div className="chart-bar">
            <div
              className="chart-fill working"
              style={{
                width: `${(tasks.filter(t => t.status === 'working').length / tasks.length) * 100}%`
              }}
            ></div>
            <div
              className="chart-fill broken"
              style={{
                width: `${(tasks.filter(t => t.status === 'broken').length / tasks.length) * 100}%`
              }}
            ></div>
            <div
              className="chart-fill pending"
              style={{
                width: `${(tasks.filter(t => t.status === 'pending').length / tasks.length) * 100}%`
              }}
            ></div>
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="status-dot" style={{ backgroundColor: '#4CAF50' }}></span>
              <span>Funcionando ({tasks.filter(t => t.status === 'working').length})</span>
            </div>
            <div className="legend-item">
              <span className="status-dot" style={{ backgroundColor: '#f44336' }}></span>
              <span>Com Problemas ({tasks.filter(t => t.status === 'broken').length})</span>
            </div>
            <div className="legend-item">
              <span className="status-dot" style={{ backgroundColor: '#ffc107' }}></span>
              <span>Pendentes ({tasks.filter(t => t.status === 'pending').length})</span>
            </div>
            <div className="legend-item">
              <span className="status-dot" style={{ backgroundColor: '#9333ea' }}></span>
              <span>Com Comentários ({tasks.filter(t => t.notes?.trim()).length})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChecklistBase; 