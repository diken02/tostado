import { useState } from 'react';
import { Calendar, Download, TrendingUp, Award, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Venta, Producto, Orden, Empleado } from '../types';

interface ReportesProps {
  ventas: Venta[];
  ordenes: Orden[];
  productos: Producto[];
  empleados: Empleado[];
}

export function Reportes({ ventas, ordenes, productos, empleados }: ReportesProps) {
  const [periodo, setPeriodo] = useState<'dia' | 'semana' | 'mes'>('dia');

  // Calcular fecha de inicio según período
  const getFechaInicio = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (periodo === 'dia') {
      return hoy;
    } else if (periodo === 'semana') {
      const inicio = new Date(hoy);
      inicio.setDate(inicio.getDate() - 7);
      return inicio;
    } else {
      const inicio = new Date(hoy);
      inicio.setDate(inicio.getDate() - 30);
      return inicio;
    }
  };

  const fechaInicio = getFechaInicio();
  const ventasFiltradas = ventas.filter(v => new Date(v.fecha) >= fechaInicio);

  // Productos más vendidos
  const productosVendidos = new Map<string, { nombre: string; cantidad: number; total: number }>();
  
  ordenes.filter(o => new Date(o.fecha) >= fechaInicio).forEach(orden => {
    orden.items.forEach(item => {
      const existing = productosVendidos.get(item.producto.id);
      if (existing) {
        existing.cantidad += item.cantidad;
        existing.total += item.producto.precio * item.cantidad;
      } else {
        productosVendidos.set(item.producto.id, {
          nombre: item.producto.nombre,
          cantidad: item.cantidad,
          total: item.producto.precio * item.cantidad
        });
      }
    });
  });

  const topProductos = Array.from(productosVendidos.values())
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  // Ventas por hora
  const ventasPorHora = Array.from({ length: 24 }, (_, i) => {
    const ventasHora = ordenes.filter(o => {
      const fecha = new Date(o.fecha);
      return fecha >= fechaInicio && fecha.getHours() === i;
    });
    return {
      hora: `${i}:00`,
      ventas: ventasHora.reduce((sum, o) => sum + o.total, 0),
      cantidad: ventasHora.length
    };
  }).filter(d => d.cantidad > 0);

  // Ventas por empleado
  const ventasPorEmpleado = empleados.map(emp => {
    const ventasEmp = ventasFiltradas.filter(v => v.empleadoId === emp.id);
    return {
      nombre: emp.nombre,
      total: ventasEmp.reduce((sum, v) => sum + v.total, 0),
      cantidad: ventasEmp.length
    };
  }).filter(e => e.cantidad > 0);

  // Ventas por tipo de orden
  const ventasPorTipo = [
    {
      tipo: 'Local',
      total: ordenes.filter(o => new Date(o.fecha) >= fechaInicio && o.tipo === 'local')
        .reduce((sum, o) => sum + o.total, 0)
    },
    {
      tipo: 'Para Llevar',
      total: ordenes.filter(o => new Date(o.fecha) >= fechaInicio && o.tipo === 'llevar')
        .reduce((sum, o) => sum + o.total, 0)
    },
    {
      tipo: 'Delivery',
      total: ordenes.filter(o => new Date(o.fecha) >= fechaInicio && o.tipo === 'delivery')
        .reduce((sum, o) => sum + o.total, 0)
    }
  ].filter(t => t.total > 0);

  const totalVentas = ventasFiltradas.reduce((sum, v) => sum + v.total, 0);
  const ticketPromedio = ventasFiltradas.length > 0 ? totalVentas / ventasFiltradas.length : 0;

  const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'];

  const exportarReporte = () => {
    const data = {
      periodo: periodo,
      totalVentas: totalVentas,
      cantidadOrdenes: ventasFiltradas.length,
      ticketPromedio: ticketPromedio,
      topProductos: topProductos,
      ventasPorEmpleado: ventasPorEmpleado
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${periodo}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl">Reportes y Análisis</h2>
          <p className="text-gray-500">Métricas financieras y de negocio</p>
        </div>
        <div className="flex gap-2">
          <Select value={periodo} onValueChange={(v: any) => setPeriodo(v)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dia">Hoy</SelectItem>
              <SelectItem value="semana">Última Semana</SelectItem>
              <SelectItem value="mes">Último Mes</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportarReporte}>
            <Download className="size-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Ventas Totales</CardTitle>
            <TrendingUp className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${totalVentas.toFixed(2)}</div>
            <p className="text-xs text-gray-500">{ventasFiltradas.length} órdenes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Ticket Promedio</CardTitle>
            <Award className="size-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${ticketPromedio.toFixed(2)}</div>
            <p className="text-xs text-gray-500">Por orden</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Hora Pico</CardTitle>
            <Clock className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {ventasPorHora.length > 0
                ? ventasPorHora.reduce((max, h) => h.ventas > max.ventas ? h : max).hora
                : '-'
              }
            </div>
            <p className="text-xs text-gray-500">Mayor actividad</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <CardDescription>Top 5 productos del período</CardDescription>
          </CardHeader>
          <CardContent>
            {topProductos.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProductos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-20">Sin datos</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ventas por Hora</CardTitle>
            <CardDescription>Distribución durante el día</CardDescription>
          </CardHeader>
          <CardContent>
            {ventasPorHora.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ventasPorHora}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hora" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                  <Line type="monotone" dataKey="ventas" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-20">Sin datos</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ventas por Tipo de Orden</CardTitle>
            <CardDescription>Distribución por canal</CardDescription>
          </CardHeader>
          <CardContent>
            {ventasPorTipo.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ventasPorTipo}
                    dataKey="total"
                    nameKey="tipo"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.tipo}: $${entry.total.toFixed(2)}`}
                  >
                    {ventasPorTipo.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-20">Sin datos</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ventas por Empleado</CardTitle>
            <CardDescription>Desempeño del equipo</CardDescription>
          </CardHeader>
          <CardContent>
            {ventasPorEmpleado.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ventasPorEmpleado}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                  <Bar dataKey="total" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-20">Sin datos</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabla de productos */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Productos</CardTitle>
          <CardDescription>Rendimiento por producto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Producto</th>
                  <th className="px-4 py-2 text-right">Cantidad</th>
                  <th className="px-4 py-2 text-right">Total Ventas</th>
                  <th className="px-4 py-2 text-right">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {topProductos.map((prod, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-3">{prod.nombre}</td>
                    <td className="px-4 py-3 text-right">{prod.cantidad}</td>
                    <td className="px-4 py-3 text-right text-green-600">
                      ${prod.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      ${(prod.total / prod.cantidad).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
