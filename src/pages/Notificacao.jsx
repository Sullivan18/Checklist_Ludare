import ChecklistBase from '../components/ChecklistBase';

const initialTasks = [
  { id: 1, text: 'Notificações recebidas', completed: false },
  { id: 2, text: 'Excluir notificação', completed: false },
  { id: 3, text: 'Redirecionamento de notificação', completed: false },
  { id: 4, text: 'Selecionar todas as notificações', completed: false },
  { id: 5, text: 'Ir para tela principal', completed: false },
];

function Notificacao() {
  return <ChecklistBase title="Página de Notificação Ludare" initialTasks={initialTasks} />;
}

export default Notificacao; 