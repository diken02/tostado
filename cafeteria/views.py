from datetime import timedelta
from decimal import Decimal, InvalidOperation

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.db.models import Count, F, Sum
from django.db.models.functions import TruncDate
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.http import require_http_methods, require_POST

from .decorators import roles_permitidos
from .models import (
    Cliente,
    CompraInsumo,
    Empleado,
    Insumo,
    Mesa,
    Orden,
    Producto,
    Proveedor,
)
from .services import cambiar_estado_orden, crear_orden

ADMIN = Empleado.Rol.ADMINISTRADOR
CAJERO = Empleado.Rol.CAJERO
BARISTA = Empleado.Rol.BARISTA


def _decimal_positivo(valor, campo):
    try:
        numero = Decimal(valor)
    except (InvalidOperation, TypeError, ValueError) as error:
        raise ValueError(f"{campo} debe ser un número válido.") from error
    if not numero.is_finite() or numero <= 0:
        raise ValueError(f"{campo} debe ser mayor que cero.")
    return numero


def _cantidades(request, limite=99):
    cantidades = {}
    for producto in Producto.objects.filter(disponible=True):
        valor = request.POST.get(f"producto_{producto.pk}", 0)
        try:
            cantidad = int(valor)
        except (TypeError, ValueError) as error:
            raise ValueError("Las cantidades deben ser números enteros.") from error
        if cantidad < 0 or cantidad > limite:
            raise ValueError(f"Cada cantidad debe estar entre 0 y {limite}.")
        if cantidad > 0:
            cantidades[producto.pk] = cantidad
    return cantidades


@require_http_methods(["GET", "POST"])
def login_view(request):
    if request.user.is_authenticated:
        return redirect("admin")
    if request.method == "POST":
        user = authenticate(
            request,
            username=request.POST.get("usuario", "").strip(),
            password=request.POST.get("contrasena", ""),
        )
        if user and user.is_active and hasattr(user, "empleado"):
            login(request, user)
            return redirect("admin")
        messages.error(request, "Usuario o contraseña incorrectos.")
    return render(request, "cafeteria/login.html")


@require_POST
def logout_view(request):
    logout(request)
    return redirect("login")


@require_http_methods(["GET", "POST"])
def menu_cliente(request):
    productos = Producto.objects.filter(disponible=True).order_by("categoria", "nombre")
    if request.method == "POST":
        try:
            mesa = (
                Mesa.objects.filter(pk=request.POST.get("mesa"), estado=Mesa.Estado.DISPONIBLE).first()
                if request.POST.get("tipo") == Orden.Tipo.LOCAL
                else None
            )
            orden = crear_orden(
                productos=_cantidades(request, limite=20),
                tipo=request.POST.get("tipo", Orden.Tipo.LLEVAR),
                mesa=mesa,
                nombre_cliente=request.POST.get("nombre_cliente", "").strip(),
            )
            messages.success(request, f"Pedido #{orden.pk} recibido. Total: ${orden.total}")
            return redirect("menu")
        except (ValueError, Producto.DoesNotExist) as error:
            messages.error(request, str(error))
    return render(
        request,
        "cafeteria/menu.html",
        {
            "productos": productos,
            "mesas": Mesa.objects.filter(estado=Mesa.Estado.DISPONIBLE),
        },
    )


@roles_permitidos(ADMIN, CAJERO, BARISTA)
def centro_admin(request):
    hoy = timezone.localdate()
    ayer = hoy - timedelta(days=1)
    ordenes_hoy = Orden.objects.filter(fecha__date=hoy)
    ventas_hoy = ordenes_hoy.exclude(estado=Orden.Estado.CANCELADO).aggregate(
        total=Sum("total")
    )["total"] or Decimal("0")
    pedidos_hoy = ordenes_hoy.exclude(estado=Orden.Estado.CANCELADO).count()
    ventas_ayer = (
        Orden.objects.filter(fecha__date=ayer)
        .exclude(estado=Orden.Estado.CANCELADO)
        .aggregate(total=Sum("total"))["total"]
        or Decimal("0")
    )
    diferencia_ventas = (
        round(float((ventas_hoy - ventas_ayer) / ventas_ayer * 100), 1)
        if ventas_ayer
        else 0
    )
    ventas_por_hora = [{"hora": hora, "total": Decimal("0")} for hora in range(24)]
    ventas_por_dia = [
        {"fecha": hoy - timedelta(days=6 - indice), "total": Decimal("0")}
        for indice in range(7)
    ]
    totales_por_fecha = {item["fecha"]: item for item in ventas_por_dia}

    ventas_registradas = Orden.objects.exclude(estado=Orden.Estado.CANCELADO).only(
        "fecha", "total"
    )
    for venta in ventas_registradas.filter(fecha__date=hoy):
        hora = timezone.localtime(venta.fecha).hour
        ventas_por_hora[hora]["total"] += venta.total

    for venta in ventas_registradas.filter(
        fecha__date__gte=ventas_por_dia[0]["fecha"],
        fecha__date__lte=hoy,
    ):
        fecha = timezone.localtime(venta.fecha).date()
        totales_por_fecha[fecha]["total"] += venta.total

    maximo_por_hora = max((item["total"] for item in ventas_por_hora), default=0)
    maximo_por_dia = max((item["total"] for item in ventas_por_dia), default=0)
    for item in ventas_por_hora:
        item["altura"] = round(item["total"] / maximo_por_hora * 100) if maximo_por_hora else 0
    for indice, item in enumerate(ventas_por_dia):
        item["x"] = 32 + round(656 * indice / 6)
        item["y"] = (
            180 - round(item["total"] / maximo_por_dia * 140)
            if maximo_por_dia
            else 180
        )
    ventas_linea = " ".join(f'{item["x"]},{item["y"]}' for item in ventas_por_dia)

    return render(
        request,
        "cafeteria/admin.html",
        {
            "ordenes": ordenes_hoy.prefetch_related("items__producto")[:20],
            "ventas_hoy": ventas_hoy,
            "pedidos_hoy": pedidos_hoy,
            "ticket_promedio": ventas_hoy / pedidos_hoy if pedidos_hoy else Decimal("0"),
            "diferencia_ventas": diferencia_ventas,
            "clientes_total": Cliente.objects.count(),
            "alertas_inventario": Insumo.objects.filter(cantidad__lte=F("nivel_minimo")).count(),
            "en_produccion": Orden.objects.filter(
                estado__in=[Orden.Estado.PENDIENTE, Orden.Estado.PREPARANDO]
            ).count(),
            "productos_activos": Producto.objects.filter(disponible=True).count(),
            "stock_bajo": Insumo.objects.filter(cantidad__lte=F("nivel_minimo")),
            "ventas_por_hora": ventas_por_hora,
            "ventas_por_dia": ventas_por_dia,
            "ventas_linea": ventas_linea,
            "tiene_ventas_hoy": maximo_por_hora > 0,
            "tiene_ventas_semana": maximo_por_dia > 0,
        },
    )


@roles_permitidos(ADMIN, CAJERO)
@require_http_methods(["GET", "POST"])
def pos(request):
    if request.method == "POST":
        try:
            orden = crear_orden(
                productos=_cantidades(request),
                tipo=request.POST.get("tipo", Orden.Tipo.LLEVAR),
                empleado=request.user.empleado,
                mesa=Mesa.objects.filter(
                    pk=request.POST.get("mesa"), estado=Mesa.Estado.DISPONIBLE
                ).first(),
                cliente=Cliente.objects.filter(pk=request.POST.get("cliente")).first(),
            )
            messages.success(request, f"Orden #{orden.pk} creada por ${orden.total}.")
            return redirect("pos")
        except (ValueError, Producto.DoesNotExist) as error:
            messages.error(request, str(error))
    return render(
        request,
        "cafeteria/pos.html",
        {
            "productos": Producto.objects.filter(disponible=True).order_by("categoria", "nombre"),
            "mesas": Mesa.objects.filter(estado=Mesa.Estado.DISPONIBLE),
            "clientes": Cliente.objects.order_by("nombre"),
        },
    )


@roles_permitidos(ADMIN, CAJERO, BARISTA)
@require_http_methods(["GET", "POST"])
def mesas(request):
    if request.method == "POST":
        mesa = get_object_or_404(Mesa, pk=request.POST.get("mesa_id"))
        estado = request.POST.get("estado")
        if estado in Mesa.Estado.values:
            mesa.estado = estado
            mesa.save(update_fields=["estado"])
            messages.success(request, f"Mesa {mesa.numero} actualizada.")
        return redirect("mesas")
    return render(
        request,
        "cafeteria/mesas.html",
        {
            "mesas": Mesa.objects.all().order_by("numero"),
            "ordenes": Orden.objects.filter(
                estado__in=[Orden.Estado.PENDIENTE, Orden.Estado.PREPARANDO, Orden.Estado.LISTO]
            ).select_related("mesa"),
        },
    )


@roles_permitidos(ADMIN, CAJERO, BARISTA)
@require_POST
def actualizar_orden(request, pk):
    estado = request.POST.get("estado")
    try:
        cambiar_estado_orden(orden_id=pk, estado=estado)
    except Orden.DoesNotExist:
        get_object_or_404(Orden, pk=pk)
    except ValueError as error:
        messages.error(request, str(error))
    siguiente = request.POST.get("siguiente", "admin")
    return redirect(siguiente if siguiente in {"admin", "mesas"} else "admin")


@roles_permitidos(ADMIN)
@require_http_methods(["GET", "POST"])
def productos(request):
    if request.method == "POST":
        if request.POST.get("accion") == "alternar":
            producto = get_object_or_404(Producto, pk=request.POST.get("producto_id"))
            producto.disponible = not producto.disponible
            producto.save(update_fields=["disponible"])
        else:
            try:
                producto = Producto(
                    nombre=request.POST["nombre"].strip(),
                    descripcion=request.POST.get("descripcion", "").strip(),
                    precio=_decimal_positivo(request.POST["precio"], "El precio"),
                    categoria=request.POST["categoria"].strip(),
                    imagen=request.POST.get("imagen", "").strip(),
                )
                producto.full_clean()
                producto.save()
                messages.success(request, "Producto creado.")
            except (KeyError, ValueError, ValidationError) as error:
                messages.error(request, f"No se pudo crear el producto: {error}")
        return redirect("productos")
    return render(
        request,
        "cafeteria/productos.html",
        {"productos": Producto.objects.all().order_by("categoria", "nombre")},
    )


@roles_permitidos(ADMIN)
@require_http_methods(["GET", "POST"])
def inventario(request):
    if request.method == "POST":
        try:
            if len(request.POST.get("contrasena", "")) < 6:
                raise ValueError("La contraseña debe tener al menos 6 caracteres.")
            with transaction.atomic():
                insumo = Insumo.objects.select_for_update().get(pk=request.POST["insumo"])
                cantidad = _decimal_positivo(request.POST["cantidad"], "La cantidad")
                compra = CompraInsumo(
                    proveedor_id=request.POST["proveedor"],
                    insumo=insumo,
                    cantidad=cantidad,
                    costo_unitario=_decimal_positivo(
                        request.POST["costo_unitario"], "El costo unitario"
                    ),
                )
                compra.full_clean()
                compra.save()
                insumo.cantidad = F("cantidad") + compra.cantidad
                insumo.save(update_fields=["cantidad"])
            messages.success(request, "Compra registrada y stock actualizado.")
        except (
            IntegrityError,
            KeyError,
            Insumo.DoesNotExist,
            ValidationError,
            ValueError,
        ) as error:
            messages.error(request, f"No se pudo registrar la compra: {error}")
        return redirect("inventario")
    return render(
        request,
        "cafeteria/inventario.html",
        {
            "insumos": Insumo.objects.all().order_by("nombre"),
            "proveedores": Proveedor.objects.all().order_by("nombre"),
        },
    )


@roles_permitidos(ADMIN, CAJERO)
@require_http_methods(["GET", "POST"])
def clientes(request):
    if request.method == "POST":
        try:
            cliente = Cliente(
                nombre=request.POST.get("nombre", "").strip(),
                telefono=request.POST.get("telefono", "").strip(),
                email=request.POST.get("email", "").strip(),
            )
            cliente.full_clean()
            cliente.save()
            messages.success(request, "Cliente agregado al programa de fidelización.")
        except ValidationError as error:
            messages.error(request, f"No se pudo agregar el cliente: {error}")
        return redirect("clientes")
    return render(
        request,
        "cafeteria/clientes.html",
        {"clientes": Cliente.objects.all().order_by("-puntos", "nombre")},
    )


@roles_permitidos(ADMIN)
def reportes(request):
    ventas = (
        Orden.objects.exclude(estado=Orden.Estado.CANCELADO)
        .annotate(dia=TruncDate("fecha"))
        .values("dia")
        .annotate(total=Sum("total"), ordenes=Count("id"))
        .order_by("-dia")[:30]
    )
    productos_top = (
        Producto.objects.annotate(unidades=Sum("items_vendidos__cantidad"))
        .filter(unidades__gt=0)
        .order_by("-unidades")[:8]
    )
    return render(
        request,
        "cafeteria/reportes.html",
        {
            "ventas": ventas,
            "productos_top": productos_top,
            "total": Orden.objects.exclude(estado=Orden.Estado.CANCELADO).aggregate(
                total=Sum("total")
            )["total"]
            or 0,
        },
    )


@roles_permitidos(ADMIN)
@require_http_methods(["GET", "POST"])
def empleados(request):
    if request.method == "POST":
        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    username=request.POST["usuario"].strip(),
                    email=request.POST.get("email", "").strip(),
                    password=request.POST["contrasena"],
                )
                empleado = Empleado(
                    usuario=user,
                    nombre=request.POST["nombre"].strip(),
                    rol=request.POST["rol"],
                )
                empleado.full_clean()
                empleado.save()
            messages.success(request, "Cuenta de empleado creada.")
        except (IntegrityError, KeyError, ValidationError, ValueError):
            messages.error(request, "No se pudo crear la cuenta; verifica que el usuario sea único.")
        return redirect("empleados")
    return render(
        request,
        "cafeteria/empleados.html",
        {"empleados": Empleado.objects.select_related("usuario").order_by("nombre")},
    )
