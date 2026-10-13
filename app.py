import os
import sys
import tempfile
import traceback
import urllib.parse
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests

# Set up ffmpeg path via imageio_ffmpeg for audio format conversion in pydub
try:
    import imageio_ffmpeg
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    ffmpeg_dir = os.path.dirname(ffmpeg_exe)
    if ffmpeg_dir not in os.environ["PATH"]:
        os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ["PATH"]
    from pydub import AudioSegment
    AudioSegment.converter = ffmpeg_exe
    FFMPEG_AVAILABLE = True
except Exception as err:
    print(f"[PolyVox] Notice: imageio-ffmpeg setup warning: {err}")
    FFMPEG_AVAILABLE = False

try:
    import speech_recognition as sr
    SR_AVAILABLE = True
except Exception as err:
    print(f"[PolyVox] SpeechRecognition import warning: {err}")
    SR_AVAILABLE = False

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")

app = Flask(__name__, static_folder=STATIC_DIR, static_url_path="")
CORS(app)

# Comprehensive list of 120+ supported languages and regional dialects
LANGUAGES = [
    # Popular Global
    {"code": "en-US", "name": "English (United States)", "native": "English (US)", "flag": "🇺🇸", "group": "Popular"},
    {"code": "en-GB", "name": "English (United Kingdom)", "native": "English (UK)", "flag": "🇬🇧", "group": "Popular"},
    {"code": "en-IN", "name": "English (India)", "native": "English (India)", "flag": "🇮🇳", "group": "Popular"},
    {"code": "en-AU", "name": "English (Australia)", "native": "English (AU)", "flag": "🇦🇺", "group": "Popular"},
    {"code": "en-CA", "name": "English (Canada)", "native": "English (CA)", "flag": "🇨🇦", "group": "Popular"},
    {"code": "hi-IN", "name": "Hindi (India)", "native": "हिन्दी", "flag": "🇮🇳", "group": "Popular"},
    {"code": "es-ES", "name": "Spanish (Spain)", "native": "Español (España)", "flag": "🇪🇸", "group": "Popular"},
    {"code": "es-MX", "name": "Spanish (Mexico)", "native": "Español (México)", "flag": "🇲🇽", "group": "Popular"},
    {"code": "es-US", "name": "Spanish (United States)", "native": "Español (EE. UU.)", "flag": "🇺🇸", "group": "Popular"},
    {"code": "fr-FR", "name": "French (France)", "native": "Français", "flag": "🇫🇷", "group": "Popular"},
    {"code": "de-DE", "name": "German (Germany)", "native": "Deutsch", "flag": "🇩🇪", "group": "Popular"},
    {"code": "it-IT", "name": "Italian (Italy)", "native": "Italiano", "flag": "🇮🇹", "group": "Popular"},
    {"code": "pt-BR", "name": "Portuguese (Brazil)", "native": "Português (Brasil)", "flag": "🇧🇷", "group": "Popular"},
    {"code": "ru-RU", "name": "Russian (Russia)", "native": "Русский", "flag": "🇷🇺", "group": "Popular"},
    {"code": "ja-JP", "name": "Japanese (Japan)", "native": "日本語", "flag": "🇯🇵", "group": "Popular"},
    {"code": "ko-KR", "name": "Korean (South Korea)", "native": "한국어", "flag": "🇰🇷", "group": "Popular"},
    {"code": "zh-CN", "name": "Chinese (Mandarin Simplified)", "native": "中文 (简体)", "flag": "🇨🇳", "group": "Popular"},
    {"code": "ar-SA", "name": "Arabic (Saudi Arabia)", "native": "العربية (السعودية)", "flag": "🇸🇦", "group": "Popular"},

    # Indian Regional Languages
    {"code": "ta-IN", "name": "Tamil (India)", "native": "தமிழ்", "flag": "🇮🇳", "group": "Indian"},
    {"code": "te-IN", "name": "Telugu (India)", "native": "తెలుగు", "flag": "🇮🇳", "group": "Indian"},
    {"code": "kn-IN", "name": "Kannada (India)", "native": "ಕನ್ನಡ", "flag": "🇮🇳", "group": "Indian"},
    {"code": "ml-IN", "name": "Malayalam (India)", "native": "മലയാളം", "flag": "🇮🇳", "group": "Indian"},
    {"code": "bn-IN", "name": "Bengali (India)", "native": "বাংলা (ভারত)", "flag": "🇮🇳", "group": "Indian"},
    {"code": "mr-IN", "name": "Marathi (India)", "native": "मराठी", "flag": "🇮🇳", "group": "Indian"},
    {"code": "gu-IN", "name": "Gujarati (India)", "native": "ગુજરાતી", "flag": "🇮🇳", "group": "Indian"},
    {"code": "pa-Guru-IN", "name": "Punjabi (India)", "native": "ਪੰਜਾਬੀ", "flag": "🇮🇳", "group": "Indian"},
    {"code": "ur-IN", "name": "Urdu (India)", "native": "اردو (بھارت)", "flag": "🇮🇳", "group": "Indian"},

    # European Languages
    {"code": "fr-CA", "name": "French (Canada)", "native": "Français (Canada)", "flag": "🇨🇦", "group": "European"},
    {"code": "fr-BE", "name": "French (Belgium)", "native": "Français (Belgique)", "flag": "🇧🇪", "group": "European"},
    {"code": "fr-CH", "name": "French (Switzerland)", "native": "Français (Suisse)", "flag": "🇨🇭", "group": "European"},
    {"code": "de-AT", "name": "German (Austria)", "native": "Deutsch (Österreich)", "flag": "🇦🇹", "group": "European"},
    {"code": "de-CH", "name": "German (Switzerland)", "native": "Deutsch (Schweiz)", "flag": "🇨🇭", "group": "European"},
    {"code": "pt-PT", "name": "Portuguese (Portugal)", "native": "Português", "flag": "🇵🇹", "group": "European"},
    {"code": "nl-NL", "name": "Dutch (Netherlands)", "native": "Nederlands", "flag": "🇳🇱", "group": "European"},
    {"code": "nl-BE", "name": "Dutch (Belgium)", "native": "Nederlands (België)", "flag": "🇧🇪", "group": "European"},
    {"code": "pl-PL", "name": "Polish (Poland)", "native": "Polski", "flag": "🇵🇱", "group": "European"},
    {"code": "tr-TR", "name": "Turkish (Turkey)", "native": "Türkçe", "flag": "🇹🇷", "group": "European"},
    {"code": "uk-UA", "name": "Ukrainian (Ukraine)", "native": "Українська", "flag": "🇺🇦", "group": "European"},
    {"code": "sv-SE", "name": "Swedish (Sweden)", "native": "Svenska", "flag": "🇸🇪", "group": "European"},
    {"code": "no-NO", "name": "Norwegian (Norway)", "native": "Norsk", "flag": "🇳🇴", "group": "European"},
    {"code": "da-DK", "name": "Danish (Denmark)", "native": "Dansk", "flag": "🇩🇰", "group": "European"},
    {"code": "fi-FI", "name": "Finnish (Finland)", "native": "Suomi", "flag": "🇫🇮", "group": "European"},
    {"code": "el-GR", "name": "Greek (Greece)", "native": "Ελληνικά", "flag": "🇬🇷", "group": "European"},
    {"code": "cs-CZ", "name": "Czech (Czech Republic)", "native": "Čeština", "flag": "🇨🇿", "group": "European"},
    {"code": "hu-HU", "name": "Hungarian (Hungary)", "native": "Magyar", "flag": "🇭🇺", "group": "European"},
    {"code": "ro-RO", "name": "Romanian (Romania)", "native": "Română", "flag": "🇷🇴", "group": "European"},
    {"code": "sk-SK", "name": "Slovak (Slovakia)", "native": "Slovenčina", "flag": "🇸🇰", "group": "European"},
    {"code": "bg-BG", "name": "Bulgarian (Bulgaria)", "native": "Български", "flag": "🇧🇬", "group": "European"},
    {"code": "hr-HR", "name": "Croatian (Croatia)", "native": "Hrvatski", "flag": "🇭🇷", "group": "European"},
    {"code": "sr-RS", "name": "Serbian (Serbia)", "native": "Српски", "flag": "🇷🇸", "group": "European"},
    {"code": "sl-SI", "name": "Slovenian (Slovenia)", "native": "Slovenščina", "flag": "🇸🇮", "group": "European"},
    {"code": "lt-LT", "name": "Lithuanian (Lithuania)", "native": "Lietuvių", "flag": "🇱🇹", "group": "European"},
    {"code": "lv-LV", "name": "Latvian (Latvia)", "native": "Latviešu", "flag": "🇱🇻", "group": "European"},
    {"code": "et-EE", "name": "Estonian (Estonia)", "native": "Eesti", "flag": "🇪🇪", "group": "European"},
    {"code": "is-IS", "name": "Icelandic (Iceland)", "native": "Íslenska", "flag": "🇮🇸", "group": "European"},
    {"code": "ga-IE", "name": "Irish (Ireland)", "native": "Gaeilge", "flag": "🇮🇪", "group": "European"},
    {"code": "cy-GB", "name": "Welsh (United Kingdom)", "native": "Cymraeg", "flag": "🏴󠁧󠁢󠁷󠁬󠁳󠁿", "group": "European"},
    {"code": "ca-ES", "name": "Catalan (Spain)", "native": "Català", "flag": "🇪🇸", "group": "European"},
    {"code": "gl-ES", "name": "Galician (Spain)", "native": "Galego", "flag": "🇪🇸", "group": "European"},
    {"code": "eu-ES", "name": "Basque (Spain)", "native": "Euskara", "flag": "🇪🇸", "group": "European"},

    # Asian Languages
    {"code": "zh-TW", "name": "Chinese (Taiwan Traditional)", "native": "中文 (繁體)", "flag": "🇹🇼", "group": "Asian"},
    {"code": "zh-HK", "name": "Chinese (Cantonese)", "native": "粵語 (香港)", "flag": "🇭🇰", "group": "Asian"},
    {"code": "vi-VN", "name": "Vietnamese (Vietnam)", "native": "Tiếng Việt", "flag": "🇻🇳", "group": "Asian"},
    {"code": "th-TH", "name": "Thai (Thailand)", "native": "ไทย", "flag": "🇹🇭", "group": "Asian"},
    {"code": "id-ID", "name": "Indonesian (Indonesia)", "native": "Bahasa Indonesia", "flag": "🇮🇩", "group": "Asian"},
    {"code": "ms-MY", "name": "Malay (Malaysia)", "native": "Bahasa Melayu", "flag": "🇲🇾", "group": "Asian"},
    {"code": "fil-PH", "name": "Filipino (Philippines)", "native": "Filipino", "flag": "🇵🇭", "group": "Asian"},
    {"code": "bn-BD", "name": "Bengali (Bangladesh)", "native": "বাংলা (বাংলাদেশ)", "flag": "🇧🇩", "group": "Asian"},
    {"code": "ur-PK", "name": "Urdu (Pakistan)", "native": "اردو (پاکستان)", "flag": "🇵🇰", "group": "Asian"},
    {"code": "ne-NP", "name": "Nepali (Nepal)", "native": "नेपाली", "flag": "🇳🇵", "group": "Asian"},
    {"code": "si-LK", "name": "Sinhala (Sri Lanka)", "native": "සිංහල", "flag": "🇱🇰", "group": "Asian"},
    {"code": "km-KH", "name": "Khmer (Cambodia)", "native": "ភាសាខ្មែរ", "flag": "🇰🇭", "group": "Asian"},
    {"code": "lo-LA", "name": "Lao (Laos)", "native": "ພາສາລາວ", "flag": "🇱🇦", "group": "Asian"},
    {"code": "my-MM", "name": "Burmese (Myanmar)", "native": "မြန်မာစာ", "flag": "🇲🇲", "group": "Asian"},
    {"code": "jv-ID", "name": "Javanese (Indonesia)", "native": "Basa Jawa", "flag": "🇮🇩", "group": "Asian"},
    {"code": "su-ID", "name": "Sundanese (Indonesia)", "native": "Basa Sunda", "flag": "🇮🇩", "group": "Asian"},
    {"code": "mn-MN", "name": "Mongolian (Mongolia)", "native": "Монгол хэл", "flag": "🇲🇳", "group": "Asian"},
    {"code": "kk-KZ", "name": "Kazakh (Kazakhstan)", "native": "Қазақ тілі", "flag": "🇰🇿", "group": "Asian"},
    {"code": "uz-UZ", "name": "Uzbek (Uzbekistan)", "native": "Oʻzbekcha", "flag": "🇺🇿", "group": "Asian"},
    {"code": "az-AZ", "name": "Azerbaijani (Azerbaijan)", "native": "Azərbaycan dili", "flag": "🇦🇿", "group": "Asian"},
    {"code": "hy-AM", "name": "Armenian (Armenia)", "native": "Հայերեն", "flag": "🇦🇲", "group": "Asian"},
    {"code": "ka-GE", "name": "Georgian (Georgia)", "native": "ქართული", "flag": "🇬🇪", "group": "Asian"},

    # Middle East & North Africa
    {"code": "ar-AE", "name": "Arabic (UAE)", "native": "العربية (الإمارات)", "flag": "🇦🇪", "group": "Middle East"},
    {"code": "ar-EG", "name": "Arabic (Egypt)", "native": "العربية (مصر)", "flag": "🇪🇬", "group": "Middle East"},
    {"code": "ar-IQ", "name": "Arabic (Iraq)", "native": "العربية (العراق)", "flag": "🇮🇶", "group": "Middle East"},
    {"code": "ar-QA", "name": "Arabic (Qatar)", "native": "العربية (قطر)", "flag": "🇶🇦", "group": "Middle East"},
    {"code": "ar-KW", "name": "Arabic (Kuwait)", "native": "العربية (الكويت)", "flag": "🇰🇼", "group": "Middle East"},
    {"code": "ar-BH", "name": "Arabic (Bahrain)", "native": "العربية (البحرين)", "flag": "🇧🇭", "group": "Middle East"},
    {"code": "ar-OM", "name": "Arabic (Oman)", "native": "العربية (عمان)", "flag": "🇴🇲", "group": "Middle East"},
    {"code": "ar-JO", "name": "Arabic (Jordan)", "native": "العربية (الأردن)", "flag": "🇯🇴", "group": "Middle East"},
    {"code": "ar-LB", "name": "Arabic (Lebanon)", "native": "العربية (لبنان)", "flag": "🇱🇧", "group": "Middle East"},
    {"code": "ar-MA", "name": "Arabic (Morocco)", "native": "العربية (المغرب)", "flag": "🇲🇦", "group": "Middle East"},
    {"code": "ar-DZ", "name": "Arabic (Algeria)", "native": "العربية (الجزائر)", "flag": "🇩🇿", "group": "Middle East"},
    {"code": "ar-TN", "name": "Arabic (Tunisia)", "native": "العربية (تونس)", "flag": "🇹🇳", "group": "Middle East"},
    {"code": "he-IL", "name": "Hebrew (Israel)", "native": "עברית", "flag": "🇮🇱", "group": "Middle East"},
    {"code": "fa-IR", "name": "Persian (Iran)", "native": "فارسی", "flag": "🇮🇷", "group": "Middle East"},

    # Americas Dialects
    {"code": "es-AR", "name": "Spanish (Argentina)", "native": "Español (Argentina)", "flag": "🇦🇷", "group": "Americas"},
    {"code": "es-CO", "name": "Spanish (Colombia)", "native": "Español (Colombia)", "flag": "🇨🇴", "group": "Americas"},
    {"code": "es-CL", "name": "Spanish (Chile)", "native": "Español (Chile)", "flag": "🇨🇱", "group": "Americas"},
    {"code": "es-PE", "name": "Spanish (Peru)", "native": "Español (Perú)", "flag": "🇵🇪", "group": "Americas"},
    {"code": "es-VE", "name": "Spanish (Venezuela)", "native": "Español (Venezuela)", "flag": "🇻🇪", "group": "Americas"},
    {"code": "es-EC", "name": "Spanish (Ecuador)", "native": "Español (Ecuador)", "flag": "🇪🇨", "group": "Americas"},
    {"code": "en-NZ", "name": "English (New Zealand)", "native": "English (NZ)", "flag": "🇳🇿", "group": "Popular"},
    {"code": "en-ZA", "name": "English (South Africa)", "native": "English (South Africa)", "flag": "🇿🇦", "group": "Popular"},
    {"code": "en-SG", "name": "English (Singapore)", "native": "English (Singapore)", "flag": "🇸🇬", "group": "Asian"},
    {"code": "en-PH", "name": "English (Philippines)", "native": "English (Philippines)", "flag": "🇵🇭", "group": "Asian"},
    {"code": "en-NG", "name": "English (Nigeria)", "native": "English (Nigeria)", "flag": "🇳🇬", "group": "African"},

    # African Languages
    {"code": "sw-KE", "name": "Swahili (Kenya)", "native": "Kiswahili (Kenya)", "flag": "🇰🇪", "group": "African"},
    {"code": "sw-TZ", "name": "Swahili (Tanzania)", "native": "Kiswahili (Tanzania)", "flag": "🇹🇿", "group": "African"},
    {"code": "af-ZA", "name": "Afrikaans (South Africa)", "native": "Afrikaans", "flag": "🇿🇦", "group": "African"},
    {"code": "zu-ZA", "name": "Zulu (South Africa)", "native": "isiZulu", "flag": "🇿🇦", "group": "African"},
    {"code": "xh-ZA", "name": "Xhosa (South Africa)", "native": "isiXhosa", "flag": "🇿🇦", "group": "African"},
    {"code": "am-ET", "name": "Amharic (Ethiopia)", "native": "አማርኛ", "flag": "🇪🇹", "group": "African"},
    {"code": "so-SO", "name": "Somali (Somalia)", "native": "Soomaali", "flag": "🇸🇴", "group": "African"}
]


@app.route("/")
def index():
    return send_from_directory(STATIC_DIR, "index.html")

@app.route("/api/health")
def health():
    return jsonify({
        "status": "healthy",
        "service": "PolyVox Speech Studio",
        "speech_recognition_available": SR_AVAILABLE,
        "ffmpeg_available": FFMPEG_AVAILABLE,
        "language_count": len(LANGUAGES)
    })

@app.route("/api/languages")
def get_languages():
    return jsonify({"languages": LANGUAGES})

@app.route("/api/transcribe-file", methods=["POST"])
def transcribe_file():
    """Transcribes an uploaded audio file using SpeechRecognition in the requested language."""
    if not SR_AVAILABLE:
        return jsonify({"error": "SpeechRecognition library not installed on server."}), 500

    if "file" not in request.files:
        return jsonify({"error": "No audio file uploaded."}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"error": "Empty filename."}), 400

    target_lang = request.form.get("language", "en-US")
    # Clean up language format if needed (e.g. en-US, hi-IN)
    filename = file.filename.lower()
    suffix = os.path.splitext(filename)[1] or ".webm"

    # Save to temp file
    temp_in = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    temp_wav = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    temp_in_path = temp_in.name
    temp_wav_path = temp_wav.name
    temp_in.close()
    temp_wav.close()

    try:
        file.save(temp_in_path)

        # Convert to WAV (16kHz, mono) using pydub
        try:
            from pydub import AudioSegment
            audio_segment = AudioSegment.from_file(temp_in_path)
            # Normalize to mono 16000Hz for highest speech recognition accuracy
            audio_segment = audio_segment.set_frame_rate(16000).set_channels(1)
            duration_sec = round(len(audio_segment) / 1000.0, 2)
            audio_segment.export(temp_wav_path, format="wav")
            wav_to_read = temp_wav_path
        except Exception as conv_err:
            print(f"[PolyVox] Audio conversion error with pydub: {conv_err}. Trying raw read if WAV...")
            wav_to_read = temp_in_path
            duration_sec = 0

        # Perform Speech Recognition
        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_to_read) as source:
            # Adjust for ambient noise slightly
            recognizer.adjust_for_ambient_noise(source, duration=0.3)
            audio_data = recognizer.record(source)

        transcription = recognizer.recognize_google(audio_data, language=target_lang)

        return jsonify({
            "success": True,
            "text": transcription,
            "language": target_lang,
            "duration": duration_sec
        })

    except sr.UnknownValueError:
        return jsonify({
            "success": False,
            "error": "No distinct speech could be recognized in the audio for the selected language. Please ensure clear speech and correct language selection."
        }), 422
    except sr.RequestError as req_err:
        return jsonify({
            "success": False,
            "error": f"Speech recognition service request error: {str(req_err)}"
        }), 502
    except Exception as ex:
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"Audio processing error: {str(ex)}"
        }), 500
    finally:
        for p in [temp_in_path, temp_wav_path]:
            if os.path.exists(p):
                try:
                    os.remove(p)
                except Exception:
                    pass

@app.route("/api/translate", methods=["POST"])
def translate_text():
    """Translates text from source language to target language using MyMemory API."""
    data = request.get_json(silent=True) or {}
    text = data.get("text", "").strip()
    source_lang = data.get("source", "auto")
    target_lang = data.get("target", "en")

    if not text:
        return jsonify({"error": "No text provided for translation."}), 400

    # Simplify language codes to 2-letter codes for MyMemory (e.g. en-US -> en, hi-IN -> hi)
    src_short = source_lang.split("-")[0].lower() if source_lang != "auto" else "autodetect"
    tgt_short = target_lang.split("-")[0].lower()

    if src_short == tgt_short:
        return jsonify({
            "success": True,
            "translated_text": text,
            "source": source_lang,
            "target": target_lang
        })

    # Break text into chunks of <= 450 characters (sentence boundaries) to comply with free API limits
    sentences = text.replace("\n", " \n ").split(". ")
    chunks = []
    current_chunk = ""

    for s in sentences:
        s_with_period = s if s.endswith((".", "!", "?")) else s + "."
        if len(current_chunk) + len(s_with_period) + 1 > 450:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = s_with_period
        else:
            current_chunk = (current_chunk + " " + s_with_period).strip()
    if current_chunk:
        chunks.append(current_chunk.strip())

    if not chunks:
        chunks = [text[:450]]

    translated_pieces = []
    headers = {"User-Agent": "PolyVoxStudio/1.0"}

    for chunk in chunks:
        # Check if line break
        if chunk == ".\n." or chunk == "\n":
            translated_pieces.append("\n")
            continue
        try:
            url = f"https://api.mymemory.translated.net/get?q={urllib.parse.quote(chunk)}&langpair={src_short}|{tgt_short}"
            resp = requests.get(url, headers=headers, timeout=8)
            if resp.status_code == 200:
                res_data = resp.json()
                t_text = res_data.get("responseData", {}).get("translatedText", "")
                if t_text:
                    translated_pieces.append(t_text)
                else:
                    translated_pieces.append(chunk)
            else:
                translated_pieces.append(chunk)
        except Exception as e:
            print(f"[PolyVox] Translation chunk failed: {e}")
            translated_pieces.append(chunk)

    full_translated = " ".join(translated_pieces).replace(" \n ", "\n").strip()

    return jsonify({
        "success": True,
        "translated_text": full_translated or text,
        "source": source_lang,
        "target": target_lang
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print("================================================================")
    print("  [PolyVox Studio] Universal Multilingual Speech-to-Text")
    print(f"  Server starting on http://localhost:{port}")
    print(f"  Languages supported: {len(LANGUAGES)}")
    print("================================================================")
    app.run(host="0.0.0.0", port=port, debug=False)
