from django.contrib import admin
from .models import Usuario, Doacao
from django.utils.html import format_html

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('nome', 'email', 'tipo_perfil')
    search_fields = ('nome', 'email')
    list_filter = ('tipo_perfil',)

@admin.register(Doacao)
class DoacaoAdmin(admin.ModelAdmin):
    list_display = ('produto', 'quantidade', 'validade', 'status', 'doador')
    list_filter = ('status', 'validade', 'doador')
    search_fields = ('produto',)
    readonly_fields = ('imagem_preview',)

    def imagem_preview(self, obj):
        if obj.imagem:
            return format_html('<img src="{}" style="max-height: 200px;" />', obj.imagem.url)
        return "Sem imagem"
    
    imagem_preview.short_description = "Pré-visualização da Imagem"
