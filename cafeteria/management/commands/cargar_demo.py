from decimal import Decimal

from django.contrib.auth.models import User
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from cafeteria.models import Cliente, Empleado, Insumo, Mesa, Producto, Proveedor, RecetaItem


IMAGENES_DEMO = {
    "Café Americano": "https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=800&q=80",
    "Café Latte": "https://images.unsplash.com/photo-1529892485617-25f63cd7b1e9?auto=format&fit=crop&w=800&q=80",
    "Cappuccino": "https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=800&q=80",
    "Té Verde": "https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=800&q=80",
    "Frappé de Chocolate": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=800&q=80",
    "Jugo Natural": "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=800&q=80",
    "Croissant": "https://images.unsplash.com/photo-1712723247648-64a03ba7c333?auto=format&fit=crop&w=800&q=80",
    "Muffin de Arándanos": "https://images.unsplash.com/photo-1712723247648-64a03ba7c333?auto=format&fit=crop&w=800&q=80",
    "Sandwich Jamón y Queso": "https://images.unsplash.com/photo-1721980743519-01f627e7b4b6?auto=format&fit=crop&w=800&q=80",
    "Tostada con Aguacate": "https://images.unsplash.com/photo-1721980743519-01f627e7b4b6?auto=format&fit=crop&w=800&q=80",
}


class Command(BaseCommand):
    help = "Carga los usuarios y datos de demostración de Tostado Cafetería."

    def add_arguments(self, parser):
        parser.add_argument(
            "--solo-catalogo",
            action="store_true",
            help="Carga productos, inventario y mesas sin crear usuarios demo.",
        )

    def handle(self, *args, **options):
        solo_catalogo = options["solo_catalogo"]
        if not settings.DEBUG and not solo_catalogo:
            raise CommandError(
                "En producción usa --solo-catalogo para no crear cuentas demo inseguras."
            )

        if not solo_catalogo:
            empleados = [
                ("admin", "admin123", "Admin Principal", "administrador", "admin@cafeteria.com"),
                ("juan", "juan123", "Juan Pérez", "cajero", "juan@cafeteria.com"),
                ("laura", "laura123", "Laura Silva", "barista", "laura@cafeteria.com"),
            ]
            for username, password, nombre, rol, email in empleados:
                user, creado = User.objects.get_or_create(
                    username=username, defaults={"email": email}
                )
                if creado:
                    user.set_password(password)
                    user.save()
                Empleado.objects.update_or_create(
                    usuario=user, defaults={"nombre": nombre, "rol": rol}
                )

        insumos = [
            ("Café en Grano", "5000", "g", "1000", "0.015"),
            ("Leche", "20", "L", "5", "1.2"),
            ("Azúcar", "3000", "g", "500", "0.002"),
            ("Vasos Papel 8oz", "500", "unidad", "100", "0.15"),
            ("Vasos Papel 12oz", "400", "unidad", "100", "0.20"),
            ("Chocolate en Polvo", "1000", "g", "200", "0.01"),
            ("Té Verde", "200", "bolsitas", "50", "0.30"),
            ("Croissants", "50", "unidad", "10", "0.80"),
            ("Pan Sandwich", "30", "unidad", "10", "1.50"),
            ("Jamón", "500", "g", "100", "0.012"),
        ]
        inventario = {}
        for nombre, cantidad, unidad, minimo, costo in insumos:
            inventario[nombre], _ = Insumo.objects.update_or_create(
                nombre=nombre,
                defaults={
                    "cantidad": Decimal(cantidad),
                    "unidad": unidad,
                    "nivel_minimo": Decimal(minimo),
                    "costo": Decimal(costo),
                },
            )

        productos = [
            ("Café Americano", "Café negro tradicional", "2.50", "Bebidas Calientes", {"Café en Grano": "18", "Vasos Papel 8oz": "1"}),
            ("Café Latte", "Espresso con leche vaporizada", "3.50", "Bebidas Calientes", {"Café en Grano": "18", "Leche": "0.25", "Vasos Papel 12oz": "1"}),
            ("Cappuccino", "Espresso con leche y espuma", "3.75", "Bebidas Calientes", {"Café en Grano": "18", "Leche": "0.20", "Vasos Papel 12oz": "1"}),
            ("Té Verde", "Infusión de té verde", "2.00", "Bebidas Calientes", {"Té Verde": "1", "Vasos Papel 8oz": "1"}),
            ("Frappé de Chocolate", "Bebida fría con chocolate", "4.50", "Bebidas Frías", {"Leche": "0.30", "Chocolate en Polvo": "30", "Vasos Papel 12oz": "1"}),
            ("Jugo Natural", "Jugo de fruta natural", "3.00", "Bebidas Frías", {}),
            ("Croissant", "Croissant de mantequilla", "2.50", "Repostería", {"Croissants": "1"}),
            ("Muffin de Arándanos", "Muffin casero con arándanos", "2.75", "Repostería", {}),
            ("Sandwich Jamón y Queso", "Sandwich caliente", "4.00", "Sándwiches", {"Pan Sandwich": "1", "Jamón": "50"}),
            ("Tostada con Aguacate", "Pan tostado con aguacate", "3.50", "Sándwiches", {}),
        ]
        for nombre, descripcion, precio, categoria, receta in productos:
            producto, _ = Producto.objects.update_or_create(
                nombre=nombre,
                defaults={
                    "descripcion": descripcion,
                    "precio": Decimal(precio),
                    "categoria": categoria,
                    "imagen": IMAGENES_DEMO[nombre],
                    "disponible": True,
                },
            )
            for insumo, cantidad in receta.items():
                RecetaItem.objects.update_or_create(
                    producto=producto,
                    insumo=inventario[insumo],
                    defaults={"cantidad": Decimal(cantidad)},
                )

        for numero, capacidad in [(1, 2), (2, 2), (3, 4), (4, 4), (5, 6), (6, 6), (7, 2), (8, 2)]:
            Mesa.objects.update_or_create(numero=numero, defaults={"capacidad": capacidad})

        if not solo_catalogo:
            clientes = [
                ("María González", "3001234567", "maria@email.com", 150, "250.50"),
                ("Carlos Rodríguez", "3009876543", "carlos@email.com", 85, "175.00"),
                ("Ana Martínez", "3005551234", "ana@email.com", 220, "450.75"),
            ]
            for nombre, telefono, email, puntos, total in clientes:
                Cliente.objects.update_or_create(
                    email=email,
                    defaults={
                        "nombre": nombre,
                        "telefono": telefono,
                        "puntos": puntos,
                        "total_compras": Decimal(total),
                    },
                )

            for nombre, contacto, telefono, email in [
                ("Café Premium S.A.", "Roberto Gómez", "6012345678", "ventas@cafepremium.com"),
                ("Lácteos del Valle", "Sandra López", "6019876543", "pedidos@lacteosval.com"),
                ("Panadería Artesanal", "Miguel Ángel", "6015551234", "info@panartesanal.com"),
            ]:
                Proveedor.objects.update_or_create(
                    nombre=nombre,
                    defaults={"contacto": contacto, "telefono": telefono, "email": email},
                )
        self.stdout.write(self.style.SUCCESS("Datos de demostración cargados correctamente."))
