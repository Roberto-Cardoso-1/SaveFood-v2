import os
import django
import sys
from datetime import date, timedelta


sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'savefood.settings')
django.setup()

from api.models import Usuario, Doacao
from django.core.files.base import ContentFile
import requests

def populate_data():
    print("Iniciando povoamento de dados com categorias...")
    
   
    doador, _ = Usuario.objects.get_or_create(
        email='contato@mercado.com',
        defaults={'nome': 'Mercado Central', 'senha': 'password123', 'tipo_perfil': 'doador'}
    )

    
    Doacao.objects.all().delete()
    print("Doações antigas removidas.")

    
    produtos = [
        {
            'produto': 'Cesta de Pães Franceses',
            'categoria': 'Padaria',
            'quantidade': 10,
            'validade': date.today() + timedelta(days=1),
            'imagem_url': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500'
        },
        {
            'produto': 'Mix de Frutas da Estação',
            'categoria': 'Frutas',
            'quantidade': 5,
            'validade': date.today() + timedelta(days=2),
            'imagem_url': 'https://images.unsplash.com/photo-1610832958506-ee563384239d?w=500'
        },
        {
            'produto': 'Marmita Vegana Fresca',
            'categoria': 'Refeições',
            'quantidade': 3,
            'validade': date.today(),
            'imagem_url': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500'
        },
        {
            'produto': 'Donuts Sortidos',
            'categoria': 'Doces',
            'quantidade': 6,
            'validade': date.today() + timedelta(days=1),
            'imagem_url': 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=500'
        },
        {
            'produto': 'Iogurte Natural',
            'categoria': 'Laticínios',
            'quantidade': 4,
            'validade': date.today() + timedelta(days=3),
            'imagem_url': 'https://images.unsplash.com/photo-1571212515416-f6103487f544?w=500'
        },
        {
            'produto': 'Pizza de Muçarela',
            'categoria': 'Refeições',
            'quantidade': 1,
            'validade': date.today(),
            'imagem_url': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500'
        },
    ]

    for p in produtos:
        doacao = Doacao.objects.create(
            produto=p['produto'],
            categoria=p['categoria'],
            quantidade=p['quantidade'],
            validade=p['validade'],
            status='disponivel',
            doador=doador
        )
        
        try:
            response = requests.get(p['imagem_url'])
            if response.status_code == 200:
                doacao.imagem.save(f"prod_{doacao.id}.jpg", ContentFile(response.content), save=True)
                print(f" Adicionado: {p['produto']} ({p['categoria']})")
        except:
            print(f" Erro na imagem: {p['produto']}")

    print("\n Pronto! Filtro de produtos agora deve funcionar perfeitamente.")

if __name__ == "__main__":
    populate_data()
