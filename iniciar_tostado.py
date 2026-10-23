#!/usr/bin/env python3
"""Prepara y ejecuta Tostado Cafetería con la menor intervención posible."""

from __future__ import annotations

import os
import shutil
import socket
import subprocess
import sys
import threading
import time
import urllib.request
import venv
import webbrowser
from pathlib import Path


RAIZ = Path(__file__).resolve().parent
ENTORNO = RAIZ / ".venv"
URL = "http://127.0.0.1:8000/"


def ejecutar(*argumentos: str) -> None:
    print(f"\n> {' '.join(argumentos)}")
    subprocess.run(argumentos, cwd=RAIZ, check=True)


def python_del_entorno() -> Path:
    if os.name == "nt":
        return ENTORNO / "Scripts" / "python.exe"
    return ENTORNO / "bin" / "python"


def abrir_navegador_cuando_este_listo() -> None:
    for _ in range(40):
        try:
            with urllib.request.urlopen(URL, timeout=1):
                webbrowser.open(URL)
                return
        except Exception:
            time.sleep(0.5)


def direcciones_red_local() -> list[str]:
    try:
        direcciones = {
            resultado[4][0]
            for resultado in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET)
            if not resultado[4][0].startswith("127.")
        }
    except socket.gaierror as error:
        print(f"No se pudieron detectar las direcciones de red: {error}")
        return []
    return sorted(direcciones)


def preparar_configuracion() -> None:
    ejemplo = RAIZ / ".env.example"
    configuracion = RAIZ / ".env"
    if not configuracion.exists():
        shutil.copyfile(ejemplo, configuracion)
        print("Se creó .env con la configuración local predeterminada de MySQL.")


def preparar(python: Path) -> None:
    ejecutar(
        str(python),
        "-m",
        "pip",
        "install",
        "--disable-pip-version-check",
        "-r",
        "requirements-local.txt",
    )
    ejecutar(str(python), "crear_base_mysql.py")
    ejecutar(str(python), "manage.py", "migrate", "--noinput")
    ejecutar(str(python), "manage.py", "cargar_demo")


def main() -> int:
    if sys.version_info < (3, 10):
        print("Se requiere Python 3.10 o superior.")
        return 1

    try:
        preparar_configuracion()
        if not python_del_entorno().exists():
            print("Creando el entorno privado de Python...")
            try:
                venv.EnvBuilder(with_pip=True).create(ENTORNO)
            except (OSError, subprocess.CalledProcessError, SystemExit) as error:
                print(f"\nNo se pudo crear el entorno de Python: {error}")
                if os.name != "nt":
                    print(
                        "En Debian/Ubuntu instala primero el soporte con:\n"
                        "  sudo apt install python3-venv"
                    )
                return 1

        python = python_del_entorno()
        preparar(python)

        print("\nTostado Cafetería está listo.")
        print(f"Abriendo {URL}")
        print("Menú en esta red Wi-Fi:")
        for direccion in direcciones_red_local():
            print(f"  http://{direccion}:8000/menu/")
        print("Usa estos enlaces solo dentro de una red local de confianza.")
        print("No publiques el servidor de desarrollo directamente en Internet.")
        print("Para cerrar el servidor, presiona Ctrl+C.\n")
        threading.Thread(target=abrir_navegador_cuando_este_listo, daemon=True).start()
        ejecutar(str(python), "manage.py", "runserver", "0.0.0.0:8000")
    except KeyboardInterrupt:
        print("\nServidor detenido.")
    except (OSError, ValueError, subprocess.CalledProcessError) as error:
        print(f"\nNo se pudo iniciar la aplicación: {error}")
        print(
            "Comprueba que MySQL esté iniciado y que las credenciales del archivo "
            ".env sean correctas."
        )
        print("Consulta INSTRUCCIONES_ENTREGA.md para resolver problemas de instalación.")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
