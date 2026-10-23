import { useState } from 'react';
import { Plus, Pencil, AlertTriangle, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Insumo, Proveedor, CompraInsumo } from '../types';

interface InventarioProps {
  insumos: Insumo[];
  proveedores: Proveedor[];
  onActualizarInsumos: (insumos: Insumo[]) => void;
  onRegistrarCompra: (compra: CompraInsumo) => void;
}

export function Inventario({ insumos, proveedores, onActualizarInsumos, onRegistrarCompra }: InventarioProps) {
  const [dialogoCompra, setDialogoCompra] = useState(false);
  const [dialogoEditar, setDialogoEditar] = useState(false);
  const [insumoSeleccionado, setInsumoSeleccionado] = useState<Insumo | null>(null);
  
  // Form estados
  const [proveedorId, setProveedorId] = useState('');
  const [insumoId, setInsumoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [costoUnitario, setCostoUnitario] = useState('');
  const [nivelMinimo, setNivelMinimo] = useState('');

  const insumosConAlerta = insumos.filter(i => i.cantidad <= i.nivelMinimo);

  const abrirDialogoEditar = (insumo: Insumo) => {
    setInsumoSeleccionado(insumo);
    setNivelMinimo(insumo.nivelMinimo.toString());
    setDialogoEditar(true);
  };

  const actualizarNivelMinimo = () => {
    if (!insumoSeleccionado) return;

    const nivel = Number(nivelMinimo);
    if (nivel < 0) {
      toast.error('El nivel mínimo debe ser positivo');
      return;
    }

    onActualizarInsumos(
      insumos.map(i => 
        i.id === insumoSeleccionado.id 
          ? { ...i, nivelMinimo: nivel }
          : i
      )
    );

    toast.success('Nivel mínimo actualizado');
    setDialogoEditar(false);
    setInsumoSeleccionado(null);
  };

  const registrarCompra = () => {
    if (!proveedorId || !insumoId || !cantidad || !costoUnitario) {
      toast.error('Complete todos los campos');
      return;
    }

    const cant = Number(cantidad);
    const costo = Number(costoUnitario);

    if (cant <= 0 || costo <= 0) {
      toast.error('Cantidad y costo deben ser positivos');
      return;
    }

    const compra: CompraInsumo = {
      id: Date.now().toString(),
      proveedorId,
      insumoId,
      cantidad: cant,
      costoUnitario: costo,
      total: cant * costo,
      fecha: new Date()
    };

    onRegistrarCompra(compra);

    // Actualizar inventario
    onActualizarInsumos(
      insumos.map(i =>
        i.id === insumoId
          ? { ...i, cantidad: i.cantidad + cant, costo }
          : i
      )
    );

    toast.success('Compra registrada e inventario actualizado');
    setDialogoCompra(false);
    setProveedorId('');
    setInsumoId('');
    setCantidad('');
    setCostoUnitario('');
  };

  const calcularPorcentaje = (insumo: Insumo) => {
    const max = insumo.nivelMinimo * 3;
    return Math.min((insumo.cantidad / max) * 100, 100);
  };

  const getColorNivel = (insumo: Insumo) => {
    if (insumo.cantidad <= insumo.nivelMinimo) return 'text-red-600';
    if (insumo.cantidad <= insumo.nivelMinimo * 1.5) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl">Gestión de Inventario</h2>
          <p className="text-gray-500">Control de stock e insumos</p>
        </div>
        <Dialog open={dialogoCompra} onOpenChange={setDialogoCompra}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Plus className="size-4 mr-2" />
              Registrar Compra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Compra de Insumos</DialogTitle>
              <DialogDescription>
                Ingrese los detalles de la compra
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Proveedor</Label>
                <Select value={proveedorId} onValueChange={setProveedorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedores.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Insumo</Label>
                <Select value={insumoId} onValueChange={setInsumoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione insumo" />
                  </SelectTrigger>
                  <SelectContent>
                    {insumos.map(i => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.nombre} ({i.unidad})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label>Costo Unitario</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={costoUnitario}
                  onChange={(e) => setCostoUnitario(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              {cantidad && costoUnitario && (
                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="text-lg">
                      ${(Number(cantidad) * Number(costoUnitario)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <Button onClick={registrarCompra} className="w-full">
                Registrar Compra
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alertas */}
      {insumosConAlerta.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="size-5" />
              Alertas de Inventario
            </CardTitle>
            <CardDescription>
              {insumosConAlerta.length} insumo(s) por debajo del nivel mínimo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insumosConAlerta.map(insumo => (
                <div key={insumo.id} className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="text-sm">{insumo.nombre}</span>
                  <Badge variant="destructive">
                    {insumo.cantidad} {insumo.unidad}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de insumos */}
      <Card>
        <CardHeader>
          <CardTitle>Stock de Insumos</CardTitle>
          <CardDescription>Estado actual del inventario</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insumos.map(insumo => (
              <div key={insumo.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="size-5 text-gray-400" />
                    <div>
                      <p>{insumo.nombre}</p>
                      <p className="text-sm text-gray-500">
                        Costo unitario: ${insumo.costo.toFixed(2)}/{insumo.unidad}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => abrirDialogoEditar(insumo)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Stock actual</span>
                    <span className={getColorNivel(insumo)}>
                      {insumo.cantidad} {insumo.unidad}
                    </span>
                  </div>
                  <Progress value={calcularPorcentaje(insumo)} />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Mínimo: {insumo.nivelMinimo} {insumo.unidad}</span>
                    <span>
                      {insumo.cantidad <= insumo.nivelMinimo 
                        ? '¡Reabastecer!'
                        : insumo.cantidad <= insumo.nivelMinimo * 1.5
                        ? 'Nivel bajo'
                        : 'Stock suficiente'
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Diálogo editar */}
      <Dialog open={dialogoEditar} onOpenChange={setDialogoEditar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar {insumoSeleccionado?.nombre}</DialogTitle>
            <DialogDescription>
              Ajuste el nivel mínimo de stock
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nivel Mínimo ({insumoSeleccionado?.unidad})</Label>
              <Input
                type="number"
                step="0.01"
                value={nivelMinimo}
                onChange={(e) => setNivelMinimo(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Stock actual: {insumoSeleccionado?.cantidad} {insumoSeleccionado?.unidad}
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={actualizarNivelMinimo} className="flex-1">
                Guardar
              </Button>
              <Button 
                onClick={() => setDialogoEditar(false)} 
                variant="outline" 
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}