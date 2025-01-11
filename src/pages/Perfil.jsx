import ChecklistBase from '../components/ChecklistBase';

const initialTasks = [
  { id: 1, text: 'Lista de seguidores/ lista de seguindo/ Postagens', completed: false },
  { id: 2, text: 'Perfil do usuário', completed: false },
  { id: 3, text: 'Verificação', completed: false },
  { id: 4, text: 'Galeria de fotos', completed: false },
  { id: 5, text: 'Galeria TV resenha', completed: false },
  { id: 6, text: 'Sobre mim', completed: false },
  { id: 7, text: 'Personalizar', completed: false },
  { id: 8, text: 'Configurações', completed: false },
  { id: 9, text: 'Ajustes', completed: false },
  { id: 10, text: 'Dados do usuário', completed: false },
  { id: 11, text: 'Privacidade da conta', completed: false },
  { id: 12, text: 'Raio', completed: false },
  { id: 13, text: 'Senha', completed: false },
  { id: 14, text: 'Troca de idioma', completed: false },
  { id: 15, text: 'Preferências', completed: false },
  { id: 16, text: 'Bio do Perfil', completed: false },
  { id: 17, text: 'Deletar conta', completed: false },
  { id: 18, text: 'Solicitação de seguidores', completed: false },
  { id: 19, text: 'Usuários Bloqueados', completed: false },
  { id: 20, text: 'Minhas solicitações de eventos', completed: false },
  { id: 21, text: 'Sair da conta', completed: false },
  { id: 22, text: 'Ver todas as publicações', completed: false },
  { id: 23, text: 'Comentar', completed: false },
  { id: 24, text: 'Ver fotos / Galeria / Tirar foto', completed: false },
];

function Perfil() {
  return <ChecklistBase title="Perfil Ludare" initialTasks={initialTasks} />;
}

export default Perfil; 