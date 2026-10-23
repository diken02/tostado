import { useApp } from '../context/AppContext';
import { Inventario } from '../components/Inventario';

export function InventarioPage() {
  const { insumos, proveedores, handleActualizarInsumos, handleRegistrarCompra } = useApp();
  return (
    <Inventario
      insumos={insumos}
      proveedores={proveedores}
      onActualizarInsumos={handleActualizarInsumos}
      onRegistrarCompra={handleRegistrarCompra}
    />
  );
}
