"""
Views da API SaveFood.

Aut: JWT (SimpleJWT). O modelo `Usuario` não estende `AbstractUser`, então:
- O endpoint de login (`/api/token/`) usa `SaveFoodTokenSerializer` que valida
  email+senha contra `Usuario.check_password` e emite tokens cujo claim
  `user_id` aponta para `Usuario.id`.
- Um middleware/authentication custom (`api.auth.SaveFoodJWTAuthentication`)
  resolve o token para a instância de `Usuario`.

Permissões:
- cadastro, login, recuperar senha → AllowAny
- listar/criar doação, perfil, notificações → IsAuthenticated
"""
import logging

from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, permissions, mixins
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Usuario, Doacao, Notificacao
from .serializers import (
    UsuarioReadSerializer,
    UsuarioCreateSerializer,
    UsuarioUpdateSerializer,
    DoacaoSerializer,
    NotificacaoSerializer,
)

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def ping(request):
    return Response({'status': 'ok', 'message': 'Conexão com o servidor estabelecida!'})


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def seed_database(request):
    """
    Dispara o populate de doações de exemplo. Protegido por `SEED_KEY` em env var.

    Uso:
        POST /api/admin/seed/  body: {"key": "<SEED_KEY>"}

    Necessário porque o plano free do Render não tem acesso a Shell. Este
    endpoint substitui `python populate_products.py` rodado manualmente.

    Idempotente: pode chamar quantas vezes quiser, sempre resulta no mesmo
    estado (22 doações em 6 capitais, mesmo usuário Mercado Central).
    """
    import os
    expected = os.getenv('SEED_KEY')
    if not expected:
        return Response(
            {'error': 'SEED_KEY não configurado no servidor.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    provided = request.data.get('key') if hasattr(request, 'data') else None
    if not provided or provided != expected:
        return Response({'error': 'Chave inválida.'}, status=status.HTTP_403_FORBIDDEN)

    from .seed import populate
    try:
        result = populate()
        return Response(result, status=status.HTTP_200_OK)
    except Exception as exc:
        logger.exception('Falha no seed')
        return Response(
            {'error': 'Falha ao popular banco.', 'detail': str(exc)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class IsSelfOrReadOnly(permissions.BasePermission):
    """Usuario só pode editar/apagar seu próprio registro."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return getattr(request.user, 'pk', None) == obj.pk


from rest_framework import serializers as drf_serializers
from rest_framework.exceptions import AuthenticationFailed


class SaveFoodTokenSerializer(drf_serializers.Serializer):
    """Aceita `email` + `senha` e devolve `access`, `refresh` e dados do usuário.

    Não herda de `TokenObtainPairSerializer` para evitar bind ao campo
    `username` (nosso `Usuario` não estende AbstractUser). A emissão do token
    é manual via `RefreshToken.for_user`.
    """

    email = drf_serializers.EmailField()
    senha = drf_serializers.CharField(write_only=True, trim_whitespace=False)

    @classmethod
    def get_token(cls, user):
        token = RefreshToken.for_user(user)
        token['email'] = user.email
        token['tipo_perfil'] = user.tipo_perfil
        return token

    def validate(self, attrs):
        email = (attrs.get('email') or '').strip().lower()
        senha = attrs.get('senha') or ''
        try:
            user = Usuario.objects.get(email__iexact=email)
        except Usuario.DoesNotExist:
            raise AuthenticationFailed('E-mail ou senha incorretos.', code='no_active_account')

        if not user.is_active or not user.check_password(senha):
            raise AuthenticationFailed('E-mail ou senha incorretos.', code='no_active_account')

        refresh = self.get_token(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UsuarioReadSerializer(user).data,
        }


class SaveFoodTokenView(TokenObtainPairView):
    serializer_class = SaveFoodTokenSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes: list = []


class UsuarioViewSet(viewsets.GenericViewSet,
                     mixins.CreateModelMixin,
                     mixins.RetrieveModelMixin,
                     mixins.UpdateModelMixin):
    """
    Endpoints:
      POST  /usuarios/                       → cria (AllowAny)
      GET   /usuarios/{id}/                  → retorna (autenticado)
      PATCH /usuarios/{id}/                  → atualiza (próprio usuário)
      POST  /usuarios/{id}/atualizar_perfil/ → multipart (compat com mobile antigo)
      POST  /usuarios/login/                 → login legado (mantido como atalho)
      POST  /usuarios/recuperar-senha/       → solicita recuperação
      POST  /usuarios/recuperar_senha/       → alias (compat com mobile antigo)
      GET   /usuarios/me/                    → dados do usuário autenticado
    """
    queryset = Usuario.objects.all()
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def get_serializer_class(self):
        if self.action == 'create':
            return UsuarioCreateSerializer
        if self.action in ('update', 'partial_update', 'atualizar_perfil'):
            return UsuarioUpdateSerializer
        return UsuarioReadSerializer

    def get_permissions(self):
        if self.action in ('create', 'login', 'recuperar_senha'):
            return [permissions.AllowAny()]
        if self.action in ('update', 'partial_update', 'atualizar_perfil'):
            return [permissions.IsAuthenticated(), IsSelfOrReadOnly()]
        if self.action == 'me':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=['post'], url_path='atualizar_perfil')
    def atualizar_perfil(self, request, pk=None):
        instance = self.get_object()
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        if 'avatar' in data and data['avatar'] in ('', 'null', None):
            if instance.avatar:
                instance.avatar.delete(save=False)
            instance.avatar = None
            data.pop('avatar', None)

        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny],
            authentication_classes=[])
    def login(self, request):
        email = (request.data.get('email') or '').strip().lower()
        senha = request.data.get('senha') or ''
        try:
            usuario = Usuario.objects.get(email__iexact=email)
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuário não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        if not usuario.is_active or not usuario.check_password(senha):
            return Response({'error': 'E-mail ou senha incorretos.'}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = SaveFoodTokenSerializer.get_token(usuario)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UsuarioReadSerializer(usuario).data,
            'id': usuario.id,
            'nome': usuario.nome,
            'email': usuario.email,
            'tipo_perfil': usuario.tipo_perfil,
            'avatar': usuario.avatar.url if usuario.avatar else None,
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny],
            authentication_classes=[], url_path='recuperar-senha')
    def recuperar_senha(self, request):
        email = (request.data.get('email') or '').strip().lower()
        if Usuario.objects.filter(email__iexact=email).exists():
            logger.info('Pedido de recuperação de senha para %s', email)
        return Response(
            {'status': 'Se este e-mail estiver cadastrado, enviaremos instruções de recuperação.'},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['get'])
    def me(self, request):
        return Response(UsuarioReadSerializer(request.user).data)


class DoacaoViewSet(viewsets.ModelViewSet):
    """
    GET    /doacoes/                  → lista pública (autenticado)
    POST   /doacoes/                  → criar (só doador)
    DELETE /doacoes/{id}/             → só o dono
    POST   /doacoes/{id}/reservar/    → receptor reserva (cria notificação p/ doador)
    GET    /doacoes/minhas/           → doações criadas pelo usuário logado
    GET    /doacoes/recebidas/        → doações reservadas pelo usuário logado
    """
    serializer_class = DoacaoSerializer
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    filterset_fields = ['categoria', 'status']
    search_fields = ['produto', 'descricao', 'doador__nome']
    ordering_fields = ['created_at', 'validade']
    ordering = ['-created_at']

    def get_queryset(self):
        return (
            Doacao.objects
            .select_related('doador', 'receptor')
            .all()
        )

    def perform_create(self, serializer):
        user = self.request.user
        if getattr(user, 'tipo_perfil', None) != Usuario.PERFIL_DOADOR:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Apenas usuários do tipo doador podem publicar doações.')
        serializer.save(doador=user)

    def perform_destroy(self, instance):
        user = self.request.user
        if instance.doador_id != getattr(user, 'pk', None):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Você só pode remover suas próprias doações.')
        instance.delete()

    @action(detail=True, methods=['post'])
    def reservar(self, request, pk=None):
        doacao = self.get_object()
        user = request.user

        if doacao.doador_id == user.pk:
            return Response(
                {'error': 'Você não pode reservar sua própria doação.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if doacao.status != Doacao.STATUS_DISPONIVEL:
            return Response(
                {'error': 'Esta doação não está disponível.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        doacao.status = Doacao.STATUS_RESERVADO
        doacao.receptor = user
        doacao.save(update_fields=['status', 'receptor', 'updated_at'])

        Notificacao.objects.create(
            usuario=doacao.doador,
            tipo=Notificacao.TIPO_MSG,
            titulo='Alimento Reservado',
            mensagem=f'{user.nome} reservou sua doação de "{doacao.produto}".',
        )
        return Response(self.get_serializer(doacao).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def minhas(self, request):
        qs = self.get_queryset().filter(doador=request.user)
        page = self.paginate_queryset(qs)
        ser = self.get_serializer(page if page is not None else qs, many=True)
        return self.get_paginated_response(ser.data) if page is not None else Response(ser.data)

    @action(detail=False, methods=['get'])
    def recebidas(self, request):
        qs = self.get_queryset().filter(receptor=request.user)
        page = self.paginate_queryset(qs)
        ser = self.get_serializer(page if page is not None else qs, many=True)
        return self.get_paginated_response(ser.data) if page is not None else Response(ser.data)


class NotificacaoViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificacaoSerializer

    def get_queryset(self):
        return Notificacao.objects.filter(usuario=self.request.user)

    @action(detail=True, methods=['post'], url_path='marcar-lida')
    def marcar_lida(self, request, pk=None):
        notif = self.get_object()
        notif.lida = True
        notif.save(update_fields=['lida'])
        return Response(NotificacaoSerializer(notif).data)

    @action(detail=False, methods=['post'], url_path='marcar-todas-lidas')
    def marcar_todas_lidas(self, request):
        self.get_queryset().filter(lida=False).update(lida=True)
        return Response({'status': 'ok'})
