package com.tostado.cafeteria.ui;

import com.tostado.cafeteria.model.Producto;
import com.tostado.cafeteria.repository.JdbcProductoRepository;
import com.tostado.cafeteria.service.ProductoService;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import java.util.Scanner;

public class Main {
    private final Scanner scanner = new Scanner(System.in);
    private final ProductoService productoService =
            new ProductoService(new JdbcProductoRepository());

    public static void main(String[] args) throws SQLException {
        try {
            new Main().iniciar();
        } catch (SQLException exception) {
            System.err.println(
                    "Error al acceder a MySQL. Verifica la conexión y las variables MYSQL_*."
            );
            throw exception;
        }
    }

    private void iniciar() throws SQLException {
        boolean continuar = true;
        while (continuar) {
            mostrarMenu();
            String opcion = scanner.nextLine().trim();
            try {
                switch (opcion) {
                    case "1" -> mostrarProductos();
                    case "2" -> crearProducto();
                    case "3" -> actualizarProducto();
                    case "4" -> eliminarProducto();
                    case "0" -> continuar = false;
                    default -> System.out.println("Selecciona una opción válida.");
                }
            } catch (IllegalArgumentException exception) {
                System.out.println("No se pudo completar la operación: " + exception.getMessage());
            }
        }
        System.out.println("Sesión finalizada.");
    }

    private void mostrarMenu() {
        System.out.println("""

                === Tostado | Gestión de productos ===
                1. Listar productos
                2. Registrar producto
                3. Actualizar producto
                4. Eliminar producto
                0. Salir
                """);
        System.out.print("Opción: ");
    }

    private void mostrarProductos() throws SQLException {
        List<Producto> productos = productoService.listarProductos();
        if (productos.isEmpty()) {
            System.out.println("No hay productos registrados.");
            return;
        }

        System.out.printf("%-6s %-28s %-20s %12s %-12s %s%n",
                "ID", "Nombre", "Categoría", "Precio", "Disponible", "Imagen");
        for (Producto producto : productos) {
            System.out.printf("%-6d %-28s %-20s %12s %-12s %s%n",
                    producto.id(),
                    limitar(producto.nombre(), 28),
                    limitar(producto.categoria(), 20),
                    producto.precio().toPlainString(),
                    producto.disponible() ? "Sí" : "No",
                    producto.imagen());
        }
    }

    private void crearProducto() throws SQLException {
        DatosProducto datos = leerDatosProducto();
        Producto producto = productoService.crearProducto(
                datos.nombre(),
                datos.descripcion(),
                datos.precio(),
                datos.categoria(),
                datos.imagen()
        );
        System.out.println("Producto registrado con ID " + producto.id() + ".");
    }

    private void actualizarProducto() throws SQLException {
        long id = leerId("ID del producto a actualizar: ");
        Optional<Producto> productoEncontrado = productoService.buscarProducto(id);
        if (productoEncontrado.isEmpty()) {
            System.out.println("No existe un producto con ese ID.");
            return;
        }

        Producto actual = productoEncontrado.get();
        System.out.println("Deja vacío un campo para conservar el valor actual.");
        DatosProducto datos = leerDatosProducto(actual);
        boolean disponible = leerDisponibilidad(actual.disponible());
        if (productoService.actualizarProducto(
                id,
                datos.nombre(),
                datos.descripcion(),
                datos.precio(),
                datos.categoria(),
                datos.imagen(),
                disponible
        )) {
            System.out.println("Producto actualizado.");
        } else {
            System.out.println("El producto ya no existe; no se realizaron cambios.");
        }
    }

    private void eliminarProducto() throws SQLException {
        long id = leerId("ID del producto a eliminar: ");
        Optional<Producto> productoEncontrado = productoService.buscarProducto(id);
        if (productoEncontrado.isEmpty()) {
            System.out.println("No existe un producto con ese ID.");
            return;
        }
        System.out.print("¿Eliminar \"" + productoEncontrado.get().nombre() + "\"? (s/N): ");
        if (scanner.nextLine().trim().equalsIgnoreCase("s")) {
            if (productoService.eliminarProducto(id)) {
                System.out.println("Producto eliminado.");
            } else {
                System.out.println("El producto ya no existe; no se realizaron cambios.");
            }
        } else {
            System.out.println("Operación cancelada.");
        }
    }

    private DatosProducto leerDatosProducto() {
        System.out.println("Ingresa los datos del producto:");
        return new DatosProducto(
                leerTexto("Nombre: "),
                leerTexto("Descripción: "),
                leerPrecio(),
                leerTexto("Categoría: "),
                leerTexto("URL de imagen (opcional): ")
        );
    }

    private DatosProducto leerDatosProducto(Producto actual) {
        return new DatosProducto(
                leerTextoActual("Nombre", actual.nombre()),
                leerTextoActual("Descripción", actual.descripcion()),
                leerPrecioActual(actual.precio()),
                leerTextoActual("Categoría", actual.categoria()),
                leerTextoActual("URL de imagen", actual.imagen())
        );
    }

    private String leerTextoActual(String etiqueta, String valorActual) {
        System.out.print(etiqueta + " [" + valorActual + "]: ");
        String nuevoValor = scanner.nextLine().trim();
        return nuevoValor.isEmpty() ? valorActual : nuevoValor;
    }

    private BigDecimal leerPrecioActual(BigDecimal precioActual) {
        System.out.print("Precio [" + precioActual.toPlainString() + "]: ");
        String entrada = scanner.nextLine().trim();
        return entrada.isEmpty() ? precioActual : convertirPrecio(entrada);
    }

    private BigDecimal leerPrecio() {
        System.out.print("Precio: ");
        return convertirPrecio(scanner.nextLine().trim());
    }

    private BigDecimal convertirPrecio(String entrada) {
        try {
            return new BigDecimal(entrada);
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("El precio debe ser un número decimal.", exception);
        }
    }

    private boolean leerDisponibilidad(boolean disponibleActual) {
        String estadoActual = disponibleActual ? "S" : "N";
        System.out.print("¿Disponible? (s/n) [" + estadoActual + "]: ");
        String respuesta = scanner.nextLine().trim();
        if (respuesta.isEmpty()) {
            return disponibleActual;
        }
        if (respuesta.equalsIgnoreCase("s")) {
            return true;
        }
        if (respuesta.equalsIgnoreCase("n")) {
            return false;
        }
        throw new IllegalArgumentException("La disponibilidad debe indicarse con s o n.");
    }

    private long leerId(String mensaje) {
        System.out.print(mensaje);
        try {
            return Long.parseLong(scanner.nextLine().trim());
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("El ID debe ser un número entero.", exception);
        }
    }

    private String leerTexto(String etiqueta) {
        System.out.print(etiqueta);
        return scanner.nextLine().trim();
    }

    private static String limitar(String valor, int longitudMaxima) {
        if (valor.length() <= longitudMaxima) {
            return valor;
        }
        return valor.substring(0, longitudMaxima - 3) + "...";
    }

    private record DatosProducto(
            String nombre,
            String descripcion,
            BigDecimal precio,
            String categoria,
            String imagen
    ) {
    }
}
