@echo off
title Tostado Cafeteria
cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel% equ 0 (
    py -3 iniciar_tostado.py
) else (
    python iniciar_tostado.py
)

if %errorlevel% neq 0 (
    echo.
    echo Ocurrio un error. Revisa el mensaje anterior.
    pause
)
