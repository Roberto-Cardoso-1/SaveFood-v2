"""URLs da API SaveFood."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from .views import (
    UsuarioViewSet,
    DoacaoViewSet,
    NotificacaoViewSet,
    SaveFoodTokenView,
    ping,
)

router = DefaultRouter(trailing_slash=True)
router.register(r'usuarios', UsuarioViewSet, basename='usuario')
router.register(r'doacoes', DoacaoViewSet, basename='doacao')
router.register(r'notificacoes', NotificacaoViewSet, basename='notificacao')

# Alias legado: o mobile antigo chamava `recuperar_senha/` (underscore). O
# DefaultRouter expõe `recuperar-senha/` (hífen) baseado no nome da action.
# Garantimos os dois caminhos.
usuario_recuperar_senha_legacy = UsuarioViewSet.as_view({'post': 'recuperar_senha'})

urlpatterns = [
    path('ping/', ping, name='ping'),

    # JWT
    path('token/', SaveFoodTokenView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # Alias legado (deve vir antes do include do router)
    path('usuarios/recuperar_senha/', usuario_recuperar_senha_legacy, name='usuario-recuperar-senha-legacy'),

    path('', include(router.urls)),
]
