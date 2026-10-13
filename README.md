# 🎙️ PolyVox Studio — Universal Multilingual Speech-to-Text Workstation

An ultra-modern, state-of-the-art web application for live speech-to-text dictation, multi-format audio transcription, and multilingual document authoring built with **HTML5, CSS3, JavaScript**, and **Python**.

---

## ✨ Features

- **🌐 130+ Languages & Dialects Supported**:
  - **Indian Languages**: Hindi (हिन्दी), Tamil (தமிழ்), Telugu (తెలుగు), Kannada (ಕನ್ನಡ), Malayalam (മലയാളം), Bengali (বাংলা), Marathi (मराठी), Gujarati (ગુજરાતી), Punjabi (ਪੰਜਾਬੀ), Urdu (اردو).
  - **Major Global Languages**: English (US, UK, India, Australia, Canada), Spanish (Spain, Mexico, US), French (France, Canada), German, Italian, Portuguese (Brazil, Portugal), Russian, Mandarin Chinese, Japanese, Korean, Arabic (Saudi, UAE, Egypt), Dutch, Turkish, Vietnamese, Thai, Indonesian, and 100+ more!
- **⚡ Dual Engine Architecture**:
  - **Engine 1 (Real-Time Live Dictation)**: High-performance streaming speech-to-text with interim previews and auto-restart resilience using the Web Speech API.
  - **Engine 2 (Python AI Audio Transcription)**: Drag-and-drop audio files (`.wav`, `.mp3`, `.ogg`, `.m4a`, `.webm`, `.flac`) processed through Python's `SpeechRecognition` and `pydub` with automatic 16kHz audio normalization.
- **🌊 Interactive Sound Wave Visualizer**:
  - Web Audio API canvas visualizer displaying real-time frequency waves and speech amplitude.
- **📝 Multilingual Document Studio**:
  - Live writing canvas with real-time metrics: **Word Count**, **Character Count**, **Words-Per-Minute (WPM)**, and **Estimated Reading Time**.
  - Smart Formatting: **Auto-Capitalization**, **Voice Punctuation Commands** ("period", "comma", "new line", "question mark"), and **Timestamps**.
  - Undo / Redo history stack (`Ctrl+Z`, `Ctrl+Y`).
  - Search & Replace drawer (`Ctrl+F`).
- **🔊 Text-to-Speech (Listen Back)**:
  - Hear your transcribed notes read aloud in the native language and accent.
- **🌍 Instant Translation**:
  - 1-click translation of transcribed text into 50+ target languages.
- **💾 Multi-Format Exporters**:
  - **.TXT** (Plain text)
  - **.DOC** (Microsoft Word compatible)
  - **.SRT** (Subtitles with timed cues)
  - **.JSON** (Structured data with metadata)
  - **Print / PDF** (Clean print-optimized layout)
- **🎨 Aesthetics & UX**:
  - Futuristic dark glassmorphic design with neon accents and seamless light mode toggle.
  - Keyboard shortcuts (`Space` or `Alt+M` for mic, `Ctrl+S` for quick export, `Ctrl+C` for copy).

---

## 🚀 Quick Start

### Option 1: 1-Click Launch (Windows)
Double-click `run.bat` in this folder. It will start the Python server and open your default browser automatically at `http://localhost:5000`.

### Option 2: Running via Terminal
1. Open PowerShell or Command Prompt in this folder:
   ```bash
   python app.py
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

### Option 3: Standalone Client Mode
You can also directly open `static/index.html` in Chrome or Edge to use live speech dictation without running Python!

---

## 📦 Tech Stack
- **Frontend**: HTML5, Vanilla CSS3 (Custom Design System, Glassmorphism, CSS Variables), JavaScript (Web Speech API, Web Audio API, Canvas, LocalStorage).
- **Backend (Optional & Integrated)**: Python 3.11, Flask, Flask-CORS, SpeechRecognition, pydub, imageio-ffmpeg.
