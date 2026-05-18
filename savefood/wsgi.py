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
    django.setup()
    from django.core.management import call_command
    try:
        call_command('migrate', interactive=False)
        print("Migrações aplicadas com sucesso!")
    except Exception as e:
        print(f"Erro ao aplicar migrações: {e}")

application = get_wsgi_application()
