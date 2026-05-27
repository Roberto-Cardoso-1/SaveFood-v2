from django.db import connection
from api.models import Usuario, Doacao

def verify_and_fix_db():
    print("Iniciando verificação do banco de dados...")
    tables = connection.introspection.table_names()
    print(f"Tabelas encontradas: {tables}")

    expected_tables = ['api_usuario', 'api_doacao']
    for table in expected_tables:
        if table not in tables:
            print(f"AVISO: Tabela {table} não encontrada. Tentando forçar migração...")
            from django.core.management import call_command
            call_command('migrate', 'api', interactive=False)
            break

    print("Verificação concluída.")
