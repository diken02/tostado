package com.tostado.cafeteria.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public final class DatabaseConnection {
    private DatabaseConnection() {
    }

    public static Connection getConnection() throws SQLException {
        String host = environmentValue("MYSQL_HOST", "127.0.0.1");
        int port = parsePort(environmentValue("MYSQL_PORT", "3306"));
        String database = environmentValue("MYSQL_DATABASE", "tostado_cafeteria");
        if (!database.matches("[A-Za-z0-9_]+")) {
            throw new IllegalArgumentException(
                    "MYSQL_DATABASE solo puede contener letras, números y guiones bajos."
            );
        }

        String url = "jdbc:mysql://" + host + ":" + port + "/" + database
                + "?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC";
        String user = environmentValue("MYSQL_USER", "root");
        String password = environmentValue("MYSQL_PASSWORD", "");
        return DriverManager.getConnection(url, user, password);
    }

    private static String environmentValue(String name, String defaultValue) {
        String value = System.getenv(name);
        return value == null || value.isBlank() ? defaultValue : value;
    }

    private static int parsePort(String value) {
        try {
            int port = Integer.parseInt(value);
            if (port < 1 || port > 65535) {
                throw new IllegalArgumentException("MYSQL_PORT debe estar entre 1 y 65535.");
            }
            return port;
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("MYSQL_PORT debe ser un número válido.", exception);
        }
    }
}
