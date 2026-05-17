from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Usuario, Doacao
from .serializers import UsuarioSerializer, DoacaoSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

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
