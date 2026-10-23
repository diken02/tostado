import { useState } from 'react';
import { Plus, Minus, Trash2, Tag, CreditCard, ShoppingCart, UtensilsCrossed } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Producto, ItemOrden, Mesa, Cliente, Orden, Pago } from '../types';

interface POSProps {
  productos: Producto[];
  mesas: Mesa[];
  clientes: Cliente[];
  empleadoId: string;
  onCrearOrden: (orden: Orden) => void;
  onActualizarMesa: (mesaId: string, estado: Mesa['estado'], ordenId?: string) => void;
}

export function POS({ productos, mesas, clientes, empleadoId, onCrearOrden, onActualizarMesa }: POSProps) {
  const [items, setItems] = useState<ItemOrden[]>([]);
  const [tipoOrden, setTipoOrden] = useState<'local' | 'llevar' | 'delivery'>('local');
  const [mesaSeleccionada, setMesaSeleccionada] = useState<string>('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>('');
  const [descuentoGlobal, setDescuentoGlobal] = useState(0);
  const [dialogoPago, setDialogoPago] = useState(false);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [montoPago, setMontoPago] = useState('');
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'billetera' | 'qr'>('efectivo');

  const categorias = Array.from(new Set(productos.map(p => p.categoria)));
  const [categoriaActiva, setCategoriaActiva] = useState(categorias[0]);
  const [vistaMovil, setVistaMovil] = useState<'menu' | 'orden'>('menu');

  const agregarProducto = (producto: Producto) => {
    if (!producto.disponible) {
      toast.error('Producto no disponible');
      return;
    }

    const itemExistente = items.find(i => i.producto.id === producto.id);
    
    if (itemExistente) {
      setItems(items.map(i => 
        i.producto.id === producto.id
          ? { ...i, cantidad: i.cantidad + 1 }
          : i
      ));
    } else {
      const nuevoItem: ItemOrden = {
        id: Date.now().toString(),
        producto,
        cantidad: 1,
        descuento: 0
      };
      setItems([...items, nuevoItem]);
    }
  };

  const actualizarCantidad = (itemId: string, cambio: number) => {
    setItems(items.map(i => {
      if (i.id === itemId) {
        const nuevaCantidad = i.cantidad + cambio;
        return nuevaCantidad > 0 ? { ...i, cantidad: nuevaCantidad } : i;
      }
      return i;
    }).filter(i => i.cantidad > 0));
  };

  const aplicarDescuentoItem = (itemId: string, descuento: number) => {
    setItems(items.map(i => 
      i.id === itemId ? { ...i, descuento } : i
    ));
  };

  const eliminarItem = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId));
  };

  const calcularSubtotal = () => {
    return items.reduce((sum, item) => {
      const precioConDescuento = item.producto.precio - item.descuento;
      return sum + (precioConDescuento * item.cantidad);
    }, 0);
  };

  const calcularTotal = () => {
    const subtotal = calcularSubtotal();
    return subtotal - descuentoGlobal;
  };

  const abrirDialogoPago = () => {
    if (items.length === 0) {
      toast.error('Agregue productos a la orden');
      return;
    }
    if (tipoOrden === 'local' && !mesaSeleccionada) {
      toast.error('Seleccione una mesa');
      return;
    }
    setDialogoPago(true);
  };

  const agregarPago = () => {
    const monto = Number(montoPago);
    if (!monto || monto <= 0) {
      toast.error('Ingrese un monto válido');
      return;
    }

    const totalPagado = pagos.reduce((sum, p) => sum + p.monto, 0);
    const faltante = calcularTotal() - totalPagado;

    if (monto > faltante) {
      const cambio = monto - faltante;
      const nuevoPago: Pago = {
        id: Date.now().toString(),
        metodo: metodoPago,
        monto: faltante,
        cambio: metodoPago === 'efectivo' ? cambio : 0
      };
      setPagos([...pagos, nuevoPago]);
      setMontoPago('');
      completarOrden([...pagos, nuevoPago]);
    } else {
      const nuevoPago: Pago = {
        id: Date.now().toString(),
        metodo: metodoPago,
        monto
      };
      setPagos([...pagos, nuevoPago]);
      setMontoPago('');
    }
  };

  const completarOrden = (pagosFinal: Pago[]) => {
    const totalPagado = pagosFinal.reduce((sum, p) => sum + p.monto, 0);
    const total = calcularTotal();

    if (totalPagado >= total) {
      const orden: Orden = {
        id: Date.now().toString(),
        items,
        tipo: tipoOrden,
        estado: 'pendiente',
        mesaId: tipoOrden === 'local' ? mesaSeleccionada : undefined,
        clienteId: clienteSeleccionado && clienteSeleccionado !== 'none' ? clienteSeleccionado : undefined,
        empleadoId,
        descuentoGlobal,
        subtotal: calcularSubtotal(),
        total,
        pagos: pagosFinal,
        fecha: new Date()
      };

      onCrearOrden(orden);

      if (tipoOrden === 'local' && mesaSeleccionada) {
        onActualizarMesa(mesaSeleccionada, 'ocupada', orden.id);
      }

      // Limpiar
      setItems([]);
      setMesaSeleccionada('');
      setClienteSeleccionado('');
      setDescuentoGlobal(0);
      setPagos([]);
      setMontoPago('');
      setDialogoPago(false);

      const cambio = pagosFinal.find(p => p.cambio);
      toast.success(
        cambio 
          ? `Orden completada. Cambio: $${cambio.cambio?.toFixed(2)}`
          : 'Orden completada exitosamente'
      );
    }
  };

  const productosFiltrados = productos.filter(p => p.categoria === categoriaActiva);
  const totalPagado = pagos.reduce((sum, p) => sum + p.monto, 0);
  const faltante = calcularTotal() - totalPagado;

  // Panel de menú (catálogo de productos)
  const PanelMenu = () => (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>Menú</CardTitle>
        <CardDescription className="hidden sm:block">Seleccione productos para la orden</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Tabs value={categoriaActiva} onValueChange={setCategoriaActiva}>
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${categorias.length}, 1fr)` }}>
            {categorias.map(cat => (
              <TabsTrigger key={cat} value={cat} className="text-xs sm:text-sm">
                {cat.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
          {productosFiltrados.map(producto => (
            <button
              key={producto.id}
              onClick={() => {
                agregarProducto(producto);
                // En mobile, mostrar feedback táctil mostrando el carrito brevemente
              }}
              disabled={!producto.disponible}
              className="relative group text-left active:scale-95 transition-transform"
            >
              <div className={`border rounded-lg overflow-hidden transition-all ${
                producto.disponible
                  ? 'hover:shadow-lg hover:border-amber-600 active:border-amber-600'
                  : 'opacity-50'
              }`}>
                <div className="aspect-square bg-gray-100">
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2 sm:p-3">
                  <p className="text-xs sm:text-sm truncate font-medium">{producto.nombre}</p>
                  <p className="text-amber-600 text-sm font-semibold">${producto.precio.toFixed(2)}</p>
                </div>
              </div>
              {!producto.disponible && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Badge variant="destructive" className="text-xs">No disponible</Badge>
                </div>
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // Panel de orden (carrito)
  const PanelOrden = () => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Orden Actual</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Orden</Label>
              <Select value={tipoOrden} onValueChange={(v: any) => setTipoOrden(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Consumir en Local</SelectItem>
                  <SelectItem value="llevar">Para Llevar</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tipoOrden === 'local' && (
              <div className="space-y-2">
                <Label>Mesa</Label>
                <Select value={mesaSeleccionada} onValueChange={setMesaSeleccionada}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione mesa" />
                  </SelectTrigger>
                  <SelectContent>
                    {mesas.filter(m => m.estado === 'disponible').map(mesa => (
                      <SelectItem key={mesa.id} value={mesa.id}>
                        Mesa {mesa.numero} ({mesa.capacidad} personas)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Cliente (Opcional)</Label>
              <Select value={clienteSeleccionado} onValueChange={setClienteSeleccionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin cliente</SelectItem>
                  {clientes.map(cliente => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nombre} - {cliente.puntos} pts
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4 space-y-2">
              {items.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Agregue productos a la orden
                </p>
              ) : (
                <>
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-2 border-b pb-2">
                      <div className="flex-1">
                        <p className="text-sm">{item.producto.nombre}</p>
                        <p className="text-xs text-gray-500">
                          ${(item.producto.precio - item.descuento).toFixed(2)} × {item.cantidad}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => actualizarCantidad(item.id, -1)}
                        >
                          <Minus className="size-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => actualizarCantidad(item.id, 1)}
                        >
                          <Plus className="size-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => eliminarItem(item.id)}
                        >
                          <Trash2 className="size-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${calcularSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Descuento"
                        value={descuentoGlobal || ''}
                        onChange={(e) => setDescuentoGlobal(Number(e.target.value) || 0)}
                        className="text-sm"
                      />
                      <Tag className="size-4 text-gray-400" />
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span>Total:</span>
                      <span className="text-xl text-amber-600">
                        ${calcularTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={abrirDialogoPago}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CreditCard className="size-4 mr-2" />
                    Procesar Pago
                  </Button>
                </>
              )}
            </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      {/* ===== LAYOUT DESKTOP: side by side ===== */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PanelMenu />
        </div>
        <div>
          <PanelOrden />
        </div>
      </div>

      {/* ===== LAYOUT MOBILE: tab switcher ===== */}
      <div className="lg:hidden space-y-0">
        {/* Toggle bar */}
        <div className="flex bg-white border rounded-xl p-1 mb-3 shadow-sm">
          <button
            onClick={() => setVistaMovil('menu')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              vistaMovil === 'menu'
                ? 'bg-amber-600 text-white shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UtensilsCrossed className="size-4" />
            Menú
          </button>
          <button
            onClick={() => setVistaMovil('orden')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
              vistaMovil === 'orden'
                ? 'bg-amber-600 text-white shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShoppingCart className="size-4" />
            Orden
            {items.length > 0 && (
              <span className={`absolute top-1 right-6 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold ${
                vistaMovil === 'orden' ? 'bg-white text-amber-600' : 'bg-amber-600 text-white'
              }`}>
                {items.reduce((s, i) => s + i.cantidad, 0)}
              </span>
            )}
          </button>
        </div>

        {vistaMovil === 'menu' ? <PanelMenu /> : <PanelOrden />}

        {/* FAB: botón flotante "Ver Orden" cuando está en menú y hay items */}
        {vistaMovil === 'menu' && items.length > 0 && (
          <div className="fixed bottom-20 left-0 right-0 px-4 z-10 pointer-events-none">
            <button
              onClick={() => setVistaMovil('orden')}
              className="pointer-events-auto w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-xl py-3.5 flex items-center justify-between px-5 shadow-xl transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <ShoppingCart className="size-4" />
                {items.reduce((s, i) => s + i.cantidad, 0)} productos
              </span>
              <span className="text-base font-bold">${calcularTotal().toFixed(2)}</span>
            </button>
          </div>
        )}
      </div>

      {/* Diálogo de pago */}
      <Dialog open={dialogoPago} onOpenChange={setDialogoPago}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Procesar Pago</DialogTitle>
            <DialogDescription>
              Total a pagar: ${calcularTotal().toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {pagos.length > 0 && (
              <div className="border rounded p-3 space-y-2">
                <p className="text-sm">Pagos registrados:</p>
                {pagos.map(pago => (
                  <div key={pago.id} className="flex justify-between text-sm">
                    <span className="capitalize">{pago.metodo}:</span>
                    <span>${pago.monto.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t">
                  <span>Faltante:</span>
                  <span className="text-red-600">${faltante.toFixed(2)}</span>
                </div>
              </div>
            )}

            {faltante > 0 && (
              <>
                <div className="space-y-2">
                  <Label>Método de Pago</Label>
                  <Select value={metodoPago} onValueChange={(v: any) => setMetodoPago(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                      <SelectItem value="billetera">Billetera Móvil</SelectItem>
                      <SelectItem value="qr">Código QR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Monto</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={montoPago}
                    onChange={(e) => setMontoPago(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <Button onClick={agregarPago} className="w-full">
                  Agregar Pago
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}