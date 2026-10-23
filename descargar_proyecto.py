#!/usr/bin/env python3
"""Crea el ZIP entregable de Tostado Cafetería sin archivos temporales."""

from __future__ import annotations

import os
import shutil
import zipfile
from pathlib import Path


RAIZ = Path(__file__).resolve().parent
DESTINO = RAIZ / "entregables" / "Tostado_Cafeteria_Django.zip"
CARPETA_ZIP = "Tostado_Cafeteria_Django"

ARCHIVOS_RAIZ = (
    ".env.example",
    "build.sh",
    "crear_base_mysql.py",
    "manage.py",
    "requirements.txt",
    "requirements-local.txt",
    "render.yaml",
    "README_DJANGO.md",
    "INSTRUCCIONES_ENTREGA.md",
    "iniciar_tostado.py",
    "iniciar_windows.bat",
    "iniciar_linux_mac.sh",
)
CARPETAS = ("cafeteria", "tostado", "templates", "static", "src")
EXCLUIR_CARPETAS = {
    "__pycache__",
    ".cache",
    ".git",
    ".mypy_cache",
    ".nox",
    ".pytest_cache",
    ".ruff_cache",
    ".tox",
    ".venv",
    ".virtualenv",
    ".vite",
    "build",
    "coverage",
    "dist",
    "env",
    "node_modules",
    "staticfiles",
    "venv",
    "virtualenv",
}
EXCLUIR_ARCHIVOS = {".ds_store", "thumbs.db"}
EXCLUIR_EXTENSIONES = {".pyc", ".pyo"}
EXTENSIONES_BASE_LOCAL = {".db", ".sqlite", ".sqlite3"}
SUFIJOS_BASE_LOCAL = ("", "-journal", "-shm", "-wal")


def incluir(ruta: Path) -> bool:
    relativa = ruta.relative_to(RAIZ)
    nombre = ruta.name.lower()
    nombre_especial = nombre in EXCLUIR_ARCHIVOS or nombre == ".env" or (
        nombre.startswith(".env.") and nombre != ".env.example"
    )
    archivo_base_local = any(
        nombre.endswith(extension + sufijo)
        for extension in EXTENSIONES_BASE_LOCAL
        for sufijo in SUFIJOS_BASE_LOCAL
    )
    return (
        not any(parte.lower() in EXCLUIR_CARPETAS for parte in relativa.parts)
        and not nombre_especial
        and not archivo_base_local
        and ruta.suffix.lower() not in EXCLUIR_EXTENSIONES
    )


def archivos_del_paquete():
    for nombre in ARCHIVOS_RAIZ:
        ruta = RAIZ / nombre
        if not ruta.is_file():
            raise FileNotFoundError(f"Falta un archivo requerido: {nombre}")
        yield ruta

    for nombre in CARPETAS:
        carpeta = RAIZ / nombre
        if not carpeta.is_dir():
            raise FileNotFoundError(f"Falta una carpeta requerida: {nombre}")
        for directorio, subdirectorios, archivos in os.walk(carpeta):
            ruta_directorio = Path(directorio)
            subdirectorios[:] = sorted(
                nombre
                for nombre in subdirectorios
                if nombre.lower() not in EXCLUIR_CARPETAS
                and not (ruta_directorio / nombre / "pyvenv.cfg").is_file()
            )
            for nombre in sorted(archivos):
                ruta = ruta_directorio / nombre
                if ruta.is_file() and incluir(ruta):
                    yield ruta


def crear_zip() -> Path:
    DESTINO.parent.mkdir(parents=True, exist_ok=True)
    temporal = DESTINO.with_suffix(".tmp")
    temporal.unlink(missing_ok=True)

    try:
        with zipfile.ZipFile(
            temporal, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9
        ) as paquete:
            for ruta in archivos_del_paquete():
                nombre = Path(CARPETA_ZIP) / ruta.relative_to(RAIZ)
                paquete.write(ruta, nombre.as_posix())
        shutil.move(temporal, DESTINO)
    finally:
        temporal.unlink(missing_ok=True)

    return DESTINO


if __name__ == "__main__":
    paquete = crear_zip()
    tamano_mb = paquete.stat().st_size / (1024 * 1024)
    print(f"Paquete creado correctamente:\n{paquete}\nTamaño: {tamano_mb:.2f} MB")
