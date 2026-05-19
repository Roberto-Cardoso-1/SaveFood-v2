from django.urls import path
from .views import UsuarioViewSet, DoacaoViewSet, ping

usuario_list = UsuarioViewSet.as_view({
    'get': 'list',
    'post': 'create'
})
usuario_detail = UsuarioViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

usuario_atualizar_perfil = UsuarioViewSet.as_view({
    'post': 'atualizar_perfil'
})

usuario_login = UsuarioViewSet.as_view({
    'post': 'login'
})

usuario_recuperar_senha = UsuarioViewSet.as_view({
    'post': 'recuperar_senha'
})

doacao_list = DoacaoViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

urlpatterns = [
    path('ping/', ping, name='ping'),
    path('usuarios/', usuario_list, name='usuario-list'),
    path('usuarios/login/', usuario_login, name='usuario-login'),
    path('usuarios/recuperar-senha/', usuario_recuperar_senha, name='usuario-recuperar-senha'),
    path('usuarios/<int:pk>/', usuario_detail, name='usuario-detail'),
    path('usuarios/<int:pk>/atualizar_perfil/', usuario_atualizar_perfil, name='usuario-atualizar-perfil'),
    path('doacoes/', doacao_list, name='doacao-list'),
]
