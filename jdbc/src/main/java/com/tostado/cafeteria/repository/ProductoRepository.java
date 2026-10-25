package com.tostado.cafeteria.repository;

import com.tostado.cafeteria.model.Producto;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

public interface ProductoRepository {
    List<Producto> listar() throws SQLException;

    Optional<Producto> buscarPorId(long id) throws SQLException;

    Producto crear(Producto producto) throws SQLException;

    boolean actualizar(Producto producto) throws SQLException;

    boolean eliminar(long id) throws SQLException;
}
