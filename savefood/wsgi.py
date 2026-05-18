"""
WSGI config for savefood project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

import os
import sys
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'savefood.settings')

# Tenta rodar migrações automaticamente ao iniciar em produção
if os.environ.get('RENDER'):
    import django
    import time
    django.setup()
    from django.core.management import call_command
    from api.db_check import verify_and_fix_db
    try:
        # Aguarda 2 segundos para garantir que o DB está aceitando conexões
        time.sleep(2)
        print("Rodando migrações automáticas...")
        call_command('migrate', interactive=False)
        verify_and_fix_db()
        print("Migrações e verificação concluídas com sucesso!")
    except Exception as e:
        print(f"Erro crítico na inicialização do DB: {e}")

application = get_wsgi_application()
