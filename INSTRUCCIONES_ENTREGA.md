# Tostado Cafetería — paquete para presentación

Este paquete contiene la aplicación POS completa en Django, las plantillas, estilos,
migraciones, datos de demostración y el código React original como referencia.
Para ejecutar la aplicación no se necesitan Node.js, Vite ni React.

## Requisito

- Python 3.10 o superior, disponible en <https://www.python.org/downloads/>.
- MySQL 8 o MariaDB 10.6 o superior, instalado y en ejecución.
- Conexión a internet durante el primer inicio para descargar las dependencias.

En Windows, activa la opción **Add Python to PATH** durante la instalación.
En Debian o Ubuntu también puede ser necesario ejecutar
`sudo apt install python3-venv`.

## Inicio rápido

### Windows

1. Descomprime el archivo ZIP.
2. Abre la carpeta `Tostado_Cafeteria_Django`.
3. Haz doble clic en `iniciar_windows.bat`.

### macOS o Linux

Abre una terminal dentro de la carpeta descomprimida y ejecuta:

```bash
sh iniciar_linux_mac.sh
```

Antes del primer inicio, copia `.env.example` como `.env` y escribe allí las
credenciales de MySQL. Por defecto se intenta conectar a `127.0.0.1:3306` con el
usuario `root`, sin contraseña.

El primer inicio crea un entorno privado `.venv`, instala las dependencias, crea la
base MySQL `tostado_cafeteria` si no existe y carga los datos demo. Después abre
automáticamente <http://127.0.0.1:8000/> y muestra enlaces del menú para otros
dispositivos conectados al mismo Wi-Fi. Los pedidos se escriben en la base MySQL
del servidor. Los siguientes inicios conservan los datos registrados. El usuario
configurado debe tener permiso `CREATE`.

Si Windows pregunta por el firewall, permite Python únicamente en redes privadas.
El servidor de desarrollo es solo para la red local: no abras el puerto 8000 al
Internet ni lo expongas mediante el router. El acceso desde fuera del local
requiere publicar la aplicación en un alojamiento de producción con HTTPS y
configurar `DJANGO_DEBUG=False`, `DJANGO_SECRET_KEY` y dominios explícitos en
`DJANGO_ALLOWED_HOSTS`. El proxy HTTPS del alojamiento debe establecer
`X-Forwarded-Proto: https`. Si aparece `Access denied for user 'root'`, configura las
credenciales MySQL correctas localmente en `.env`; nunca las compartas por chat.

## Publicar en Internet con Render

El proyecto incluye `render.yaml` para desplegar Django con HTTPS, archivos
estáticos y PostgreSQL. La configuración actual usa planes gratuitos de Render
para pruebas, no para recibir pedidos reales.

1. El código está publicado en [diken02/tostado](https://github.com/diken02/tostado),
   rama `main`. En Render inicia un **Blueprint** y conecta ese repositorio:
   Render detectará `render.yaml`.
2. Revisa los planes que aparecen antes de confirmar. Los planes gratuitos
   pueden dormir la web tras 15 minutos sin tráfico y tardar cerca de un minuto
   en volver; el sistema de archivos de la web es temporal. La base PostgreSQL
   gratuita vence a los 30 días y, si no se actualiza durante el período de
   gracia posterior, se elimina junto con sus datos. Usa esta configuración
   solo para pruebas y no guardes pedidos reales.
3. Cuando el despliegue esté listo, abre la Shell del servicio y carga los datos
   de catálogo una sola vez, antes de recibir pedidos:

   ```bash
   python manage.py cargar_demo --solo-catalogo
   ```
4. En la misma Shell, crea la cuenta del administrador. La contraseña se solicita
   de forma oculta y debe tener al menos 14 caracteres:

   ```bash
   python manage.py crear_administrador --username cafeadmin --nombre "Nombre del administrador" --email admin@tudominio.com
   ```

5. Usa la URL HTTPS de Render para probar el menú `/menu/` y el panel.

`cargar_demo --solo-catalogo` no crea cuentas demo; no lo repitas después de
comenzar a vender porque inicializa las cantidades de inventario de ejemplo.
Nunca subas `.env` ni contraseñas a GitHub. Antes de usar el sistema con pedidos
reales, migra a planes de pago con almacenamiento adecuado y respaldos.

Para detener la aplicación, vuelve a la ventana de la terminal y presiona `Ctrl+C`.

## Accesos de demostración

| Rol | Usuario | Contraseña |
| --- | --- | --- |
| Administrador | `admin` | `admin123` |
| Cajero | `juan` | `juan123` |
| Barista | `laura` | `laura123` |

El menú público está disponible en <http://127.0.0.1:8000/menu/>.

## Restablecer la demostración

Cierra la aplicación y elimina/recrea la base desde MySQL:

```sql
DROP DATABASE tostado_cafeteria;
CREATE DATABASE tostado_cafeteria
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Después vuelve a ejecutar el lanzador. Usa el nombre definido en
`MYSQL_DATABASE` si cambiaste el valor predeterminado.

## Inicio manual

Si prefieres usar comandos:

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
python -m pip install -r requirements-local.txt
python crear_base_mysql.py
python manage.py migrate
python manage.py cargar_demo
python manage.py runserver
```

## Crear nuevamente el ZIP entregable

Desde la carpeta original del proyecto:

```bash
python descargar_proyecto.py
```

El archivo se genera en `entregables/Tostado_Cafeteria_Django.zip`. Incluye
`.env.example`, pero nunca tus credenciales de `.env`. Tampoco incluye entornos
virtuales (incluidos los identificados por `pyvenv.cfg`), cachés, `node_modules`,
archivos SQLite/DB locales ni configuraciones `.env` privadas.
