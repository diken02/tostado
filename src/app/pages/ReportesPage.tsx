import { useApp } from '../context/AppContext';
import { Reportes } from '../components/Reportes';

export function ReportesPage() {
  const { ventas, ordenes, productos, empleados } = useApp();
  return <Reportes ventas={ventas} ordenes={ordenes} productos={productos} empleados={empleados} />;
}
