from django.urls import path

from . import views

urlpatterns = [
    path("", views.login_view, name="login"),
    path("salir/", views.logout_view, name="logout"),
    path("menu/", views.menu_cliente, name="menu"),
    path("admin/", views.centro_admin, name="admin"),
    path("pos/", views.pos, name="pos"),
    path("mesas/", views.mesas, name="mesas"),
    path("ordenes/<int:pk>/estado/", views.actualizar_orden, name="actualizar_orden"),
    path("productos/", views.productos, name="productos"),
    path("inventario/", views.inventario, name="inventario"),
    path("clientes/", views.clientes, name="clientes"),
    path("reportes/", views.reportes, name="reportes"),
    path("empleados/", views.empleados, name="empleados"),
]
