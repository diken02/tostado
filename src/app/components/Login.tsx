import { useState } from 'react';
import { User, Lock, ShoppingBag, ChevronDown, X, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: (usuario: string, contrasena: string) => void;
  onOrdenarSoloCliente?: () => void;
}

export function Login({ onLogin, onOrdenarSoloCliente }: LoginProps) {
  const [mostrarLoginStaff, setMostrarLoginStaff] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [verPass, setVerPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!usuario || !contrasena) { setError('Ingresa usuario y contraseña'); return; }
    onLogin(usuario, contrasena);
    setError('Credenciales incorrectas. Inténtalo de nuevo.');
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #fdf0d5 0%, #fde9b8 45%, #f8d899 100%)' }}
    >
      {/* Decoración de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-300/25 rounded-full blur-3xl" />
        <div className="absolute bottom-16 -left-16 w-64 h-64 bg-orange-200/25 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-yellow-100/20 rounded-full blur-3xl" />
      </div>

      {/* Contenido central */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-5 py-10">

        {/* Logo y nombre */}
        <div className="flex flex-col items-center gap-4 mb-10 text-center">
          <div className="relative">
            <div className="w-28 h-28 bg-gradient-to-br from-amber-600 to-orange-700 rounded-[2rem] shadow-2xl shadow-amber-400/40 flex items-center justify-center">
              <svg viewBox="0 0 64 64" className="w-16 h-16" fill="none"><path></path><path></path><path d="M22 10 Q24 6 22 2" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/><path></path><path d="M32 10 Q34 6 32 2" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/><path></path><path d="M42 10 Q44 6 42 2" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/><path></path><path d="M14 17 L50 17 L46 50 Q45 55 40 55 L24 55 Q19 55 18 50 Z" fill="white" opacity="0.95"/><ellipse></ellipse><path d="M50 25 Q62 25 62 34 Q62 43 50 43" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.85"/><ellipse></ellipse><ellipse cx="32" cy="57" rx="20" ry="4" fill="white" opacity="0.4"/><ellipse cx="32" cy="23" rx="13" ry="2.5" fill="#b45309" opacity="0.3"/></svg>
            </div>
            <div className="absolute top-2 left-3 w-8 h-4 bg-white/20 rounded-full blur-sm -rotate-12" />
          </div>

          <div>
            <h1
              className="text-5xl font-black tracking-tight text-amber-900 leading-none"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Tostado
            </h1>
            <p className="text-base font-semibold text-amber-700/60 mt-1.5 tracking-[0.22em] uppercase">
              Cafetería
            </p>
          </div>
          <p className="text-amber-700/55 text-sm max-w-[260px] leading-relaxed">
            ¿Qué deseas tomar?
          </p>
        </div>

        {/* CTA principal */}
        {onOrdenarSoloCliente && (
          <button
            onClick={onOrdenarSoloCliente}
            className="w-full max-w-sm bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-3xl py-5 px-8 text-lg font-bold shadow-xl shadow-amber-300/40 active:scale-95 transition-all flex items-center justify-center gap-3 mb-3"
          >
            <ShoppingBag className="size-6" />
            Ver Menú y Ordenar
          </button>
        )}
        <p className="text-amber-600/45 text-xs mb-8">Explora nuestro menú y realiza tu pedido</p>

        {/* Separador */}
        <div className="w-full max-w-sm flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-amber-300/40" />
          <span className="text-xs text-amber-500/50 font-medium px-1">o</span>
          <div className="flex-1 h-px bg-amber-300/40" />
        </div>

        {/* Acceso personal */}
        <div className="w-full max-w-sm">
          {!mostrarLoginStaff ? (
            <button
              onClick={() => setMostrarLoginStaff(true)}
              className="w-full flex items-center justify-center gap-2 text-sm text-amber-700/55 hover:text-amber-900 py-3 rounded-2xl border border-amber-300/50 bg-white/35 backdrop-blur-sm hover:bg-white/55 transition-all"
            >
              <User className="size-4" />
              Acceso del personal
              <ChevronDown className="size-4" />
            </button>
          ) : (
            <div className="bg-white/85 backdrop-blur-md rounded-3xl p-5 shadow-xl border border-amber-100/80">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                    <User className="size-4 text-amber-700" />
                  </div>
                  <p className="text-sm font-bold text-amber-900">Acceso del personal</p>
                </div>
                <button
                  onClick={() => { setMostrarLoginStaff(false); setError(''); setUsuario(''); setContrasena(''); }}
                  className="p-1.5 rounded-xl hover:bg-amber-50 text-amber-400 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-amber-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Usuario"
                    value={usuario}
                    onChange={e => { setUsuario(e.target.value); setError(''); }}
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl border border-amber-200 bg-amber-50/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-amber-300"
                    autoComplete="username"
                    autoFocus
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-amber-400 pointer-events-none" />
                  <input
                    type={verPass ? 'text' : 'password'}
                    placeholder="Contraseña"
                    value={contrasena}
                    onChange={e => { setContrasena(e.target.value); setError(''); }}
                    className="w-full pl-10 pr-11 py-3 text-sm rounded-2xl border border-amber-200 bg-amber-50/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-amber-300"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setVerPass(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-700 transition-colors"
                  >
                    {verPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                {error && (
                  <p className="text-xs text-red-500 text-center bg-red-50 rounded-xl py-2 px-3">{error}</p>
                )}

                <button
                  type="submit"
                  className="w-full bg-amber-700 hover:bg-amber-800 active:scale-95 text-white rounded-2xl py-3 text-sm font-bold shadow-sm shadow-amber-300/30 transition-all"
                >
                  Ingresar al sistema
                </button>

                <p className="text-center text-xs text-amber-400/80 pt-0.5">
                  Demo: <span className="font-mono font-semibold text-amber-600">admin / admin123</span>
                </p>
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="relative text-center pb-6">
        <p className="text-xs text-amber-500/40">© 2026 Tostado Cafetería · Todos los derechos reservados</p>
      </div>
    </div>
  );
}
