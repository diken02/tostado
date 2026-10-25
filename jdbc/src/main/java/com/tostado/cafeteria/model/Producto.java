package com.tostado.cafeteria.model;

import java.math.BigDecimal;

public record Producto(
        long id,
        String nombre,
        String descripcion,
        BigDecimal precio,
        String categoria,
        String imagen,
        boolean disponible
) {
}
