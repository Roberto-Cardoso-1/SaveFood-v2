from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import make_password, check_password

def validate_positive_nonzero(value):
    if value <= 0:
        raise ValidationError('A quantidade deve ser maior que zero.')

class Usuario(models.Model):
    PERFIL_CHOICES = [
        ('doador', 'Doador'),
        ('receptor', 'Receptor'),
    ]
    nome = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    senha = models.CharField(max_length=255)  
    tipo_perfil = models.CharField(max_length=10, choices=PERFIL_CHOICES)

    def save(self, *args, **kwargs):
        # Hash a senha apenas se ela não estiver no formato de hash do Django
        if self.senha and not self.senha.startswith('pbkdf2_sha256$'):
            self.senha = make_password(self.senha)
        super().save(*args, **kwargs)

    def check_password(self, raw_password):
        return check_password(raw_password, self.senha)

    def __str__(self):
        return self.nome

class Doacao(models.Model):
    STATUS_CHOICES = [
        ('disponivel', 'Disponível'),
        ('reservado', 'Reservado'),
        ('entregue', 'Entregue'),
    ]
    produto = models.CharField(max_length=255)
    quantidade = models.IntegerField(validators=[validate_positive_nonzero])
    validade = models.DateField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='disponivel')
    doador = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='doacoes')
    imagem = models.ImageField(upload_to='doacoes/', null=True, blank=True)

    def __str__(self):
        return f"{self.produto} ({self.quantidade})"
