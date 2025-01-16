import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { checklists } from '../data/checklists';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function ChecklistBase({ title, initialTasks = [], profileId }) {
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
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editTaskName, setEditTaskName] = useState('');
  const navigate = useNavigate();
  const [pageStartTime, setPageStartTime] = useState(Date.now());
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(new Map());
  const [profileTasks, setProfileTasks] = useState({});

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
    async function loadTasks() {
      setLoading(true);
      try {
        let query = supabase
          .from('tasks')
          .select('*')
          .eq('page_title', title);

        // Se não for admin, filtra apenas pelo perfil atual
        if (profileId !== 'admin') {
          query = query.eq('profile_id', profileId);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (profileId === 'admin') {
          // Para admin, organiza as tarefas por perfil
          const tasksByProfile = {};
          data.forEach(task => {
            if (!tasksByProfile[task.profile_id]) {
              tasksByProfile[task.profile_id] = {};
            }
            tasksByProfile[task.profile_id][task.task_id] = task;
          });
          setProfileTasks(tasksByProfile);

          // Combina tarefas iniciais com tarefas do banco para o admin
          const loadedTasks = initialTasks.map(task => {
            const adminTask = data?.find(t => t.task_id === task.id && t.profile_id === 'admin');
            return {
              ...task,
              name: task.text,
              status: adminTask?.status || 'pending',
              notes: adminTask?.notes || ''
            };
          });

          setTasks(loadedTasks);
        } else {
          // Para outros perfis, mantém o comportamento original
          const loadedTasks = initialTasks.map(task => {
            const savedTask = data?.find(t => t.task_id === task.id);
            return {
              ...task,
              name: task.text,
              status: savedTask?.status || 'pending',
              notes: savedTask?.notes || ''
            };
          });

          setTasks(loadedTasks);
        }

        setPendingChanges(new Map());
        setUnsavedChanges(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError(error.message);
        toast.error('Erro ao carregar dados. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [title, initialTasks, profileId]);

  // Aviso de alterações não salvas ao tentar sair
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedChanges]);

  // Registrar mudança pendente
  const registerChange = (taskId, changes) => {
    setPendingChanges(prev => {
      const newChanges = new Map(prev);
      const currentChanges = newChanges.get(taskId) || {};
      newChanges.set(taskId, { ...currentChanges, ...changes });
      return newChanges;
    });
    setUnsavedChanges(true);
  };

  // Salvar todas as alterações pendentes
  const saveAllChanges = async () => {
    if (!unsavedChanges) return;

    try {
      const changes = Array.from(pendingChanges.entries()).map(([taskId, changes]) => {
        const task = tasks.find(t => t.id === taskId);
        return {
          task_id: taskId,
          page_title: title,
          profile_id: profileId,
          status: task.status, // Garante que o status atual da tarefa seja enviado
          notes: changes.notes || '', // Garante que notes seja uma string vazia se não existir
          ...changes, // Sobrescreve com as mudanças pendentes
          updated_at: new Date().toISOString()
        };
      });

      const { error } = await supabase
        .from('tasks')
        .upsert(changes, {
          onConflict: 'task_id,page_title,profile_id'
        });

      if (error) throw error;

      setPendingChanges(new Map());
      setUnsavedChanges(false);
      toast.success('Alterações salvas com sucesso');
      
      // Dispara evento para atualizar o dashboard
      window.dispatchEvent(new Event('taskStatusChanged'));
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      toast.error('Erro ao salvar alterações. Tente novamente.');
    }
  };

  // Registrar entrada na página
  useEffect(() => {
    const startTime = Date.now();
    setPageStartTime(startTime);

    // Registrar ação de entrada
    supabase.from('analytics').insert({
      profile_id: profileId,
      page_title: title,
      action_type: 'page_enter',
      created_at: new Date().toISOString()
    });

    // Registrar tempo de permanência quando sair
    return () => {
      const duration = Math.round((Date.now() - startTime) / 1000); // Duração em segundos
      supabase.from('analytics').insert({
        profile_id: profileId,
        page_title: title,
        action_type: 'page_exit',
        duration,
        created_at: new Date().toISOString()
      });
    };
  }, [title, profileId]);

  // Registrar mudanças de status
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Atualizar estado local
      const updatedTasks = tasks.map(t => {
        if (t.id === taskId) {
          return { ...t, status: newStatus };
        }
        return t;
      });
      setTasks(updatedTasks);

      // Registrar mudança pendente
      registerChange(taskId, { status: newStatus });

      // Registrar ação
      await supabase.from('analytics').insert({
        profile_id: profileId,
        page_title: title,
        action_type: 'status_change',
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  // Registrar adição de notas
  const handleNotesChange = async (taskId, notes) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Atualizar estado local
      const updatedTasks = tasks.map(t => {
        if (t.id === taskId) {
          return { ...t, notes };
        }
        return t;
      });
      setTasks(updatedTasks);

      // Registrar mudança pendente
      registerChange(taskId, { notes });

      // Registrar ação apenas se adicionou nota
      if (notes.trim() && !task.notes.trim()) {
        await supabase.from('analytics').insert({
          profile_id: profileId,
          page_title: title,
          action_type: 'note_added',
          created_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar notas:', error);
    }
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

  // Gestos de deslize
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const onTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isSwipe = Math.abs(distance) > 50;

    if (isSwipe) {
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
      // Deslizar para a esquerda
      if (distance > 0) {
        const currentIndex = checklists.findIndex(c => c.title === title);
        const nextChecklist = checklists[currentIndex + 1];
        if (nextChecklist) {
          navigate(`/${createSlug(nextChecklist.title)}`);
        }
      }
      // Deslizar para a direita
      else {
        const currentIndex = checklists.findIndex(c => c.title === title);
        const prevChecklist = checklists[currentIndex - 1];
        if (prevChecklist) {
          navigate(`/${createSlug(prevChecklist.title)}`);
        }
      }
    }
  };

  // Função para adicionar nova tarefa (apenas admin)
  const handleAddTask = async () => {
    if (!newTaskName.trim()) {
      toast.error('Digite um nome para a tarefa');
      return;
    }

    const newTask = {
      id: `task-${Date.now()}`,
      name: newTaskName.trim(),
      status: 'pending',
      notes: ''
    };

    try {
      // Salvar no Supabase primeiro
      await saveTask(newTask.id, newTask.status, newTask.notes, newTask.name);
      
      // Atualizar a lista de tarefas localmente
      setTasks(prevTasks => [...prevTasks, newTask]);
      
      // Limpar o formulário
      setNewTaskName('');
      setShowAddTask(false);
      
      toast.success('Tarefa adicionada com sucesso');
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
      toast.error('Erro ao adicionar tarefa');
    }
  };

  // Função para iniciar edição de tarefa
  const handleStartEdit = (task) => {
    setEditingTask(task);
    setEditTaskName(task.name || task.text || ''); // Garante que sempre terá um valor
  };

  // Função para salvar edição de tarefa
  const handleSaveEdit = async () => {
    if (!editTaskName.trim()) {
      toast.error('O nome da tarefa não pode ficar vazio');
      return;
    }

    try {
      // Salvar no Supabase primeiro
      await saveTask(editingTask.id, editingTask.status, editingTask.notes, editTaskName.trim());

      // Atualizar localmente
      const updatedTasks = tasks.map(task => {
        if (task.id === editingTask.id) {
          return { 
            ...task, 
            name: editTaskName.trim(),
            text: editTaskName.trim() // Atualizar também o texto original
          };
        }
        return task;
      });

      setTasks(updatedTasks);
      setEditingTask(null);
      setEditTaskName('');
      
      toast.success('Tarefa atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast.error('Erro ao atualizar tarefa');
    }
  };

  // Função para excluir tarefa
  const handleDeleteTask = async (taskId) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;

    try {
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      
      // Remover do Supabase
      await supabase
        .from('tasks')
        .delete()
        .match({ task_id: taskId, page_title: title });
      
      toast.success('Tarefa excluída com sucesso');
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      toast.error('Erro ao excluir tarefa');
    }
  };

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
    <div 
      className={`checklist-page ${pageLoaded ? 'loaded' : ''}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
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

        {/* Botão de adicionar tarefa (apenas admin) */}
        {profileId === 'admin' && (
          <div className="admin-controls">
            {!showAddTask ? (
              <button 
                className="add-task-button"
                onClick={() => setShowAddTask(true)}
              >
                ➕ Adicionar Nova Tarefa
              </button>
            ) : (
              <div className="add-task-form">
                <input
                  type="text"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="Nome da nova tarefa"
                  className="add-task-input"
                />
                <div className="add-task-buttons">
                  <button 
                    className="add-task-submit"
                    onClick={handleAddTask}
                  >
                    Adicionar
                  </button>
                  <button 
                    className="add-task-cancel"
                    onClick={() => {
                      setShowAddTask(false);
                      setNewTaskName('');
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botão de salvar */}
        {unsavedChanges && (
          <button
            className="save-changes-button"
            onClick={saveAllChanges}
            title="Salvar todas as alterações"
          >
            💾 Salvar Alterações
          </button>
        )}
      </div>

      <div className="checklist">
        {filteredTasks.map(task => (
          <div key={task.id} className={`task-item ${task.status} ${pendingChanges.has(task.id) ? 'unsaved' : ''}`}>
            <div className="task-content">
              <div className="task-main">
                {editingTask?.id === task.id ? (
                  <div className="edit-task-form">
                    <input
                      type="text"
                      value={editTaskName}
                      onChange={(e) => setEditTaskName(e.target.value)}
                      className="edit-task-input"
                      placeholder="Nome da tarefa"
                    />
                    <div className="edit-task-buttons">
                      <button 
                        className="edit-task-save"
                        onClick={handleSaveEdit}
                      >
                        Salvar
                      </button>
                      <button 
                        className="edit-task-cancel"
                        onClick={() => {
                          setEditingTask(null);
                          setEditTaskName('');
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="task-text">{task.name || task.text}</span>
                    {profileId === 'admin' && (
                      <>
                        <div className="task-admin-controls">
                          <button
                            className="edit-task-button"
                            onClick={() => handleStartEdit(task)}
                            title="Editar tarefa"
                          >
                            ✏️
                          </button>
                          <button
                            className="delete-task-button"
                            onClick={() => handleDeleteTask(task.id)}
                            title="Excluir tarefa"
                          >
                            🗑️
                          </button>
                        </div>
                        <div className="profile-statuses">
                          {Object.entries(profileTasks)
                            .filter(([profile]) => profile !== 'admin') // Remove o admin da lista
                            .map(([profile, tasks]) => {
                              const profileTask = tasks[task.id];
                              const getProfileIcon = (profile) => {
                                switch(profile) {
                                  case '1':
                                    return '👤';
                                  case '2':
                                    return '👥';
                                  case '3':
                                    return '🧑‍💼';
                                  default:
                                    return '👤';
                                }
                              };
                              
                              const getProfileName = (profile) => {
                                switch(profile) {
                                  case '1':
                                    return 'Perfil 1';
                                  case '2':
                                    return 'Perfil 2';
                                  case '3':
                                    return 'Perfil 3';
                                  default:
                                    return `Perfil ${profile}`;
                                }
                              };

                              return (
                                <div key={profile} className="profile-status">
                                  <span className="profile-name">
                                    <span className="profile-icon">{getProfileIcon(profile)}</span>
                                    {getProfileName(profile)}
                                  </span>
                                  <span className={`status-indicator ${profileTask?.status || 'pending'}`}>
                                    {profileTask?.status === 'working' ? '✓' : 
                                     profileTask?.status === 'broken' ? '✕' : '?'}
                                  </span>
                                  {profileTask?.notes && (
                                    <span 
                                      className="notes-indicator" 
                                      title={profileTask.notes}
                                      onClick={() => toast(profileTask.notes, {
                                        icon: '📝',
                                        style: {
                                          borderRadius: '10px',
                                          background: '#333',
                                          color: '#fff',
                                        },
                                      })}
                                    >
                                      📝
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
              
              {/* Botões de status apenas para perfis não-admin */}
              {profileId !== 'admin' && (
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
              )}
            </div>
            
            {showNotes === task.id && (
              <div className="task-notes">
                <textarea
                  placeholder="Adicione observações sobre esta tarefa..."
                  value={task.notes}
                  onChange={(e) => handleNotesChange(task.id, e.target.value)}
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