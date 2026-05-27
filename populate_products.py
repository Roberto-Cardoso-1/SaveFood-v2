"""
CLI para popular o banco com 22 doações de exemplo. Usa o módulo `api.seed`
que também é usado pelo endpoint HTTP `/api/admin/seed/` em produção.

Uso (dev local):
    python populate_products.py
"""
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'savefood.settings')

import django
django.setup()

from api.seed import populate


def main():
    print('Iniciando povoamento de dados...')
    result = populate()
    for line in result['log']:
        print(f'  {line}')
    print(f'\n{result["ok"]} OK, {result["fail"]} sem imagem.')


if __name__ == '__main__':
    main()
