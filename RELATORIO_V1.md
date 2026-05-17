# Relatório de Desenvolvimento - SaveFood (Versão 1.0)

## 1. Introdução
O **SaveFood** é uma solução tecnológica voltada para o combate ao desperdício de alimentos. A plataforma facilita a conexão entre doadores que possuem excedentes alimentares e receptores que podem dar um destino útil a esses produtos, promovendo a segurança alimentar e a sustentabilidade.

## 2. Visão Geral da Arquitetura
O sistema foi estruturado em uma arquitetura cliente-servidor, composta por:
- **Backend (API):** Desenvolvido em Python com Django REST Framework, responsável pela lógica de negócios, persistência de dados e autenticação.
- **Frontend (Mobile):** Desenvolvido em React Native com Expo, focado na experiência do usuário e acessibilidade em dispositivos móveis.

---

## 3. Tecnologias Utilizadas

### Backend
- **Framework:** Django 6.0.4 & Django REST Framework 3.17.1.
- **Banco de Dados:** SQLite (ambiente de desenvolvimento).
- **Segurança:** CORS configurado para permitir integrações mobile e web.
- **Gerenciamento de Mídia:** Sistema de upload de imagens integrado para fotos de doações.

### Mobile
- **Framework:** React Native (Expo SDK 51).
- **Linguagem:** TypeScript.
- **Estilização:** NativeWind (Tailwind CSS).
- **Estado Global:** Zustand.
- **Comunicação:** Axios.
- **Interface:** React Navigation (Tabs & Stack) e Lucide Icons.

---

## 4. Funcionalidades Implementadas (V1.0)

### API Backend
- **Endpoint de Usuários:** Cadastro e listagem de doadores/receptores.
- **Endpoint de Doações:** CRUD completo para gerenciamento de itens doados.
- **Lógica de Reserva:** Funcionalidade via `POST` para alterar o status de uma doação para "Reservado".
- **Autenticação:** Validação básica de login para integração com o app.

### Aplicativo Mobile
- **Fluxo de Acesso:** Telas de Login e Cadastro (Doador/Receptor).
- **Feed de Doações:** Listagem dinâmica de alimentos disponíveis consumindo a API.
- **Cadastro de Doação:** Interface para upload de fotos e preenchimento de dados (produto, quantidade, validade).
- **Sistema de Navegação:** Bottom Tab Bar intuitiva para acesso rápido (Home, Mapa, Doar, Perfil).
- **Confirmação:** Telas de feedback após ações de sucesso.

---

## 5. Próximos Passos (Roadmap)
1. **Integração com Mapas:** Implementação completa da visualização geográfica usando Google Maps/Mapbox.
2. **Notificações Push:** Alertas em tempo real para novos itens disponíveis próximos ao receptor.
3. **Filtros Avançados:** Busca por categoria de alimento e distância.
4. **Histórico Detalhado:** Visualização de doações concluídas e avaliações.

---

## 6. Conclusão
A primeira versão do SaveFood estabelece uma base sólida para a plataforma, com um backend funcional e uma interface mobile moderna e responsiva. O projeto cumpre os requisitos iniciais de conectividade e gestão de doações, estando pronto para a expansão de funcionalidades geográficas e de engajamento.

**Data:** 16 de maio de 2026

