from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from .models import Cliente, Insumo, ItemOrden, Mesa, Orden, Producto


@transaction.atomic
def crear_orden(*, productos, tipo, empleado=None, mesa=None, cliente=None, nombre_cliente=""):
    """Crea una orden y aplica inventario/fidelización como una sola transacción."""
    if tipo not in Orden.Tipo.values:
        raise ValueError("El tipo de orden no es válido.")
    if not productos:
        raise ValueError("La orden debe incluir al menos un producto.")

    if tipo == Orden.Tipo.LOCAL:
        if mesa is None:
            raise ValueError("Selecciona una mesa disponible.")
        mesa = Mesa.objects.select_for_update().filter(
            pk=mesa.pk, estado=Mesa.Estado.DISPONIBLE
        ).first()
        if mesa is None:
            raise ValueError("La mesa seleccionada ya no está disponible.")
    else:
        mesa = None

    orden = Orden.objects.create(
        tipo=tipo,
        empleado=empleado,
        mesa=mesa,
        cliente=cliente,
        nombre_cliente=nombre_cliente,
    )
    subtotal = Decimal("0")
    for producto_id, cantidad in productos.items():
        if cantidad <= 0:
            continue
        producto = Producto.objects.select_for_update().get(pk=producto_id, disponible=True)
        ItemOrden.objects.create(
            orden=orden,
            producto=producto,
            cantidad=cantidad,
            precio_unitario=producto.precio,
        )
        subtotal += producto.precio * cantidad
        for receta in producto.receta.all():
            insumo = Insumo.objects.select_for_update().get(pk=receta.insumo_id)
            requerido = receta.cantidad * cantidad
            if insumo.cantidad < requerido:
                raise ValueError(
                    f"No hay suficiente {insumo.nombre} para preparar la orden."
                )
            insumo.cantidad -= requerido
            insumo.save(update_fields=["cantidad"])

    if not orden.items.exists():
        raise ValueError("La orden debe incluir al menos un producto.")

    orden.subtotal = subtotal
    orden.total = subtotal
    orden.save(update_fields=["subtotal", "total"])
    if mesa:
        mesa.estado = Mesa.Estado.OCUPADA
        mesa.save(update_fields=["estado"])
    if cliente:
        cliente = Cliente.objects.select_for_update().get(pk=cliente.pk)
        puntos = int(orden.total * 10)
        cliente.puntos += puntos
        cliente.total_compras += orden.total
        cliente.ultima_visita = timezone.now()
        cliente.save(update_fields=["puntos", "total_compras", "ultima_visita"])
    return orden


@transaction.atomic
def cambiar_estado_orden(*, orden_id, estado):
    """Cambia el estado y revierte inventario/fidelización al cancelar."""
    if estado not in Orden.Estado.values:
        raise ValueError("El estado de la orden no es válido.")

    orden = (
        Orden.objects.select_for_update()
        .select_related("mesa", "cliente")
        .get(pk=orden_id)
    )
    if estado == orden.estado:
        return orden
    if orden.estado in {Orden.Estado.ENTREGADO, Orden.Estado.CANCELADO}:
        raise ValueError("Una orden finalizada no puede cambiar de estado.")

    if estado == Orden.Estado.CANCELADO:
        for item in orden.items.select_related("producto"):
            for receta in item.producto.receta.all():
                insumo = Insumo.objects.select_for_update().get(pk=receta.insumo_id)
                insumo.cantidad += receta.cantidad * item.cantidad
                insumo.save(update_fields=["cantidad"])

        if orden.cliente_id:
            cliente = Cliente.objects.select_for_update().get(pk=orden.cliente_id)
            cliente.puntos = max(0, cliente.puntos - int(orden.total * 10))
            cliente.total_compras = max(
                Decimal("0"), cliente.total_compras - orden.total
            )
            cliente.save(update_fields=["puntos", "total_compras"])

    orden.estado = estado
    orden.save(update_fields=["estado"])
    if estado in {Orden.Estado.ENTREGADO, Orden.Estado.CANCELADO} and orden.mesa_id:
        Mesa.objects.filter(pk=orden.mesa_id).update(estado=Mesa.Estado.DISPONIBLE)
    return orden
