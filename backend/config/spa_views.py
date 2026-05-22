from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404
from django.views.static import serve


def _frontend_dir() -> Path:
    return Path(settings.BASE_DIR) / 'frontend_dist'


def serve_frontend_asset(request, path: str):
    full = _frontend_dir() / 'assets' / path
    if not full.exists() or not full.is_file():
        raise Http404
    content_type = 'application/javascript' if path.endswith('.js') else 'text/css' if path.endswith('.css') else None
    return FileResponse(open(full, 'rb'), content_type=content_type)


def serve_frontend_index(request):
    index = _frontend_dir() / 'index.html'
    if not index.exists():
        raise Http404('Frontend not built. Run npm run build.')
    return FileResponse(open(index, 'rb'), content_type='text/html')
