@echo off
title PolyVox Studio - Multilingual Speech to Text
echo ==============================================================
echo    🎙️  PolyVox Studio - Universal Speech-to-Text Workstation
echo ==============================================================
echo.
echo Starting Python Web Server...
start "" http://localhost:5000
python app.py
pause
