import { useApp } from '../context/AppContext';
import { GestionClientes } from '../components/GestionClientes';

export function ClientesPage() {
  const { clientes, setClientes } = useApp();
  return <GestionClientes clientes={clientes} onActualizarClientes={setClientes} />;
}
