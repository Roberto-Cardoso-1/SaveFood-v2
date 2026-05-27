from django.contrib import admin
from django.utils.html import format_html

from .models import Usuario, Doacao, Notificacao


@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('nome', 'email', 'tipo_perfil', 'is_active', 'created_at')
    search_fields = ('nome', 'email')
    list_filter = ('tipo_perfil', 'is_active')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Doacao)
class DoacaoAdmin(admin.ModelAdmin):
    list_display = ('produto', 'categoria', 'quantidade', 'validade', 'status', 'doador')
    list_filter = ('status', 'categoria', 'validade')
    search_fields = ('produto', 'doador__nome')
    autocomplete_fields = ('doador', 'receptor')
    readonly_fields = ('imagem_preview', 'created_at', 'updated_at')

    def imagem_preview(self, obj):
        if obj.imagem:
            return format_html('<img src="{}" style="max-height: 200px;" />', obj.imagem.url)
        return 'Sem imagem'

    imagem_preview.short_description = 'Pré-visualização da Imagem'


@admin.register(Notificacao)
class NotificacaoAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'tipo', 'usuario', 'lida', 'created_at')
    list_filter = ('tipo', 'lida')
    search_fields = ('titulo', 'mensagem', 'usuario__nome')
    autocomplete_fields = ('usuario',)
