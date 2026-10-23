import { useState } from 'react';
import { UserPlus, Pencil, Trash2, Eye, EyeOff, ShieldCheck, Coffee, CreditCard, X, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Empleado } from '../types';
import { toast } from 'sonner';

interface GestionEmpleadosProps {
  empleados: Empleado[];
  onActualizarEmpleados: (empleados: Empleado[]) => void;
}

const ROL_CONFIG: Record<Empleado['rol'], { label: string; color: string; icon: React.ElementType }> = {
  administrador: { label: 'Administrador', color: 'bg-amber-100 text-amber-800', icon: ShieldCheck },
  cajero:        { label: 'Cajero',         color: 'bg-blue-100 text-blue-700',  icon: CreditCard },
  barista:       { label: 'Barista',        color: 'bg-green-100 text-green-700', icon: Coffee },
};

interface FormEmpleado {
  nombre: string;
  email: string;
  rol: Empleado['rol'];
  usuario: string;
  contrasena: string;
}

const FORM_VACIO: FormEmpleado = { nombre: '', email: '', rol: 'cajero', usuario: '', contrasena: '' };

export function GestionEmpleados({ empleados, onActualizarEmpleados }: GestionEmpleadosProps) {
  const [formulario, setFormulario] = useState<FormEmpleado>(FORM_VACIO);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarPass, setMostrarPass] = useState(false);

  const abrirNuevo = () => {
    setFormulario(FORM_VACIO);
    setEditandoId(null);
    setMostrarForm(true);
    setMostrarPass(false);
  };

  const abrirEditar = (emp: Empleado) => {
    setFormulario({
      nombre:    emp.nombre,
      email:     emp.email,
      rol:       emp.rol,
      usuario:   (emp as any).usuario ?? '',
      contrasena: (emp as any).contrasena ?? '',
    });
    setEditandoId(emp.id);
    setMostrarForm(true);
    setMostrarPass(false);
  };

  const cerrarForm = () => {
    setMostrarForm(false);
    setEditandoId(null);
    setFormulario(FORM_VACIO);
  };

  const guardar = () => {
    if (!formulario.nombre.trim() || !formulario.usuario.trim()) {
      toast.error('Nombre y usuario son obligatorios');
      return;
    }
    if (!editandoId && !formulario.contrasena.trim()) {
      toast.error('La contraseña es obligatoria para cuentas nuevas');
      return;
    }
    const usuarioDuplicado = empleados.find(
      e => (e as any).usuario === formulario.usuario && e.id !== editandoId
    );
    if (usuarioDuplicado) {
      toast.error('Ese nombre de usuario ya existe');
      return;
    }

    if (editandoId) {
      onActualizarEmpleados(empleados.map(e =>
        e.id === editandoId
          ? {
              ...e,
              nombre:     formulario.nombre,
              email:      formulario.email,
              rol:        formulario.rol,
              usuario:    formulario.usuario,
              ...(formulario.contrasena ? { contrasena: formulario.contrasena } : {}),
            }
          : e
      ));
      toast.success('Cuenta actualizada');
    } else {
      const nuevo: Empleado & { usuario: string; contrasena: string } = {
        id:        Date.now().toString(),
        nombre:    formulario.nombre,
        email:     formulario.email,
        rol:       formulario.rol,
        activo:    true,
        usuario:   formulario.usuario,
        contrasena: formulario.contrasena,
      };
      onActualizarEmpleados([...empleados, nuevo]);
      toast.success('Cuenta creada exitosamente');
    }
    cerrarForm();
  };

  const toggleActivo = (id: string) => {
    onActualizarEmpleados(empleados.map(e =>
      e.id === id ? { ...e, activo: !e.activo } : e
    ));
  };

  const eliminar = (id: string) => {
    if (empleados.filter(e => e.activo && e.rol === 'administrador').length === 1) {
      const emp = empleados.find(e => e.id === id);
      if (emp?.rol === 'administrador' && emp?.activo) {
        toast.error('Debe haber al menos un administrador activo');
        return;
      }
    }
    onActualizarEmpleados(empleados.filter(e => e.id !== id));
    toast.success('Cuenta eliminada');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Gestión de Cuentas</h2>
          <p className="text-sm text-gray-500">{empleados.length} cuenta(s) registradas</p>
        </div>
        <button
          onClick={abrirNuevo}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm shadow-amber-200 active:scale-95 transition-all"
        >
          <UserPlus className="size-4" />
          Nueva cuenta
        </button>
      </div>

      {/* Tarjetas de empleados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {empleados.map(emp => {
          const cfg = ROL_CONFIG[emp.rol];
          const Icon = cfg.icon;
          return (
            <Card key={emp.id} className={`transition-all ${!emp.activo ? 'opacity-50' : ''}`}>
              <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="size-5 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{emp.nombre}</p>
                      <p className="text-xs text-gray-400 truncate">{(emp as any).usuario ?? emp.email}</p>
                    </div>
                  </div>
                  <Badge className={`${cfg.color} border-0 text-xs flex-shrink-0`}>{cfg.label}</Badge>
                </div>

                {emp.email && (
                  <p className="text-xs text-gray-400 mb-3 truncate">{emp.email}</p>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActivo(emp.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      emp.activo
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    <Check className="size-3" />
                    {emp.activo ? 'Activo' : 'Inactivo'}
                  </button>
                  <button
                    onClick={() => abrirEditar(emp)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => eliminar(emp.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Resumen por rol */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Resumen por rol</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(ROL_CONFIG) as Empleado['rol'][]).map(rol => {
              const count = empleados.filter(e => e.rol === rol && e.activo).length;
              const cfg = ROL_CONFIG[rol];
              const Icon = cfg.icon;
              return (
                <div key={rol} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${cfg.color}`}>
                  <Icon className="size-4" />
                  <span className="text-sm font-medium">{cfg.label}</span>
                  <span className="text-sm font-black">{count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modal / Drawer de formulario */}
      {mostrarForm && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={cerrarForm} />
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md md:rounded-2xl">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b sticky top-0 bg-white rounded-t-3xl md:rounded-t-2xl">
              <h3 className="font-bold text-gray-800">
                {editandoId ? 'Editar cuenta' : 'Nueva cuenta'}
              </h3>
              <button onClick={cerrarForm} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
                <X className="size-4" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              {/* Nombre */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre completo *</label>
                <input
                  value={formulario.nombre}
                  onChange={e => setFormulario(f => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej: María González"
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Correo electrónico</label>
                <input
                  type="email"
                  value={formulario.email}
                  onChange={e => setFormulario(f => ({ ...f, email: e.target.value }))}
                  placeholder="correo@ejemplo.com"
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
              {/* Rol */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol *</label>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {(Object.keys(ROL_CONFIG) as Empleado['rol'][]).map(rol => {
                    const cfg = ROL_CONFIG[rol];
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={rol}
                        onClick={() => setFormulario(f => ({ ...f, rol }))}
                        className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-medium transition-all ${
                          formulario.rol === rol
                            ? 'border-amber-500 bg-amber-50 text-amber-800'
                            : 'border-gray-200 bg-white text-gray-500'
                        }`}
                      >
                        <Icon className="size-4" />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Usuario */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuario (para iniciar sesión) *</label>
                <input
                  value={formulario.usuario}
                  onChange={e => setFormulario(f => ({ ...f, usuario: e.target.value }))}
                  placeholder="Ej: maria.gonzalez"
                  autoComplete="off"
                  className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
              {/* Contraseña */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Contraseña {editandoId ? '(dejar vacío para no cambiar)' : '*'}
                </label>
                <div className="relative mt-1">
                  <input
                    type={mostrarPass ? 'text' : 'password'}
                    value={formulario.contrasena}
                    onChange={e => setFormulario(f => ({ ...f, contrasena: e.target.value }))}
                    placeholder={editandoId ? '••••••••' : 'Contraseña segura'}
                    autoComplete="new-password"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {mostrarPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 pb-4 flex gap-3">
                <button
                  onClick={cerrarForm}
                  className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardar}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-3 text-sm font-semibold transition-colors active:scale-95"
                >
                  {editandoId ? 'Guardar cambios' : 'Crear cuenta'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
