@echo off
cd /d "%~dp0"
echo Установка зависимостей...
call npm install
echo.
echo Зависимости установлены!
echo.
echo Для запуска приложения выполните: npm run dev
pause


