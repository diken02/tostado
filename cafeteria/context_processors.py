from django.db import models

from .models import Insumo


def navegacion(request):
    if not request.user.is_authenticated:
        return {}
    return {
        "empleado_actual": getattr(request.user, "empleado", None),
        "alertas_stock": Insumo.objects.filter(cantidad__lte=models.F("nivel_minimo")).count(),
    }
