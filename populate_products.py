"""
Repopula o banco com doações de exemplo espalhadas por **várias capitais
brasileiras**, com coordenadas GPS reais e **imagens locais** vindas de
`media/seeds/`.

Estrutura esperada:
    media/seeds/paes_franceses.jpg
    media/seeds/donuts.jpg
    ...

Se algum arquivo estiver faltando, a doação é criada sem imagem (não bloqueia).

Uso:
    python populate_products.py
"""
import os
import sys
from datetime import date, timedelta
from pathlib import Path

# Garante que o script funciona quando rodado de qualquer diretório
# (incluindo o Render Shell, que pode ter o cwd em /opt/render/project/src).
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'savefood.settings')

import django
django.setup()

from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.core.files.base import ContentFile

from api.models import Usuario, Doacao


SEEDS_DIR = Path(settings.MEDIA_ROOT) / 'seeds'


def _city(produtos_da_cidade, cidade_nome, lat_centro, lng_centro):
    for p in produtos_da_cidade:
        p['cidade'] = cidade_nome
        p['_lat_centro'] = lat_centro
        p['_lng_centro'] = lng_centro
    return produtos_da_cidade


# ---------------------------------------------------------------------------
# Doações por cidade — `image` aponta para um arquivo em media/seeds/.
# Aceita .jpg ou .png (o script tenta os dois).
# ---------------------------------------------------------------------------

SAO_PAULO = _city([
    {'produto': 'Cesta de Pães Franceses', 'categoria': 'Padaria', 'quantidade': 10,
     'latitude': Decimal('-23.5505'), 'longitude': Decimal('-46.6333'),
     'image': 'paes_franceses'},
    {'produto': 'Mix de Frutas da Estação', 'categoria': 'Frutas', 'quantidade': 5,
     'latitude': Decimal('-23.5613'), 'longitude': Decimal('-46.6565'),
     'image': 'mix_frutas'},
    {'produto': 'Marmita Vegana Fresca', 'categoria': 'Refeições', 'quantidade': 3,
     'latitude': Decimal('-23.5680'), 'longitude': Decimal('-46.6486'),
     'image': 'marmita_vegana'},
    {'produto': 'Donuts Sortidos', 'categoria': 'Doces', 'quantidade': 6,
     'latitude': Decimal('-23.5489'), 'longitude': Decimal('-46.6388'),
     'image': 'donuts'},
    {'produto': 'Iogurte Natural', 'categoria': 'Laticínios', 'quantidade': 4,
     'latitude': Decimal('-23.5832'), 'longitude': Decimal('-46.6817'),
     'image': 'iogurte_natural'},
], 'São Paulo', -23.55, -46.63)

RIO = _city([
    {'produto': 'Pão de Queijo Mineiro', 'categoria': 'Padaria', 'quantidade': 8,
     'latitude': Decimal('-22.9068'), 'longitude': Decimal('-43.1729'),
     'image': 'pao_queijo_mineiro'},
    {'produto': 'Caixa de Mangas', 'categoria': 'Frutas', 'quantidade': 6,
     'latitude': Decimal('-22.9711'), 'longitude': Decimal('-43.1822'),
     'image': 'mangas'},
    {'produto': 'Quentinhas Caseiras', 'categoria': 'Refeições', 'quantidade': 4,
     'latitude': Decimal('-22.9519'), 'longitude': Decimal('-43.2105'),
     'image': 'quentinhas'},
    {'produto': 'Bolos Variados', 'categoria': 'Doces', 'quantidade': 3,
     'latitude': Decimal('-22.9132'), 'longitude': Decimal('-43.2300'),
     'image': 'bolos'},
], 'Rio de Janeiro', -22.91, -43.17)

SALVADOR = _city([
    {'produto': 'Acarajés Frescos', 'categoria': 'Refeições', 'quantidade': 8,
     'latitude': Decimal('-12.9714'), 'longitude': Decimal('-38.5014'),
     'image': 'acarajes'},
    {'produto': 'Cocadas da Bahia', 'categoria': 'Doces', 'quantidade': 12,
     'latitude': Decimal('-12.9777'), 'longitude': Decimal('-38.5151'),
     'image': 'cocadas'},
    {'produto': 'Cesta de Acerolas', 'categoria': 'Frutas', 'quantidade': 5,
     'latitude': Decimal('-13.0083'), 'longitude': Decimal('-38.5083'),
     'image': 'acerolas'},
    {'produto': 'Pães de Tapioca', 'categoria': 'Padaria', 'quantidade': 10,
     'latitude': Decimal('-12.9904'), 'longitude': Decimal('-38.4747'),
     'image': 'paes_tapioca'},
], 'Salvador', -12.97, -38.50)

BH = _city([
    {'produto': 'Pão de Queijo Mineiro Tradicional', 'categoria': 'Padaria', 'quantidade': 15,
     'latitude': Decimal('-19.9167'), 'longitude': Decimal('-43.9345'),
     'image': 'pao_queijo_tradicional'},
    {'produto': 'Frutas Cítricas', 'categoria': 'Frutas', 'quantidade': 4,
     'latitude': Decimal('-19.9408'), 'longitude': Decimal('-43.9536'),
     'image': 'frutas_citricas'},
    {'produto': 'Doce de Leite Caseiro', 'categoria': 'Doces', 'quantidade': 6,
     'latitude': Decimal('-19.9026'), 'longitude': Decimal('-43.9583'),
     'image': 'doce_leite'},
], 'Belo Horizonte', -19.92, -43.93)

BRASILIA = _city([
    {'produto': 'Marmitas do Comércio', 'categoria': 'Refeições', 'quantidade': 7,
     'latitude': Decimal('-15.7942'), 'longitude': Decimal('-47.8822'),
     'image': 'marmitas_comercio'},
    {'produto': 'Queijos Frescos', 'categoria': 'Laticínios', 'quantidade': 4,
     'latitude': Decimal('-15.8267'), 'longitude': Decimal('-47.9218'),
     'image': 'queijos'},
    {'produto': 'Cesta de Bananas', 'categoria': 'Frutas', 'quantidade': 8,
     'latitude': Decimal('-15.7780'), 'longitude': Decimal('-47.9298'),
     'image': 'bananas'},
], 'Brasília', -15.79, -47.88)

CURITIBA = _city([
    {'produto': 'Tortas Doces', 'categoria': 'Doces', 'quantidade': 5,
     'latitude': Decimal('-25.4284'), 'longitude': Decimal('-49.2733'),
     'image': 'tortas_doces'},
    {'produto': 'Iogurtes Artesanais', 'categoria': 'Laticínios', 'quantidade': 9,
     'latitude': Decimal('-25.4515'), 'longitude': Decimal('-49.2872'),
     'image': 'iogurtes_artesanais'},
    {'produto': 'Pães Integrais', 'categoria': 'Padaria', 'quantidade': 7,
     'latitude': Decimal('-25.4080'), 'longitude': Decimal('-49.2641'),
     'image': 'paes_integrais'},
], 'Curitiba', -25.43, -49.27)


def find_image(basename: str) -> Path | None:
    """Procura `basename.jpg` ou `basename.png` em media/seeds/."""
    for ext in ('jpg', 'jpeg', 'png', 'webp'):
        candidate = SEEDS_DIR / f'{basename}.{ext}'
        if candidate.exists():
            return candidate
    return None


def populate_data():
    print('Iniciando povoamento com imagens locais de media/seeds/...')

    if not SEEDS_DIR.exists():
        print(f'!! Pasta {SEEDS_DIR} não existe. Crie e coloque os arquivos.')
        sys.exit(1)

    doador, _ = Usuario.objects.get_or_create(
        email='contato@mercado.com',
        defaults={
            'nome': 'Mercado Central',
            'senha': 'password123',
            'tipo_perfil': 'doador',
        },
    )

    Doacao.objects.all().delete()
    print('Doações antigas removidas.')

    todas = [*SAO_PAULO, *RIO, *SALVADOR, *BH, *BRASILIA, *CURITIBA]

    # Validade padrão escalonada (1, 2 ou 3 dias).
    for i, p in enumerate(todas):
        p.setdefault('validade', date.today() + timedelta(days=1 + (i % 3)))

    ok_count = 0
    fail_count = 0
    for p in todas:
        doacao = Doacao.objects.create(
            produto=p['produto'],
            categoria=p['categoria'],
            quantidade=p['quantidade'],
            validade=p['validade'],
            status='disponivel',
            doador=doador,
            latitude=p['latitude'],
            longitude=p['longitude'],
        )

        img_path = find_image(p['image'])
        if img_path:
            with img_path.open('rb') as f:
                doacao.imagem.save(
                    f'prod_{doacao.id}{img_path.suffix}',
                    ContentFile(f.read()),
                    save=True,
                )
            ok_count += 1
            print(f"  [OK]   [{p['cidade']:>18}] {p['produto']}  <- {img_path.name}")
        else:
            fail_count += 1
            print(f"  [FAIL] [{p['cidade']:>18}] {p['produto']}  (arquivo {p['image']}.* nao encontrado)")

    print(f'\nPronto! {ok_count} doações com imagem local, {fail_count} sem imagem.')


if __name__ == '__main__':
    populate_data()
