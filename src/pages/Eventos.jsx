import ChecklistBase from '../components/ChecklistBase';

const initialTasks = [
  { id: 1, text: 'Criação de eventos', completed: false },
  { id: 2, text: 'Adicionar título para eventos', completed: false },
  { id: 3, text: 'Adicionar imagens da câmera / galeria', completed: false },
  { id: 4, text: 'Detalhes do evento', completed: false },
  { id: 5, text: 'Data e hora de início / término', completed: false },
  { id: 6, text: 'Localização do evento', completed: false },
  { id: 7, text: 'Exibir participantes', completed: false },
  { id: 8, text: 'Seleção de evento privado', completed: false },
  { id: 9, text: 'Busca de eventos de acordo com o raio', completed: false },
  { id: 10, text: 'Cards com detalhamentos de evento', completed: false },
  { id: 11, text: 'Pesquisar eventos', completed: false },
  { id: 12, text: 'Confirmar presença', completed: false },
  { id: 13, text: 'Solicitação de eventos', completed: false },
  { id: 14, text: 'Minhas solicitações', completed: false },
  { id: 15, text: 'Solicitações de usuários', completed: false },
  { id: 16, text: 'Meus eventos', completed: false },
];

function Eventos() {
  return <ChecklistBase title="Eventos Ludare" initialTasks={initialTasks} />;
}

export default Eventos; 