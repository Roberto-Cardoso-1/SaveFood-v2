from rest_framework import serializers
from .models import Usuario, Doacao

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'
        extra_kwargs = {'senha': {'write_only': True}}

class DoacaoSerializer(serializers.ModelSerializer):
    estabelecimento = serializers.CharField(source='doador.nome', read_only=True)
    
    class Meta:
        model = Doacao
        fields = ['id', 'produto', 'categoria', 'quantidade', 'validade', 'status', 'doador', 'imagem', 'estabelecimento']
