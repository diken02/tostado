import { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Coffee, X, ChevronRight, Check, CreditCard, Banknote, Smartphone, QrCode, MapPin, Package, ArrowLeft } from 'lucide-react';
import { Producto, Mesa } from '../types';

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  notas: string;
}

interface MenuClienteProps {
  productos: Producto[];
  mesas: Mesa[];
  onPedidoRealizado: (items: ItemCarrito[], tipo: 'local' | 'llevar', mesaId?: string, nombreCliente?: string, metodoPago?: string) => void;
  onVolver: () => void;
}

type Paso = 'menu' | 'carrito' | 'pago' | 'confirmado';

const METODOS_PAGO = [
  { id: 'efectivo', label: 'Efectivo', icon: Banknote },
  { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
  { id: 'billetera', label: 'Billetera Móvil', icon: Smartphone },
  { id: 'qr', label: 'Código QR', icon: QrCode },
] as const;

const EMOJIS_CATEGORIA: Record<string, string> = {
  'Bebidas Calientes': '☕',
  'Bebidas Frías': '🧋',
  'Alimentos': '🥐',
  'Postres': '🍰',
  'Snacks': '🍿',
};

export function MenuCliente({ productos, mesas, onPedidoRealizado, onVolver }: MenuClienteProps) {
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState('');
  const [paso, setPaso] = useState<Paso>('menu');
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null);
  const [notaTemp, setNotaTemp] = useState('');
  const [nombreCliente, setNombreCliente] = useState('');
  const [tipoOrden, setTipoOrden] = useState<'local' | 'llevar'>('local');
  const [mesaSeleccionada, setMesaSeleccionada] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [numeroPedido] = useState(() => Math.floor(Math.random() * 900) + 100);
  const catScrollRef = useRef<HTMLDivElement>(null);

  const categorias = Array.from(new Set(productos.map(p => p.categoria)));

  useEffect(() => {
    if (categorias.length > 0 && !categoriaActiva) {
      setCategoriaActiva(categorias[0]);
    }
  }, [categorias]);

  const productosFiltrados = productos.filter(p => p.disponible && p.categoria === categoriaActiva);

  const totalItems = carrito.reduce((s, i) => s + i.cantidad, 0);
  const totalPrecio = carrito.reduce((s, i) => s + i.producto.precio * i.cantidad, 0);

  const agregarAlCarrito = (producto: Producto, notas = '') => {
    setCarrito(prev => {
      const existente = prev.find(i => i.producto.id === producto.id && i.notas === notas);
      if (existente) {
        return prev.map(i =>
          i.producto.id === producto.id && i.notas === notas
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [...prev, { producto, cantidad: 1, notas }];
    });
  };

  const cambiarCantidad = (productoId: string, delta: number) => {
    setCarrito(prev =>
      prev
        .map(i => i.producto.id === productoId ? { ...i, cantidad: i.cantidad + delta } : i)
        .filter(i => i.cantidad > 0)
    );
  };

  const cantidadEnCarrito = (productoId: string) =>
    carrito.filter(i => i.producto.id === productoId).reduce((s, i) => s + i.cantidad, 0);

  const confirmarPedido = () => {
    onPedidoRealizado(carrito, tipoOrden, mesaSeleccionada || undefined, nombreCliente, metodoPago);
    setPaso('confirmado');
    setCarritoAbierto(false);
  };

  const reiniciar = () => {
    setCarrito([]);
    setPaso('menu');
    setNombreCliente('');
    setMesaSeleccionada('');
    setMetodoPago('efectivo');
  };

  // ── Pantalla de confirmación ────────────────────────────────────────────────
  if (paso === 'confirmado') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <Check className="size-10 text-green-600" strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">¡Pedido Realizado!</h1>
        <p className="text-gray-500 mb-1">Tu número de pedido es</p>
        <div className="text-5xl font-black text-amber-600 mb-6">#{numeroPedido}</div>
        <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-sm border border-amber-100 mb-6 text-left space-y-2">
          {carrito.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-700">{item.cantidad}× {item.producto.nombre}</span>
              <span className="font-medium">${(item.producto.precio * item.cantidad).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-amber-600">${totalPrecio.toFixed(2)}</span>
          </div>
          {tipoOrden === 'local' && mesaSeleccionada && (
            <div className="text-xs text-gray-500 flex items-center gap-1 pt-1">
              <MapPin className="size-3" />
              Mesa {mesas.find(m => m.id === mesaSeleccionada)?.numero} · Pago: {METODOS_PAGO.find(m => m.id === metodoPago)?.label}
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-8">Te avisaremos cuando esté listo 🙌</p>
        <button
          onClick={reiniciar}
          className="w-full max-w-sm bg-amber-600 text-white rounded-2xl py-4 text-base font-semibold shadow-lg active:scale-95 transition-transform"
        >
          Hacer otro pedido
        </button>
      </div>
    );
  }

  // ── Vista del Carrito ───────────────────────────────────────────────────────
  const VistaCarrito = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-4 border-b bg-white sticky top-0">
        <button
          onClick={() => { setCarritoAbierto(false); setPaso('menu'); }}
          className="p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="size-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-bold flex-1">Tu pedido</h2>
        {carrito.length > 0 && (
          <button
            onClick={() => setCarrito([])}
            className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50"
          >
            Vaciar
          </button>
        )}
      </div>

      {carrito.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
          <ShoppingCart className="size-16 mb-4 opacity-30" />
          <p className="font-medium">Tu carrito está vacío</p>
          <p className="text-sm mt-1">Agrega productos del menú</p>
          <button
            onClick={() => { setCarritoAbierto(false); setPaso('menu'); }}
            className="mt-6 bg-amber-600 text-white px-6 py-3 rounded-xl text-sm font-medium active:scale-95 transition-transform"
          >
            Ver menú
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {carrito.map((item, idx) => (
              <div key={idx} className="flex gap-3 bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                <img
                  src={item.producto.imagen}
                  alt={item.producto.nombre}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">{item.producto.nombre}</p>
                  {item.notas && <p className="text-xs text-gray-400 truncate">{item.notas}</p>}
                  <p className="text-amber-600 font-bold text-sm mt-1">${(item.producto.precio * item.cantidad).toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => cambiarCantidad(item.producto.id, -item.cantidad)} className="text-gray-300 hover:text-red-400 transition-colors p-1">
                    <Trash2 className="size-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => cambiarCantidad(item.producto.id, -1)}
                      className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.cantidad}</span>
                    <button
                      onClick={() => cambiarCantidad(item.producto.id, 1)}
                      className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sección de datos del pedido */}
          <div className="px-4 pb-4 pt-3 bg-gray-50 border-t space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tu nombre (opcional)</label>
              <input
                value={nombreCliente}
                onChange={e => setNombreCliente(e.target.value)}
                placeholder="Ej: Ana García"
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo de pedido</label>
              <div className="mt-1 flex gap-2">
                {(['local', 'llevar'] as const).map(tipo => (
                  <button
                    key={tipo}
                    onClick={() => setTipoOrden(tipo)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                      tipoOrden === tipo
                        ? 'border-amber-600 bg-amber-50 text-amber-700'
                        : 'border-gray-200 bg-white text-gray-500'
                    }`}
                  >
                    {tipo === 'local' ? <><MapPin className="size-4" /> En el local</> : <><Package className="size-4" /> Para llevar</>}
                  </button>
                ))}
              </div>
            </div>

            {tipoOrden === 'local' && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mesa</label>
                <div className="mt-1 grid grid-cols-4 gap-2">
                  {mesas.filter(m => m.estado === 'disponible').map(mesa => (
                    <button
                      key={mesa.id}
                      onClick={() => setMesaSeleccionada(mesa.id)}
                      className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all active:scale-95 ${
                        mesaSeleccionada === mesa.id
                          ? 'border-amber-600 bg-amber-50 text-amber-700'
                          : 'border-gray-200 bg-white text-gray-600'
                      }`}
                    >
                      {mesa.numero}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pago</label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {METODOS_PAGO.map(mp => {
                  const Icon = mp.icon;
                  return (
                    <button
                      key={mp.id}
                      onClick={() => setMetodoPago(mp.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm border-2 transition-all active:scale-95 ${
                        metodoPago === mp.id
                          ? 'border-amber-600 bg-amber-50 text-amber-700 font-medium'
                          : 'border-gray-200 bg-white text-gray-500'
                      }`}
                    >
                      <Icon className="size-4 flex-shrink-0" />
                      <span className="truncate">{mp.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-gray-200 mt-1">
              <span className="font-bold text-gray-700">Total</span>
              <span className="text-2xl font-black text-amber-600">${totalPrecio.toFixed(2)}</span>
            </div>

            <button
              onClick={confirmarPedido}
              disabled={tipoOrden === 'local' && !mesaSeleccionada}
              className="w-full bg-amber-600 disabled:bg-gray-300 text-white rounded-2xl py-4 text-base font-bold shadow-lg active:scale-95 transition-all disabled:scale-100"
            >
              {tipoOrden === 'local' && !mesaSeleccionada ? 'Selecciona una mesa' : 'Confirmar pedido →'}
            </button>
          </div>
        </>
      )}
    </div>
  );

  // ── Vista del Detalle de producto ───────────────────────────────────────────
  if (productoDetalle) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="relative">
          <img
            src={productoDetalle.imagen}
            alt={productoDetalle.nombre}
            className="w-full h-56 sm:h-72 object-cover"
          />
          <button
            onClick={() => { setProductoDetalle(null); setNotaTemp(''); }}
            className="absolute top-4 left-4 bg-white/90 backdrop-blur p-2.5 rounded-full shadow-lg active:scale-90 transition-transform"
          >
            <X className="size-5 text-gray-700" />
          </button>
          {cantidadEnCarrito(productoDetalle.id) > 0 && (
            <div className="absolute top-4 right-4 bg-amber-600 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow">
              {cantidadEnCarrito(productoDetalle.id)} en carrito
            </div>
          )}
        </div>
        <div className="flex-1 px-5 py-5 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{productoDetalle.nombre}</h2>
            <p className="text-gray-500 mt-1">{productoDetalle.descripcion}</p>
          </div>
          <div className="text-3xl font-black text-amber-600">${productoDetalle.precio.toFixed(2)}</div>
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-1">Notas especiales (opcional)</label>
            <textarea
              value={notaTemp}
              onChange={e => setNotaTemp(e.target.value)}
              placeholder="Ej: sin azúcar, leche de avena..."
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>
        </div>
        <div className="px-5 pb-8 pt-2">
          <button
            onClick={() => {
              agregarAlCarrito(productoDetalle, notaTemp);
              setProductoDetalle(null);
              setNotaTemp('');
            }}
            className="w-full bg-amber-600 text-white rounded-2xl py-4 text-base font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <ShoppingCart className="size-5" />
            Agregar al pedido · ${productoDetalle.precio.toFixed(2)}
          </button>
        </div>
      </div>
    );
  }

  // ── Vista principal del menú ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white sticky top-0 z-20 shadow-sm">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={onVolver}
            className="p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="size-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="bg-gradient-to-br from-amber-500 to-orange-400 p-1.5 rounded-lg">
              <Coffee className="size-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">Tostado Cafetería</h1>
              <p className="text-xs text-gray-400 leading-tight">Haz tu pedido</p>
            </div>
          </div>
          <button
            onClick={() => setCarritoAbierto(true)}
            className="relative p-2 rounded-xl bg-amber-50 text-amber-700 active:bg-amber-100 transition-colors"
          >
            <ShoppingCart className="size-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-black w-4.5 h-4.5 w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Categorías */}
        <div
          ref={catScrollRef}
          className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${
                categoriaActiva === cat
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{EMOJIS_CATEGORIA[cat] ?? '🍽️'}</span>
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Grid de productos */}
      <main className="flex-1 px-3 py-4 pb-28">
        {productosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 text-gray-400">
            <Coffee className="size-12 mb-3 opacity-30" />
            <p>No hay productos disponibles en esta categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {productosFiltrados.map(producto => {
              const enCarrito = cantidadEnCarrito(producto.id);
              return (
                <div
                  key={producto.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col"
                >
                  <button
                    onClick={() => setProductoDetalle(producto)}
                    className="relative block w-full"
                  >
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="w-full aspect-square object-cover"
                    />
                    {enCarrito > 0 && (
                      <div className="absolute top-2 right-2 bg-amber-600 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow">
                        {enCarrito}
                      </div>
                    )}
                  </button>
                  <div className="p-2.5 flex flex-col flex-1">
                    <button
                      onClick={() => setProductoDetalle(producto)}
                      className="text-left flex-1"
                    >
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-snug line-clamp-2">{producto.nombre}</p>
                      {producto.descripcion && (
                        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 line-clamp-1">{producto.descripcion}</p>
                      )}
                    </button>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-black text-amber-600">${producto.precio.toFixed(2)}</span>
                      {enCarrito === 0 ? (
                        <button
                          onClick={() => agregarAlCarrito(producto)}
                          className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center shadow active:scale-90 transition-transform"
                        >
                          <Plus className="size-4" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => cambiarCantidad(producto.id, -1)}
                            className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="text-sm font-bold w-4 text-center">{enCarrito}</span>
                          <button
                            onClick={() => agregarAlCarrito(producto)}
                            className="w-7 h-7 bg-amber-600 text-white rounded-full flex items-center justify-center active:scale-90 transition-transform"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* FAB carrito fijo al fondo */}
      {totalItems > 0 && !carritoAbierto && (
        <div className="fixed bottom-4 left-4 right-4 z-30">
          <button
            onClick={() => setCarritoAbierto(true)}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-2xl py-4 flex items-center px-5 shadow-2xl active:scale-98 transition-all"
          >
            <span className="bg-amber-500 text-white text-sm font-black w-7 h-7 rounded-full flex items-center justify-center mr-3">
              {totalItems}
            </span>
            <span className="flex-1 text-left font-semibold">Ver mi pedido</span>
            <span className="font-black text-lg">${totalPrecio.toFixed(2)}</span>
            <ChevronRight className="size-5 ml-1" />
          </button>
        </div>
      )}

      {/* Drawer del carrito */}
      {carritoAbierto && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setCarritoAbierto(false)}
          />
          <div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto">
            <VistaCarrito />
          </div>
        </>
      )}
    </div>
  );
}
