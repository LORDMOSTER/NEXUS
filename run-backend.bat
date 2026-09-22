@echo off
echo =======================================
echo     Starting NexusOBE Backend ⚙️
echo =======================================
echo.

cd server

:: Check if node_modules exists in the server folder
if not exist "node_modules\" (
    echo [INFO] node_modules not found in server. Installing dependencies...
    call npm install
)

echo [INFO] Starting Node.js backend server...
:: You can change this to "call npm run dev" if you have nodemon setup in package.json
call node server.js
pause
