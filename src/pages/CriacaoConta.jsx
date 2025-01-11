import ChecklistBase from '../components/ChecklistBase';

const initialTasks = [
  { id: 1, text: 'Nome / Sobrenome', completed: false },
  { id: 2, text: 'Data de nascimento', completed: false },
  { id: 3, text: 'Nome de usuário', completed: false },
  { id: 4, text: 'Email', completed: false },
  { id: 5, text: 'Senha', completed: false },
  { id: 6, text: 'Confirmar senha', completed: false },
  { id: 7, text: 'Visualizar senha', completed: false },
  { id: 8, text: 'Cadastre-se', completed: false },
  { id: 9, text: 'Envio de código para confirmação de email', completed: false },
];

function CriacaoConta() {
  return <ChecklistBase title="Criação de Conta Ludare" initialTasks={initialTasks} />;
}

export default CriacaoConta; 