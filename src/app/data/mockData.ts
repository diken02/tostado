import { Producto, Insumo, Mesa, Cliente, Empleado, Proveedor } from '../types';

export const insumosIniciales: Insumo[] = [
  { id: '1', nombre: 'Café en Grano', cantidad: 5000, unidad: 'g', nivelMinimo: 1000, costo: 0.015 },
  { id: '2', nombre: 'Leche', cantidad: 20, unidad: 'L', nivelMinimo: 5, costo: 1.2 },
  { id: '3', nombre: 'Azúcar', cantidad: 3000, unidad: 'g', nivelMinimo: 500, costo: 0.002 },
  { id: '4', nombre: 'Vasos Papel 8oz', cantidad: 500, unidad: 'unidad', nivelMinimo: 100, costo: 0.15 },
  { id: '5', nombre: 'Vasos Papel 12oz', cantidad: 400, unidad: 'unidad', nivelMinimo: 100, costo: 0.20 },
  { id: '6', nombre: 'Chocolate en Polvo', cantidad: 1000, unidad: 'g', nivelMinimo: 200, costo: 0.01 },
  { id: '7', nombre: 'Té Verde', cantidad: 200, unidad: 'bolsitas', nivelMinimo: 50, costo: 0.30 },
  { id: '8', nombre: 'Croissants', cantidad: 50, unidad: 'unidad', nivelMinimo: 10, costo: 0.80 },
  { id: '9', nombre: 'Pan Sandwich', cantidad: 30, unidad: 'unidad', nivelMinimo: 10, costo: 1.50 },
  { id: '10', nombre: 'Jamón', cantidad: 500, unidad: 'g', nivelMinimo: 100, costo: 0.012 },
];

export const productosIniciales: Producto[] = [
  {
    id: '1',
    nombre: 'Café Americano',
    descripcion: 'Café negro tradicional',
    precio: 2.50,
    categoria: 'Bebidas Calientes',
    imagen: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc3ByZXNzbyUyMGNvZmZlZXxlbnwxfHx8fDE3NjYwNTYwOTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    disponible: true,
    receta: [
      { insumoId: '1', cantidad: 18 },
      { insumoId: '4', cantidad: 1 }
    ]
  },
  {
    id: '2',
    nombre: 'Café Latte',
    descripcion: 'Espresso con leche vaporizada',
    precio: 3.50,
    categoria: 'Bebidas Calientes',
    imagen: 'https://images.unsplash.com/photo-1529892485617-25f63cd7b1e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXR0ZSUyMGFydHxlbnwxfHx8fDE3NjYwMzE0Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    disponible: true,
    receta: [
      { insumoId: '1', cantidad: 18 },
      { insumoId: '2', cantidad: 0.25 },
      { insumoId: '5', cantidad: 1 }
    ]
  },
  {
    id: '3',
    nombre: 'Cappuccino',
    descripcion: 'Espresso con leche y espuma',
    precio: 3.75,
    categoria: 'Bebidas Calientes',
    imagen: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc3ByZXNzbyUyMGNvZmZlZXxlbnwxfHx8fDE3NjYwNTYwOTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    disponible: true,
    receta: [
      { insumoId: '1', cantidad: 18 },
      { insumoId: '2', cantidad: 0.20 },
      { insumoId: '5', cantidad: 1 }
    ]
  },
  {
    id: '4',
    nombre: 'Té Verde',
    descripcion: 'Infusión de té verde',
    precio: 2.00,
    categoria: 'Bebidas Calientes',
    imagen: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc3ByZXNzbyUyMGNvZmZlZXxlbnwxfHx8fDE3NjYwNTYwOTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    disponible: true,
    receta: [
      { insumoId: '7', cantidad: 1 },
      { insumoId: '4', cantidad: 1 }
    ]
  },
  {
    id: '5',
    nombre: 'Frappé de Chocolate',
    descripcion: 'Bebida fría con chocolate',
    precio: 4.50,
    categoria: 'Bebidas Frías',
    imagen: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGp1aWNlfGVufDF8fHx8MTc2NjA4OTkxMnww&ixlib=rb-4.1.0&q=80&w=1080',
    disponible: true,
    receta: [
      { insumoId: '2', cantidad: 0.30 },
      { insumoId: '6', cantidad: 30 },
      { insumoId: '5', cantidad: 1 }
    ]
  },
  {
    id: '6',
    nombre: 'Jugo Natural',
    descripcion: 'Jugo de fruta natural',
    precio: 3.00,
    categoria: 'Bebidas Frías',
    imagen: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGp1aWNlfGVufDF8fHx8MTc2NjA4OTkxMnww&ixlib=rb-4.1.0&q=80&w=1080',
    disponible: true
  },
  {
    id: '7',
    nombre: 'Croissant',
    descripcion: 'Croissant de mantequilla',
    precio: 2.50,
    categoria: 'Repostería',
    imagen: 'https://images.unsplash.com/photo-1712723247648-64a03ba7c333?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm9pc3NhbnQlMjBwYXN0cnl8ZW58MXx8fHwxNzY2MDUzOTA2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    disponible: true,
    receta: [
      { insumoId: '8', cantidad: 1 }
    ]
  },
  {
    id: '8',
    nombre: 'Muffin de Arándanos',
    descripcion: 'Muffin casero con arándanos',
    precio: 2.75,
    categoria: 'Repostería',
    imagen: 'https://images.unsplash.com/photo-1712723247648-64a03ba7c333?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm9pc3NhbnQlMjBwYXN0cnl8ZW58MXx8fHwxNzY2MDUzOTA2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    disponible: true
  },
  {
    id: '9',
    nombre: 'Sandwich Jamón y Queso',
    descripcion: 'Sandwich caliente',
    precio: 4.00,
    categoria: 'Sándwiches',
    imagen: 'https://images.unsplash.com/photo-1721980743519-01f627e7b4b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW5kd2ljaCUyMGZvb2R8ZW58MXx8fHwxNzY1OTk2NzY1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    disponible: true,
    receta: [
      { insumoId: '9', cantidad: 1 },
      { insumoId: '10', cantidad: 50 }
    ]
  },
  {
    id: '10',
    nombre: 'Tostada con Aguacate',
    descripcion: 'Pan tostado con aguacate',
    precio: 3.50,
    categoria: 'Sándwiches',
    imagen: 'https://images.unsplash.com/photo-1721980743519-01f627e7b4b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW5kd2ljaCUyMGZvb2R8ZW58MXx8fHwxNzY1OTk2NzY1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    disponible: true
  }
];

export const mesasIniciales: Mesa[] = [
  { id: '1', numero: 1, capacidad: 2, estado: 'disponible', x: 20, y: 20 },
  { id: '2', numero: 2, capacidad: 2, estado: 'disponible', x: 180, y: 20 },
  { id: '3', numero: 3, capacidad: 4, estado: 'disponible', x: 20, y: 120 },
  { id: '4', numero: 4, capacidad: 4, estado: 'disponible', x: 180, y: 120 },
  { id: '5', numero: 5, capacidad: 6, estado: 'disponible', x: 20, y: 220 },
  { id: '6', numero: 6, capacidad: 6, estado: 'disponible', x: 180, y: 220 },
  { id: '7', numero: 7, capacidad: 2, estado: 'disponible', x: 340, y: 20 },
  { id: '8', numero: 8, capacidad: 2, estado: 'disponible', x: 340, y: 120 },
];

export const clientesIniciales: Cliente[] = [
  {
    id: '1',
    nombre: 'María González',
    telefono: '3001234567',
    email: 'maria@email.com',
    puntos: 150,
    totalCompras: 250.50,
    ultimaVisita: new Date('2024-12-18')
  },
  {
    id: '2',
    nombre: 'Carlos Rodríguez',
    telefono: '3009876543',
    email: 'carlos@email.com',
    puntos: 85,
    totalCompras: 175.00,
    ultimaVisita: new Date('2024-12-17')
  },
  {
    id: '3',
    nombre: 'Ana Martínez',
    telefono: '3005551234',
    email: 'ana@email.com',
    puntos: 220,
    totalCompras: 450.75,
    ultimaVisita: new Date('2024-12-19')
  }
];

export const empleadosIniciales: (Empleado & { usuario: string; contrasena: string })[] = [
  {
    id: '1',
    nombre: 'Admin Principal',
    rol: 'administrador',
    email: 'admin@cafeteria.com',
    activo: true,
    usuario: 'admin',
    contrasena: 'admin123',
  },
  {
    id: '2',
    nombre: 'Juan Pérez',
    rol: 'cajero',
    email: 'juan@cafeteria.com',
    activo: true,
    usuario: 'juan',
    contrasena: 'juan123',
  },
  {
    id: '3',
    nombre: 'Laura Silva',
    rol: 'barista',
    email: 'laura@cafeteria.com',
    activo: true,
    usuario: 'laura',
    contrasena: 'laura123',
  },
];

export const proveedoresIniciales: Proveedor[] = [
  {
    id: '1',
    nombre: 'Café Premium S.A.',
    contacto: 'Roberto Gómez',
    telefono: '6012345678',
    email: 'ventas@cafepremium.com'
  },
  {
    id: '2',
    nombre: 'Lácteos del Valle',
    contacto: 'Sandra López',
    telefono: '6019876543',
    email: 'pedidos@lacteosval.com'
  },
  {
    id: '3',
    nombre: 'Panadería Artesanal',
    contacto: 'Miguel Ángel',
    telefono: '6015551234',
    email: 'info@panartesanal.com'
  }
];
