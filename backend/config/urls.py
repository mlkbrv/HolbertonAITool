from django.contrib import admin
from django.urls import include, path, re_path

from .spa_views import serve_frontend_asset, serve_frontend_index

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    re_path(r'^assets/(?P<path>.*)$', serve_frontend_asset),
    re_path(r'^(?!api|admin|static|assets).*$', serve_frontend_index),
]
