from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from django.views.static import serve as static_serve


def health_check(request):
    return HttpResponse("SERVIDOR SAVEFOOD ESTA VIVO E PRONTO!")


urlpatterns = [
    path('', health_check),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

urlpatterns += [
    re_path(
        r'^media/(?P<path>.*)$',
        static_serve,
        {'document_root': settings.MEDIA_ROOT},
    ),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
