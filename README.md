# Tostado Cafetería

Sistema web para administrar las operaciones de una cafetería: ventas en mostrador, mesas, menú para clientes, productos, inventario, compras, clientes, empleados y reportes.

El proyecto está diseñado para probar el funcionamiento completo de una cafetería desde una computadora local o para usarlo como base educativa y de desarrollo. Permite al personal iniciar sesión según su rol y automatiza parte del control operativo mediante recetas, existencias, puntos de fidelización y estados de las órdenes.

**Repositorio:** <https://github.com/diken02/tostado>

## Para qué sirve

- Recibir pedidos desde un menú público de autoservicio.
- Registrar ventas y pagos en un punto de venta (POS).
- Enviar pedidos a preparación y actualizar su estado.
- Administrar mesas, productos, precios y disponibilidad.
- Controlar insumos, niveles mínimos, compras y proveedores.
- Registrar clientes y acumular puntos de compra.
- Generar reportes y consultar los productos más vendidos.
- Separar las funciones de administrador, cajero y barista.

## Funcionalidades

- **Centro de administración:** resumen diario, producción y alertas de inventario.
- **POS:** registro de ventas con descuento automático según las recetas de productos.
- **Mesas y órdenes:** gestión de mesas, pedidos y cambios de estado.
- **Catálogo:** administración de productos, categorías, precios y disponibilidad.
- **Inventario:** control de existencias, movimientos y compras a proveedores.
- **Clientes:** datos, pedidos y puntos de fidelización.
- **Reportes:** ventas, productos más vendidos y actividad del negocio.
- **Empleados:** autenticación, roles y permisos por área.
- **Menú público:** autoservicio para clientes en `/menu/`.
- **Módulo JDBC:** utilidad Java independiente para consultar el catálogo MySQL.

## Tecnologías

- Python 3.10+
- Django 5.2
- MySQL/MariaDB para desarrollo local
- PostgreSQL compatible con despliegues en Render
- HTML, CSS y JavaScript en plantillas del servidor
- React/Vite como referencia del prototipo original en `src/`
- Java 17 + JDBC en `jdbc/`

## Requisitos previos

- Git, si vas a descargar el proyecto desde GitHub.
- Python 3.10 o una versión posterior.
- MySQL 8 o MariaDB 10.6 o posterior, instalado e iniciado.
- En Windows, debes permitir al instalador de Python agregarlo al `PATH`.
- Conexión a Internet durante la primera instalación para descargar las dependencias.

Comprueba las herramientas principales:

```bash
git --version
python --version
```

## Descargar y ejecutar el proyecto

### Windows: instalación recomendada

Abre una terminal (PowerShell, CMD o Terminal de Git) y ejecuta:

```bash
git clone https://github.com/diken02/tostado.git
cd tostado
copy .env.example .env
```

Edita `.env` y escribe las credenciales de tu servidor MySQL. Después inicia MySQL y ejecuta:

```bat
iniciar_windows.bat
```

El lanzador crea automáticamente `.venv`, instala las dependencias, prepara la base de datos, aplica las migraciones, carga los datos de demostración y abre la aplicación.

### macOS/Linux

```bash
git clone https://github.com/diken02/tostado.git
cd tostado
cp .env.example .env
sh iniciar_linux_mac.sh
```

El lanzador automático requiere que MySQL esté iniciado y que `.env` contenga credenciales válidas.

### Direcciones de acceso

Abre:

- Aplicación y login: <http://127.0.0.1:8000/>
- Menú público: <http://127.0.0.1:8000/menu/>
- Administración técnica de Django: <http://127.0.0.1:8000/django-admin/>

Para detener el servidor, vuelve a la terminal y presiona `Ctrl+C`.

## Inicio manual

```bash
python -m venv .venv
```

### Windows

```bat
.venv\Scripts\activate
python -m pip install -r requirements-local.txt
python crear_base_mysql.py
python manage.py migrate
python manage.py cargar_demo
python manage.py runserver
```

### macOS/Linux

```bash
source .venv/bin/activate
python -m pip install -r requirements-local.txt
python crear_base_mysql.py
python manage.py migrate
python manage.py cargar_demo
python manage.py runserver
```

## Configuración MySQL

Ejemplo mínimo para `.env`:

```dotenv
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=tostado_cafeteria
MYSQL_USER=root
MYSQL_PASSWORD=tu_contrasena
```

El usuario configurado debe tener permiso para crear la base indicada en `MYSQL_DATABASE`. No subas `.env` ni credenciales al repositorio.

## Usuarios de demostración

Estas cuentas están pensadas únicamente para pruebas locales:

| Rol | Usuario | Contraseña |
| --- | --- | --- |
| Administrador | `admin` | `admin123` |
| Cajero | `juan` | `juan123` |
| Barista | `laura` | `laura123` |

En un entorno real debes crear cuentas propias con `python manage.py crear_administrador` o el administrador de Django y eliminar las credenciales de demostración.

## Estructura principal

```text
cafeteria/       Modelos, vistas, servicios, URLs y migraciones de Django
src/             Prototipo original React/Vite
templates/       Plantillas HTML servidas por Django
static/          CSS y JavaScript de la aplicación Django
tostado/         Configuración global del proyecto
jdbc/            Módulo independiente Java/JDBC
manage.py        Punto de entrada de administración de Django
render.yaml      Configuración del despliegue en Render
```

## Despliegue con Render

El archivo `render.yaml` configura:

- Servicio web Django con Gunicorn y WhiteNoise.
- Base PostgreSQL gratuita.
- Configuración HTTPS y variables de entorno para producción.

Desde la página de Render, crea un **Blueprint**, selecciona este repositorio y despliega la rama `main`.

```bash
python manage.py crear_administrador --username cafeadmin --nombre "Nombre del administrador" --email admin@tudominio.com
```

La configuración gratuita de Render es adecuada solo para pruebas. Puede dormir el servicio, tardar al reactivarse y usar almacenamiento o bases de datos temporales según el plan. Para pedidos reales utiliza planes de pago, respaldos y almacenamiento persistente.

No ejecutes el cargador demo completo en producción: puede crear usuarios con contraseñas conocidas.

## Empaquetado para entrega

Para generar un ZIP limpio:

```bash
python descargar_proyecto.py
```

El archivo se crea en `entregables/Tostado_Cafeteria_Django.zip`. Consulta [INSTRUCCIONES_ENTREGA.md](INSTRUCCIONES_ENTREGA.md) para más detalles.

## Documentación adicional

- [Guía Django y despliegue](README_DJANGO.md)
- [Instrucciones de entrega](INSTRUCCIONES_ENTREGA.md)
- [Módulo Java/JDBC](jdbc/README.md)

## Comprobación de la instalación

Con el entorno virtual activado, puedes validar Django y ejecutar las pruebas del proyecto:

```bash
python manage.py check
python manage.py test
```

Si el servidor inicia sin errores, visita <http://127.0.0.1:8000/> y prueba una cuenta de demostración.

## Problemas frecuentes

- **`Access denied for user` o error de conexión:** verifica usuario, contraseña, host y puerto en `.env`; confirma que MySQL esté iniciado.
- **`Unknown database` o permisos insuficientes:** el usuario debe tener permiso `CREATE` para que el script pueda crear la base.
- **El puerto 8000 está ocupado:** ejecuta manualmente `python manage.py runserver 127.0.0.1:8001` y abre el puerto indicado.
- **Python no se reconoce como comando:** reinstala Python marcando la opción **Add Python to PATH** o usa `py` en lugar de `python`.
- **Faltan módulos de Python:** activa `.venv` e instala con `python -m pip install -r requirements-local.txt`.
- **Linux requiere soporte de entornos virtuales:** en Debian/Ubuntu ejecuta `sudo apt install python3-venv`.

## Seguridad

- Nunca publiques `.env`, contraseñas o claves secretas.
- Cambia todas las cuentas demo antes de usar el sistema en producción.
- Ejecuta el servidor de Django solo en una red local de confianza durante pruebas.
- Para acceso público configura HTTPS, secretos propios y dominios explícitos.
