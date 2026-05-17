from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Usuario

class SecurityTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_data = {
            "nome": "Test User",
            "email": "test@example.com",
            "senha": "password123",
            "tipo_perfil": "doador"
        }
        self.user = Usuario.objects.create(**self.user_data)

    def test_password_is_hashed(self):
        user = Usuario.objects.get(email="test@example.com")
        self.assertNotEqual(user.senha, "password123")
        self.assertTrue(user.senha.startswith('pbkdf2_sha256$'))

    def test_login_success(self):
        response = self.client.post('/api/usuarios/login/', {
            "email": "test@example.com",
            "senha": "password123"
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nome'], "Test User")

    def test_login_failure(self):
        response = self.client.post('/api/usuarios/login/', {
            "email": "test@example.com",
            "senha": "wrongpassword"
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
