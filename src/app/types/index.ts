// Tipos de datos del sistema

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen: string;
  disponible: boolean;
  receta?: RecetaItem[];
}

export interface RecetaItem {
  insumoId: string;
  cantidad: number;
}

export interface Insumo {
  id: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  nivelMinimo: number;
  costo: number;
}

export interface ItemOrden {
  id: string;
  producto: Producto;
  cantidad: number;
  descuento: number;
  notas?: string;
}

export interface Orden {
  id: string;
  items: ItemOrden[];
  tipo: 'local' | 'llevar' | 'delivery';
  estado: 'pendiente' | 'preparando' | 'listo' | 'entregado' | 'cancelado';
  mesaId?: string;
  clienteId?: string;
  empleadoId: string;
  descuentoGlobal: number;
  subtotal: number;
  total: number;
  pagos: Pago[];
  fecha: Date;
  notas?: string;
}

export interface Pago {
  id: string;
  metodo: 'efectivo' | 'tarjeta' | 'billetera' | 'qr';
  monto: number;
  cambio?: number;
}

export interface Mesa {
  id: string;
  numero: number;
  capacidad: number;
  estado: 'disponible' | 'ocupada' | 'reservada';
  ordenId?: string;
  x: number;
  y: number;
}

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  puntos: number;
  totalCompras: number;
  ultimaVisita: Date;
}

export interface Empleado {
  id: string;
  nombre: string;
  rol: 'administrador' | 'cajero' | 'barista';
  email: string;
  activo: boolean;
}

export interface Turno {
  id: string;
  empleadoId: string;
  inicio: Date;
  fin?: Date;
}

export interface Venta {
  id: string;
  ordenId: string;
  total: number;
  fecha: Date;
  empleadoId: string;
  clienteId?: string;
}

export interface Proveedor {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
}

export interface CompraInsumo {
  id: string;
  proveedorId: string;
  insumoId: string;
  cantidad: number;
  costoUnitario: number;
  total: number;
  fecha: Date;
}
