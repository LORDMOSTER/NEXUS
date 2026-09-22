@echo off
echo =======================================
echo     Starting NexusOBE Frontend 🚀
echo =======================================
echo.

:: Check if node_modules exists, if not, install dependencies
if not exist "node_modules\" (
    echo [INFO] node_modules not found. Installing dependencies...
    call npm install
)

echo [INFO] Starting Vite development server...
call npm run dev
pause
