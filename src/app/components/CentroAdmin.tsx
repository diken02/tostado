import { useState, useRef, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Clock, CheckCircle2,
  ChefHat, Package, AlertTriangle, Plus, Pencil, Trash2, ImagePlus,
  X, Search, LayoutDashboard, RefreshCw, BadgeCheck, Circle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Producto, Insumo, Orden, Venta } from '../types';
import { toast } from 'sonner';

interface CentroAdminProps {
  ventas: Venta[];
  ordenes: Orden[];
  productos: Producto[];
  insumos: Insumo[];
  onActualizarOrden: (id: string, estado: Orden['estado']) => void;
  onActualizarProductos: (productos: Producto[]) => void;
}

type Tab = 'hoy' | 'produccion' | 'stock' | 'productos';

const ESTADO_CONFIG: Record<Orden['estado'], { label: string; color: string; next?: Orden['estado']; nextLabel?: string }> = {
  pendiente:   { label: 'Pendiente',   color: 'bg-yellow-100 text-yellow-700', next: 'preparando', nextLabel: 'Iniciar' },
  preparando:  { label: 'Preparando',  color: 'bg-blue-100 text-blue-700',     next: 'listo',      nextLabel: 'Listo' },
  listo:       { label: 'Listo',       color: 'bg-green-100 text-green-700',   next: 'entregado',  nextLabel: 'Entregar' },
  entregado:   { label: 'Entregado',   color: 'bg-gray-100 text-gray-500' },
  cancelado:   { label: 'Cancelado',   color: 'bg-red-100 text-red-500' },
};

const CATEGORIA_EMOJI: Record<string, string> = {
  'Bebidas Calientes': '☕', 'Bebidas Frías': '🧋', 'Alimentos': '🥐',
  'Repostería': '🍰', 'Snacks': '🍿',
};

interface FormProducto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: string;
  categoria: string;
  imagen: string;
  disponible: boolean;
}

const FORM_VACIO: FormProducto = {
  id: '', nombre: '', descripcion: '', precio: '', categoria: 'Bebidas Calientes', imagen: '', disponible: true,
};

export function CentroAdmin({ ventas, ordenes, productos, insumos, onActualizarOrden, onActualizarProductos }: CentroAdminProps) {
  const [tabActivo, setTabActivo] = useState<Tab>('hoy');
  const [busqueda, setBusqueda] = useState('');
  const [formulario, setFormulario] = useState<FormProducto>(FORM_VACIO);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [imagenPreview, setImagenPreview] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Cálculos del día ────────────────────────────────────────────────────────
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const ayer = new Date(hoy); ayer.setDate(ayer.getDate() - 1);

  const ventasHoy   = ventas.filter(v => { const d = new Date(v.fecha); d.setHours(0,0,0,0); return d.getTime() === hoy.getTime(); });
  const ventasAyer  = ventas.filter(v => { const d = new Date(v.fecha); d.setHours(0,0,0,0); return d.getTime() === ayer.getTime(); });
  const totalHoy    = ventasHoy.reduce((s, v) => s + v.total, 0);
  const totalAyer   = ventasAyer.reduce((s, v) => s + v.total, 0);
  const crecimiento = totalAyer > 0 ? ((totalHoy - totalAyer) / totalAyer) * 100 : 0;
  const ticketProm  = ventasHoy.length > 0 ? totalHoy / ventasHoy.length : 0;

  const ordenesActivas   = ordenes.filter(o => o.estado !== 'entregado' && o.estado !== 'cancelado');
  const ordenesPendientes = ordenes.filter(o => o.estado === 'pendiente').length;
  const ordenesPreparando = ordenes.filter(o => o.estado === 'preparando').length;
  const ordenesListas     = ordenes.filter(o => o.estado === 'listo').length;
  const ordenesEntregadas = ordenes.filter(o => o.estado === 'entregado').length;

  const insumosAlerta = insumos.filter(i => i.cantidad <= i.nivelMinimo);
  const insumosOk     = insumos.filter(i => i.cantidad > i.nivelMinimo);

  // ── Imagen ──────────────────────────────────────────────────────────────────
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagenPreview(url);
    setFormulario(f => ({ ...f, imagen: url }));
  };

  // ── Formulario producto ─────────────────────────────────────────────────────
  const abrirNuevo = () => {
    setFormulario(FORM_VACIO);
    setImagenPreview('');
    setMostrarForm(true);
  };

  const abrirEditar = (p: Producto) => {
    setFormulario({ id: p.id, nombre: p.nombre, descripcion: p.descripcion, precio: String(p.precio), categoria: p.categoria, imagen: p.imagen, disponible: p.disponible });
    setImagenPreview(p.imagen);
    setMostrarForm(true);
  };

  const cerrarForm = () => { setMostrarForm(false); setFormulario(FORM_VACIO); setImagenPreview(''); };

  const guardarProducto = () => {
    if (!formulario.nombre.trim() || !formulario.precio) { toast.error('Nombre y precio son obligatorios'); return; }
    const precio = parseFloat(formulario.precio);
    if (isNaN(precio) || precio <= 0) { toast.error('Precio inválido'); return; }

    if (formulario.id) {
      onActualizarProductos(productos.map(p => p.id === formulario.id ? { ...p, nombre: formulario.nombre, descripcion: formulario.descripcion, precio, categoria: formulario.categoria, imagen: formulario.imagen || p.imagen, disponible: formulario.disponible } : p));
      toast.success('Producto actualizado');
    } else {
      const nuevo: Producto = { id: Date.now().toString(), nombre: formulario.nombre, descripcion: formulario.descripcion, precio, categoria: formulario.categoria, imagen: formulario.imagen || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400', disponible: formulario.disponible };
      onActualizarProductos([...productos, nuevo]);
      toast.success('Producto agregado');
    }
    cerrarForm();
  };

  const toggleDisponible = (id: string) => {
    onActualizarProductos(productos.map(p => p.id === id ? { ...p, disponible: !p.disponible } : p));
  };

  const eliminarProducto = (id: string) => {
    onActualizarProductos(productos.filter(p => p.id !== id));
    toast.success('Producto eliminado');
  };

  const categorias = Array.from(new Set(productos.map(p => p.categoria)));
  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  // ── TABS ────────────────────────────────────────────────────────────────────
  const TABS: { id: Tab; label: string; emoji: string; badge?: number }[] = [
    { id: 'hoy',        label: 'Hoy',        emoji: '📊' },
    { id: 'produccion', label: 'Producción',  emoji: '🍳', badge: ordenesActivas.length },
    { id: 'stock',      label: 'Stock',       emoji: '📦', badge: insumosAlerta.length },
    { id: 'productos',  label: 'Productos',   emoji: '✏️' },
  ];

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">Centro de Administración</h2>
        <p className="text-sm text-gray-500">Gestión en tiempo real del negocio</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTabActivo(t.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all relative ${
              tabActivo === t.id
                ? 'bg-amber-600 text-white shadow-sm shadow-amber-200'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-amber-200 hover:text-amber-600'
            }`}
          >
            <span>{t.emoji}</span>
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className={`text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ${tabActivo === t.id ? 'bg-white text-amber-600' : 'bg-amber-600 text-white'}`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════ TAB: HOY ══════════════════════ */}
      {tabActivo === 'hoy' && (
        <div className="space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-amber-500 font-semibold uppercase tracking-wide">Ingresos hoy</p>
                    <p className="text-2xl font-black text-amber-700 mt-1">${totalHoy.toFixed(2)}</p>
                  </div>
                  <div className="bg-amber-100 p-2 rounded-xl">
                    <DollarSign className="size-4 text-amber-600" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {crecimiento >= 0
                    ? <TrendingUp className="size-3 text-green-500" />
                    : <TrendingDown className="size-3 text-red-500" />}
                  <span className={`text-xs font-medium ${crecimiento >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {crecimiento >= 0 ? '+' : ''}{crecimiento.toFixed(1)}% vs ayer
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-100">
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-blue-400 font-semibold uppercase tracking-wide">Pedidos hoy</p>
                    <p className="text-2xl font-black text-blue-600 mt-1">{ventasHoy.length}</p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-xl">
                    <ShoppingBag className="size-4 text-blue-500" />
                  </div>
                </div>
                <p className="text-xs text-blue-400 mt-2">Ticket prom: <span className="font-semibold">${ticketProm.toFixed(2)}</span></p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-100">
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-yellow-600 font-semibold uppercase tracking-wide">En producción</p>
                    <p className="text-2xl font-black text-yellow-600 mt-1">{ordenesPreparando}</p>
                  </div>
                  <div className="bg-yellow-100 p-2 rounded-xl">
                    <ChefHat className="size-4 text-yellow-600" />
                  </div>
                </div>
                <p className="text-xs text-yellow-500 mt-2">{ordenesPendientes} pendiente(s)</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Entregados</p>
                    <p className="text-2xl font-black text-green-600 mt-1">{ordenesEntregadas}</p>
                  </div>
                  <div className="bg-green-100 p-2 rounded-xl">
                    <BadgeCheck className="size-4 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-green-500 mt-2">{ordenesListas} listo(s) para entregar</p>
              </CardContent>
            </Card>
          </div>

          {/* Resumen de órdenes recientes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Últimas ventas del día</CardTitle>
            </CardHeader>
            <CardContent>
              {ventasHoy.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <LayoutDashboard className="size-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Sin ventas registradas hoy</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {[...ventasHoy].reverse().slice(0, 8).map((v, i) => (
                    <div key={v.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-5 text-right">{i + 1}</span>
                        <div>
                          <p className="text-xs text-gray-500">{new Date(v.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <span className="font-bold text-amber-600 text-sm">${v.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alertas rápidas */}
          {insumosAlerta.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="size-4 text-orange-500" />
                  <p className="text-sm font-semibold text-orange-700">{insumosAlerta.length} insumo(s) bajo stock mínimo</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {insumosAlerta.map(i => (
                    <span key={i.id} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-lg">
                      {i.nombre}: {i.cantidad}{i.unidad}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ══════════════════════ TAB: PRODUCCIÓN ══════════════════════ */}
      {tabActivo === 'produccion' && (
        <div className="space-y-3">
          {ordenesActivas.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center text-gray-400">
                <ChefHat className="size-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium">No hay órdenes activas</p>
                <p className="text-sm mt-1">Las nuevas órdenes aparecerán aquí</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Kanban por estado */}
              {(['pendiente', 'preparando', 'listo'] as Orden['estado'][]).map(estado => {
                const grupo = ordenesActivas.filter(o => o.estado === estado);
                if (grupo.length === 0) return null;
                const cfg = ESTADO_CONFIG[estado];
                return (
                  <div key={estado}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
                      <span className="text-xs text-gray-400">{grupo.length} orden(es)</span>
                    </div>
                    <div className="space-y-3">
                      {grupo.map(orden => (
                        <Card key={orden.id} className={`border-l-4 ${estado === 'pendiente' ? 'border-l-yellow-400' : estado === 'preparando' ? 'border-l-blue-400' : 'border-l-green-400'}`}>
                          <CardContent className="pt-3 pb-3 px-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <p className="text-xs text-gray-500 font-mono">#{orden.id.slice(-4)}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-gray-500 capitalize">{orden.tipo}</span>
                                  {orden.mesaId && <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md">Mesa</span>}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-amber-600">${orden.total.toFixed(2)}</p>
                                <p className="text-xs text-gray-400">{new Date(orden.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            </div>

                            {/* Items */}
                            <div className="space-y-1 mb-3 bg-gray-50 rounded-xl p-2">
                              {orden.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-xs">
                                  <span className="text-gray-700">{item.cantidad}× {item.producto.nombre}</span>
                                  {item.notas && <span className="text-gray-400 italic truncate ml-2">{item.notas}</span>}
                                </div>
                              ))}
                            </div>

                            {/* Botón avanzar estado */}
                            {cfg.next && (
                              <button
                                onClick={() => { onActualizarOrden(orden.id, cfg.next!); toast.success(`Orden marcada como ${ESTADO_CONFIG[cfg.next!].label}`); }}
                                className={`w-full py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                                  estado === 'pendiente' ? 'bg-blue-500 text-white hover:bg-blue-600' :
                                  estado === 'preparando' ? 'bg-green-500 text-white hover:bg-green-600' :
                                  'bg-gray-700 text-white hover:bg-gray-800'
                                }`}
                              >
                                {cfg.nextLabel} →
                              </button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* ══════════════════════ TAB: STOCK ══════════════════════ */}
      {tabActivo === 'stock' && (
        <div className="space-y-4">
          {/* Resumen visual */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-green-50 border-green-100">
              <CardContent className="pt-3 pb-3 px-4 flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-xl"><Circle className="size-4 text-green-500 fill-green-500" /></div>
                <div>
                  <p className="text-xs text-green-600">En buen nivel</p>
                  <p className="text-xl font-black text-green-700">{insumosOk.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-100">
              <CardContent className="pt-3 pb-3 px-4 flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-xl"><AlertTriangle className="size-4 text-red-500" /></div>
                <div>
                  <p className="text-xs text-red-500">Bajo mínimo</p>
                  <p className="text-xl font-black text-red-600">{insumosAlerta.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de insumos */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Inventario de insumos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insumos.map(insumo => {
                const porcentaje = Math.min((insumo.cantidad / (insumo.nivelMinimo * 3)) * 100, 100);
                const enAlerta = insumo.cantidad <= insumo.nivelMinimo;
                const enPeligro = insumo.cantidad <= insumo.nivelMinimo * 0.5;
                return (
                  <div key={insumo.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {enPeligro
                          ? <AlertTriangle className="size-3.5 text-red-500 flex-shrink-0" />
                          : enAlerta
                          ? <AlertTriangle className="size-3.5 text-orange-400 flex-shrink-0" />
                          : <CheckCircle2 className="size-3.5 text-green-500 flex-shrink-0" />}
                        <span className="text-sm font-medium text-gray-700">{insumo.nombre}</span>
                      </div>
                      <span className={`text-xs font-bold ${enPeligro ? 'text-red-600' : enAlerta ? 'text-orange-500' : 'text-gray-500'}`}>
                        {insumo.cantidad} {insumo.unidad}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${enPeligro ? 'bg-red-400' : enAlerta ? 'bg-orange-400' : 'bg-green-400'}`}
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">Mínimo: {insumo.nivelMinimo} {insumo.unidad}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══════════════════════ TAB: PRODUCTOS ══════════════════════ */}
      {tabActivo === 'productos' && (
        <div className="space-y-4">
          {/* Barra de acciones */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar producto..."
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
            <button
              onClick={abrirNuevo}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-all shadow-sm shadow-amber-200"
            >
              <Plus className="size-4" />
              Nuevo
            </button>
          </div>

          {/* Grid de productos */}
          <div className="space-y-2">
            {categorias.map(cat => {
              const grupo = productosFiltrados.filter(p => p.categoria === cat);
              if (grupo.length === 0) return null;
              return (
                <div key={cat}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <span>{CATEGORIA_EMOJI[cat] ?? '🍽️'}</span> {cat}
                  </p>
                  <div className="space-y-2">
                    {grupo.map(p => (
                      <div key={p.id} className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
                        <img
                          src={p.imagen}
                          alt={p.nombre}
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-800 truncate">{p.nombre}</p>
                          <p className="text-xs text-gray-400 truncate">{p.descripcion}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-black text-amber-600 text-sm">${p.precio.toFixed(2)}</span>
                            <button
                              onClick={() => toggleDisponible(p.id)}
                              className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${p.disponible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                            >
                              {p.disponible ? '● Activo' : '○ Inactivo'}
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <button onClick={() => abrirEditar(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <Pencil className="size-3.5" />
                          </button>
                          <button onClick={() => eliminarProducto(p.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════ MODAL PRODUCTO ══════════════════════ */}
      {mostrarForm && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={cerrarForm} />
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg md:rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b sticky top-0 bg-white rounded-t-3xl md:rounded-t-2xl z-10">
              <h3 className="font-bold text-gray-800">{formulario.id ? 'Editar producto' : 'Nuevo producto'}</h3>
              <button onClick={cerrarForm} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"><X className="size-4" /></button>
            </div>

            <div className="px-5 py-4 space-y-4 pb-6">
              {/* Imagen */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Imagen del producto</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="mt-2 relative w-full h-40 rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:bg-amber-100 transition-colors overflow-hidden"
                >
                  {imagenPreview ? (
                    <>
                      <img src={imagenPreview} alt="preview" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-2xl">
                        <div className="bg-white/90 rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                          <RefreshCw className="size-3" /> Cambiar imagen
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <ImagePlus className="size-8 text-amber-300 mb-2" />
                      <p className="text-sm text-amber-500 font-medium">Toca para subir imagen</p>
                      <p className="text-xs text-amber-300 mt-0.5">JPG, PNG, WEBP</p>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                {/* O URL manual */}
                <input
                  value={formulario.imagen.startsWith('blob:') ? '' : formulario.imagen}
                  onChange={e => { setFormulario(f => ({ ...f, imagen: e.target.value })); setImagenPreview(e.target.value); }}
                  placeholder="… o pega una URL de imagen"
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-2 text-xs bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              {/* Nombre */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre *</label>
                <input
                  value={formulario.nombre}
                  onChange={e => setFormulario(f => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej: Café Latte"
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Descripción</label>
                <textarea
                  value={formulario.descripcion}
                  onChange={e => setFormulario(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Describe el producto..."
                  rows={2}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              {/* Precio + Categoría */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Precio *</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formulario.precio}
                      onChange={e => setFormulario(f => ({ ...f, precio: e.target.value }))}
                      placeholder="0.00"
                      className="w-full pl-6 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoría</label>
                  <select
                    value={formulario.categoria}
                    onChange={e => setFormulario(f => ({ ...f, categoria: e.target.value }))}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  >
                    {['Bebidas Calientes', 'Bebidas Frías', 'Alimentos', 'Repostería', 'Snacks'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Disponibilidad */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Disponible para venta</p>
                  <p className="text-xs text-gray-400">Los clientes podrán ordenarlo</p>
                </div>
                <button
                  onClick={() => setFormulario(f => ({ ...f, disponible: !f.disponible }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${formulario.disponible ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${formulario.disponible ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-1">
                <button onClick={cerrarForm} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-3 text-sm font-medium hover:bg-gray-50">
                  Cancelar
                </button>
                <button onClick={guardarProducto} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-3 text-sm font-semibold active:scale-95 transition-all">
                  {formulario.id ? 'Guardar cambios' : 'Agregar producto'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
