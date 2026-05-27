"""
Modelos do SaveFood.

Mantemos o `Usuario` customizado (sem `AbstractUser`) por compatibilidade com
dados existentes. Para JWT funcionar com este modelo:
- `is_authenticated` retorna `True` em instâncias válidas (DRF checa isso).
- `pk` é exposto no token.
"""
from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone


def validate_positive_nonzero(value):
    if value is None or value <= 0:
        raise ValidationError('A quantidade deve ser maior que zero.')


def validate_validade_futura(value):
    if value < timezone.localdate():
        raise ValidationError('A validade não pode estar no passado.')


class Usuario(models.Model):
    PERFIL_DOADOR = 'doador'
    PERFIL_RECEPTOR = 'receptor'
    PERFIL_CHOICES = [
        (PERFIL_DOADOR, 'Doador'),
        (PERFIL_RECEPTOR, 'Receptor'),
    ]

    nome = models.CharField(max_length=255)
    email = models.EmailField(unique=True, db_index=True)
    senha = models.CharField(max_length=255)
    tipo_perfil = models.CharField(max_length=10, choices=PERFIL_CHOICES)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if self.senha and not self.senha.startswith('pbkdf2_'):
            self.senha = make_password(self.senha)
        super().save(*args, **kwargs)

    # -- API compatível com DRF / SimpleJWT -----------------------------------
    def set_password(self, raw_password: str) -> None:
        self.senha = make_password(raw_password)

    def check_password(self, raw_password: str) -> bool:
        return check_password(raw_password, self.senha)

    @property
    def is_authenticated(self) -> bool:
        return self.is_active

    @property
    def is_anonymous(self) -> bool:
        return False

    def __str__(self):
        return f'{self.nome} <{self.email}>'


class Doacao(models.Model):
    STATUS_DISPONIVEL = 'disponivel'
    STATUS_RESERVADO = 'reservado'
    STATUS_ENTREGUE = 'entregue'
    STATUS_CHOICES = [
        (STATUS_DISPONIVEL, 'Disponível'),
        (STATUS_RESERVADO, 'Reservado'),
        (STATUS_ENTREGUE, 'Entregue'),
    ]

    CATEGORIA_CHOICES = [
        ('Padaria', 'Padaria'),
        ('Frutas', 'Frutas'),
        ('Refeições', 'Refeições'),
        ('Doces', 'Doces'),
        ('Laticínios', 'Laticínios'),
        ('Outros', 'Outros'),
    ]

    produto = models.CharField(max_length=255)
    descricao = models.TextField(blank=True, default='')
    categoria = models.CharField(max_length=20, choices=CATEGORIA_CHOICES, default='Outros')
    quantidade = models.IntegerField(validators=[validate_positive_nonzero])
    validade = models.DateField(validators=[validate_validade_futura])
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default=STATUS_DISPONIVEL, db_index=True)
    doador = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='doacoes')
    receptor = models.ForeignKey(
        Usuario, on_delete=models.SET_NULL, null=True, blank=True, related_name='reservas'
    )
    imagem = models.ImageField(upload_to='doacoes/', null=True, blank=True)

    # Geolocalização do ponto de coleta. Opcional: doações antigas ficam null e
    # não aparecem no mapa, mas continuam na lista da Home.
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'validade']),
            models.Index(fields=['categoria', 'status']),
        ]

    def __str__(self):
        return f'{self.produto} ({self.quantidade}) — {self.get_status_display()}'


class Notificacao(models.Model):
    TIPO_ALERTA = 'alerta'
    TIPO_RANKING = 'ranking'
    TIPO_IMPACTO = 'impacto'
    TIPO_MSG = 'mensagem'
    TIPO_CHOICES = [
        (TIPO_ALERTA, 'Alerta'),
        (TIPO_RANKING, 'Ranking'),
        (TIPO_IMPACTO, 'Impacto'),
        (TIPO_MSG, 'Mensagem'),
    ]

    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='notificacoes')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default=TIPO_ALERTA)
    titulo = models.CharField(max_length=255)
    mensagem = models.TextField()
    lida = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'[{self.get_tipo_display()}] {self.titulo}'
