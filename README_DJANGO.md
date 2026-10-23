# Tostado Cafetería — versión Django

La aplicación ahora puede ejecutarse completamente con Python y Django. Usa MySQL,
autenticación de Django, permisos por rol y plantillas renderizadas en el servidor.

## Paquete listo para presentar

Genera un ZIP limpio y transportable con:

```bash
python descargar_proyecto.py
```

El resultado queda en `entregables/Tostado_Cafeteria_Django.zip`. Al descomprimirlo,
en Windows basta con abrir `iniciar_windows.bat`; en macOS o Linux se ejecuta
`sh iniciar_linux_mac.sh`. Consulta `INSTRUCCIONES_ENTREGA.md` para la guía que se
incluye con la entrega. El ZIP omite entornos virtuales, cachés, `node_modules`,
archivos de base de datos locales y configuraciones `.env` privadas.

## Instalación

Se requiere MySQL 8 o MariaDB 10.6 o superior. Crea la configuración local:

```bash
# Linux/macOS
cp .env.example .env

# Windows (CMD)
copy .env.example .env
```

Edita `.env` con el usuario, contraseña, host y puerto de tu servidor. El usuario
debe tener permiso para crear la base indicada en `MYSQL_DATABASE`. El lanzador
automático y el procedimiento manual de abajo crearán las tablas mediante las
migraciones de Django.

```bash
python -m venv .venv
```

Activa el entorno:

- Linux/macOS: `source .venv/bin/activate`
- Windows: `.venv\Scripts\activate`

Después instala y prepara el proyecto:

```bash
python -m pip install -r requirements-local.txt
python crear_base_mysql.py
python manage.py migrate
python manage.py cargar_demo
python manage.py runserver
```

Abre `http://127.0.0.1:8000`. El lanzador también muestra las direcciones para
abrir el menú desde otros dispositivos conectados a la misma red Wi-Fi, por
ejemplo `http://192.168.1.14:8000/menu/`. Si Windows solicita permiso para que
Python acepte conexiones, permite el acceso solo en redes privadas. Todos los
pedidos se guardan en la misma base MySQL configurada para el servidor.

El lanzador usa el servidor de desarrollo de Django y sirve únicamente para
pruebas dentro de una red local de confianza. No abras el puerto 8000 al Internet
ni configures el reenvío de puertos del router. Para acceso público se necesita
alojamiento de producción con HTTPS, una clave secreta propia, dominios
explícitos y una base de datos de producción. En producción define
`DJANGO_DEBUG=False`, `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS` y, cuando el
proveedor lo requiera, `DJANGO_CSRF_TRUSTED_ORIGINS`.
En producción, el proxy HTTPS del alojamiento debe establecer
`X-Forwarded-Proto: https`; Django usa ese encabezado para reconocer la conexión
segura y aplicar redirección HTTPS y cookies protegidas.

Si el inicio falla con `Access denied for user 'root'`, corrige localmente
`MYSQL_USER` y `MYSQL_PASSWORD` en `.env`. No compartas esa contraseña en el chat.

## Usuarios de demostración

| Rol | Usuario | Contraseña |
| --- | --- | --- |
| Administrador | `admin` | `admin123` |
| Cajero | `juan` | `juan123` |
| Barista | `laura` | `laura123` |

El menú de clientes es público en `/menu/`. La administración técnica de Django
está disponible en `/django-admin/`; para usarla, marca un usuario como `is_staff`
desde la consola o crea un superusuario con `python manage.py createsuperuser`.

## Módulos

- Centro de administración con resumen diario, producción y alertas de stock
- POS con descuento automático de recetas
- Gestión de mesas y estados de órdenes
- Catálogo de productos
- Inventario y compras a proveedores
- CRM y puntos de fidelización
- Reportes de venta y productos más vendidos
- Empleados, autenticación y permisos por rol
- Menú público de autoservicio

La implementación React/Vite original permanece en `src/` como referencia durante
la transición, pero Django es independiente y se inicia únicamente con Python.

## Publicar en Internet con Render

El archivo `render.yaml` configura una aplicación Django servida con HTTPS,
archivos estáticos gestionados por WhiteNoise y una base PostgreSQL persistente.
La configuración conserva MySQL para el desarrollo local.

1. Sube el proyecto a un repositorio GitHub privado o público. Esta carpeta local
   todavía no está conectada a un repositorio Git. Para crearla desde Windows:

   - Instala Git for Windows desde <https://git-scm.com/download/win>.
   - En GitHub crea un repositorio **privado** vacío llamado
     `tostado-cafeteria`. No agregues README, licencia ni `.gitignore`.
   - Abre PowerShell en la carpeta del proyecto y ejecuta:

     ```powershell
     git init -b main
     git add .
     git status --short
     ```

     Verifica que la lista no incluya `.env`, `db.sqlite3` ni `staticfiles`.
     `.gitignore` los excluye automáticamente.
   - Si la lista es correcta, crea el commit y publica la rama:

     ```powershell
     git commit -m "Prepare Tostado for Render" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
     git remote add origin https://github.com/TU_USUARIO/tostado-cafeteria.git
     git push -u origin main
     ```

     Sustituye `TU_USUARIO` por tu nombre de usuario de GitHub. GitHub abrirá
     su proceso de autenticación; no pegues tokens ni contraseñas en el chat.
2. Inicia sesión en Render, crea un **Blueprint** y conecta ese repositorio.
   Revisa el precio que muestra Render antes de aplicar la configuración.
   El Blueprint utiliza planes de pago para la aplicación y PostgreSQL; no
   actives el despliegue hasta aceptar el costo recurrente.
3. Cuando el despliegue termine, abre **Shell** en el servicio y, en una base
   nueva, carga el catálogo de ejemplo una sola vez:

   ```bash
   python manage.py cargar_demo --solo-catalogo
   ```

   Este comando no crea los usuarios demo con contraseñas públicas. Ejecútalo
   únicamente antes de registrar ventas, ya que reinicializa los insumos del
   catálogo.
4. Crea la cuenta administrativa. Render solicitará la contraseña sin mostrarla:

   ```bash
   python manage.py crear_administrador --username cafeadmin --nombre "Nombre del administrador" --email admin@tudominio.com
   ```

5. Abre la URL HTTPS del servicio. Los clientes pueden usar `/menu/`; el
   personal inicia sesión en `/` y las órdenes aparecen en el panel.

No ejecutes `cargar_demo` sin `--solo-catalogo` en producción: la versión completa
crea cuentas con contraseñas demo conocidas. No subas `.env` ni credenciales al
repositorio. Para usar un dominio propio, añade el dominio a
`DJANGO_ALLOWED_HOSTS` y `https://tudominio.com` a `DJANGO_CSRF_TRUSTED_ORIGINS`
en el entorno del servicio.

Render documenta el [despliegue de Django](https://render.com/docs/deploy-django),
los [límites de los planes gratuitos](https://render.com/docs/free) y la
[creación de bases PostgreSQL](https://render.com/docs/postgresql-creating-connecting).
Los planes gratuitos no son adecuados para producción: la aplicación puede
dormirse y las bases PostgreSQL gratuitas expiran y eventualmente se eliminan.
