import { useState } from 'react';
import { Plus, Gift, Mail, Phone, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { Cliente } from '../types';

interface GestionClientesProps {
  clientes: Cliente[];
  onActualizarClientes: (clientes: Cliente[]) => void;
}

export function GestionClientes({ clientes, onActualizarClientes }: GestionClientesProps) {
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');

  const PUNTOS_POR_DOLLAR = 10;
  const PUNTOS_PRODUCTO_GRATIS = 100;

  const abrirDialogo = (cliente?: Cliente) => {
    if (cliente) {
      setClienteSeleccionado(cliente);
      setNombre(cliente.nombre);
      setTelefono(cliente.telefono);
      setEmail(cliente.email);
    } else {
      setClienteSeleccionado(null);
      setNombre('');
      setTelefono('');
      setEmail('');
    }
    setDialogoAbierto(true);
  };

  const guardarCliente = () => {
    if (!nombre || !telefono) {
      toast.error('Nombre y teléfono son requeridos');
      return;
    }

    if (clienteSeleccionado) {
      onActualizarClientes(
        clientes.map(c =>
          c.id === clienteSeleccionado.id
            ? { ...c, nombre, telefono, email }
            : c
        )
      );
      toast.success('Cliente actualizado');
    } else {
      const nuevoCliente: Cliente = {
        id: Date.now().toString(),
        nombre,
        telefono,
        email,
        puntos: 0,
        totalCompras: 0,
        ultimaVisita: new Date()
      };
      onActualizarClientes([...clientes, nuevoCliente]);
      toast.success('Cliente registrado');
    }

    setDialogoAbierto(false);
  };

  const canjearPuntos = (cliente: Cliente) => {
    if (cliente.puntos < PUNTOS_PRODUCTO_GRATIS) {
      toast.error('Puntos insuficientes para canjear');
      return;
    }

    onActualizarClientes(
      clientes.map(c =>
        c.id === cliente.id
          ? { ...c, puntos: c.puntos - PUNTOS_PRODUCTO_GRATIS }
          : c
      )
    );

    toast.success('¡Puntos canjeados! Producto gratis aplicado');
  };

  const clientesOrdenados = [...clientes].sort((a, b) => b.totalCompras - a.totalCompras);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl">Gestión de Clientes</h2>
          <p className="text-gray-500">CRM y programa de fidelización</p>
        </div>
        <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Plus className="size-4 mr-2" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {clienteSeleccionado ? 'Editar Cliente' : 'Nuevo Cliente'}
              </DialogTitle>
              <DialogDescription>
                Complete la información del cliente
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo *</Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Juan Pérez"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="3001234567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@email.com"
                />
              </div>

              <Button onClick={guardarCliente} className="w-full">
                {clienteSeleccionado ? 'Actualizar' : 'Registrar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Clientes</CardTitle>
            <TrendingUp className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{clientes.length}</div>
            <p className="text-xs text-gray-500">Clientes registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Promedio de Compras</CardTitle>
            <TrendingUp className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              ${clientes.length > 0 
                ? (clientes.reduce((sum, c) => sum + c.totalCompras, 0) / clientes.length).toFixed(2)
                : '0.00'
              }
            </div>
            <p className="text-xs text-gray-500">Por cliente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Puntos Activos</CardTitle>
            <Gift className="size-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {clientes.reduce((sum, c) => sum + c.puntos, 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Puntos totales</p>
          </CardContent>
        </Card>
      </div>

      {/* Programa de fidelidad */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="size-5 text-amber-600" />
            Programa de Fidelidad
          </CardTitle>
          <CardDescription>
            Gana {PUNTOS_POR_DOLLAR} puntos por cada $1 de compra
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Producto gratis:</span>
              <Badge className="bg-amber-600">{PUNTOS_PRODUCTO_GRATIS} puntos</Badge>
            </div>
            <p className="text-xs text-gray-600">
              Los clientes pueden canjear sus puntos por productos seleccionados
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lista de clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Base de Clientes</CardTitle>
          <CardDescription>Ordenados por total de compras</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clientesOrdenados.map((cliente, index) => {
              const progresoPuntos = (cliente.puntos % PUNTOS_PRODUCTO_GRATIS) / PUNTOS_PRODUCTO_GRATIS * 100;
              const puedeCAnjear = cliente.puntos >= PUNTOS_PRODUCTO_GRATIS;

              return (
                <div key={cliente.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p>{cliente.nombre}</p>
                        {index < 3 && (
                          <Badge className="bg-amber-600">Top {index + 1}</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Phone className="size-3" />
                          {cliente.telefono}
                        </div>
                        {cliente.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="size-3" />
                            {cliente.email}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => abrirDialogo(cliente)}
                    >
                      Editar
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Total Compras</p>
                      <p className="text-lg text-green-600">
                        ${cliente.totalCompras.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Última Visita</p>
                      <p className="text-sm">
                        {new Date(cliente.ultimaVisita).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Gift className="size-4 text-amber-600" />
                        Puntos: {cliente.puntos}
                      </span>
                      {puedeCAnjear && (
                        <Button
                          size="sm"
                          onClick={() => canjearPuntos(cliente)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Canjear Producto
                        </Button>
                      )}
                    </div>
                    <Progress value={progresoPuntos} className="h-2" />
                    <p className="text-xs text-gray-500 text-right">
                      {puedeCAnjear 
                        ? `¡Puede canjear ${Math.floor(cliente.puntos / PUNTOS_PRODUCTO_GRATIS)} producto(s)!`
                        : `${PUNTOS_PRODUCTO_GRATIS - (cliente.puntos % PUNTOS_PRODUCTO_GRATIS)} puntos para canjear`
                      }
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}