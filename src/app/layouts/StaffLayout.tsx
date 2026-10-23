import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Coffee, LayoutDashboard, ShoppingCart, Utensils, Package,
  Users, BarChart3, LogOut, MoreHorizontal, X, ChevronRight, UserCog,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
}

const MENU_ITEMS: MenuItem[] = [
  { path: '/admin',      label: 'Admin',           icon: LayoutDashboard, roles: ['administrador'] },
  { path: '/pos',        label: 'Punto de Venta',  icon: ShoppingCart,    roles: ['administrador', 'cajero'] },
  { path: '/mesas',      label: 'Mesas',           icon: Utensils,        roles: ['administrador', 'cajero', 'barista'] },
  { path: '/productos',  label: 'Productos',       icon: Coffee,          roles: ['administrador'] },
  { path: '/inventario', label: 'Inventario',      icon: Package,         roles: ['administrador'] },
  { path: '/clientes',   label: 'Clientes',        icon: Users,           roles: ['administrador', 'cajero'] },
  { path: '/reportes',   label: 'Reportes',        icon: BarChart3,       roles: ['administrador'] },
  { path: '/empleados',  label: 'Cuentas',         icon: UserCog,         roles: ['administrador'] },
];

const BOTTOM_PATHS = ['/admin', '/pos', '/mesas', '/clientes'];
const MAS_PATHS    = ['/productos', '/inventario', '/reportes', '/empleados'];

export function StaffLayout() {
  const { autenticado, empleadoActual, insumos, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuMasAbierto, setMenuMasAbierto] = useState(false);

  useEffect(() => {
    if (!autenticado) navigate('/', { replace: true });
  }, [autenticado, navigate]);

  if (!autenticado) return null;

  const menuFiltrado   = MENU_ITEMS.filter(item => item.roles.includes(empleadoActual.rol));
  const bottomItems    = menuFiltrado.filter(item => BOTTOM_PATHS.includes(item.path));
  const masItems       = menuFiltrado.filter(item => MAS_PATHS.includes(item.path));
  const insumosAlerta  = insumos.filter(i => i.cantidad <= i.nivelMinimo).length;
  const currentPath    = location.pathname;

  const handleLogout = () => { logout(); navigate('/'); };
  const handleNav    = (path: string) => { navigate(path); setMenuMasAbierto(false); };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#fdf6ed' }}>
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-amber-100 sticky top-0 z-20 shadow-sm">
        <div className="px-3 sm:px-6 py-2 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-amber-600 to-orange-700 p-1.5 rounded-xl shadow-sm">
              <Coffee className="size-5 text-white" />
            </div>
            <div>
              <h1
                className="text-base font-black text-amber-900 leading-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Tostado
              </h1>
              <p className="text-[10px] text-amber-600/60 leading-tight hidden sm:block tracking-wide">
                {empleadoActual.nombre} · {empleadoActual.rol.charAt(0).toUpperCase() + empleadoActual.rol.slice(1)}
              </p>
            </div>
          </Link>

          <span className="text-sm font-medium text-gray-600 sm:hidden">
            {menuFiltrado.find(m => m.path === currentPath)?.label}
          </span>

          {/* Nav desktop */}
          <nav className="hidden md:flex gap-1 items-center">
            {menuFiltrado.map(item => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
                    isActive ? 'bg-amber-50 text-amber-700 font-medium' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="size-3.5" />
                  {item.label}
                  {item.path === '/inventario' && insumosAlerta > 0 && (
                    <span className="bg-red-500 text-white text-xs px-1 py-0.5 rounded-full leading-none">{insumosAlerta}</span>
                  )}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="size-3.5" />
              <span className="hidden lg:inline">Salir</span>
            </button>
          </nav>

          <button onClick={handleLogout} className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 px-3 sm:px-4 md:px-6 py-4 pb-24 md:pb-6 max-w-screen-xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Barra inferior móvil */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-stretch">
          {bottomItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors active:bg-gray-100 ${
                  isActive ? 'text-amber-600' : 'text-gray-400'
                }`}
              >
                <Icon className="size-5" />
                <span className="text-[10px] font-medium leading-tight">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}

          {masItems.length > 0 && (
            <button
              onClick={() => setMenuMasAbierto(true)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors active:bg-gray-100 ${
                masItems.some(m => m.path === currentPath) ? 'text-amber-600' : 'text-gray-400'
              }`}
            >
              <div className="relative">
                <MoreHorizontal className="size-5" />
                {insumosAlerta > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                    {insumosAlerta}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-tight">Más</span>
            </button>
          )}
        </div>
      </nav>

      {/* Sheet "Más" */}
      {menuMasAbierto && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/40 z-30" onClick={() => setMenuMasAbierto(false)} />
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-2xl shadow-2xl">
            <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b">
              <h2 className="text-sm font-semibold text-gray-700">Más opciones</h2>
              <button onClick={() => setMenuMasAbierto(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                <X className="size-4" />
              </button>
            </div>
            <div className="p-3 space-y-1">
              {masItems.map(item => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive ? 'bg-amber-50 text-amber-700' : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                    }`}
                  >
                    <Icon className="size-5" />
                    <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                    {item.path === '/inventario' && insumosAlerta > 0 && (
                      <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{insumosAlerta}</span>
                    )}
                    <ChevronRight className="size-4 text-gray-400" />
                  </button>
                );
              })}
              <div className="pt-1 border-t mt-2">
                <button
                  onClick={() => { setMenuMasAbierto(false); handleLogout(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="size-5" />
                  <span className="text-sm font-medium">Cerrar sesión</span>
                </button>
              </div>
            </div>
            <div className="pb-2" />
          </div>
        </>
      )}
    </div>
  );
}
