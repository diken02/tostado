from functools import wraps

from django.contrib import messages
from django.shortcuts import redirect


def roles_permitidos(*roles):
    def decorator(view):
        @wraps(view)
        def wrapped(request, *args, **kwargs):
            empleado = getattr(request.user, "empleado", None)
            if not request.user.is_authenticated:
                return redirect("login")
            if empleado is None or empleado.rol not in roles:
                messages.error(request, "No tienes permiso para acceder a esta sección.")
                return redirect("admin")
            return view(request, *args, **kwargs)

        return wrapped

    return decorator
