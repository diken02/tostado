from decimal import Decimal

from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from django.db import models


class Empleado(models.Model):
    class Rol(models.TextChoices):
        ADMINISTRADOR = "administrador", "Administrador"
        CAJERO = "cajero", "Cajero"
        BARISTA = "barista", "Barista"

    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name="empleado")
    nombre = models.CharField(max_length=120)
    rol = models.CharField(max_length=20, choices=Rol.choices)

    def __str__(self):
        return f"{self.nombre} · {self.get_rol_display()}"


class Cliente(models.Model):
    nombre = models.CharField(max_length=120)
    telefono = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    puntos = models.PositiveIntegerField(default=0)
    total_compras = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    ultima_visita = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.nombre


class Proveedor(models.Model):
    nombre = models.CharField(max_length=120)
    contacto = models.CharField(max_length=120, blank=True)
    telefono = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)

    def __str__(self):
        return self.nombre


class Insumo(models.Model):
    nombre = models.CharField(max_length=120)
    cantidad = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    unidad = models.CharField(max_length=30)
    nivel_minimo = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    costo = models.DecimalField(max_digits=12, decimal_places=4, default=0)

    @property
    def bajo_stock(self):
        return self.cantidad <= self.nivel_minimo

    def __str__(self):
        return self.nombre


class Producto(models.Model):
    nombre = models.CharField(max_length=120)
    descripcion = models.TextField(blank=True)
    precio = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    categoria = models.CharField(max_length=80)
    imagen = models.URLField(blank=True)
    disponible = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre


class RecetaItem(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="receta")
    insumo = models.ForeignKey(Insumo, on_delete=models.PROTECT, related_name="usos")
    cantidad = models.DecimalField(
        max_digits=12,
        decimal_places=3,
        validators=[MinValueValidator(Decimal("0.001"))],
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["producto", "insumo"], name="receta_producto_insumo")
        ]


class Mesa(models.Model):
    class Estado(models.TextChoices):
        DISPONIBLE = "disponible", "Disponible"
        OCUPADA = "ocupada", "Ocupada"
        RESERVADA = "reservada", "Reservada"

    numero = models.PositiveIntegerField(unique=True)
    capacidad = models.PositiveIntegerField(default=2)
    estado = models.CharField(max_length=15, choices=Estado.choices, default=Estado.DISPONIBLE)
    posicion_x = models.PositiveIntegerField(default=0)
    posicion_y = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Mesa {self.numero}"


class Orden(models.Model):
    class Tipo(models.TextChoices):
        LOCAL = "local", "En el local"
        LLEVAR = "llevar", "Para llevar"
        DELIVERY = "delivery", "Delivery"

    class Estado(models.TextChoices):
        PENDIENTE = "pendiente", "Pendiente"
        PREPARANDO = "preparando", "Preparando"
        LISTO = "listo", "Listo"
        ENTREGADO = "entregado", "Entregado"
        CANCELADO = "cancelado", "Cancelado"

    tipo = models.CharField(max_length=15, choices=Tipo.choices)
    estado = models.CharField(max_length=15, choices=Estado.choices, default=Estado.PENDIENTE)
    mesa = models.ForeignKey(Mesa, null=True, blank=True, on_delete=models.SET_NULL, related_name="ordenes")
    cliente = models.ForeignKey(Cliente, null=True, blank=True, on_delete=models.SET_NULL, related_name="ordenes")
    empleado = models.ForeignKey(Empleado, null=True, blank=True, on_delete=models.SET_NULL, related_name="ordenes")
    nombre_cliente = models.CharField(max_length=120, blank=True)
    descuento_global = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fecha = models.DateTimeField(auto_now_add=True)
    notas = models.TextField(blank=True)

    class Meta:
        ordering = ["-fecha"]

    def recalcular(self):
        subtotal = sum((item.total for item in self.items.all()), Decimal("0"))
        self.subtotal = subtotal
        self.total = max(Decimal("0"), subtotal - self.descuento_global)
        self.save(update_fields=["subtotal", "total"])


class ItemOrden(models.Model):
    orden = models.ForeignKey(Orden, on_delete=models.CASCADE, related_name="items")
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT, related_name="items_vendidos")
    cantidad = models.PositiveIntegerField(default=1)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    descuento = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notas = models.CharField(max_length=250, blank=True)

    @property
    def total(self):
        return max(Decimal("0"), self.precio_unitario * self.cantidad - self.descuento)


class Pago(models.Model):
    class Metodo(models.TextChoices):
        EFECTIVO = "efectivo", "Efectivo"
        TARJETA = "tarjeta", "Tarjeta"
        BILLETERA = "billetera", "Billetera"
        QR = "qr", "QR"

    orden = models.ForeignKey(Orden, on_delete=models.CASCADE, related_name="pagos")
    metodo = models.CharField(max_length=15, choices=Metodo.choices)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    cambio = models.DecimalField(max_digits=10, decimal_places=2, default=0)


class CompraInsumo(models.Model):
    proveedor = models.ForeignKey(Proveedor, on_delete=models.PROTECT, related_name="compras")
    insumo = models.ForeignKey(Insumo, on_delete=models.PROTECT, related_name="compras")
    cantidad = models.DecimalField(
        max_digits=12,
        decimal_places=3,
        validators=[MinValueValidator(Decimal("0.001"))],
    )
    costo_unitario = models.DecimalField(
        max_digits=12,
        decimal_places=4,
        validators=[MinValueValidator(Decimal("0.0001"))],
    )
    fecha = models.DateTimeField(auto_now_add=True)

    @property
    def total(self):
        return self.cantidad * self.costo_unitario


class Turno(models.Model):
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name="turnos")
    inicio = models.DateTimeField()
    fin = models.DateTimeField(null=True, blank=True)
