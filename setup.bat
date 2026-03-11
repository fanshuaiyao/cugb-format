@echo off
chcp 65001 >nul
echo ============================================
echo   cugb-format setup
echo ============================================
echo.

echo [Step 1] check Node.js
echo -----------------------------------------
call node -v
if %errorlevel% neq 0 (
    echo [FAIL] Node.js not found
    echo Please install from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js ready
echo.

echo [Step 2] check npm
echo -----------------------------------------
call npm -v
if %errorlevel% neq 0 (
    echo [FAIL] npm not found
    pause
    exit /b 1
)
echo [OK] npm ready
echo.

echo [Step 3] npm install (root)
echo -----------------------------------------
call npm install
if %errorlevel% neq 0 (
    echo [FAIL] npm install failed
    pause
    exit /b 1
)
echo [OK] lerna installed
echo.

echo [Step 4] install all sub-packages
echo -----------------------------------------
call npx lerna exec -- npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo [FAIL] sub-package install failed
    pause
    exit /b 1
)
echo [OK] all sub-packages installed
echo.

echo [Step 5] build all packages
echo -----------------------------------------
call npx lerna run build
if %errorlevel% neq 0 (
    echo [FAIL] build failed
    pause
    exit /b 1
)
echo [OK] build done
echo.

echo [Step 6] run tests
echo -----------------------------------------
call npx lerna run test
echo.

echo ============================================
echo   DONE!
echo ============================================
echo.
echo   npm run start            start web app
echo   npm run test             run all tests
echo   node cli-format.js x.docx   CLI format
echo.
pause
