import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-hot-toast';

function DashboardSummary() {
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    setPageLoaded(false);
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('checklists')
        .select('*');

      if (error) throw error;

      const processedData = data.map(item => {
        const tasks = JSON.parse(item.tasks);
        return {
          title: item.title,
          totalTasks: tasks.length,
          working: tasks.filter(t => t.status === 'working').length,
          broken: tasks.filter(t => t.status === 'broken').length,
          pending: tasks.filter(t => t.status === 'pending').length,
          withNotes: tasks.filter(t => t.notes?.trim()).length,
          progress: Math.round((tasks.filter(t => t.status === 'working').length / tasks.length) * 100),
          lastUpdate: new Date(item.updated_at).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
        };
      });

      setSummaryData(processedData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleResetAll = async () => {
    if (window.confirm('Tem certeza que deseja resetar TODAS as páginas para pendente? Isso também removerá todos os comentários.')) {
      try {
        setLoading(true);
        
        // Busca todos os checklists
        const { data: checklists, error: fetchError } = await supabase
          .from('checklists')
          .select('*');

        if (fetchError) throw fetchError;

        // Para cada checklist, reseta todas as tarefas para pendente
        const updatePromises = checklists.map(async (checklist) => {
          const tasks = JSON.parse(checklist.tasks);
          // Garante que cada tarefa tenha um status e notes definidos
          const resetTasks = tasks.map(task => ({
            id: task.id,
            text: task.text,
            status: 'pending',
            notes: ''
          }));

          return supabase
            .from('checklists')
            .update({ 
              tasks: JSON.stringify(resetTasks),
              updated_at: new Date().toISOString()
            })
            .eq('title', checklist.title);
        });

        // Executa todas as atualizações em paralelo
        const results = await Promise.all(updatePromises);
        
        // Verifica se houve algum erro
        const updateError = results.find(result => result.error);
        if (updateError) throw updateError.error;

        // Recarrega os dados
        await loadAllData();
        
        toast.success('Todas as tarefas foram resetadas para pendente');
      } catch (error) {
        console.error('Erro ao resetar tarefas:', error);
        toast.error('Erro ao resetar tarefas. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <div className={`loading ${pageLoaded ? 'loaded' : ''}`}>Carregando resumo...</div>;
  }

  if (error) {
    return (
      <div className={`error-message ${pageLoaded ? 'loaded' : ''}`}>
        Erro ao carregar resumo: {error}
        <button onClick={() => window.location.reload()}>Tentar Novamente</button>
      </div>
    );
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
          <div key={page.title} className="dashboard-card">
            <div className="card-header">
              <h2 className="card-title">{page.title}</h2>
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

            <div className="card-footer">
              <span className="last-update">Última atualização: {page.lastUpdate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardSummary; 