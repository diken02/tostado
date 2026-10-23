import { useApp } from '../context/AppContext';
import { POS } from '../components/POS';

export function POSPage() {
  const { productos, mesas, clientes, empleadoActual, handleCrearOrden, handleActualizarMesa } = useApp();
  return (
    <POS
      productos={productos}
      mesas={mesas}
      clientes={clientes}
      empleadoId={empleadoActual.id}
      onCrearOrden={handleCrearOrden}
      onActualizarMesa={handleActualizarMesa}
    />
  );
}
