import ChecklistBase from '../components/ChecklistBase';

const initialTasks = [
  { id: 1, text: 'Email / Senha', completed: false },
  { id: 2, text: 'Ocultar senha', completed: false },
  { id: 3, text: 'Lembrar-me', completed: false },
  { id: 4, text: 'Esqueci minha senha', completed: false },
  { id: 5, text: 'Cadastre-se', completed: false },
  { id: 6, text: 'Entrar', completed: false },
];

function Login() {
  return <ChecklistBase title="Login Ludare" initialTasks={initialTasks} />;
}

export default Login; 