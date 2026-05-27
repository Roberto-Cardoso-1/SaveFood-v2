@echo off
TITLE SERVIDOR SAVEFOOD - NAO FECHE ESTA JANELA

REM Caminho base = pasta onde este .bat está. Não usa caminho fixo, então
REM funciona mesmo se você mover o projeto.
SET "BASE=%~dp0"
SET "BASE=%BASE:~0,-1%"

echo ======================================================
echo           INICIANDO SERVIDORES DO SAVEFOOD
echo ======================================================
echo Pasta do projeto: %BASE%
echo.

echo [1/3] Iniciando Backend Django...
start "SaveFood :: Django"    cmd /k "cd /d ""%BASE%"" && call .\venv\Scripts\activate && python manage.py runserver"

echo [2/3] Iniciando Tunel Ngrok (acesso remoto)...
echo DICA: Se a URL do ngrok mudar, atualize mobile\.env (EXPO_PUBLIC_API_URL)
echo       e gere novo APK se for buildar.
echo URL ATUAL: https://monoxide-untagged-hull.ngrok-free.dev
start "SaveFood :: ngrok"     cmd /k "ngrok http 8000"

echo [3/3] Iniciando Expo (mobile)...
start "SaveFood :: Expo"      cmd /k "cd /d ""%BASE%\mobile"" && npx expo start"

echo.
echo ======================================================
echo    TUDO PRONTO! Tres janelas foram abertas:
echo       - Django  (porta 8000)
echo       - ngrok   (tunel HTTPS)
echo       - Expo    (escaneie o QR no Expo Go)
echo    Mantenha as 3 janelas abertas enquanto usar o app.
echo ======================================================
pause
