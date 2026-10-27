# ☕ Tostado Cafetería

Sistema web integral para administrar las operaciones de una cafetería desde una sola aplicación.

Permite gestionar ventas, pedidos, mesas, productos, inventario, clientes, empleados, proveedores y reportes. Incluye un menú público para clientes y accesos separados para administrador, cajero y barista.

## ✨ Funcionalidades

- Punto de venta (POS) y registro de pagos.
- Menú público de autoservicio para clientes.
- Gestión de mesas, órdenes y estados de preparación.
- Productos, categorías, precios y disponibilidad.
- Inventario, insumos, compras y proveedores.
- Clientes, pedidos y puntos de fidelización.
- Reportes de ventas y productos más vendidos.
- Roles y permisos para administrador, cajero y barista.
- Administración técnica de Django.

## 🛠 Tecnologías

- **Backend:** Python 3.10+ y Django 5
- **Base de datos local:** SQLite
- **Base de datos alternativa:** MySQL o MariaDB
- **Frontend:** HTML, CSS y JavaScript
- **Desarrollo adicional:** React/Vite, Java 17 y JDBC

## 🚀 Inicio rápido

### Requisitos mínimos

Solo necesitas Python 3.10 o una versión posterior. No debes instalar MySQL para la primera ejecución porque el proyecto usa SQLite automáticamente.

En Windows, marca **Add Python to PATH** durante la instalación de Python.

### Windows

1. Descarga el proyecto como ZIP desde GitHub o clona el repositorio:

   ```bash
   git clone https://github.com/diken02/tostado.git
   cd tostado
   ```

2. Haz doble clic en `iniciar_windows.bat`.

Al iniciarse por primera vez, el archivo automático:

- Crea el entorno virtual aislado `.venv`.
- Instala las dependencias dentro de ese entorno.
- Prepara la base SQLite `db.sqlite3`.
- Ejecuta las migraciones y crea las tablas.
- Carga los usuarios, productos y datos de demostración.
- Inicia Django en el puerto `8000`.
- Abre automáticamente el navegador.

### Linux o macOS

```bash
git clone https://github.com/diken02/tostado.git
cd tostado
sh iniciar_linux_mac.sh
```

El iniciador conserva los mismos datos entre ejecuciones; no elimina pedidos ni cambios registrados.

## 🌐 Direcciones locales

Con el servidor iniciado, abre:

| Sección | Dirección |
| --- | --- |
| Inicio de sesión | <http://127.0.0.1:8000/> |
| Menú público | <http://127.0.0.1:8000/menu/> |
| Administración Django | <http://127.0.0.1:8000/django-admin/> |

Para detener el servidor, vuelve a la ventana de la terminal y presiona `Ctrl+C`.

## 👤 Usuarios de demostración

> Los datos de demostración están destinados únicamente a pruebas locales.

| Rol | Usuario | Contraseña |
| --- | --- | --- |
| Administrador | `admin` | `admin123` |
| Cajero | `juan` | `juan123` |
| Barista | `laura` | `laura123` |

## 🗄 Base de datos

La instalación predeterminada utiliza SQLite en `db.sqlite3`. No necesitas crear manualmente la base de datos ni ejecutar scripts de instalación para comenzar.

Para cambiar a MySQL, crea o modifica `.env` con:

```dotenv
DATABASE_ENGINE=mysql
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=tostado_cafeteria
MYSQL_USER=root
MYSQL_PASSWORD=tu_contrasena
```

El usuario de MySQL debe tener permiso para crear bases y tablas. Nunca publiques el archivo `.env` ni sus credenciales.

## 🔧 Comandos manuales

Los iniciadores automatizan estos pasos, pero también puedes ejecutarlos manualmente:

```bash
python -m venv .venv
```

En Windows activa el entorno con:

```bat
.venv\Scripts\activate
```

En Linux o macOS:

```bash
source .venv/bin/activate
```

Después instala, prepara y ejecuta el proyecto:

```bash
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py cargar_demo
python manage.py runserver
```

## ❓ Solución de problemas

| Problema | Solución |
| --- | --- |
| Python no se reconoce | Reinstala Python activando **Add Python to PATH**, o prueba `py -3` en Windows. |
| El puerto `8000` está ocupado | Ejecuta `python manage.py runserver 127.0.0.1:8001`. |
| Falta una dependencia | Ejecuta `python -m pip install -r requirements.txt`. |
| Error de acceso con MySQL | Revisa las credenciales de `.env` y confirma que MySQL esté iniciado. |
| Se desea eliminar la demostración | Ejecuta nuevamente las migraciones o elimina `db.sqlite3` y vuelve a iniciar el proyecto para crear una base limpia. |

## 🔒 Seguridad

- No publiques `.env`, contraseñas, tokens ni claves secretas.
- Cambia o elimina las cuentas demo antes de cualquier uso real.
- Usa el servidor Django integrado solo para desarrollo o una red local de confianza.
- Antes de publicar el proyecto, configura una clave secreta propia, dominio permitido y HTTPS.

## 📚 Documentación adicional

- [Guía técnica de Django](README_DJANGO.md)
- [Guía de despliegue con Render](render.yaml)
- [Instrucciones de entrega](INSTRUCCIONES_ENTREGA.md)
- [Módulo Java/JDBC](jdbc/README.md)
