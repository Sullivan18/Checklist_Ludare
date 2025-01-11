import ChecklistBase from '../components/ChecklistBase';

const initialTasks = [
  { id: 1, text: 'Feed de postagem', completed: false },
  { id: 2, text: 'Postagem de vídeos e fotos', completed: false },
  { id: 3, text: 'Comentar', completed: false },
  { id: 4, text: 'Curtir', completed: false },
  { id: 5, text: 'Denunciar comentário', completed: false },
  { id: 6, text: 'Lista de curtidas', completed: false },
  { id: 7, text: 'Curtir o comentário', completed: false },
  { id: 8, text: 'Responder comentário', completed: false },
  { id: 9, text: 'Compartilhar', completed: false },
  { id: 10, text: 'Excluir publicação', completed: false },
  { id: 11, text: 'Contagem de visualização', completed: false },
  { id: 12, text: 'Descrição', completed: false },
  { id: 13, text: 'Tempo de postagem', completed: false },
  { id: 14, text: 'Marcar pessoas', completed: false },
  { id: 15, text: 'Localização', completed: false },
  { id: 16, text: 'Editar publicação', completed: false },
  { id: 17, text: 'Excluir comentário', completed: false },
  { id: 18, text: 'Edição de imagem', completed: false },
];

function Feed() {
  return <ChecklistBase title="Feed Ludare" initialTasks={initialTasks} />;
}

export default Feed; 