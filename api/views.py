from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Usuario, Doacao
from .serializers import UsuarioSerializer, DoacaoSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if not serializer.is_valid():
            print(f"Erro de validação no UsuarioViewSet: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def atualizar_perfil(self, request, pk=None):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def login(self, request):
        email = request.data.get('email')
        senha = request.data.get('senha')
        
        try:
            usuario = Usuario.objects.get(email=email)
            if usuario.check_password(senha):
                serializer = self.get_serializer(usuario)
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response({'error': 'Senha incorreta.'}, status=status.HTTP_401_UNAUTHORIZED)
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuário não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def recuperar_senha(self, request):
        email = request.data.get('email')
        try:
            usuario = Usuario.objects.get(email=email)
            return Response({'status': 'Instruções de recuperação enviadas para o e-mail informado.'}, status=status.HTTP_200_OK)
        except Usuario.DoesNotExist:
            return Response({'error': 'E-mail não encontrado em nossa base de dados.'}, status=status.HTTP_404_NOT_FOUND)

class DoacaoViewSet(viewsets.ModelViewSet):
    queryset = Doacao.objects.all()
    serializer_class = DoacaoSerializer

    @action(detail=True, methods=['post'])
    def reservar(self, request, pk=None):
        doacao = self.get_object()
        if doacao.status == 'disponivel':
            doacao.status = 'reservado'
            doacao.save()
            return Response({'status': 'Doação reservada com sucesso.'}, status=status.HTTP_200_OK)
        return Response({'error': 'Doação não está disponível.'}, status=status.HTTP_400_BAD_REQUEST)
