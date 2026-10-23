import { useApp } from '../context/AppContext';
import { CentroAdmin } from '../components/CentroAdmin';

export function AdminPage() {
  const { ventas, ordenes, productos, insumos, handleActualizarOrden, setProductos } = useApp();
  return (
    <CentroAdmin
      ventas={ventas}
      ordenes={ordenes}
      productos={productos}
      insumos={insumos}
      onActualizarOrden={handleActualizarOrden}
      onActualizarProductos={setProductos}
    />
  );
}
