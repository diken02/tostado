import { createContext, useContext, useState, ReactNode } from 'react';
import {
  productosIniciales, insumosIniciales, mesasIniciales,
  clientesIniciales, empleadosIniciales, proveedoresIniciales,
} from '../data/mockData';
import { Producto, Insumo, Mesa, Cliente, Empleado, Venta, Orden, CompraInsumo } from '../types';
import { toast } from 'sonner';

type EmpleadoConCredenciales = Empleado & { usuario: string; contrasena: string };

interface AppContextValue {
  // Auth
  autenticado: boolean;
  empleadoActual: EmpleadoConCredenciales;
  login: (usuario: string, contrasena: string) => boolean;
  logout: () => void;
  // Data
  productos: Producto[];
  insumos: Insumo[];
  mesas: Mesa[];
  clientes: Cliente[];
  ordenes: Orden[];
  ventas: Venta[];
  empleados: EmpleadoConCredenciales[];
  proveedores: typeof proveedoresIniciales;
  // Handlers
  setProductos: (p: Producto[]) => void;
  setInsumos: (i: Insumo[]) => void;
  setEmpleados: (e: EmpleadoConCredenciales[]) => void;
  setClientes: (c: Cliente[]) => void;
  handleCrearOrden: (orden: Orden) => void;
  handleActualizarMesa: (mesaId: string, estado: Mesa['estado'], ordenId?: string) => void;
  handleActualizarOrden: (ordenId: string, estado: Orden['estado']) => void;
  handleActualizarInsumos: (insumos: Insumo[]) => void;
  handleRegistrarCompra: (compra: CompraInsumo) => void;
  handlePedidoCliente: (items: any[], tipo: 'local' | 'llevar', mesaId?: string, nombreCliente?: string, metodoPago?: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [autenticado, setAutenticado] = useState(false);
  const [empleadoActual, setEmpleadoActual] = useState<EmpleadoConCredenciales>(empleadosIniciales[0]);
  const [empleados, setEmpleados] = useState<EmpleadoConCredenciales[]>(empleadosIniciales);
  const [productos, setProductos] = useState<Producto[]>(productosIniciales);
  const [insumos, setInsumos] = useState<Insumo[]>(insumosIniciales);
  const [mesas, setMesas] = useState<Mesa[]>(mesasIniciales);
  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciales);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);

  const login = (usuario: string, contrasena: string): boolean => {
    const emp = empleados.find(e => e.usuario === usuario && e.contrasena === contrasena && e.activo);
    if (emp) {
      setEmpleadoActual(emp);
      setAutenticado(true);
      return true;
    }
    toast.error('Usuario o contraseña incorrectos');
    return false;
  };

  const logout = () => setAutenticado(false);

  const handleCrearOrden = (orden: Orden) => {
    setOrdenes(prev => [...prev, orden]);
    const venta: Venta = {
      id: Date.now().toString(), ordenId: orden.id, total: orden.total,
      fecha: orden.fecha, empleadoId: orden.empleadoId, clienteId: orden.clienteId,
    };
    setVentas(prev => [...prev, venta]);

    if (orden.clienteId && orden.clienteId !== 'none') {
      const puntos = Math.floor(orden.total * 10);
      setClientes(prev => prev.map(c =>
        c.id === orden.clienteId
          ? { ...c, puntos: c.puntos + puntos, totalCompras: c.totalCompras + orden.total, ultimaVisita: new Date() }
          : c
      ));
    }

    setInsumos(prev => {
      const copia = prev.map(i => ({ ...i }));
      orden.items.forEach(item => {
        item.producto.receta?.forEach(r => {
          const idx = copia.findIndex(i => i.id === r.insumoId);
          if (idx !== -1) copia[idx].cantidad -= r.cantidad * item.cantidad;
        });
      });
      const alerta = copia.filter(i => i.cantidad <= i.nivelMinimo);
      if (alerta.length > 0) toast.warning(`${alerta.length} insumo(s) bajo stock mínimo`);
      return copia;
    });
  };

  const handleActualizarMesa = (mesaId: string, estado: Mesa['estado'], ordenId?: string) =>
    setMesas(prev => prev.map(m => m.id === mesaId ? { ...m, estado, ordenId } : m));

  const handleActualizarOrden = (ordenId: string, estado: Orden['estado']) =>
    setOrdenes(prev => prev.map(o => o.id === ordenId ? { ...o, estado } : o));

  const handleActualizarInsumos = (nuevosInsumos: Insumo[]) => setInsumos(nuevosInsumos);

  const handleRegistrarCompra = (_compra: CompraInsumo) => {};

  const handlePedidoCliente = (items: any[], tipo: 'local' | 'llevar', mesaId?: string, nombreCliente?: string) => {
    const orden: Orden = {
      id: Date.now().toString(),
      items: items.map(i => ({ id: Date.now().toString() + Math.random(), producto: i.producto, cantidad: i.cantidad, descuento: 0, notas: i.notas })),
      tipo, estado: 'pendiente', mesaId, empleadoId: 'cliente',
      descuentoGlobal: 0,
      subtotal: items.reduce((s: number, i: any) => s + i.producto.precio * i.cantidad, 0),
      total: items.reduce((s: number, i: any) => s + i.producto.precio * i.cantidad, 0),
      pagos: [], fecha: new Date(),
      notas: nombreCliente ? `Cliente: ${nombreCliente}` : undefined,
    };
    handleCrearOrden(orden);
    if (mesaId) handleActualizarMesa(mesaId, 'ocupada', orden.id);
  };

  return (
    <AppContext.Provider value={{
      autenticado, empleadoActual, login, logout,
      productos, insumos, mesas, clientes, ordenes, ventas, empleados,
      proveedores: proveedoresIniciales,
      setProductos, setInsumos, setEmpleados, setClientes,
      handleCrearOrden, handleActualizarMesa, handleActualizarOrden,
      handleActualizarInsumos, handleRegistrarCompra, handlePedidoCliente,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
