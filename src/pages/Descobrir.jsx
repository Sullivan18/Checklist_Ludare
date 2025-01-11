import ChecklistBase from '../components/ChecklistBase';

const initialTasks = [
  { id: 1, text: 'Lista de Eventos', completed: false },
  { id: 2, text: 'Lista de pessoas', completed: false },
  { id: 3, text: 'Pesquisa de evento', completed: false },
  { id: 4, text: 'Pesquisa de pessoas', completed: false },
  { id: 5, text: 'Seguir e deixar de seguir', completed: false },
  { id: 6, text: 'Redirecionamento de perfil', completed: false },
];

function Descobrir() {
  return <ChecklistBase title="Descobrir Ludare" initialTasks={initialTasks} />;
}

export default Descobrir; 