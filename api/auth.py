"""
Autenticação JWT custom para o modelo `Usuario` (que não estende AbstractUser).

SimpleJWT por padrão chama `get_user_model().objects.get(pk=user_id)`. Como
nosso modelo é `api.Usuario` e não está configurado como `AUTH_USER_MODEL`,
escrevemos uma `BaseAuthentication` que decodifica o token e resolve para
`Usuario`.
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed, InvalidToken
from .models import Usuario


class SaveFoodJWTAuthentication(JWTAuthentication):
    """JWTAuthentication que devolve uma instância de `api.Usuario`."""

    def get_user(self, validated_token):
        try:
            user_id = validated_token['user_id']
        except KeyError:
            raise InvalidToken('Token sem claim user_id.')

        try:
            user = Usuario.objects.get(pk=user_id)
        except Usuario.DoesNotExist:
            raise AuthenticationFailed('Usuário não encontrado.', code='user_not_found')

        if not user.is_active:
            raise AuthenticationFailed('Usuário inativo.', code='user_inactive')

        return user
