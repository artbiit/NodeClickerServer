@echo off
cd /d "%~dp0"
node --experimental-specifier-resolution=node --input-type=module src/index.js
echo.
echo 계속하려면 아무 키나 누르세요...
pause >nul
