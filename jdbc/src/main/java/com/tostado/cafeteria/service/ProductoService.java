package com.tostado.cafeteria.service;

import com.tostado.cafeteria.model.Producto;
import com.tostado.cafeteria.repository.ProductoRepository;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

public class ProductoService {
    private static final BigDecimal PRECIO_MINIMO = new BigDecimal("0.01");
    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public List<Producto> listarProductos() throws SQLException {
        return productoRepository.listar();
    }

    public Optional<Producto> buscarProducto(long id) throws SQLException {
        validarId(id);
        return productoRepository.buscarPorId(id);
    }

    public Producto crearProducto(
            String nombre,
            String descripcion,
            BigDecimal precio,
            String categoria,
            String imagen
    ) throws SQLException {
        Producto producto = validarDatos(0, nombre, descripcion, precio, categoria, imagen, true);
        return productoRepository.crear(producto);
    }

    public boolean actualizarProducto(
            long id,
            String nombre,
            String descripcion,
            BigDecimal precio,
            String categoria,
            String imagen,
            boolean disponible
    ) throws SQLException {
        validarId(id);
        Producto producto = validarDatos(
                id, nombre, descripcion, precio, categoria, imagen, disponible
        );
        return productoRepository.actualizar(producto);
    }

    public boolean eliminarProducto(long id) throws SQLException {
        validarId(id);
        return productoRepository.eliminar(id);
    }

    private static Producto validarDatos(
            long id,
            String nombre,
            String descripcion,
            BigDecimal precio,
            String categoria,
            String imagen,
            boolean disponible
    ) {
        String nombreNormalizado = textoRequerido(nombre, "El nombre", 120);
        String categoriaNormalizada = textoRequerido(categoria, "La categoría", 80);
        String descripcionNormalizada = descripcion == null ? "" : descripcion.trim();
        String imagenNormalizada = imagen == null ? "" : imagen.trim();

        if (precio == null || precio.compareTo(PRECIO_MINIMO) < 0) {
            throw new IllegalArgumentException("El precio debe ser igual o superior a 0.01.");
        }
        if (precio.scale() > 2 || precio.precision() > 10) {
            throw new IllegalArgumentException("El precio admite hasta 10 dígitos y 2 decimales.");
        }
        if (imagenNormalizada.length() > 200) {
            throw new IllegalArgumentException("La URL de imagen no puede superar 200 caracteres.");
        }

        return new Producto(
                id,
                nombreNormalizado,
                descripcionNormalizada,
                precio,
                categoriaNormalizada,
                imagenNormalizada,
                disponible
        );
    }

    private static String textoRequerido(String valor, String campo, int longitudMaxima) {
        String textoNormalizado = valor == null ? "" : valor.trim();
        if (textoNormalizado.isEmpty()) {
            throw new IllegalArgumentException(campo + " es obligatorio.");
        }
        if (textoNormalizado.length() > longitudMaxima) {
            throw new IllegalArgumentException(
                    campo + " no puede superar " + longitudMaxima + " caracteres."
            );
        }
        return textoNormalizado;
    }

    private static void validarId(long id) {
        if (id <= 0) {
            throw new IllegalArgumentException("El ID debe ser un número positivo.");
        }
    }
}
