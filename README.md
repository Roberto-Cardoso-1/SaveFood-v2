# SaveFood API - Documentação Técnica (OAT Parte 1)

Este repositório contém o backend do projeto **SaveFood**, desenvolvido para a disciplina de Desenvolvimento Mobile. O objetivo da aplicação é gerenciar doações de alimentos, conectando doadores e receptores para reduzir o desperdício.

## 🔗 Repositório GitHub
O código-fonte completo está disponível em: [https://github.com/Roberto-Cardoso-1/OAT-Desenvolvimento-Mobile](https://github.com/Roberto-Cardoso-1/OAT-Desenvolvimento-Mobile)

---

## 🚀 Manual de Uso dos Endpoints

A API foi construída utilizando **Django REST Framework** e fornece os seguintes recursos:

### 1. Usuários (`/api/usuarios/`)
Gerencia o cadastro de doadores e receptores.

*   **Listar todos os usuários:** `GET /api/usuarios/`
*   **Criar novo usuário:** `POST /api/usuarios/`
    *   **Payload:**
        ```json
        {
          "nome": "João Silva",
          "email": "joao@email.com",
          "senha": "senha123",
          "tipo_perfil": "doador"
        }
        ```
*   **Detalhes do usuário:** `GET /api/usuarios/{id}/`
*   **Excluir usuário:** `DELETE /api/usuarios/{id}/`

### 2. Doações (`/api/doacoes/`)
Gerencia os alimentos disponíveis para doação.

*   **Listar doações:** `GET /api/doacoes/`
*   **Cadastrar doação:** `POST /api/doacoes/`
    *   **Payload:**
        ```json
        {
          "produto": "Arroz 5kg",
          "quantidade": 2,
          "validade": "2026-12-31",
          "status": "disponivel",
          "doador": 1
        }
        ```
*   **Reservar Doação:** `POST /api/doacoes/{id}/reservar/`
    *   **Descrição:** Altera o status da doação de "disponível" para "reservado".
    *   **Resposta de Sucesso (200 OK):**
        ```json
        { "status": "Doação reservada com sucesso." }
        ```

### 3. Login (`/api/login/`)
*   **Endpoint de Autenticação:** `POST /api/login/`
    *   *(Nota: Endpoint em fase de implementação inicial)*

---

## 🛠️ Como rodar o projeto localmente

1.  **Clonar o repositório:**
    ```bash
    git clone https://github.com/Roberto-Cardoso-1/OAT-Desenvolvimento-Mobile.git
    cd OAT-Desenvolvimento-Mobile
    ```

2.  **Configurar ambiente virtual:**
    ```bash
    python -m venv venv
    .\venv\Scripts\activate   #para o windows
    ```

3.  **Instalar dependências:**
    ```bash
    pip install django djangorestframework
    ```

4.  **Rodar migrações e iniciar servidor:**
    ```bash
    python manage.py migrate
    python manage.py runserver
    ```
    A API estará acessível em `http://127.0.0.1:8000/api/`
