import ChecklistBase from '../components/ChecklistBase';

const initialTasks = [
  { id: 1, text: 'Zoom', completed: false },
  { id: 2, text: 'Música', completed: false },
  { id: 3, text: 'Publicação de fotos e vídeos, câmera e galeria', completed: false },
  { id: 4, text: 'Rotação', completed: false },
  { id: 5, text: 'Curtir', completed: false },
  { id: 6, text: 'Contagem de visualização', completed: false },
  { id: 7, text: 'Compartilhar', completed: false },
  { id: 8, text: 'Denunciar publicação', completed: false },
];

function FlashDare() {
  return <ChecklistBase title="Flash Dare Ludare" initialTasks={initialTasks} />;
}

export default FlashDare; 