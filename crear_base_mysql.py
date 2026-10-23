#!/usr/bin/env python3
"""Crea la base MySQL configurada en .env si todavía no existe."""

from __future__ import annotations

import os
import re
from pathlib import Path

import MySQLdb
from dotenv import load_dotenv


RAIZ = Path(__file__).resolve().parent


def crear_base() -> None:
    load_dotenv(RAIZ / ".env")
    nombre = os.getenv("MYSQL_DATABASE", "tostado_cafeteria")
    if not re.fullmatch(r"[A-Za-z0-9_]+", nombre):
        raise ValueError(
            "MYSQL_DATABASE solo puede contener letras, números y guiones bajos."
        )

    conexion = MySQLdb.connect(
        host=os.getenv("MYSQL_HOST", "127.0.0.1"),
        port=int(os.getenv("MYSQL_PORT", "3306")),
        user=os.getenv("MYSQL_USER", "root"),
        passwd=os.getenv("MYSQL_PASSWORD", ""),
        charset="utf8mb4",
    )
    try:
        with conexion.cursor() as cursor:
            cursor.execute(
                f"CREATE DATABASE IF NOT EXISTS `{nombre}` "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
    finally:
        conexion.close()

    print(f"Base MySQL preparada: {nombre}")


if __name__ == "__main__":
    crear_base()
