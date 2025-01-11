import ChecklistBase from '../components/ChecklistBase';

const initialTasks = [
  { id: 1, text: 'Criar uma nova Resenha (mensagens)', completed: false },
  { id: 2, text: 'Envio de fotos e vídeos câmera/galeria', completed: false },
  { id: 3, text: 'Compartilhamento de vídeos, fotos e documentos externos', completed: false },
  { id: 4, text: 'Contagem de mensagens não lidas', completed: false },
  { id: 5, text: 'Horário de última mensagem', completed: false },
  { id: 6, text: 'Pesquisar conversa', completed: false },
  { id: 7, text: 'Criação de grupos', completed: false },
  { id: 8, text: 'Solicitação de grupo', completed: false },
  { id: 9, text: 'Adicionar pessoa ao grupo', completed: false },
  { id: 10, text: 'Remover pessoas do grupo', completed: false },
  { id: 11, text: 'Excluir grupo', completed: false },
  { id: 12, text: 'Excluir conversa', completed: false },
  { id: 13, text: 'Adicionar fotos ao grupo', completed: false },
  { id: 14, text: 'Adicionar nome ao grupo', completed: false },
  { id: 15, text: 'Excluir mensagem dentro do grupo', completed: false },
  { id: 16, text: 'Apagar todas as mensagens', completed: false },
  { id: 17, text: 'Copiar mensagem', completed: false },
  { id: 18, text: 'Encaminhar mensagem', completed: false },
  { id: 19, text: 'Aviso de participantes que entram e saem do grupo', completed: false },
  { id: 20, text: 'Chamada de vídeo e voz', completed: false },
  { id: 21, text: 'Áudio', completed: false },
  { id: 22, text: 'GIFs e figurinhas', completed: false },
  { id: 23, text: 'Redirecionamento para perfil do usuário', completed: false },
  { id: 24, text: 'Status de atividade', completed: false },
  { id: 25, text: 'Notificação de Resenha e Grupo', completed: false },
];

function Resenha() {
  return <ChecklistBase title="Resenha Ludare" initialTasks={initialTasks} />;
}

export default Resenha; 