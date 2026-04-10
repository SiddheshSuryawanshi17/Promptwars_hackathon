@echo off
REM VenueFlow Easy Startup Script for Windows
REM This script sets up and starts the entire VenueFlow application

color 0A
cls

echo.
echo ====================================
echo.   Checking prerequisites...
echo ====================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Node.js is not installed!
    echo Please install from: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js found (%NODE_VERSION%)

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] npm is not installed!
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [OK] npm found (%NPM_VERSION%)
echo.

REM Step 1: Install dependencies
echo ====================================
echo  Step 1: Installing dependencies...
echo ====================================
if not exist "node_modules" (
    echo Installing npm packages...
    call npm install
    echo [OK] Dependencies installed
) else (
    echo [OK] Dependencies already installed
)
echo.

REM Step 2: Create .env if it doesn't exist
echo ====================================
echo  Step 2: Setting up environment...
echo ====================================
if not exist ".env" (
    echo Creating .env file...
    (
        echo PORT=5000
        echo NODE_ENV=development
        echo FRONTEND_URL=http://localhost:3000
    ) > .env
    echo [OK] .env file created
) else (
    echo [OK] .env file already exists
)
echo.

REM Step 3: Display ready message
echo ====================================
echo  VenueFlow Setup Complete!
echo ====================================
echo.
echo To start VenueFlow, open 2 command prompts:
echo.
echo Terminal 1 (Backend):
echo   node server.js
echo.
echo Terminal 2 (Frontend):
echo   npm start
echo.
echo Then open: http://localhost:3000
echo.
pause
