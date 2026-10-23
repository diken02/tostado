#!/bin/sh
cd "$(dirname "$0")" || exit 1

if command -v python3 >/dev/null 2>&1; then
    exec python3 iniciar_tostado.py
fi

echo "No se encontro Python 3. Instala Python 3.10 o superior y vuelve a intentarlo."
exit 1
