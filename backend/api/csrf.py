from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie

csrf_enforce = method_decorator(ensure_csrf_cookie, name='dispatch')
