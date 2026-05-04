from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .views import UsuarioViewSet, DoacaoViewSet

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'doacoes', DoacaoViewSet)

@api_view(['POST'])
def login(request):
    # Lógica de login simplificada para exemplo
    return Response({"message": "Endpoint de login acessado"}, status=200)

urlpatterns = [
    path('login/', login),
    path('', include(router.urls)),
]
