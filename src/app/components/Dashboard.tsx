import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Venta } from '../types';

interface DashboardProps {
  ventas: Venta[];
  totalClientes: number;
  productosActivos: number;
  insumosAlerta: number;
}

export function Dashboard({ ventas, totalClientes, productosActivos, insumosAlerta }: DashboardProps) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const ventasHoy = ventas.filter(v => {
    const fechaVenta = new Date(v.fecha);
    fechaVenta.setHours(0, 0, 0, 0);
    return fechaVenta.getTime() === hoy.getTime();
  });

  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);

  const ventasAyer = ventas.filter(v => {
    const fechaVenta = new Date(v.fecha);
    fechaVenta.setHours(0, 0, 0, 0);
    return fechaVenta.getTime() === ayer.getTime();
  });

  const totalHoy = ventasHoy.reduce((sum, v) => sum + v.total, 0);
  const totalAyer = ventasAyer.reduce((sum, v) => sum + v.total, 0);
  const diferencia = totalAyer > 0 ? ((totalHoy - totalAyer) / totalAyer) * 100 : 0;

  // Datos para gráficos
  const ventasPorHora = Array.from({ length: 24 }, (_, i) => {
    const ventasHora = ventasHoy.filter(v => new Date(v.fecha).getHours() === i);
    return {
      hora: `${i}:00`,
      ventas: ventasHora.reduce((sum, v) => sum + v.total, 0)
    };
  }).filter(d => d.ventas > 0);

  const ventasUltimos7Dias = Array.from({ length: 7 }, (_, i) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - (6 - i));
    fecha.setHours(0, 0, 0, 0);
    
    const ventasDia = ventas.filter(v => {
      const fv = new Date(v.fecha);
      fv.setHours(0, 0, 0, 0);
      return fv.getTime() === fecha.getTime();
    });

    return {
      dia: fecha.toLocaleDateString('es-ES', { weekday: 'short' }),
      total: ventasDia.reduce((sum, v) => sum + v.total, 0)
    };
  });

  const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl">Dashboard Ejecutivo</h2>
        <p className="text-gray-500">Resumen de métricas clave</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Ventas Hoy</CardTitle>
            <DollarSign className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${totalHoy.toFixed(2)}</div>
            <p className="text-xs flex items-center gap-1 mt-1">
              {diferencia >= 0 ? (
                <>
                  <TrendingUp className="size-3 text-green-600" />
                  <span className="text-green-600">+{diferencia.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="size-3 text-red-600" />
                  <span className="text-red-600">{diferencia.toFixed(1)}%</span>
                </>
              )}
              <span className="text-gray-500">vs ayer</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pedidos Hoy</CardTitle>
            <ShoppingCart className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{ventasHoy.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              Ticket promedio: ${ventasHoy.length > 0 ? (totalHoy / ventasHoy.length).toFixed(2) : '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Clientes</CardTitle>
            <Users className="size-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalClientes}</div>
            <p className="text-xs text-gray-500 mt-1">Clientes registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Alertas Inventario</CardTitle>
            <Package className="size-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{insumosAlerta}</div>
            <p className="text-xs text-gray-500 mt-1">
              {insumosAlerta > 0 ? 'Insumos bajo stock mínimo' : 'Todo en stock'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Hora (Hoy)</CardTitle>
            <CardDescription>Distribución de ventas durante el día</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ventasPorHora}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Bar dataKey="ventas" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendencia Últimos 7 Días</CardTitle>
            <CardDescription>Evolución de ventas diarias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ventasUltimos7Dias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
