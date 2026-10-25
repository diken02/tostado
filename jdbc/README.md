# Módulo Java JDBC — gestión de productos

Módulo de consola para consultar y administrar el catálogo de productos de
Tostado Cafetería. Está implementado con Java 17, Maven y JDBC; utiliza
consultas parametrizadas y `try-with-resources` para cerrar conexiones y
recursos de base de datos.

## Integración con la aplicación

Este módulo usa la base MySQL existente y la tabla `cafeteria_producto` creada
por las migraciones de Django. No crea una segunda tabla ni cambia el esquema.
Primero prepara la base y el esquema desde la raíz del proyecto:

```powershell
python crear_base_mysql.py
python manage.py migrate
```

Si aún no hay catálogo, también puedes cargar los datos de demostración:

```powershell
python manage.py cargar_demo
```

## Requisitos y configuración

- JDK 17 o superior
- Maven 3.8 o superior
- MySQL 8 o MariaDB compatible en ejecución

Configura en el entorno las mismas variables que usa Django:

| Variable | Predeterminado |
| --- | --- |
| `MYSQL_HOST` | `127.0.0.1` |
| `MYSQL_PORT` | `3306` |
| `MYSQL_DATABASE` | `tostado_cafeteria` |
| `MYSQL_USER` | `root` |
| `MYSQL_PASSWORD` | vacío |

En Windows PowerShell, por ejemplo:

```powershell
$env:MYSQL_HOST = "127.0.0.1"
$env:MYSQL_PORT = "3306"
$env:MYSQL_DATABASE = "tostado_cafeteria"
$env:MYSQL_USER = "root"
$env:MYSQL_PASSWORD = "tu-contraseña-local"
```

No guardes contraseñas reales en el código fuente ni las publiques en Git.

## Compilar y ejecutar

Desde esta carpeta:

```powershell
mvn clean package
mvn exec:java
```

El menú permite listar, registrar, actualizar y eliminar productos. Las
validaciones replican los límites principales del modelo Django (`nombre`:
120 caracteres; `categoría`: 80; precio mínimo 0,01 y máximo 10 dígitos con
2 decimales). Cada lectura y escritura utiliza JDBC y valores parametrizados.
El borrado respeta las restricciones de claves foráneas de MySQL; si un
producto está asociado a ventas, la base de datos rechazará la operación y
mostrará el error en lugar de eliminar referencias.

## Estructura

```text
src/main/java/com/tostado/cafeteria/
├── config/       # Conexión JDBC desde variables de entorno
├── model/        # Modelo Producto
├── repository/   # Contrato y acceso JDBC a datos
├── service/      # Reglas y validaciones del catálogo
└── ui/           # Interfaz de consola
```

El repositorio es Git y el módulo se mantiene bajo control de versiones junto
con el resto del proyecto.
