package com.tostado.cafeteria.repository;

import com.tostado.cafeteria.config.DatabaseConnection;
import com.tostado.cafeteria.model.Producto;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class JdbcProductoRepository implements ProductoRepository {
    private static final String COLUMNAS =
            "id, nombre, descripcion, precio, categoria, imagen, disponible";

    @Override
    public List<Producto> listar() throws SQLException {
        String sql = "SELECT " + COLUMNAS + " FROM cafeteria_producto ORDER BY nombre";
        List<Producto> productos = new ArrayList<>();

        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql);
             ResultSet resultSet = statement.executeQuery()) {
            while (resultSet.next()) {
                productos.add(mapearProducto(resultSet));
            }
        }
        return productos;
    }

    @Override
    public Optional<Producto> buscarPorId(long id) throws SQLException {
        String sql = "SELECT " + COLUMNAS + " FROM cafeteria_producto WHERE id = ?";
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, id);
            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.next()
                        ? Optional.of(mapearProducto(resultSet))
                        : Optional.empty();
            }
        }
    }

    @Override
    public Producto crear(Producto producto) throws SQLException {
        String sql = """
                INSERT INTO cafeteria_producto
                    (nombre, descripcion, precio, categoria, imagen, disponible)
                VALUES (?, ?, ?, ?, ?, ?)
                """;
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                     sql, Statement.RETURN_GENERATED_KEYS)) {
            asignarCampos(statement, producto);
            if (statement.executeUpdate() != 1) {
                throw new SQLException("No se pudo crear el producto.");
            }
            try (ResultSet generatedKeys = statement.getGeneratedKeys()) {
                if (!generatedKeys.next()) {
                    throw new SQLException("La base de datos no devolvió el ID del producto.");
                }
                return new Producto(
                        generatedKeys.getLong(1),
                        producto.nombre(),
                        producto.descripcion(),
                        producto.precio(),
                        producto.categoria(),
                        producto.imagen(),
                        producto.disponible()
                );
            }
        }
    }

    @Override
    public boolean actualizar(Producto producto) throws SQLException {
        String sql = """
                UPDATE cafeteria_producto
                SET nombre = ?, descripcion = ?, precio = ?, categoria = ?, imagen = ?,
                    disponible = ?
                WHERE id = ?
                """;
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            asignarCampos(statement, producto);
            statement.setLong(7, producto.id());
            return statement.executeUpdate() == 1;
        }
    }

    @Override
    public boolean eliminar(long id) throws SQLException {
        String sql = "DELETE FROM cafeteria_producto WHERE id = ?";
        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, id);
            return statement.executeUpdate() == 1;
        }
    }

    private static void asignarCampos(PreparedStatement statement, Producto producto)
            throws SQLException {
        statement.setString(1, producto.nombre());
        statement.setString(2, producto.descripcion());
        statement.setBigDecimal(3, producto.precio());
        statement.setString(4, producto.categoria());
        statement.setString(5, producto.imagen());
        statement.setBoolean(6, producto.disponible());
    }

    private static Producto mapearProducto(ResultSet resultSet) throws SQLException {
        return new Producto(
                resultSet.getLong("id"),
                resultSet.getString("nombre"),
                resultSet.getString("descripcion"),
                resultSet.getBigDecimal("precio"),
                resultSet.getString("categoria"),
                resultSet.getString("imagen"),
                resultSet.getBoolean("disponible")
        );
    }
}
