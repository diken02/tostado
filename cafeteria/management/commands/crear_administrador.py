from getpass import getpass

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from cafeteria.models import Empleado


class Command(BaseCommand):
    help = "Crea una cuenta segura de administrador para el sistema de cafetería."

    def add_arguments(self, parser):
        parser.add_argument("--username", required=True)
        parser.add_argument("--nombre", required=True)
        parser.add_argument("--email", required=True)

    @transaction.atomic
    def handle(self, *args, **options):
        username = options["username"].strip()
        nombre = options["nombre"].strip()
        email = options["email"].strip()
        if not username or not nombre or not email:
            raise CommandError("Usuario, nombre y correo no pueden estar vacíos.")
        if User.objects.filter(username=username).exists():
            raise CommandError(f"El usuario «{username}» ya existe.")

        password = getpass("Contraseña del administrador (mínimo 14 caracteres): ")
        if len(password) < 14:
            raise CommandError("La contraseña debe tener al menos 14 caracteres.")
        if password != getpass("Confirma la contraseña: "):
            raise CommandError("Las contraseñas no coinciden.")
        try:
            validate_password(password, user=User(username=username, email=email))
        except ValidationError as error:
            raise CommandError(" ".join(error.messages)) from error

        usuario = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
        )
        Empleado.objects.create(
            usuario=usuario,
            nombre=nombre,
            rol=Empleado.Rol.ADMINISTRADOR,
        )
        self.stdout.write(
            self.style.SUCCESS(f"Cuenta de administrador «{username}» creada.")
        )
