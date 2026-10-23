# Generated for Tostado Cafetería.
import decimal

import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL)]

    operations = [
        migrations.CreateModel(
            name="Cliente",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("nombre", models.CharField(max_length=120)),
                ("telefono", models.CharField(blank=True, max_length=30)),
                ("email", models.EmailField(blank=True, max_length=254)),
                ("puntos", models.PositiveIntegerField(default=0)),
                ("total_compras", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("ultima_visita", models.DateTimeField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name="Insumo",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("nombre", models.CharField(max_length=120)),
                ("cantidad", models.DecimalField(decimal_places=3, default=0, max_digits=12)),
                ("unidad", models.CharField(max_length=30)),
                ("nivel_minimo", models.DecimalField(decimal_places=3, default=0, max_digits=12)),
                ("costo", models.DecimalField(decimal_places=4, default=0, max_digits=12)),
            ],
        ),
        migrations.CreateModel(
            name="Mesa",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("numero", models.PositiveIntegerField(unique=True)),
                ("capacidad", models.PositiveIntegerField(default=2)),
                (
                    "estado",
                    models.CharField(
                        choices=[("disponible", "Disponible"), ("ocupada", "Ocupada"), ("reservada", "Reservada")],
                        default="disponible",
                        max_length=15,
                    ),
                ),
                ("posicion_x", models.PositiveIntegerField(default=0)),
                ("posicion_y", models.PositiveIntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name="Producto",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("nombre", models.CharField(max_length=120)),
                ("descripcion", models.TextField(blank=True)),
                (
                    "precio",
                    models.DecimalField(
                        decimal_places=2,
                        max_digits=10,
                        validators=[django.core.validators.MinValueValidator(0)],
                    ),
                ),
                ("categoria", models.CharField(max_length=80)),
                ("imagen", models.URLField(blank=True)),
                ("disponible", models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name="Proveedor",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("nombre", models.CharField(max_length=120)),
                ("contacto", models.CharField(blank=True, max_length=120)),
                ("telefono", models.CharField(blank=True, max_length=30)),
                ("email", models.EmailField(blank=True, max_length=254)),
            ],
        ),
        migrations.CreateModel(
            name="Empleado",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("nombre", models.CharField(max_length=120)),
                (
                    "rol",
                    models.CharField(
                        choices=[("administrador", "Administrador"), ("cajero", "Cajero"), ("barista", "Barista")],
                        max_length=20,
                    ),
                ),
                (
                    "usuario",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="empleado",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="CompraInsumo",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("cantidad", models.DecimalField(decimal_places=3, max_digits=12)),
                ("costo_unitario", models.DecimalField(decimal_places=4, max_digits=12)),
                ("fecha", models.DateTimeField(auto_now_add=True)),
                (
                    "insumo",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="compras",
                        to="cafeteria.insumo",
                    ),
                ),
                (
                    "proveedor",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="compras",
                        to="cafeteria.proveedor",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Orden",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "tipo",
                    models.CharField(
                        choices=[("local", "En el local"), ("llevar", "Para llevar"), ("delivery", "Delivery")],
                        max_length=15,
                    ),
                ),
                (
                    "estado",
                    models.CharField(
                        choices=[
                            ("pendiente", "Pendiente"),
                            ("preparando", "Preparando"),
                            ("listo", "Listo"),
                            ("entregado", "Entregado"),
                            ("cancelado", "Cancelado"),
                        ],
                        default="pendiente",
                        max_length=15,
                    ),
                ),
                ("nombre_cliente", models.CharField(blank=True, max_length=120)),
                ("descuento_global", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ("subtotal", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ("total", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ("fecha", models.DateTimeField(auto_now_add=True)),
                ("notas", models.TextField(blank=True)),
                (
                    "cliente",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="ordenes",
                        to="cafeteria.cliente",
                    ),
                ),
                (
                    "empleado",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="ordenes",
                        to="cafeteria.empleado",
                    ),
                ),
                (
                    "mesa",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="ordenes",
                        to="cafeteria.mesa",
                    ),
                ),
            ],
            options={"ordering": ["-fecha"]},
        ),
        migrations.CreateModel(
            name="ItemOrden",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("cantidad", models.PositiveIntegerField(default=1)),
                ("precio_unitario", models.DecimalField(decimal_places=2, max_digits=10)),
                ("descuento", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ("notas", models.CharField(blank=True, max_length=250)),
                (
                    "orden",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="items",
                        to="cafeteria.orden",
                    ),
                ),
                (
                    "producto",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="items_vendidos",
                        to="cafeteria.producto",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Pago",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "metodo",
                    models.CharField(
                        choices=[("efectivo", "Efectivo"), ("tarjeta", "Tarjeta"), ("billetera", "Billetera"), ("qr", "QR")],
                        max_length=15,
                    ),
                ),
                ("monto", models.DecimalField(decimal_places=2, max_digits=10)),
                ("cambio", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                (
                    "orden",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="pagos",
                        to="cafeteria.orden",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="RecetaItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "cantidad",
                    models.DecimalField(
                        decimal_places=3,
                        max_digits=12,
                        validators=[django.core.validators.MinValueValidator(0)],
                    ),
                ),
                (
                    "insumo",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="usos",
                        to="cafeteria.insumo",
                    ),
                ),
                (
                    "producto",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="receta",
                        to="cafeteria.producto",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Turno",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("inicio", models.DateTimeField()),
                ("fin", models.DateTimeField(blank=True, null=True)),
                (
                    "empleado",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="turnos",
                        to="cafeteria.empleado",
                    ),
                ),
            ],
        ),
        migrations.AddConstraint(
            model_name="recetaitem",
            constraint=models.UniqueConstraint(
                fields=("producto", "insumo"),
                name="receta_producto_insumo",
            ),
        ),
    ]
