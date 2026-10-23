#!/usr/bin/env bash
set -o errexit

python -m pip install -r requirements.txt
python manage.py migrate --noinput
python manage.py cargar_demo --solo-catalogo --si-vacio
python manage.py collectstatic --noinput
