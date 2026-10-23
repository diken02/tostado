import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Mesa, Orden } from '../types';
import { toast } from 'sonner';

interface GestionMesasProps {
  mesas: Mesa[];
  ordenes: Orden[];
  onActualizarMesa: (mesaId: string, estado: Mesa['estado'], ordenId?: string) => void;
  onActualizarOrden: (ordenId: string, estado: Orden['estado']) => void;
}

export function GestionMesas({ mesas, ordenes, onActualizarMesa, onActualizarOrden }: GestionMesasProps) {
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);

  const abrirDetalleMesa = (mesa: Mesa) => {
    setMesaSeleccionada(mesa);
    setDialogoAbierto(true);
  };

  const liberarMesa = (mesa: Mesa) => {
    if (mesa.ordenId) {
      const orden = ordenes.find(o => o.id === mesa.ordenId);
      if (orden && orden.estado !== 'entregado') {
        onActualizarOrden(mesa.ordenId, 'entregado');
      }
    }
    onActualizarMesa(mesa.id, 'disponible');
    setDialogoAbierto(false);
    toast.success(`Mesa ${mesa.numero} liberada`);
  };

  const getEstadoColor = (estado: Mesa['estado']) => {
    switch (estado) {
      case 'disponible':
        return 'bg-green-100 border-green-400 hover:bg-green-200';
      case 'ocupada':
        return 'bg-red-100 border-red-400 hover:bg-red-200';
      case 'reservada':
        return 'bg-yellow-100 border-yellow-400 hover:bg-yellow-200';
      default:
        return 'bg-gray-100 border-gray-400';
    }
  };

  const getEstadoBadge = (estado: Mesa['estado']) => {
    switch (estado) {
      case 'disponible':
        return <Badge className="bg-green-600">Disponible</Badge>;
      case 'ocupada':
        return <Badge className="bg-red-600">Ocupada</Badge>;
      case 'reservada':
        return <Badge className="bg-yellow-600">Reservada</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl">Gestión de Mesas</h2>
        <p className="text-gray-500">Vista del estado de las mesas</p>
      </div>

      {/* Leyenda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-600"></div>
              <span className="text-sm">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-600"></div>
              <span className="text-sm">Ocupada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-600"></div>
              <span className="text-sm">Reservada</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mapa de mesas */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución del Local</CardTitle>
          <CardDescription>Haga clic en una mesa para ver detalles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gray-50 rounded-lg p-6" style={{ minHeight: '400px' }}>
            {mesas.map(mesa => {
              const orden = mesa.ordenId ? ordenes.find(o => o.id === mesa.ordenId) : null;
              return (
                <button
                  key={mesa.id}
                  onClick={() => abrirDetalleMesa(mesa)}
                  className={`absolute border-2 rounded-lg p-4 transition-all ${getEstadoColor(mesa.estado)}`}
                  style={{
                    left: `${mesa.x}px`,
                    top: `${mesa.y}px`,
                    width: mesa.capacidad >= 6 ? '140px' : '100px',
                    height: mesa.capacidad >= 6 ? '100px' : '80px'
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <Users className="size-5 mb-1" />
                    <p>Mesa {mesa.numero}</p>
                    <p className="text-xs text-gray-600">{mesa.capacidad} pers.</p>
                    {orden && (
                      <p className="text-xs mt-1 text-amber-600">
                        ${orden.total.toFixed(2)}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lista de mesas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Mesas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mesas.map(mesa => {
              const orden = mesa.ordenId ? ordenes.find(o => o.id === mesa.ordenId) : null;
              return (
                <div
                  key={mesa.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => abrirDetalleMesa(mesa)}
                >
                  <div className="flex items-center gap-3">
                    <Users className="size-5 text-gray-400" />
                    <div>
                      <p>Mesa {mesa.numero}</p>
                      <p className="text-sm text-gray-500">Capacidad: {mesa.capacidad} personas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {orden && (
                      <span className="text-sm text-gray-600">
                        ${orden.total.toFixed(2)}
                      </span>
                    )}
                    {getEstadoBadge(mesa.estado)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de detalles */}
      <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mesa {mesaSeleccionada?.numero}</DialogTitle>
            <DialogDescription>
              Capacidad: {mesaSeleccionada?.capacidad} personas
            </DialogDescription>
          </DialogHeader>
          {mesaSeleccionada && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span>Estado:</span>
                {getEstadoBadge(mesaSeleccionada.estado)}
              </div>

              {mesaSeleccionada.ordenId && (() => {
                const orden = ordenes.find(o => o.id === mesaSeleccionada.ordenId);
                if (!orden) return null;

                return (
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Orden #{orden.id.slice(-6)}</span>
                      <Badge>{orden.estado}</Badge>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm">Items:</p>
                      {orden.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm text-gray-600">
                          <span>{item.cantidad}× {item.producto.nombre}</span>
                          <span>${(item.producto.precio * item.cantidad).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between pt-3 border-t">
                      <span>Total:</span>
                      <span className="text-lg text-amber-600">${orden.total.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="size-4" />
                      <span>{new Date(orden.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => liberarMesa(mesaSeleccionada)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="size-4 mr-2" />
                        Completar y Liberar
                      </Button>
                    </div>
                  </div>
                );
              })()}

              {mesaSeleccionada.estado === 'disponible' && (
                <p className="text-center text-gray-500 py-4">
                  Mesa disponible para asignar
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
