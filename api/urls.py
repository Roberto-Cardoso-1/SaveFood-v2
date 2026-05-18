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

doacao_list = DoacaoViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

urlpatterns = [
    path('ping/', ping, name='ping'),
    path('usuarios/', usuario_list, name='usuario-list'),
    path('usuarios/<int:pk>/', usuario_detail, name='usuario-detail'),
    path('doacoes/', doacao_list, name='doacao-list'),
]
