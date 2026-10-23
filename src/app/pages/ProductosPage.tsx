import { useApp } from '../context/AppContext';
import { GestionProductos } from '../components/GestionProductos';

export function ProductosPage() {
  const { productos, setProductos } = useApp();
  return <GestionProductos productos={productos} onActualizarProductos={setProductos} />;
}
