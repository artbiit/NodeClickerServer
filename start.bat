@echo off
cd /d "%~dp0"

for /f "tokens=2 delims=:," %%a in ('findstr /i "main" package.json') do set MAIN_FILE=%%~a
set MAIN_FILE=%MAIN_FILE: =%
set MAIN_FILE=%MAIN_FILE:"=%

node --experimental-specifier-resolution=node %MAIN_FILE%

echo.
echo 계속하려면 아무 키나 누르세요...
pause >nul
