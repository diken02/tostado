import { useApp } from '../context/AppContext';
import { GestionMesas } from '../components/GestionMesas';

export function MesasPage() {
  const { mesas, ordenes, handleActualizarMesa, handleActualizarOrden } = useApp();
  return (
    <GestionMesas
      mesas={mesas}
      ordenes={ordenes}
      onActualizarMesa={handleActualizarMesa}
      onActualizarOrden={handleActualizarOrden}
    />
  );
}
