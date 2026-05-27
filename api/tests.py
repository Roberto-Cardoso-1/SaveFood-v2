"""
Suite de testes do SaveFood (API).

Cobre:
- Modelos (hash de senha, validators).
- Cadastro/login/recuperar senha.
- JWT (/token/, /token/refresh/, /me/).
- CRUD de doações (perfil-aware).
- Reservar (validações + notificação criada).
- Notificações (isolamento, marcar lida).
"""
import datetime
from io import BytesIO

from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from .models import Usuario, Doacao, Notificacao


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_doador(email='doador@example.com', senha='senhaforte123', nome='Doador Teste'):
    u = Usuario(nome=nome, email=email, senha=senha, tipo_perfil=Usuario.PERFIL_DOADOR)
    u.save()
    return u


def make_receptor(email='receptor@example.com', senha='senhaforte123', nome='Receptor Teste'):
    u = Usuario(nome=nome, email=email, senha=senha, tipo_perfil=Usuario.PERFIL_RECEPTOR)
    u.save()
    return u


def auth_client(user, senha='senhaforte123'):
    """Autentica via /api/token/ e devolve client com header pronto."""
    client = APIClient()
    resp = client.post('/api/token/', {'email': user.email, 'senha': senha}, format='json')
    assert resp.status_code == 200, resp.data
    token = resp.data['access']
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    return client, resp.data


def amanha():
    return (timezone.localdate() + datetime.timedelta(days=1)).isoformat()


# ---------------------------------------------------------------------------
# Modelos
# ---------------------------------------------------------------------------

class UsuarioModelTests(TestCase):

    def test_senha_eh_hasheada_no_save(self):
        u = make_doador()
        self.assertNotEqual(u.senha, 'senhaforte123')
        self.assertTrue(u.senha.startswith('pbkdf2_'))

    def test_check_password(self):
        u = make_doador()
        self.assertTrue(u.check_password('senhaforte123'))
        self.assertFalse(u.check_password('errada'))

    def test_re_save_nao_re_hasheia(self):
        u = make_doador()
        hash_original = u.senha
        u.nome = 'Outro nome'
        u.save()
        u.refresh_from_db()
        self.assertEqual(u.senha, hash_original)


# ---------------------------------------------------------------------------
# Cadastro / login (rotas legadas e /token/)
# ---------------------------------------------------------------------------

class AuthTests(TestCase):

    def setUp(self):
        self.client = APIClient()

    def test_cadastro_cria_usuario_com_senha_hasheada(self):
        resp = self.client.post('/api/usuarios/', {
            'nome': 'Novo', 'email': 'novo@example.com',
            'senha': 'senhaforte123', 'tipo_perfil': 'doador',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.data)
        u = Usuario.objects.get(email='novo@example.com')
        self.assertNotEqual(u.senha, 'senhaforte123')
        # Senha não deve aparecer no payload de resposta
        self.assertNotIn('senha', resp.data)

    def test_cadastro_recusa_email_duplicado(self):
        make_doador(email='dup@example.com')
        resp = self.client.post('/api/usuarios/', {
            'nome': 'X', 'email': 'dup@example.com',
            'senha': 'senhaforte123', 'tipo_perfil': 'doador',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_token_obtain_pair(self):
        make_doador()
        resp = self.client.post('/api/token/',
                                {'email': 'doador@example.com', 'senha': 'senhaforte123'},
                                format='json')
        self.assertEqual(resp.status_code, 200, resp.data)
        self.assertIn('access', resp.data)
        self.assertIn('refresh', resp.data)
        self.assertEqual(resp.data['user']['email'], 'doador@example.com')

    def test_token_obtain_pair_falha_com_senha_errada(self):
        make_doador()
        resp = self.client.post('/api/token/',
                                {'email': 'doador@example.com', 'senha': 'errada'},
                                format='json')
        self.assertEqual(resp.status_code, 401)

    def test_login_legacy_endpoint(self):
        make_doador()
        resp = self.client.post('/api/usuarios/login/',
                                {'email': 'doador@example.com', 'senha': 'senhaforte123'},
                                format='json')
        self.assertEqual(resp.status_code, 200, resp.data)
        self.assertIn('access', resp.data)
        # Campos legados continuam disponíveis para clientes antigos
        self.assertEqual(resp.data['nome'], 'Doador Teste')

    def test_recuperar_senha_responde_200_e_nao_vaza_existencia(self):
        make_doador()
        for email in ['doador@example.com', 'inexistente@example.com']:
            resp = self.client.post('/api/usuarios/recuperar-senha/', {'email': email}, format='json')
            self.assertEqual(resp.status_code, 200)

    def test_recuperar_senha_alias_legacy(self):
        resp = self.client.post('/api/usuarios/recuperar_senha/',
                                {'email': 'qualquer@example.com'}, format='json')
        self.assertEqual(resp.status_code, 200)

    def test_me_exige_autenticacao(self):
        resp = self.client.get('/api/usuarios/me/')
        self.assertEqual(resp.status_code, 401)

    def test_me_devolve_dados_do_usuario_logado(self):
        u = make_doador()
        client, _ = auth_client(u)
        resp = client.get('/api/usuarios/me/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['email'], u.email)


# ---------------------------------------------------------------------------
# Doações
# ---------------------------------------------------------------------------

class DoacoesTests(TestCase):

    def setUp(self):
        self.doador = make_doador()
        self.receptor = make_receptor()
        self.doador_client, _ = auth_client(self.doador)
        self.receptor_client, _ = auth_client(self.receptor)

    def _payload(self, **overrides):
        base = {
            'produto': 'Pão de Forma',
            'descricao': 'Pacotes fechados.',
            'categoria': 'Padaria',
            'quantidade': 5,
            'validade': amanha(),
        }
        base.update(overrides)
        return base

    def test_listar_doacoes_exige_auth(self):
        resp = APIClient().get('/api/doacoes/')
        self.assertEqual(resp.status_code, 401)

    def test_doador_pode_criar_doacao(self):
        resp = self.doador_client.post('/api/doacoes/', self._payload(), format='json')
        self.assertEqual(resp.status_code, 201, resp.data)
        self.assertEqual(resp.data['estabelecimento'], self.doador.nome)
        self.assertEqual(resp.data['status'], 'disponivel')

    def test_receptor_nao_pode_criar_doacao(self):
        resp = self.receptor_client.post('/api/doacoes/', self._payload(), format='json')
        self.assertEqual(resp.status_code, 403)

    def test_quantidade_zero_invalida(self):
        resp = self.doador_client.post('/api/doacoes/', self._payload(quantidade=0), format='json')
        self.assertEqual(resp.status_code, 400)

    def test_validade_passada_invalida(self):
        ontem = (timezone.localdate() - datetime.timedelta(days=1)).isoformat()
        resp = self.doador_client.post('/api/doacoes/', self._payload(validade=ontem), format='json')
        self.assertEqual(resp.status_code, 400)

    def test_filtrar_por_categoria(self):
        Doacao.objects.create(doador=self.doador, produto='Maçã', categoria='Frutas',
                              quantidade=3, validade=timezone.localdate() + datetime.timedelta(days=2))
        Doacao.objects.create(doador=self.doador, produto='Pão', categoria='Padaria',
                              quantidade=2, validade=timezone.localdate() + datetime.timedelta(days=2))
        resp = self.doador_client.get('/api/doacoes/?categoria=Frutas')
        self.assertEqual(resp.status_code, 200)
        # paginated
        results = resp.data['results'] if 'results' in resp.data else resp.data
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['produto'], 'Maçã')

    def test_criar_doacao_com_lat_lng(self):
        resp = self.doador_client.post(
            '/api/doacoes/',
            self._payload(latitude='-23.5505', longitude='-46.6333'),
            format='json',
        )
        self.assertEqual(resp.status_code, 201, resp.data)
        self.assertEqual(str(resp.data['latitude']), '-23.550500')
        self.assertEqual(str(resp.data['longitude']), '-46.633300')

    def test_criar_doacao_sem_lat_lng(self):
        """Doação pode ser criada sem coordenadas; aparece na lista mas não no mapa."""
        resp = self.doador_client.post('/api/doacoes/', self._payload(), format='json')
        self.assertEqual(resp.status_code, 201, resp.data)
        self.assertIsNone(resp.data['latitude'])
        self.assertIsNone(resp.data['longitude'])

    def test_lat_sem_lng_eh_recusada(self):
        resp = self.doador_client.post(
            '/api/doacoes/',
            self._payload(latitude='-23.5505'),
            format='json',
        )
        self.assertEqual(resp.status_code, 400)

    def test_dono_pode_remover_propria_doacao(self):
        d = Doacao.objects.create(doador=self.doador, produto='X', categoria='Outros',
                                  quantidade=1, validade=timezone.localdate() + datetime.timedelta(days=2))
        resp = self.doador_client.delete(f'/api/doacoes/{d.id}/')
        self.assertEqual(resp.status_code, 204)

    def test_outro_usuario_nao_pode_remover_doacao_alheia(self):
        d = Doacao.objects.create(doador=self.doador, produto='X', categoria='Outros',
                                  quantidade=1, validade=timezone.localdate() + datetime.timedelta(days=2))
        resp = self.receptor_client.delete(f'/api/doacoes/{d.id}/')
        self.assertEqual(resp.status_code, 403)


# ---------------------------------------------------------------------------
# Reservar
# ---------------------------------------------------------------------------

class ReservarTests(TestCase):

    def setUp(self):
        self.doador = make_doador()
        self.receptor = make_receptor()
        self.doador_client, _ = auth_client(self.doador)
        self.receptor_client, _ = auth_client(self.receptor)

        self.doacao = Doacao.objects.create(
            doador=self.doador, produto='Cesta de Frutas', categoria='Frutas',
            quantidade=5, validade=timezone.localdate() + datetime.timedelta(days=3),
        )

    def test_receptor_reserva_doacao_disponivel(self):
        resp = self.receptor_client.post(f'/api/doacoes/{self.doacao.id}/reservar/')
        self.assertEqual(resp.status_code, 200, resp.data)
        self.doacao.refresh_from_db()
        self.assertEqual(self.doacao.status, 'reservado')
        self.assertEqual(self.doacao.receptor, self.receptor)

    def test_reservar_cria_notificacao_para_doador(self):
        self.receptor_client.post(f'/api/doacoes/{self.doacao.id}/reservar/')
        notifs = Notificacao.objects.filter(usuario=self.doador)
        self.assertEqual(notifs.count(), 1)
        self.assertIn('reservou', notifs.first().mensagem)

    def test_doador_nao_pode_reservar_propria_doacao(self):
        resp = self.doador_client.post(f'/api/doacoes/{self.doacao.id}/reservar/')
        self.assertEqual(resp.status_code, 400)

    def test_doacao_ja_reservada_recusa_segunda_reserva(self):
        self.receptor_client.post(f'/api/doacoes/{self.doacao.id}/reservar/')
        outro = make_receptor(email='outro@example.com')
        outro_client, _ = auth_client(outro)
        resp = outro_client.post(f'/api/doacoes/{self.doacao.id}/reservar/')
        self.assertEqual(resp.status_code, 400)


# ---------------------------------------------------------------------------
# Notificações
# ---------------------------------------------------------------------------

class NotificacoesTests(TestCase):

    def setUp(self):
        self.user_a = make_doador(email='a@example.com')
        self.user_b = make_doador(email='b@example.com')
        Notificacao.objects.create(usuario=self.user_a, titulo='T1', mensagem='m1')
        Notificacao.objects.create(usuario=self.user_a, titulo='T2', mensagem='m2')
        Notificacao.objects.create(usuario=self.user_b, titulo='T3', mensagem='m3')

    def test_lista_isola_por_usuario(self):
        client, _ = auth_client(self.user_a)
        resp = client.get('/api/notificacoes/')
        self.assertEqual(resp.status_code, 200)
        results = resp.data['results'] if 'results' in resp.data else resp.data
        self.assertEqual(len(results), 2)

    def test_marcar_lida(self):
        client, _ = auth_client(self.user_a)
        notif = Notificacao.objects.filter(usuario=self.user_a).first()
        resp = client.post(f'/api/notificacoes/{notif.id}/marcar-lida/')
        self.assertEqual(resp.status_code, 200)
        notif.refresh_from_db()
        self.assertTrue(notif.lida)

    def test_marcar_todas_lidas(self):
        client, _ = auth_client(self.user_a)
        resp = client.post('/api/notificacoes/marcar-todas-lidas/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(Notificacao.objects.filter(usuario=self.user_a, lida=False).count(), 0)
        # Não toca em outros
        self.assertEqual(Notificacao.objects.filter(usuario=self.user_b, lida=False).count(), 1)


# ---------------------------------------------------------------------------
# Perfil / minhas / recebidas
# ---------------------------------------------------------------------------

class PerfilTests(TestCase):

    def setUp(self):
        self.doador = make_doador()
        self.doador_client, _ = auth_client(self.doador)

    def test_atualizar_perfil_nome(self):
        resp = self.doador_client.patch(f'/api/usuarios/{self.doador.id}/',
                                        {'nome': 'Novo Nome'}, format='json')
        self.assertEqual(resp.status_code, 200, resp.data)
        self.doador.refresh_from_db()
        self.assertEqual(self.doador.nome, 'Novo Nome')

    def test_atualizar_perfil_de_outro_eh_bloqueado(self):
        outro = make_doador(email='outro@example.com')
        resp = self.doador_client.patch(f'/api/usuarios/{outro.id}/',
                                        {'nome': 'Hacker'}, format='json')
        self.assertIn(resp.status_code, (403, 404))

    def test_minhas_doacoes(self):
        Doacao.objects.create(doador=self.doador, produto='A', categoria='Outros',
                              quantidade=1, validade=timezone.localdate() + datetime.timedelta(days=2))
        resp = self.doador_client.get('/api/doacoes/minhas/')
        self.assertEqual(resp.status_code, 200)
        results = resp.data['results'] if 'results' in resp.data else resp.data
        self.assertEqual(len(results), 1)
