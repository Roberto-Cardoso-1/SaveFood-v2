"""
Serializers da API.

Estratégia:
- `UsuarioReadSerializer`: usado em respostas (esconde a senha).
- `UsuarioCreateSerializer`: cadastro com `senha` write-only e validações.
- `UsuarioUpdateSerializer`: atualização parcial de perfil.
- `DoacaoSerializer`: read-friendly (inclui nome do doador via select_related no
  ViewSet) e aceita upload de imagem. Validações: quantidade > 0, validade >= hoje.
- `NotificacaoSerializer`: read-only para o cliente; criação é interna.
"""
from django.utils import timezone
from rest_framework import serializers
from .models import Usuario, Doacao, Notificacao


class UsuarioReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ('id', 'nome', 'email', 'tipo_perfil', 'avatar', 'created_at')
        read_only_fields = fields


class UsuarioCreateSerializer(serializers.ModelSerializer):
    senha = serializers.CharField(write_only=True, min_length=6, max_length=128)

    class Meta:
        model = Usuario
        fields = ('id', 'nome', 'email', 'senha', 'tipo_perfil', 'avatar')
        read_only_fields = ('id',)

    def validate_email(self, value: str) -> str:
        value = value.strip().lower()
        if Usuario.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Este e-mail já está cadastrado.')
        return value

    def validate_tipo_perfil(self, value: str) -> str:
        value = (value or '').strip().lower()
        if value not in {Usuario.PERFIL_DOADOR, Usuario.PERFIL_RECEPTOR}:
            raise serializers.ValidationError("tipo_perfil deve ser 'doador' ou 'receptor'.")
        return value

    def to_representation(self, instance):
        return UsuarioReadSerializer(instance, context=self.context).data


class UsuarioUpdateSerializer(serializers.ModelSerializer):
    senha = serializers.CharField(write_only=True, min_length=6, max_length=128, required=False)

    class Meta:
        model = Usuario
        fields = ('nome', 'email', 'senha', 'avatar')

    def validate_email(self, value: str) -> str:
        value = value.strip().lower()
        qs = Usuario.objects.filter(email__iexact=value)
        if self.instance is not None:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('Este e-mail já está em uso.')
        return value

    def update(self, instance, validated_data):
        nova_senha = validated_data.pop('senha', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if nova_senha:
            instance.set_password(nova_senha)
        instance.save()
        return instance

    def to_representation(self, instance):
        return UsuarioReadSerializer(instance, context=self.context).data


class DoacaoSerializer(serializers.ModelSerializer):
    estabelecimento = serializers.CharField(source='doador.nome', read_only=True)
    doador_id = serializers.PrimaryKeyRelatedField(source='doador', read_only=True)
    receptor_id = serializers.PrimaryKeyRelatedField(source='receptor', read_only=True)

    class Meta:
        model = Doacao
        fields = (
            'id', 'produto', 'descricao', 'categoria', 'quantidade',
            'validade', 'status', 'imagem',
            'latitude', 'longitude',
            'doador_id', 'receptor_id', 'estabelecimento',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'status', 'doador_id', 'receptor_id', 'estabelecimento', 'created_at', 'updated_at')

    def validate_quantidade(self, value: int) -> int:
        if value is None or value <= 0:
            raise serializers.ValidationError('A quantidade deve ser maior que zero.')
        return value

    def validate_validade(self, value):
        if value < timezone.localdate():
            raise serializers.ValidationError('A validade não pode estar no passado.')
        return value

    def validate(self, attrs):
        lat = attrs.get('latitude')
        lng = attrs.get('longitude')
        if (lat is None) != (lng is None):
            raise serializers.ValidationError(
                'Latitude e longitude devem ser enviadas juntas.'
            )
        return attrs


class NotificacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacao
        fields = ('id', 'tipo', 'titulo', 'mensagem', 'lida', 'created_at')
        read_only_fields = fields
