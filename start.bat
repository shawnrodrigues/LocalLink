@echo off
echo ========================================
echo  Local Network Share ^& Chat
echo  Quick Start Guide
echo ========================================
echo.

echo Step 1: Checking port 3308...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3308 ^| findstr LISTENING') do (
    echo Closing existing server on port 3308...
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo Port 3308 is now available
echo.

echo Step 2: Installing dependencies...
call npm install
echo.

echo Step 3: Starting server...
echo.
echo The server will start on port 3308
echo.
echo To access from this computer:
echo   http://localhost:3308
echo.
echo To access from other devices:
echo   1. Run 'ipconfig' in a new terminal
echo   2. Find your IPv4 Address (e.g., 192.168.1.100)
echo   3. Open browser on other device and go to:
echo      http://[YOUR_IP]:3308
echo.
echo Starting server now...
echo.

npm start

pause
