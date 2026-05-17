# SaveFood 🍎

O **SaveFood** é uma plataforma desenvolvida para combater o desperdício de alimentos, conectando doadores (restaurantes, supermercados, indivíduos) a receptores (ONGs, comunidades, pessoas em necessidade).

Este repositório contém tanto o **Backend (API)** quanto o **Frontend Mobile (App)** do projeto.

---

## 🚀 Funcionalidades

### 📱 Mobile
- **Cadastro e Login:** Perfis distintos para Doadores e Receptores.
- **Feed de Doações:** Visualização de alimentos disponíveis próximos ao usuário.
- **Criação de Doações:** Doadores podem cadastrar produtos com fotos, quantidade e validade.
- **Reserva de Alimentos:** Receptores podem reservar itens disponíveis para coleta.
- **Mapa:** (Em desenvolvimento) Visualização geográfica dos pontos de doação.
- **Perfil:** Gerenciamento de dados do usuário e histórico.

### ⚙️ Backend (API)
- **Gestão de Usuários:** CRUD completo de perfis.
- **Gestão de Doações:** Endpoints para listagem, cadastro e atualização de status.
- **Autenticação:** Sistema de login para validação de acesso.
- **Processamento de Imagens:** Suporte para upload de fotos dos alimentos doados.

---

## 🛠️ Tecnologias Utilizadas

### **Mobile**
- [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [NativeWind](https://www.nativewind.dev/) (Tailwind CSS para React Native)
- [Zustand](https://github.com/pmndrs/zustand) (Gerenciamento de Estado)
- [Axios](https://axios-http.com/) (Consumo de API)
- [Lucide React Native](https://lucide.dev/) (Ícones)

### **Backend**
- [Python](https://www.python.org/) + [Django](https://www.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [SQLite](https://www.sqlite.org/) (Banco de dados)
- [CORS Headers](https://github.com/adamchainz/django-cors-headers)

---

## 📦 Como Instalar e Rodar

### 1️⃣ Clonar o Repositório
```bash
git clone https://github.com/Roberto-Cardoso-1/OAT-Desenvolvimento-Mobile.git
cd OAT-Desenvolvimento-Mobile
```

### 2️⃣ Configurar o Backend
```bash
# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# No Windows:
.\venv\Scripts\activate
# No Linux/macOS:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Rodar migrações
python manage.py migrate

# Iniciar o servidor
python manage.py runserver
```
A API estará disponível em `http://127.0.0.1:8000/api/`

### 3️⃣ Configurar o Mobile
```bash
cd mobile

# Instalar dependências
npm install

# Iniciar o Expo
npx expo start
```
Use o aplicativo **Expo Go** no seu celular para testar ou um emulador Android/iOS.

---

## 🔗 Links Úteis
- **Repositório GitHub:** [SaveFood Repo](https://github.com/Roberto-Cardoso-1/OAT-Desenvolvimento-Mobile)
- **Documentação DRF:** [Django REST Framework](https://www.django-rest-framework.org/)

---

Desenvolvido para a disciplina de **Desenvolvimento Mobile**.
