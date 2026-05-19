@echo off
TITLE SERVIDOR SAVEFOOD - NAO FECHE ESTA JANELA
echo ======================================================
echo           INICIANDO SERVIDORES DO SAVEFOOD
echo ======================================================
echo.
echo [1/2] Iniciando Backend Django...
start cmd /k "cd /d C:\SaveFood && .\venv\Scripts\activate && python manage.py runserver"

echo [2/2] Iniciando Tunel Ngrok (Acesso Remoto)...
echo.
echo DICA: Se a URL mudar, voce precisara gerar um novo APK.
echo URL ATUAL: https://monoxide-untagged-hull.ngrok-free.dev
echo.
start cmd /k "ngrok http 8000"

echo.
echo ======================================================
echo    TUDO PRONTO! MANTENHA AS JANELAS ABERTAS.
echo    O APP DO SEU COLEGA JA PODE SER USADO.
echo ======================================================
pause
