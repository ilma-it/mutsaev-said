@echo off
chcp 65001 > nul
title Умная теплица - Локальный сервер
cd /d "%~dp0"

echo ===================================================
echo   🌱 ЗАПУСК ПОРТФОЛИО САЙТА "УМНАЯ ТЕПЛИЦА"
echo ===================================================
echo.
echo Запуск веб-сервера...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"

pause
