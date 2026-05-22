from django.conf import settings


def browser_cookie_kwargs(max_age=None):
    cross = getattr(settings, 'CROSS_ORIGIN_FRONTEND', False)
    secure = not settings.DEBUG or cross
    kwargs = {
        'samesite': 'None' if cross else 'Lax',
        'secure': secure,
    }
    if max_age is not None:
        kwargs['max_age'] = max_age
    return kwargs
