import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Login } from '../components/Login';
import { useApp } from '../context/AppContext';

export function LoginPage() {
  const { autenticado, login } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (autenticado) navigate('/admin', { replace: true });
  }, [autenticado, navigate]);

  const handleLogin = (usuario: string, contrasena: string) => {
    if (login(usuario, contrasena)) navigate('/admin', { replace: true });
  };

  return (
    <Login
      onLogin={handleLogin}
      onOrdenarSoloCliente={() => navigate('/menu')}
    />
  );
}
