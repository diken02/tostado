import { useNavigate } from 'react-router-dom';
import { MenuCliente } from '../components/MenuCliente';
import { useApp } from '../context/AppContext';

export function MenuClientePage() {
  const { productos, mesas, handlePedidoCliente } = useApp();
  const navigate = useNavigate();

  return (
    <MenuCliente
      productos={productos}
      mesas={mesas}
      onPedidoRealizado={handlePedidoCliente}
      onVolver={() => navigate('/')}
    />
  );
}
