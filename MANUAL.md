# Manual de Uso — SaveFood

Documento de orientações de uso do sistema SaveFood, incluindo funcionalidades implementadas, fluxos de utilização e evidências dos testes realizados durante o desenvolvimento.

---

## Sumário

1. [Descrição geral](#descri%C3%A7%C3%A3o-geral)
2. [Funcionalidades implementadas](#funcionalidades-implementadas)
3. [Páginas (telas) desenvolvidas](#p%C3%A1ginas-telas-desenvolvidas)
4. [Fluxo básico de utilização](#fluxo-b%C3%A1sico-de-utiliza%C3%A7%C3%A3o)
5. [Perfis de usuário](#perfis-de-usu%C3%A1rio)
6. [Testes realizados](#testes-realizados)
7. [Evidências e observações](#evid%C3%AAncias-e-observa%C3%A7%C3%B5es)

---

## Descrição geral

O **SaveFood** é uma plataforma social cujo objetivo é reduzir o desperdício de alimentos, permitindo que estabelecimentos e pessoas físicas ofereçam alimentos que iriam para o lixo (próximos do vencimento, excedentes de produção, sobras, etc.) e que ONGs, comunidades carentes ou pessoas interessadas possam reservar e coletar gratuitamente esses itens.

O sistema é composto por:
- Uma **API REST** em Django que gerencia usuários, doações, notificações e autenticação.
- Um **aplicativo mobile** em React Native + Expo, que roda em **Android, iOS e Web**.

---

## Funcionalidades implementadas

### Autenticação e perfis
- Cadastro com escolha de perfil: **Doador** ou **Receptor**.
- Login com email e senha; sessão persistida via JWT (access + refresh) no Secure Store (mobile) ou localStorage (web).
- Recuperação de senha (endpoint anti-enumeração: responde 200 mesmo se o email não existir).
- Edição de perfil (nome e avatar).
- Logout.

### Doações
- **Listagem** de doações disponíveis (paginação automática, 30 por página).
- **Filtros** por categoria: Padaria, Frutas, Refeições, Doces, Laticínios, Outros.
- **Busca** por nome do produto ou estabelecimento.
- **Criação de doação** (apenas Doador): título, descrição, categoria, quantidade, validade, foto e geolocalização automática.
- **Exclusão de doação** (apenas o próprio dono).
- **Reserva** (apenas Receptor): muda status para "reservado" e notifica o doador.

### Mapa
- Mapa real interativo (Google Maps no Android, Apple Maps no iOS) **sem chave de API**.
- Marcadores verdes nas coordenadas reais das doações.
- Ícones por categoria.
- Marcador da localização atual do usuário (pulsante).
- Bottom-sheet com detalhes da doação ao tocar no marcador.
- Botão "Como chegar" — abre o Google Maps / Apple Maps com a rota.
- Botão de recentralizar na localização do usuário.
- Filtros por categoria sobrepostos no mapa.

### Notificações
- Doador recebe notificação quando sua doação é reservada.
- Lista de notificações no app com indicador de não-lidas.
- Marcar uma ou todas como lidas.

### Outras
- **Tema claro/escuro** (toggle no perfil).
- **Ranking** de impacto (mock, para visualização).
- **Pull-to-refresh** na Home.
- **Sessão persistente** — usuário continua logado ao reabrir o app.

---

## Páginas (telas) desenvolvidas

| Tela                 | Arquivo                                       | Acesso         | Descrição                                             |
| -------------------- | --------------------------------------------- | -------------- | ----------------------------------------------------- |
| Login                | `mobile/src/screens/LoginScreen.tsx`          | Não autenticado| Entrada via email + senha; link para cadastro         |
| Cadastro             | `mobile/src/screens/RegisterScreen.tsx`       | Não autenticado| Nome, email, senha, escolha de perfil, avatar         |
| Recuperar senha      | `mobile/src/screens/ForgotPasswordScreen.tsx` | Não autenticado| Solicita recuperação por email                        |
| Home (Início)        | `mobile/src/screens/HomeScreen.tsx`           | Autenticado    | Feed de doações, filtros, busca, notificações         |
| Doar                 | `mobile/src/screens/DonateScreen.tsx`         | Doador         | Formulário de criação de doação com foto + GPS        |
| Mapa                 | `mobile/src/screens/MapScreen.tsx`            | Autenticado    | Mapa real com marcadores das doações                  |
| Perfil               | `mobile/src/screens/ProfileScreen.tsx`        | Autenticado    | Dados, histórico, configurações, logout               |
| Confirmação          | `mobile/src/screens/ConfirmationScreen.tsx`   | Doador         | Tela exibida após criar uma doação                    |

### Componentes reutilizáveis
- `Button` — botão padrão (primary / secondary / outline / ghost) com loading.
- `Input` — campo de texto com ícone, label e validação visual.
- `Toast` — notificação flutuante (success / error).
- `BottomTabBar` — barra inferior custom com tabs adaptáveis ao perfil.

---

## Fluxo básico de utilização

### Como Doador
1. Abrir o app → **Cadastro** → escolher "**Vou Doar**".
2. Preencher nome, email, senha e (opcional) foto de perfil.
3. Após o cadastro, o app loga automaticamente e abre a **Home**.
4. Ir na aba **Doar** (ícone "+").
5. Preencher o formulário:
   - Tirar foto ou escolher da galeria.
   - Título, descrição, quantidade, validade, categoria.
   - O app captura automaticamente a localização para mostrar a doação no mapa.
6. Clicar em **"Publicar Doação"** → confirmação visual.
7. Quando um Receptor reservar, uma **notificação** chega na sininho.
8. O Doador pode excluir suas próprias doações pelo ícone de lixeira no card.

### Como Receptor
1. Abrir o app → **Cadastro** → escolher "**Vou Receber**".
2. Após cadastro, abrir a **Home** ou a aba **Mapa**.
3. Navegar entre os cards (Home) ou marcadores (Mapa).
4. Tocar em uma doação → bottom-sheet com detalhes.
5. Clicar em **"Reservar agora"** → confirmação.
6. Usar **"Como chegar"** para abrir a rota no Google Maps.
7. Acompanhar suas reservas em **Perfil → Histórico de Coletas**.

---

## Perfis de usuário

| Ação                          | Doador | Receptor |
| ----------------------------- | ------ | -------- |
| Cadastrar / fazer login       | ✅      | ✅       |
| Ver lista de doações          | ✅      | ✅       |
| Ver mapa                      | ✅      | ✅       |
| Editar perfil                 | ✅      | ✅       |
| **Criar doação**              | ✅      | ❌       |
| **Excluir própria doação**    | ✅      | ❌       |
| **Reservar doação**           | ❌      | ✅       |
| Receber notificação de reserva| ✅      | —        |
| Ver histórico (Minhas doações)| ✅      | —        |
| Ver histórico (Coletas)       | —      | ✅       |

---

## Testes realizados

### Testes automatizados (backend)

O backend conta com **33 testes unitários e de integração** cobrindo:

| Categoria        | Quantidade | O que testa                                                        |
| ---------------- | ---------- | ------------------------------------------------------------------ |
| Modelos          | 3          | Hash de senha, check_password, idempotência do save                |
| Autenticação     | 9          | Cadastro, validação de email duplicado, JWT, login legado, /me/    |
| Doações          | 10         | Listagem, criação por perfil, validações, filtros, lat/lng         |
| Reservas         | 4          | Reservar, notificação criada, restrições por perfil e status       |
| Notificações     | 3          | Isolamento por usuário, marcar lida, marcar todas                  |
| Perfil           | 3          | Atualizar nome, bloqueio de edição de outro usuário, minhas doações|

**Como executar:**
```bash
python manage.py test api
```

**Resultado:**
```
Ran 33 tests in 47s
OK
```

### Testes manuais realizados

Durante o desenvolvimento foram validadas as seguintes situações no aplicativo:

1. **Fluxo de cadastro** — Doador e Receptor, com e sem avatar.
2. **Login bem-sucedido** — sessão persistida ao fechar e reabrir o app.
3. **Login com credenciais inválidas** — mensagem amigável de erro.
4. **Recuperação de senha** — endpoint responde 200 mesmo para emails inexistentes (segurança).
5. **Criação de doação com foto** — câmera e galeria.
6. **Criação de doação sem GPS** — quando o usuário nega permissão, a doação é criada mas não aparece no mapa.
7. **Reserva por Receptor** — muda status e notifica o doador.
8. **Doador tentando reservar** — bloqueado pelo backend.
9. **Doador tentando reservar a própria doação** — bloqueado pelo backend.
10. **Filtro por categoria** — Home e Mapa.
11. **Busca por nome / estabelecimento** — Home e Mapa.
12. **Tema claro / escuro** — todas as telas adaptam.
13. **Mapa em SP, Rio, Salvador, BH, Brasília e Curitiba** — marcadores aparecem nas coordenadas corretas.
14. **Botão "Como chegar"** — abre o Google Maps / Apple Maps com rota.
15. **Recarregar a Home (pull-to-refresh)** — atualiza lista e notificações.
16. **Logout** — limpa tokens e volta pra tela de Login.
17. **Token expirado** — interceptor do Axios tenta refresh; se falhar, desloga automaticamente.

### Plataformas testadas
- ✅ Android (Expo Go) — celular físico
- ✅ Android (Expo Go) — emulador MSI App Player
- ✅ Android (APK gerado via EAS Build) — celular físico
- ✅ Expo Web (Chrome) — fallback informativo no mapa
- ⚠️ iOS — não testado por falta de dispositivo

---

## Evidências e observações

### Bugs encontrados e corrigidos durante o desenvolvimento

1. **Bug Zustand + Hermes / Expo Web**
   O Zustand publicava arquivos `.mjs` com sintaxe `import.meta.env.MODE`, que não é suportada nem pelo Hermes (motor JS do React Native) nem pelo bundle clássico do Expo Web. Causava crash na inicialização do app.
   **Correção:** redirecionamos no `metro.config.js` todos os imports de `zustand` para os arquivos `.js` (CommonJS), que são funcionalmente equivalentes mas usam `process.env.NODE_ENV`.

2. **Bug do banco em produção (Render)**
   Quando o `DATABASE_URL` apontava para a URL **interna** do Render (sem `.render.com` no domínio), forçar `ssl_require=True` causava silenciosamente falha de conexão e o Django caía pro SQLite efêmero, perdendo todos os dados a cada redeploy.
   **Correção:** detectamos pelo domínio se é interna ou externa e aplicamos `ssl_require` apenas em URLs externas.

3. **Imagens não persistiam no Render Free**
   O plano Free do Render usa disco efêmero — uploads em `/media/doacoes/` são perdidos a cada redeploy.
   **Correção:** as 22 imagens de fixture ficam em `/media/seeds/`, comitadas no Git, e o populate aponta os campos `Doacao.imagem` diretamente para `seeds/<arquivo>.jpg`.

4. **Logout não funcionava em Expo Web**
   `Alert.alert` no react-native-web não dispara os handlers dos botões.
   **Correção:** usamos `window.confirm` nativo quando `Platform.OS === 'web'`.

5. **URL malformada de imagem**
   O backend salvava o caminho como `seeds/donuts.jpg` (sem barra inicial). O cliente concatenava com a base e gerava URLs quebradas (`https://savefood-api.onrender.comseeds/...`).
   **Correção:** o mapper em `useDonationsStore.ts` agora normaliza o caminho, cobrindo os 3 formatos possíveis (`http://...`, `/media/...`, `seeds/...`).

### Otimizações implementadas
- **Refresh token com fila** — evita N requisições de refresh simultâneas quando várias chamadas estouram 401 ao mesmo tempo.
- **Cache do GPS** — `getLastKnownPositionAsync` é usado primeiro para resposta instantânea, depois a leitura fresca substitui em background.
- **Imagem com fallback** — se uma doação não tem foto, é exibida uma imagem padrão do Unsplash.
- **Persistência de UI** — tema, localização escolhida e preferências sobrevivem ao fechamento do app.
- **Keep-alive em produção** — cronjob externo pinga a API a cada 14 min para evitar que o Render Free durma.

### Limitações conhecidas
- Mapa não funciona no **Expo Web** (limitação do `react-native-maps`). Mostramos um fallback informativo.
- Não há **login social** integrado (botão Google é mock visual).
- Não há **notificações push** — as notificações funcionam apenas dentro do app.
- O **plano Free do Render** demora ~10-30 segundos na primeira requisição após inatividade prolongada (mitigado pelo cronjob).

---

Projeto desenvolvido como entrega final da disciplina de **Desenvolvimento Mobile**.
