from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Usuario, Doacao
from .serializers import UsuarioSerializer, DoacaoSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

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
