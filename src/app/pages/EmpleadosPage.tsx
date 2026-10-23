import { useApp } from '../context/AppContext';
import { GestionEmpleados } from '../components/GestionEmpleados';

export function EmpleadosPage() {
  const { empleados, empleadoActual, setEmpleados } = useApp();

  if (empleadoActual.rol !== 'administrador') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <p className="text-lg font-medium">Acceso restringido</p>
        <p className="text-sm mt-1">Solo los administradores pueden ver esta sección.</p>
      </div>
    );
  }

  return <GestionEmpleados empleados={empleados} onActualizarEmpleados={setEmpleados} />;
}
