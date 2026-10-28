# ☕ Tostado Cafetería

Sistema web de gestión para una cafetería. Centraliza las ventas, los pedidos y la
administración del negocio en una aplicación con acceso según el rol del personal.
Este repositorio corresponde a un proyecto académico y de demostración; no está
preparado para manejar datos reales en producción.

## 🎯 Objetivo del proyecto

Facilitar las operaciones diarias de una cafetería con herramientas para atender
clientes, preparar pedidos y llevar el control de productos e inventario desde un
solo sistema.

## ✨ Funcionalidades principales

- **Ventas y pedidos:** punto de venta, pagos, pedidos para mesa o para llevar y
  estados de preparación.
- **Menú público:** catálogo para que los clientes consulten productos y realicen
  pedidos.
- **Administración:** productos, categorías, precios, disponibilidad, mesas,
  inventario, compras y proveedores.
- **Clientes y reportes:** historial, puntos de fidelización, ventas y productos más
  vendidos.
- **Acceso por roles:** vistas y permisos para administrador, cajero y barista.

## 🧰 Tecnologías

- **Aplicación web:** Python 3.10+ y Django 5.
- **Interfaz actual:** plantillas de Django, HTML, CSS y JavaScript.
- **Base de datos predeterminada:** SQLite, sin servidor adicional.
- **Base de datos opcional:** MySQL o MariaDB.
- **Prototipo de interfaz:** React, Vite y Tailwind CSS en `src/`.
- **Módulo complementario:** Java 17 y JDBC en `jdbc/`.

La aplicación que se ejecuta para la demostración es la versión Django. El
prototipo React/Vite y el módulo Java son componentes independientes; no se
necesitan para iniciar el sitio web.

## 🚀 Cómo ejecutar el proyecto

### Requisitos

- Python 3.10 o posterior.
- Git para clonar el repositorio.
- Node.js y pnpm solo si también quieres trabajar en el prototipo React/Vite.

### Opción rápida

Clona el repositorio y ejecuta el iniciador correspondiente. En el primer inicio,
se crea un entorno virtual, se instalan las dependencias, se prepara SQLite, se
aplican las migraciones, se cargan datos de demostración y se inicia Django en el
puerto `8000`.

**Windows**

```bat
git clone https://github.com/diken02/tostado.git
cd tostado
iniciar_windows.bat
```

**Linux o macOS**

```bash
git clone https://github.com/diken02/tostado.git
cd tostado
sh iniciar_linux_mac.sh
```

Abre <http://127.0.0.1:8000/>. Para detener el servidor, vuelve a la terminal y
presiona `Ctrl+C`.

### Desarrollo manual

Desde la carpeta del proyecto, crea y activa un entorno virtual:

```bash
python -m venv .venv
```

En Windows:

```bat
.venv\Scripts\activate
```

En Linux o macOS:

```bash
source .venv/bin/activate
```

Instala las dependencias, crea las tablas y ejecuta la aplicación:

```bash
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py cargar_demo
python manage.py runserver
```

Si prefieres usar MySQL o MariaDB, inicia el servidor de base de datos, copia
`.env.example` como `.env` y cambia `DATABASE_ENGINE=sqlite` por
`DATABASE_ENGINE=mysql`. Completa las variables `MYSQL_*` con tus datos locales y
ejecuta:

```bash
python -m pip install -r requirements-local.txt
python crear_base_mysql.py
python manage.py migrate
python manage.py cargar_demo
python manage.py runserver
```

No compartas ni subas el archivo `.env`; contiene credenciales locales.

## 🧭 Recorrido de la aplicación

| Sección | Dirección |
| --- | --- |
| Inicio de sesión y panel | <http://127.0.0.1:8000/> |
| Menú público | <http://127.0.0.1:8000/menu/> |
| Administración de Django | <http://127.0.0.1:8000/django-admin/> |

### Cuentas de demostración

| Rol | Usuario | Contraseña |
| --- | --- | --- |
| Administrador | `admin` | `admin123` |
| Cajero | `juan` | `juan123` |
| Barista | `laura` | `laura123` |

Estas cuentas son únicamente para pruebas locales. No las uses en un despliegue
público.

## 🗂 Estructura del proyecto

| Ruta | Contenido |
| --- | --- |
| `cafeteria/` | Modelos, vistas, servicios, permisos y migraciones de Django. |
| `tostado/` | Configuración principal y rutas del proyecto Django. |
| `templates/` y `static/` | Plantillas, estilos y recursos de la aplicación web. |
| `src/` | Prototipo de interfaz React/Vite. |
| `jdbc/` | Módulo independiente de administración de catálogo con Java y JDBC. |
| `iniciar_tostado.py` | Preparación del entorno e inicio automático de la aplicación. |

## 🧑‍💻 Cómo continuar desarrollándolo

1. Crea una rama para cada mejora y conserva la rama principal estable.
2. Modifica la lógica de negocio en `cafeteria/`, la configuración en `tostado/` y
   la interfaz en `templates/` y `static/`.
3. Si cambias los modelos, genera y aplica una migración:

   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. Ejecuta las pruebas del proyecto:

   ```bash
   python manage.py test --settings=tostado.test_settings
   ```

5. Antes de compartir los cambios, verifica el sitio y no incluyas bases de datos
   locales, `.env`, contraseñas ni claves privadas.

Para trabajar por separado en el prototipo de React/Vite, instala sus dependencias
con `pnpm install` e inicia el servidor con `pnpm dev`.

## 🔐 Seguridad y alcance

- El servidor integrado de Django es solo para desarrollo local o una red de
  confianza; no lo expongas directamente a Internet.
- Cambia las cuentas demo y configura secretos, dominios permitidos, HTTPS y una
  base de datos de producción antes de cualquier uso real.
- Los datos cargados por `cargar_demo` son de prueba.

## 📚 Documentación relacionada

- [Guía técnica de Django](README_DJANGO.md)
- [Instrucciones para la entrega](INSTRUCCIONES_ENTREGA.md)
- [Módulo Java/JDBC](jdbc/README.md)
