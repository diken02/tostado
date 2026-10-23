from django.contrib import admin

from .models import (
    Cliente,
    CompraInsumo,
    Empleado,
    Insumo,
    ItemOrden,
    Mesa,
    Orden,
    Pago,
    Producto,
    Proveedor,
    RecetaItem,
    Turno,
)


class RecetaInline(admin.TabularInline):
    model = RecetaItem
    extra = 1


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ("nombre", "categoria", "precio", "disponible")
    list_filter = ("categoria", "disponible")
    search_fields = ("nombre",)
    inlines = [RecetaInline]


class ItemOrdenInline(admin.TabularInline):
    model = ItemOrden
    extra = 0
    readonly_fields = ("precio_unitario",)


@admin.register(Orden)
class OrdenAdmin(admin.ModelAdmin):
    list_display = ("id", "fecha", "tipo", "estado", "total", "mesa", "empleado")
    list_filter = ("estado", "tipo", "fecha")
    inlines = [ItemOrdenInline]


admin.site.register([Empleado, Cliente, Proveedor, Insumo, Mesa, Pago, CompraInsumo, Turno])
admin.site.site_header = "Tostado Cafetería"
admin.site.site_title = "Administración Tostado"
