from datetime import timedelta
from decimal import Decimal
from io import StringIO
from unittest.mock import patch

from django.contrib.auth.models import User
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone

from .models import Empleado, Insumo, Mesa, Orden, Producto, RecetaItem
from .services import cambiar_estado_orden, crear_orden


class CrearOrdenTests(TestCase):
    def setUp(self):
        self.insumo = Insumo.objects.create(
            nombre="Café",
            cantidad=Decimal("100"),
            unidad="g",
            nivel_minimo=Decimal("10"),
            costo=Decimal("0.01"),
        )
        self.producto = Producto.objects.create(
            nombre="Americano",
            precio=Decimal("3.00"),
            categoria="Café",
        )
        RecetaItem.objects.create(
            producto=self.producto,
            insumo=self.insumo,
            cantidad=Decimal("20"),
        )
        self.mesa = Mesa.objects.create(numero=1)

    def test_crea_orden_y_descuenta_inventario(self):
        orden = crear_orden(
            productos={self.producto.pk: 2},
            tipo=Orden.Tipo.LOCAL,
            mesa=self.mesa,
        )

        self.insumo.refresh_from_db()
        self.mesa.refresh_from_db()
        self.assertEqual(orden.total, Decimal("6.00"))
        self.assertEqual(self.insumo.cantidad, Decimal("60"))
        self.assertEqual(self.mesa.estado, Mesa.Estado.OCUPADA)

    def test_stock_insuficiente_revierte_toda_la_orden(self):
        with self.assertRaisesRegex(ValueError, "No hay suficiente"):
            crear_orden(
                productos={self.producto.pk: 6},
                tipo=Orden.Tipo.LLEVAR,
            )

        self.insumo.refresh_from_db()
        self.assertEqual(self.insumo.cantidad, Decimal("100"))
        self.assertFalse(Orden.objects.exists())

    def test_orden_local_requiere_mesa_disponible(self):
        self.mesa.estado = Mesa.Estado.OCUPADA
        self.mesa.save(update_fields=["estado"])

        with self.assertRaisesRegex(ValueError, "no está disponible"):
            crear_orden(
                productos={self.producto.pk: 1},
                tipo=Orden.Tipo.LOCAL,
                mesa=self.mesa,
            )

    def test_rechaza_tipo_de_orden_invalido(self):
        with self.assertRaisesRegex(ValueError, "tipo de orden"):
            crear_orden(productos={self.producto.pk: 1}, tipo="invalido")

    def test_cancelar_orden_restaura_inventario_y_mesa(self):
        orden = crear_orden(
            productos={self.producto.pk: 2},
            tipo=Orden.Tipo.LOCAL,
            mesa=self.mesa,
        )

        cambiar_estado_orden(orden_id=orden.pk, estado=Orden.Estado.CANCELADO)

        self.insumo.refresh_from_db()
        self.mesa.refresh_from_db()
        orden.refresh_from_db()
        self.assertEqual(self.insumo.cantidad, Decimal("100"))
        self.assertEqual(self.mesa.estado, Mesa.Estado.DISPONIBLE)
        self.assertEqual(orden.estado, Orden.Estado.CANCELADO)

    def test_orden_finalizada_no_puede_reabrirse(self):
        orden = crear_orden(
            productos={self.producto.pk: 1},
            tipo=Orden.Tipo.LLEVAR,
        )
        cambiar_estado_orden(orden_id=orden.pk, estado=Orden.Estado.ENTREGADO)

        with self.assertRaisesRegex(ValueError, "finalizada"):
            cambiar_estado_orden(
                orden_id=orden.pk,
                estado=Orden.Estado.PENDIENTE,
            )


class DashboardChartTests(TestCase):
    def setUp(self):
        usuario = User.objects.create_user(username="admin")
        Empleado.objects.create(
            usuario=usuario,
            nombre="Admin de prueba",
            rol=Empleado.Rol.ADMINISTRADOR,
        )
        self.client.force_login(usuario)

    def test_charts_sum_sales_for_the_last_seven_days_and_ignore_cancelled_orders(self):
        ahora = timezone.localtime()
        orden_hoy = Orden.objects.create(
            tipo=Orden.Tipo.LLEVAR,
            total=Decimal("5.00"),
        )
        orden_cancelada = Orden.objects.create(
            tipo=Orden.Tipo.LLEVAR,
            estado=Orden.Estado.CANCELADO,
            total=Decimal("100.00"),
        )
        orden_ayer = Orden.objects.create(
            tipo=Orden.Tipo.LLEVAR,
            total=Decimal("10.00"),
        )
        orden_anterior = Orden.objects.create(
            tipo=Orden.Tipo.LLEVAR,
            total=Decimal("7.00"),
        )
        Orden.objects.filter(pk=orden_cancelada.pk).update(fecha=ahora)
        Orden.objects.filter(pk=orden_ayer.pk).update(fecha=ahora - timedelta(days=1))
        Orden.objects.filter(pk=orden_anterior.pk).update(fecha=ahora - timedelta(days=2))

        response = self.client.get(reverse("admin"))

        ventas_por_hora = response.context["ventas_por_hora"]
        ventas_por_dia = response.context["ventas_por_dia"]
        self.assertEqual(ventas_por_hora[ahora.hour]["total"], Decimal("5.00"))
        self.assertEqual(ventas_por_dia[-1]["total"], Decimal("5.00"))
        self.assertEqual(ventas_por_dia[-2]["total"], Decimal("10.00"))
        self.assertEqual(ventas_por_dia[-3]["total"], Decimal("7.00"))
        self.assertTrue(response.context["tiene_ventas_hoy"])
        self.assertTrue(response.context["tiene_ventas_semana"])
        self.assertEqual(response.context["ventas_hoy"], Decimal("5.00"))
        self.assertEqual(response.context["diferencia_ventas"], -50.0)
        self.assertEqual(response.context["ticket_promedio"], Decimal("5.00"))


class MenuClienteTests(TestCase):
    def setUp(self):
        self.producto = Producto.objects.create(
            nombre="Latte",
            precio=Decimal("3.50"),
            categoria="Bebidas calientes",
        )

    def test_publico_puede_crear_pedido_para_llevar(self):
        response = self.client.post(
            reverse("menu"),
            {
                f"producto_{self.producto.pk}": "2",
                "tipo": Orden.Tipo.LLEVAR,
                "nombre_cliente": "Cliente de prueba",
            },
        )

        self.assertRedirects(response, reverse("menu"))
        orden = Orden.objects.get()
        self.assertEqual(orden.nombre_cliente, "Cliente de prueba")
        self.assertEqual(orden.total, Decimal("7.00"))
        self.assertEqual(orden.items.get().cantidad, 2)

    def test_pedido_en_local_requiere_una_mesa_disponible(self):
        response = self.client.post(
            reverse("menu"),
            {
                f"producto_{self.producto.pk}": "1",
                "tipo": Orden.Tipo.LOCAL,
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Selecciona una mesa disponible.")
        self.assertFalse(Orden.objects.exists())


class CatalogoDemoTests(TestCase):
    @override_settings(DEBUG=False)
    def test_produccion_no_permite_crear_usuarios_demo(self):
        with self.assertRaisesRegex(CommandError, "--solo-catalogo"):
            call_command("cargar_demo", stdout=StringIO())

    @override_settings(DEBUG=False)
    def test_catalogo_demo_no_crea_usuarios_con_contrasenas_publicas(self):
        call_command("cargar_demo", solo_catalogo=True, stdout=StringIO())

        self.assertFalse(User.objects.exists())
        self.assertEqual(Producto.objects.count(), 10)
        self.assertEqual(Mesa.objects.count(), 8)

    @override_settings(DEBUG=False)
    def test_catalogo_se_carga_solo_si_no_hay_productos_y_no_se_reinicia(self):
        call_command(
            "cargar_demo",
            solo_catalogo=True,
            si_vacio=True,
            stdout=StringIO(),
        )
        self.assertEqual(Producto.objects.count(), 10)
        self.assertEqual(Mesa.objects.count(), 8)
        self.assertFalse(User.objects.exists())

        insumo = Insumo.objects.get(nombre="Café en Grano")
        insumo.cantidad = Decimal("42")
        insumo.save(update_fields=["cantidad"])
        call_command(
            "cargar_demo",
            solo_catalogo=True,
            si_vacio=True,
            stdout=StringIO(),
        )

        self.assertEqual(Producto.objects.count(), 10)
        self.assertEqual(insumo.__class__.objects.get(pk=insumo.pk).cantidad, Decimal("42"))

    def test_si_vacio_requiere_solo_catalogo(self):
        with self.assertRaisesRegex(CommandError, "--si-vacio requiere --solo-catalogo"):
            call_command("cargar_demo", si_vacio=True, stdout=StringIO())


class CrearAdministradorTests(TestCase):
    @patch(
        "cafeteria.management.commands.crear_administrador.getpass",
        return_value="contraseña-segura-para-prueba",
    )
    def test_crea_usuario_staff_y_empleado_sin_revelar_password(self, _getpass):
        call_command(
            "crear_administrador",
            username="cafeadmin",
            nombre="Administradora",
            email="admin@example.com",
            stdout=StringIO(),
        )

        usuario = User.objects.get(username="cafeadmin")
        self.assertTrue(usuario.is_staff)
        self.assertTrue(usuario.is_superuser)
        self.assertTrue(usuario.check_password("contraseña-segura-para-prueba"))
        self.assertEqual(usuario.empleado.rol, "administrador")

    @patch(
        "cafeteria.management.commands.crear_administrador.getpass",
        return_value="corta",
    )
    def test_rechaza_password_corta(self, _getpass):
        with self.assertRaisesRegex(CommandError, "14 caracteres"):
            call_command(
                "crear_administrador",
                username="cafeadmin",
                nombre="Administradora",
                email="admin@example.com",
                stdout=StringIO(),
            )

        self.assertFalse(User.objects.exists())
