from django.http import JsonResponse


def handler404(request, exception):
    if request.path.startswith('/api/'):
        return JsonResponse({'detail': 'Not found'}, status=404)
    from django.views.defaults import page_not_found

    return page_not_found(request, exception)
