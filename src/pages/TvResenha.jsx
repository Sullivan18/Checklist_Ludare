import ChecklistBase from '../components/ChecklistBase';

const initialTasks = [
  { id: 1, text: 'Adicionar (publicar vídeos)', completed: false },
  { id: 2, text: 'Preview do TV Resenha', completed: false },
  { id: 3, text: 'Curtidas', completed: false },
  { id: 4, text: 'Quantidade de visualização', completed: false },
  { id: 5, text: 'Comentários', completed: false },
  { id: 6, text: 'Descrição', completed: false },
  { id: 7, text: 'Compartilhar', completed: false },
  { id: 8, text: 'Denunciar publicação', completed: false },
  { id: 9, text: 'Marcação', completed: false },
  { id: 10, text: 'Scrollar vídeos', completed: false },
  { id: 11, text: 'Áudio', completed: false },
  { id: 12, text: 'Música', completed: false },
  { id: 13, text: 'Play/Pause', completed: false },
  { id: 14, text: 'Redirecionamento de perfil', completed: false },
  { id: 15, text: 'Curtir comentário', completed: false },
  { id: 16, text: 'Responder comentário', completed: false },
  { id: 17, text: 'Botão de câmera para postagem', completed: false },
  { id: 18, text: 'Denunciar comentário', completed: false },
];

function TvResenha() {
  return <ChecklistBase title="TV Resenha Ludare" initialTasks={initialTasks} />;
}

export default TvResenha; 