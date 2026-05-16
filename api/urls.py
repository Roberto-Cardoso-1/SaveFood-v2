from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet, DoacaoViewSet

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'doacoes', DoacaoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
