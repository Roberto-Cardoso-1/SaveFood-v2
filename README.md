# SaveFood

Plataforma para combater o desperdício de alimentos, conectando **doadores** (restaurantes, supermercados, pessoas físicas) a **receptores** (ONGs, comunidades, indivíduos). Composto por uma **API REST em Django** e um **aplicativo mobile multiplataforma em React Native + Expo**.

---

## Sumário

1. [Tecnologias](#tecnologias)
2. [Estrutura do repositório](#estrutura-do-reposit%C3%B3rio)
3. [Requisitos](#requisitos)
4. [Execução local — backend](#execu%C3%A7%C3%A3o-local--backend-django--drf)
5. [Execução local — mobile](#execu%C3%A7%C3%A3o-local--mobile-react-native--expo)
6. [Variáveis de ambiente](#vari%C3%A1veis-de-ambiente)
7. [Popular o banco com dados de exemplo](#popular-o-banco-com-dados-de-exemplo)
8. [Testes](#testes)
9. [Deploy](#deploy)
10. [Observações importantes](#observa%C3%A7%C3%B5es-importantes)

---

## Tecnologias

### Backend
- Python 3.12
- Django 6.0
- Django REST Framework + SimpleJWT (autenticação JWT)
- django-filter, django-cors-headers, whitenoise
- SQLite (desenvolvimento) / PostgreSQL (produção)
- Gunicorn (servidor de produção)
- Pillow (processamento de imagens)

### Mobile
- React Native via Expo SDK 54
- TypeScript
- NativeWind (Tailwind CSS para RN)
- Zustand (gerenciamento de estado com persistência em AsyncStorage)
- Axios (cliente HTTP com interceptors JWT)
- expo-location (GPS), expo-image-picker (câmera/galeria), expo-secure-store (tokens)
- react-native-maps (mapa Google/Apple sem chave de API)

---

## Estrutura do repositório

```
SaveFood/
├── api/                    # App Django principal
│   ├── models.py           # Usuario, Doacao, Notificacao
│   ├── serializers.py
│   ├── views.py            # ViewSets DRF + endpoint /admin/seed/
│   ├── urls.py
│   ├── auth.py             # JWT custom (Usuario não-AbstractUser)
│   ├── seed.py             # Função populate() — 22 doações em 6 capitais
│   ├── tests.py            # 33 testes automatizados
│   └── migrations/
├── savefood/               # Projeto Django (settings, urls, wsgi)
├── media/seeds/            # Imagens de fixture (commitadas no git)
├── mobile/                 # Aplicativo Expo
│   ├── App.tsx             # Entry + roteador (stack + tabs)
│   ├── src/
│   │   ├── screens/        # Login, Register, Home, Donate, Map, Profile...
│   │   ├── components/     # Button, Input, Toast, BottomTabBar
│   │   ├── store/          # Zustand (auth, donations, notifications, ui)
│   │   ├── services/       # api.ts (axios), auth, donations, notifications
│   │   ├── hooks/          # useTheme, useUserLocation
│   │   └── theme/          # paleta de cores (light/dark)
│   ├── app.json
│   ├── eas.json            # Configuração EAS Build
│   ├── metro.config.js     # Redirect Zustand ESM → CJS (Hermes/Web)
│   └── package.json
├── manage.py
├── populate_products.py    # CLI que chama api.seed.populate()
├── requirements.txt
└── README.md
```

---

## Requisitos

| Ferramenta       | Versão mínima |
| ---------------- | ------------- |
| Python           | 3.10+         |
| Node.js          | 18+           |
| npm              | 9+            |
| Git              | qualquer      |
| Expo Go (opcional) | última do celular |

Sistema operacional: Windows, macOS ou Linux.

---

## Execução local — Backend (Django + DRF)

### 1. Clonar o repositório
```bash
git clone https://github.com/Roberto-Cardoso-1/SaveFood-v2.git
cd SaveFood-v2
```

### 2. Criar e ativar o ambiente virtual
**Windows (cmd):**
```cmd
python -m venv venv
venv\Scripts\activate
```

**Linux / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Instalar dependências
```bash
pip install -r requirements.txt
```

### 4. (Opcional) Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz com:
```ini
SECRET_KEY=alguma-chave-secreta-para-dev
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
# CORS_ALLOWED_ORIGINS=http://localhost:8081,http://localhost:19006
```
Se não criar o `.env`, o Django usa defaults seguros para desenvolvimento.

### 5. Rodar as migrações
```bash
python manage.py migrate
```

### 6. (Opcional) Popular o banco com 22 doações de exemplo
```bash
python populate_products.py
```

### 7. Iniciar o servidor
```bash
python manage.py runserver
```

A API responde em `http://127.0.0.1:8000/api/`.

Endpoints úteis:
- `GET  /api/ping/` — health check
- `POST /api/token/` — login (retorna access + refresh)
- `POST /api/usuarios/` — cadastro
- `GET  /api/doacoes/` — listar doações (paginated)
- `POST /api/doacoes/` — criar doação (apenas usuários do tipo Doador)
- `POST /api/doacoes/{id}/reservar/` — reservar (apenas Receptor)
- `GET  /admin/` — Django admin

---

## Execução local — Mobile (React Native + Expo)

### 1. Instalar dependências
```bash
cd mobile
npm install
```

### 2. Configurar a URL da API
Por padrão o app aponta para a API publicada em produção. Para desenvolvimento local, crie `mobile/.env`:
```ini
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:8000/api/
```

> **Importante:** No mobile não use `localhost` nem `127.0.0.1` — esse endereço aponta para o próprio celular/emulador. Use o IP do seu computador na rede local (ex: `192.168.0.10`). Descubra com `ipconfig` (Windows) ou `ifconfig` (Linux/macOS).

### 3. Iniciar o Expo
```bash
npx expo start
```

### 4. Abrir no dispositivo
- **Celular físico:** instale **Expo Go** (Play Store / App Store), escaneie o QR code do terminal.
- **Emulador Android:** aperte `a` no terminal (precisa do Android Studio com AVD configurado).
- **Web (limitado):** aperte `w` no terminal — abre no navegador. O mapa não funciona em web (fallback informativo).

---

## Variáveis de ambiente

### Backend (`.env` na raiz, opcional em dev)
| Variável                     | Descrição                                            | Padrão |
| ---------------------------- | ---------------------------------------------------- | ------ |
| `SECRET_KEY`                 | Chave secreta do Django                              | `django-insecure-default-key-for-dev` |
| `DEBUG`                      | Modo debug                                           | `False` |
| `ALLOWED_HOSTS`              | Lista separada por vírgula                           | `localhost,127.0.0.1` |
| `DATABASE_URL`               | URL do Postgres (ex: do Render). Se vazio, usa SQLite| vazio |
| `CORS_ALLOWED_ORIGINS`       | Lista separada por vírgula                           | vazio (libera tudo em DEBUG) |
| `ACCESS_TOKEN_LIFETIME_MIN`  | Duração do access token em minutos                   | `60` |
| `REFRESH_TOKEN_LIFETIME_DAYS`| Duração do refresh token em dias                     | `14` |
| `SEED_KEY`                   | Chave para proteger o endpoint `/api/admin/seed/`    | vazio (endpoint fica desabilitado) |

### Mobile (`mobile/.env`)
| Variável                | Descrição                                       |
| ----------------------- | ----------------------------------------------- |
| `EXPO_PUBLIC_API_URL`   | URL completa da API, com `/api/` no final       |

---

## Popular o banco com dados de exemplo

O projeto inclui 22 doações fixtures em 6 capitais brasileiras (São Paulo, Rio de Janeiro, Salvador, Belo Horizonte, Brasília, Curitiba), com imagens reais armazenadas em `media/seeds/`.

**Local (CLI):**
```bash
python populate_products.py
```

**Produção via HTTP** (quando não há acesso a Shell, ex: Render Free):
```bash
curl -X POST "https://SUA-API/api/admin/seed/" \
  -H "Content-Type: application/json" \
  -d '{"key":"SEED_KEY-DEFINIDA-NO-ENV"}'
```

Idempotente: o `populate()` apaga as doações existentes e recria todas.

---

## Testes

O backend tem **33 testes automatizados** cobrindo modelos, autenticação, doações, reservas, notificações e perfis.

```bash
python manage.py test api
```

Saída esperada:
```
Ran 33 tests in 47s
OK
```

---

## Deploy

A aplicação está atualmente publicada em:

- **API:** https://savefood-api.onrender.com (Render — plano free)
- **APK Android:** distribuído via EAS Build (link enviado por mensagem)

Detalhes de configuração de produção no arquivo `MANUAL.md`.

---

## Observações importantes

- **Plano Free do Render** "dorme" o servidor após 15 min de inatividade. Para evitar isso na apresentação, configuramos um cronjob no [cron-job.org](https://cron-job.org) que pinga a API a cada 14 minutos.
- **Banco em produção:** PostgreSQL (Render). Em desenvolvimento: SQLite local.
- **Imagens de fixtures** estão commitadas em `media/seeds/` para sobreviver a redeploys no Render Free (que tem disco efêmero).
- **JWT:** o modelo `Usuario` não estende `AbstractUser`. A autenticação JWT foi implementada com `SaveFoodJWTAuthentication` (ver `api/auth.py`).
- **Web Expo:** a tela do mapa não funciona na web (limitação do `react-native-maps`). É exibido um fallback informativo com a lista de doações geolocalizadas.

---

Projeto desenvolvido para a disciplina de **Desenvolvimento Mobile** — entrega final.
