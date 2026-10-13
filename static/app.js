/**
 * POLYVOX STUDIO — APPLICATION LOGIC
 * Universal Multilingual Speech-to-Text Workstation
 */

// --- Global State ---
const state = {
    currentLanguage: 'en-US',
    isRecording: false,
    startTime: null,
    timerInterval: null,
    recognition: null,
    audioContext: null,
    analyser: null,
    audioStream: null,
    visualizerAnimationId: null,
    ttsPlaying: false,
    history: [],
    historyIndex: -1,
    maxHistory: 50,
    selectedAudioFile: null,
    backendOnline: false
};

// --- Comprehensive 120+ Language Catalog ---
const LANGUAGES = [
    // Popular
    { code: 'en-US', name: 'English (United States)', native: 'English (US)', flag: '🇺🇸', group: 'Popular' },
    { code: 'en-GB', name: 'English (United Kingdom)', native: 'English (UK)', flag: '🇬🇧', group: 'Popular' },
    { code: 'en-IN', name: 'English (India)', native: 'English (India)', flag: '🇮🇳', group: 'Popular' },
    { code: 'en-AU', name: 'English (Australia)', native: 'English (AU)', flag: '🇦🇺', group: 'Popular' },
    { code: 'en-CA', name: 'English (Canada)', native: 'English (CA)', flag: '🇨🇦', group: 'Popular' },
    { code: 'hi-IN', name: 'Hindi (India)', native: 'हिन्दी', flag: '🇮🇳', group: 'Popular' },
    { code: 'es-ES', name: 'Spanish (Spain)', native: 'Español (España)', flag: '🇪🇸', group: 'Popular' },
    { code: 'es-MX', name: 'Spanish (Mexico)', native: 'Español (México)', flag: '🇲🇽', group: 'Popular' },
    { code: 'es-US', name: 'Spanish (United States)', native: 'Español (EE. UU.)', flag: '🇺🇸', group: 'Popular' },
    { code: 'fr-FR', name: 'French (France)', native: 'Français', flag: '🇫🇷', group: 'Popular' },
    { code: 'de-DE', name: 'German (Germany)', native: 'Deutsch', flag: '🇩🇪', group: 'Popular' },
    { code: 'it-IT', name: 'Italian (Italy)', native: 'Italiano', flag: '🇮🇹', group: 'Popular' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)', native: 'Português (Brasil)', flag: '🇧🇷', group: 'Popular' },
    { code: 'ru-RU', name: 'Russian (Russia)', native: 'Русский', flag: '🇷🇺', group: 'Popular' },
    { code: 'ja-JP', name: 'Japanese (Japan)', native: '日本語', flag: '🇯🇵', group: 'Popular' },
    { code: 'ko-KR', name: 'Korean (South Korea)', native: '한국어', flag: '🇰🇷', group: 'Popular' },
    { code: 'zh-CN', name: 'Chinese (Mandarin Simplified)', native: '中文 (简体)', flag: '🇨🇳', group: 'Popular' },
    { code: 'ar-SA', name: 'Arabic (Saudi Arabia)', native: 'العربية', flag: '🇸🇦', group: 'Popular' },
    
    // Indian Regional Languages
    { code: 'ta-IN', name: 'Tamil (India)', native: 'தமிழ்', flag: '🇮🇳', group: 'Indian' },
    { code: 'te-IN', name: 'Telugu (India)', native: 'తెలుగు', flag: '🇮🇳', group: 'Indian' },
    { code: 'kn-IN', name: 'Kannada (India)', native: 'ಕನ್ನಡ', flag: '🇮🇳', group: 'Indian' },
    { code: 'ml-IN', name: 'Malayalam (India)', native: 'മലയാളം', flag: '🇮🇳', group: 'Indian' },
    { code: 'bn-IN', name: 'Bengali (India)', native: 'বাংলা (ভারত)', flag: '🇮🇳', group: 'Indian' },
    { code: 'mr-IN', name: 'Marathi (India)', native: 'मराठी', flag: '🇮🇳', group: 'Indian' },
    { code: 'gu-IN', name: 'Gujarati (India)', native: 'ગુજરાતી', flag: '🇮🇳', group: 'Indian' },
    { code: 'pa-Guru-IN', name: 'Punjabi (India)', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳', group: 'Indian' },
    { code: 'ur-IN', name: 'Urdu (India)', native: 'اردو (بھارت)', flag: '🇮🇳', group: 'Indian' },

    // European Languages
    { code: 'fr-CA', name: 'French (Canada)', native: 'Français (Canada)', flag: '🇨🇦', group: 'European' },
    { code: 'fr-BE', name: 'French (Belgium)', native: 'Français (Belgique)', flag: '🇧🇪', group: 'European' },
    { code: 'fr-CH', name: 'French (Switzerland)', native: 'Français (Suisse)', flag: '🇨🇭', group: 'European' },
    { code: 'de-AT', name: 'German (Austria)', native: 'Deutsch (Österreich)', flag: '🇦🇹', group: 'European' },
    { code: 'de-CH', name: 'German (Switzerland)', native: 'Deutsch (Schweiz)', flag: '🇨🇭', group: 'European' },
    { code: 'pt-PT', name: 'Portuguese (Portugal)', native: 'Português', flag: '🇵🇹', group: 'European' },
    { code: 'nl-NL', name: 'Dutch (Netherlands)', native: 'Nederlands', flag: '🇳🇱', group: 'European' },
    { code: 'nl-BE', name: 'Dutch (Belgium)', native: 'Nederlands (België)', flag: '🇧🇪', group: 'European' },
    { code: 'pl-PL', name: 'Polish (Poland)', native: 'Polski', flag: '🇵🇱', group: 'European' },
    { code: 'tr-TR', name: 'Turkish (Turkey)', native: 'Türkçe', flag: '🇹🇷', group: 'European' },
    { code: 'uk-UA', name: 'Ukrainian (Ukraine)', native: 'Українська', flag: '🇺🇦', group: 'European' },
    { code: 'sv-SE', name: 'Swedish (Sweden)', native: 'Svenska', flag: '🇸🇪', group: 'European' },
    { code: 'no-NO', name: 'Norwegian (Norway)', native: 'Norsk', flag: '🇳🇴', group: 'European' },
    { code: 'da-DK', name: 'Danish (Denmark)', native: 'Dansk', flag: '🇩🇰', group: 'European' },
    { code: 'fi-FI', name: 'Finnish (Finland)', native: 'Suomi', flag: '🇫🇮', group: 'European' },
    { code: 'el-GR', name: 'Greek (Greece)', native: 'Ελληνικά', flag: '🇬🇷', group: 'European' },
    { code: 'cs-CZ', name: 'Czech (Czech Republic)', native: 'Čeština', flag: '🇨🇿', group: 'European' },
    { code: 'hu-HU', name: 'Hungarian (Hungary)', native: 'Magyar', flag: '🇭🇺', group: 'European' },
    { code: 'ro-RO', name: 'Romanian (Romania)', native: 'Română', flag: '🇷🇴', group: 'European' },
    { code: 'sk-SK', name: 'Slovak (Slovakia)', native: 'Slovenčina', flag: '🇸🇰', group: 'European' },
    { code: 'bg-BG', name: 'Bulgarian (Bulgaria)', native: 'Български', flag: '🇧🇬', group: 'European' },
    { code: 'hr-HR', name: 'Croatian (Croatia)', native: 'Hrvatski', flag: '🇭🇷', group: 'European' },
    { code: 'sr-RS', name: 'Serbian (Serbia)', native: 'Српски', flag: '🇷🇸', group: 'European' },
    { code: 'sl-SI', name: 'Slovenian (Slovenia)', native: 'Slovenščina', flag: '🇸🇮', group: 'European' },
    { code: 'lt-LT', name: 'Lithuanian (Lithuania)', native: 'Lietuvių', flag: '🇱🇹', group: 'European' },
    { code: 'lv-LV', name: 'Latvian (Latvia)', native: 'Latviešu', flag: '🇱🇻', group: 'European' },
    { code: 'et-EE', name: 'Estonian (Estonia)', native: 'Eesti', flag: '🇪🇪', group: 'European' },
    { code: 'is-IS', name: 'Icelandic (Iceland)', native: 'Íslenska', flag: '🇮🇸', group: 'European' },
    { code: 'ga-IE', name: 'Irish (Ireland)', native: 'Gaeilge', flag: '🇮🇪', group: 'European' },
    { code: 'cy-GB', name: 'Welsh (United Kingdom)', native: 'Cymraeg', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', group: 'European' },
    { code: 'ca-ES', name: 'Catalan (Spain)', native: 'Català', flag: '🇪🇸', group: 'European' },
    { code: 'gl-ES', name: 'Galician (Spain)', native: 'Galego', flag: '🇪🇸', group: 'European' },
    { code: 'eu-ES', name: 'Basque (Spain)', native: 'Euskara', flag: '🇪🇸', group: 'European' },

    // Asian Languages
    { code: 'zh-TW', name: 'Chinese (Taiwan Traditional)', native: '中文 (繁體)', flag: '🇹🇼', group: 'Asian' },
    { code: 'zh-HK', name: 'Chinese (Cantonese)', native: '粵語 (香港)', flag: '🇭🇰', group: 'Asian' },
    { code: 'vi-VN', name: 'Vietnamese (Vietnam)', native: 'Tiếng Việt', flag: '🇻🇳', group: 'Asian' },
    { code: 'th-TH', name: 'Thai (Thailand)', native: 'ไทย', flag: '🇹🇭', group: 'Asian' },
    { code: 'id-ID', name: 'Indonesian (Indonesia)', native: 'Bahasa Indonesia', flag: '🇮🇩', group: 'Asian' },
    { code: 'ms-MY', name: 'Malay (Malaysia)', native: 'Bahasa Melayu', flag: '🇲🇾', group: 'Asian' },
    { code: 'fil-PH', name: 'Filipino (Philippines)', native: 'Filipino', flag: '🇵🇭', group: 'Asian' },
    { code: 'bn-BD', name: 'Bengali (Bangladesh)', native: 'বাংলা (বাংলাদেশ)', flag: '🇧🇩', group: 'Asian' },
    { code: 'ur-PK', name: 'Urdu (Pakistan)', native: 'اردو (پاکستان)', flag: '🇵🇰', group: 'Asian' },
    { code: 'ne-NP', name: 'Nepali (Nepal)', native: 'नेपाली', flag: '🇳🇵', group: 'Asian' },
    { code: 'si-LK', name: 'Sinhala (Sri Lanka)', native: 'සිංහල', flag: '🇱🇰', group: 'Asian' },
    { code: 'km-KH', name: 'Khmer (Cambodia)', native: 'ភាសាខ្មែរ', flag: '🇰🇭', group: 'Asian' },
    { code: 'lo-LA', name: 'Lao (Laos)', native: 'ພາສາລາວ', flag: '🇱🇦', group: 'Asian' },
    { code: 'my-MM', name: 'Burmese (Myanmar)', native: 'မြန်မာစာ', flag: '🇲🇲', group: 'Asian' },
    { code: 'jv-ID', name: 'Javanese (Indonesia)', native: 'Basa Jawa', flag: '🇮🇩', group: 'Asian' },
    { code: 'su-ID', name: 'Sundanese (Indonesia)', native: 'Basa Sunda', flag: '🇮🇩', group: 'Asian' },
    { code: 'mn-MN', name: 'Mongolian (Mongolia)', native: 'Монгол хэл', flag: '🇲🇳', group: 'Asian' },
    { code: 'kk-KZ', name: 'Kazakh (Kazakhstan)', native: 'Қазақ тілі', flag: '🇰🇿', group: 'Asian' },
    { code: 'uz-UZ', name: 'Uzbek (Uzbekistan)', native: 'Oʻzbekcha', flag: '🇺🇿', group: 'Asian' },
    { code: 'az-AZ', name: 'Azerbaijani (Azerbaijan)', native: 'Azərbaycan dili', flag: '🇦🇿', group: 'Asian' },
    { code: 'hy-AM', name: 'Armenian (Armenia)', native: 'Հայերեն', flag: '🇦🇲', group: 'Asian' },
    { code: 'ka-GE', name: 'Georgian (Georgia)', native: 'ქართული', flag: '🇬🇪', group: 'Asian' },

    // Middle Eastern Languages
    { code: 'ar-AE', name: 'Arabic (United Arab Emirates)', native: 'العربية (الإمارات)', flag: '🇦🇪', group: 'Middle East' },
    { code: 'ar-EG', name: 'Arabic (Egypt)', native: 'العربية (مصر)', flag: '🇪🇬', group: 'Middle East' },
    { code: 'ar-IQ', name: 'Arabic (Iraq)', native: 'العربية (العراق)', flag: '🇮🇶', group: 'Middle East' },
    { code: 'ar-QA', name: 'Arabic (Qatar)', native: 'العربية (قطر)', flag: '🇶🇦', group: 'Middle East' },
    { code: 'ar-KW', name: 'Arabic (Kuwait)', native: 'العربية (الكويت)', flag: '🇰🇼', group: 'Middle East' },
    { code: 'ar-BH', name: 'Arabic (Bahrain)', native: 'العربية (البحرين)', flag: '🇧🇭', group: 'Middle East' },
    { code: 'ar-OM', name: 'Arabic (Oman)', native: 'العربية (عمان)', flag: '🇴🇲', group: 'Middle East' },
    { code: 'ar-JO', name: 'Arabic (Jordan)', native: 'العربية (الأردن)', flag: '🇯🇴', group: 'Middle East' },
    { code: 'ar-LB', name: 'Arabic (Lebanon)', native: 'العربية (لبنان)', flag: '🇱🇧', group: 'Middle East' },
    { code: 'ar-MA', name: 'Arabic (Morocco)', native: 'العربية (المغرب)', flag: '🇲🇦', group: 'Middle East' },
    { code: 'ar-DZ', name: 'Arabic (Algeria)', native: 'العربية (الجزائر)', flag: '🇩🇿', group: 'Middle East' },
    { code: 'ar-TN', name: 'Arabic (Tunisia)', native: 'العربية (تونس)', flag: '🇹🇳', group: 'Middle East' },
    { code: 'he-IL', name: 'Hebrew (Israel)', native: 'עברית', flag: '🇮🇱', group: 'Middle East' },
    { code: 'fa-IR', name: 'Persian (Iran)', native: 'فارسی', flag: '🇮🇷', group: 'Middle East' },

    // African Languages
    { code: 'sw-KE', name: 'Swahili (Kenya)', native: 'Kiswahili', flag: '🇰🇪', group: 'African' },
    { code: 'sw-TZ', name: 'Swahili (Tanzania)', native: 'Kiswahili (Tanzania)', flag: '🇹🇿', group: 'African' },
    { code: 'af-ZA', name: 'Afrikaans (South Africa)', native: 'Afrikaans', flag: '🇿🇦', group: 'African' },
    { code: 'am-ET', name: 'Amharic (Ethiopia)', native: 'አማርኛ', flag: '🇪🇹', group: 'African' },
    { code: 'zu-ZA', name: 'Zulu (South Africa)', native: 'isiZulu', flag: '🇿🇦', group: 'African' },
    { code: 'xh-ZA', name: 'Xhosa (South Africa)', native: 'isiXhosa', flag: '🇿🇦', group: 'African' },
    { code: 'so-SO', name: 'Somali (Somalia)', native: 'Soomaali', flag: '🇸🇴', group: 'African' }
];


// --- DOM References ---
const elements = {
    // Nav & Mode
    tabLive: document.getElementById('tab-live'),
    tabFile: document.getElementById('tab-file'),
    viewLive: document.getElementById('view-live'),
    viewFile: document.getElementById('view-file'),
    themeToggle: document.getElementById('theme-toggle'),
    helpToggle: document.getElementById('help-toggle'),
    backendStatus: document.getElementById('backend-status'),
    backendLabel: document.getElementById('backend-label'),

    // Language
    activeFlag: document.getElementById('active-flag'),
    activeName: document.getElementById('active-name'),
    activeCode: document.getElementById('active-code'),
    openLangModal: document.getElementById('open-lang-modal'),
    quickLangPills: document.getElementById('quick-lang-pills'),
    browseAllLangsBtn: document.getElementById('browse-all-langs-btn'),
    currentLangHint: document.getElementById('current-lang-hint'),
    fileLangName: document.getElementById('file-lang-name'),

    // Live Mic & Visualizer
    canvas: document.getElementById('audio-visualizer'),
    micBtn: document.getElementById('mic-btn'),
    radarRing: document.getElementById('radar-ring'),
    liveDot: document.getElementById('live-dot'),
    liveStatusText: document.getElementById('live-status-text'),
    recordingTimer: document.getElementById('recording-timer'),
    interimStream: document.getElementById('interim-stream'),
    toggleContinuous: document.getElementById('toggle-continuous'),
    togglePunctuation: document.getElementById('toggle-punctuation'),
    toggleTimestamps: document.getElementById('toggle-timestamps'),
    toggleAutocap: document.getElementById('toggle-autocap'),

    // File Upload
    fileDropzone: document.getElementById('file-dropzone'),
    audioFileInput: document.getElementById('audio-file-input'),
    browseFileBtn: document.getElementById('browse-file-btn'),
    filePreviewCard: document.getElementById('file-preview-card'),
    fileNameLabel: document.getElementById('file-name-label'),
    fileSizeLabel: document.getElementById('file-size-label'),
    removeFileBtn: document.getElementById('remove-file-btn'),
    audioPreviewPlayer: document.getElementById('audio-preview-player'),
    transcribeFileBtn: document.getElementById('transcribe-file-btn'),
    transcribeSpinner: document.getElementById('transcribe-spinner'),
    transcribeBtnText: document.getElementById('transcribe-btn-text'),
    fileProgressContainer: document.getElementById('file-progress-container'),
    fileProgressStatus: document.getElementById('file-progress-status'),

    // Text Editor
    editor: document.getElementById('transcript-editor'),
    saveStatus: document.getElementById('save-status'),
    metricWords: document.getElementById('metric-words'),
    metricChars: document.getElementById('metric-chars'),
    metricWpm: document.getElementById('metric-wpm'),
    metricReadtime: document.getElementById('metric-readtime'),

    // Toolbar
    toolUndo: document.getElementById('tool-undo'),
    toolRedo: document.getElementById('tool-redo'),
    toolCapitalize: document.getElementById('tool-capitalize'),
    toolTimestamp: document.getElementById('tool-timestamp'),
    toolFindToggle: document.getElementById('tool-find-toggle'),
    toolTts: document.getElementById('tool-tts'),
    ttsLabel: document.getElementById('tts-label'),
    toolTranslate: document.getElementById('tool-translate'),
    toolCopy: document.getElementById('tool-copy'),
    toolClear: document.getElementById('tool-clear'),
    copyBtnText: document.getElementById('copy-btn-text'),

    // Find & Replace
    findReplaceDrawer: document.getElementById('find-replace-drawer'),
    findInput: document.getElementById('find-input'),
    replaceInput: document.getElementById('replace-input'),
    btnFindNext: document.getElementById('btn-find-next'),
    btnReplaceOne: document.getElementById('btn-replace-one'),
    btnReplaceAll: document.getElementById('btn-replace-all'),
    btnCloseFind: document.getElementById('btn-close-find'),

    // Exporters
    exportTxt: document.getElementById('export-txt'),
    exportDoc: document.getElementById('export-doc'),
    exportSrt: document.getElementById('export-srt'),
    exportJson: document.getElementById('export-json'),
    exportPrint: document.getElementById('export-print'),

    // Modals
    langModal: document.getElementById('lang-modal'),
    closeLangModal: document.getElementById('close-lang-modal'),
    langSearchInput: document.getElementById('lang-search-input'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    langGroupTabs: document.getElementById('lang-group-tabs'),
    langGridContainer: document.getElementById('lang-grid-container'),

    translateModal: document.getElementById('translate-modal'),
    closeTranslateModal: document.getElementById('close-translate-modal'),
    transSourceLang: document.getElementById('trans-source-lang'),
    transTargetLang: document.getElementById('trans-target-lang'),
    transResultText: document.getElementById('trans-result-text'),
    transCopyBtn: document.getElementById('trans-copy-btn'),
    transReplaceEditorBtn: document.getElementById('trans-replace-editor-btn'),
    transExecuteBtn: document.getElementById('trans-execute-btn'),
    transSpinner: document.getElementById('trans-spinner'),

    helpModal: document.getElementById('help-modal'),
    closeHelpModal: document.getElementById('close-help-modal'),
    toastContainer: document.getElementById('toast-container')
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSpeechRecognition();
    initVisualizerCanvas();
    initEditorEvents();
    initLanguageCatalog();
    checkBackendHealth();
    bindEventListeners();
    loadSavedContent();
});

// --- Theme Management ---
function initTheme() {
    const savedTheme = localStorage.getItem('polyvox_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('polyvox_theme', next);
    showToast(`Switched to ${next} theme`, 'info');
}

// --- Check Backend Health ---
async function checkBackendHealth() {
    try {
        const res = await fetch('/api/health');
        if (res.ok) {
            const data = await res.json();
            state.backendOnline = true;
            elements.backendStatus.classList.remove('offline');
            elements.backendLabel.textContent = 'Python AI Ready';
            elements.backendStatus.title = `Connected to Python backend (${data.language_count} languages, SpeechRecognition online)`;
        } else {
            throw new Error();
        }
    } catch {
        state.backendOnline = false;
        elements.backendStatus.classList.add('offline');
        elements.backendLabel.textContent = 'Browser Engine';
        elements.backendStatus.title = 'Running directly in browser mode with Web Speech API';
    }
}

// --- Speech Recognition Setup ---
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showToast('Web Speech API not supported in this browser. Please use Chrome, Edge, or Safari.', 'error');
        elements.liveStatusText.textContent = 'Speech API Unsupported';
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = state.currentLanguage;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        state.isRecording = true;
        document.body.classList.add('is-recording');
        elements.liveStatusText.textContent = `Listening in ${getLanguageObj(state.currentLanguage).name}...`;
        elements.interimStream.classList.add('active-speech');
        startTimer();
        startVisualizerMic();
    };

    recognition.onresult = (event) => {
        let interimText = '';
        let finalizedText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalizedText += transcript;
            } else {
                interimText += transcript;
            }
        }

        // Display interim preview in real-time stream box
        if (interimText.trim()) {
            elements.interimStream.innerHTML = `<span class="interim-active">“${interimText.trim()}”</span>`;
        } else if (!finalizedText) {
            elements.interimStream.innerHTML = `<span class="interim-placeholder">Listening for speech...</span>`;
        }

        // Commit finalized transcript to editor
        if (finalizedText.trim()) {
            commitSpeechToEditor(finalizedText.trim());
        }
    };

    recognition.onerror = (event) => {
        console.warn('[PolyVox] Recognition error:', event.error);
        if (event.error === 'not-allowed') {
            stopRecording();
            showToast('Microphone access was denied. Please allow microphone permissions in browser settings.', 'error');
            elements.liveStatusText.textContent = 'Mic Permission Denied';
        } else if (event.error === 'no-speech') {
            // Handled gracefully in onend
        }
    };

    recognition.onend = () => {
        // If user intended continuous dictation, restart automatically
        if (state.isRecording && elements.toggleContinuous.checked) {
            try {
                recognition.start();
            } catch {
                // If restarting too fast, stop gracefully
            }
        } else if (state.isRecording) {
            stopRecording();
        }
    };

    state.recognition = recognition;
}

// --- Mic Toggle Action ---
function toggleRecording() {
    if (!state.recognition) {
        showToast('Speech Recognition not supported in this browser.', 'error');
        return;
    }

    if (!state.isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
}

function startRecording() {
    try {
        state.recognition.lang = state.currentLanguage;
        state.recognition.start();
    } catch (e) {
        console.error('Recognition start error:', e);
    }
}

function stopRecording() {
    state.isRecording = false;
    document.body.classList.remove('is-recording');
    elements.liveStatusText.textContent = 'Microphone Paused';
    elements.interimStream.classList.remove('active-speech');
    elements.interimStream.innerHTML = `<span class="interim-placeholder">Spoken words in ${getLanguageObj(state.currentLanguage).name} will stream here in real-time...</span>`;
    stopTimer();
    stopVisualizerMic();
    if (state.recognition) {
        try {
            state.recognition.stop();
        } catch { }
    }
}

// --- Text Processing & Commit to Editor ---
function commitSpeechToEditor(rawText) {
    let processed = rawText;

    // Smart Punctuation Command Replacements
    if (elements.togglePunctuation.checked) {
        processed = applyPunctuationCommands(processed);
    }

    // Auto-Capitalize First Letter
    if (elements.toggleAutocap.checked) {
        processed = processed.charAt(0).toUpperCase() + processed.slice(1);
    }

    // Add Timestamps
    if (elements.toggleTimestamps.checked) {
        const timeStamp = `[${getCurrentTimeString()}] `;
        processed = '\n' + timeStamp + processed;
    }

    // Append to textarea
    const currentVal = elements.editor.value;
    const separator = (currentVal.length === 0 || currentVal.endsWith('\n') || processed.startsWith('\n')) ? '' : ' ';
    const newVal = currentVal + separator + processed;

    updateEditorContent(newVal);

    // Scroll to bottom of editor
    elements.editor.scrollTop = elements.editor.scrollHeight;
}

function applyPunctuationCommands(text) {
    let t = text;
    // Common English & universal punctuation commands
    t = t.replace(/\b(period|full stop)\b/gi, '.');
    t = t.replace(/\b(comma)\b/gi, ',');
    t = t.replace(/\b(question mark)\b/gi, '?');
    t = t.replace(/\b(exclamation mark|exclamation point)\b/gi, '!');
    t = t.replace(/\b(new line|newline|enter)\b/gi, '\n');
    t = t.replace(/\b(new paragraph)\b/gi, '\n\n');
    t = t.replace(/\b(colon)\b/gi, ':');
    t = t.replace(/\b(semi colon|semicolon)\b/gi, ';');
    t = t.replace(/\b(hyphen|dash)\b/gi, '-');
    t = t.replace(/\b(open quote|quote)\b/gi, '"');
    t = t.replace(/\b(close quote)\b/gi, '"');
    return t;
}

function getCurrentTimeString() {
    const now = new Date();
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${mm}:${ss}`;
}

// --- Timer & Analytics ---
function startTimer() {
    state.startTime = Date.now();
    clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
        const elapsedSec = Math.floor((Date.now() - state.startTime) / 1000);
        const mins = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
        const secs = String(elapsedSec % 60).padStart(2, '0');
        elements.recordingTimer.textContent = `${mins}:${secs}`;
        updateMetrics();
    }, 1000);
}

function stopTimer() {
    clearInterval(state.timerInterval);
    updateMetrics();
}

function updateMetrics() {
    const text = elements.editor.value.trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;

    elements.metricWords.textContent = words.toLocaleString();
    elements.metricChars.textContent = chars.toLocaleString();

    // Reading time (approx 200 words per minute)
    const readMinutes = Math.ceil(words / 200);
    elements.metricReadtime.textContent = `${readMinutes}m`;

    // Calculate WPM if currently recording
    if (state.isRecording && state.startTime) {
        const elapsedMinutes = (Date.now() - state.startTime) / 60000;
        if (elapsedMinutes > 0.1) {
            const wpm = Math.round(words / elapsedMinutes);
            elements.metricWpm.textContent = wpm > 300 ? 150 : wpm;
        }
    } else if (!state.isRecording) {
        elements.metricWpm.textContent = words > 0 ? '120' : '0';
    }
}

// --- Canvas Sound Wave Visualizer ---
function initVisualizerCanvas() {
    const canvas = elements.canvas;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Draw idle ambient sinusoidal wave
    let phase = 0;
    function renderIdle() {
        if (state.isRecording) return; // Mic visualizer takes over
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const width = canvas.width;
        const height = canvas.height;
        const centerY = height / 2;

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';

        for (let x = 0; x < width; x++) {
            const y = centerY + Math.sin(x * 0.015 + phase) * 8 * Math.sin(x / width * Math.PI);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        phase += 0.03;
        requestAnimationFrame(renderIdle);
    }
    renderIdle();
}

async function startVisualizerMic() {
    try {
        if (!state.audioContext) {
            state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (state.audioContext.state === 'suspended') {
            await state.audioContext.resume();
        }

        if (!state.audioStream) {
            state.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }

        const source = state.audioContext.createMediaStreamSource(state.audioStream);
        state.analyser = state.audioContext.createAnalyser();
        state.analyser.fftSize = 256;
        source.connect(state.analyser);

        const canvas = elements.canvas;
        const ctx = canvas.getContext('2d');
        const bufferLength = state.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function drawLive() {
            if (!state.isRecording) return;
            state.visualizerAnimationId = requestAnimationFrame(drawLive);

            state.analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const width = canvas.width;
            const height = canvas.height;
            const barWidth = (width / bufferLength) * 2.2;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * (height * 0.75);

                // Dynamic gradient depending on amplitude
                const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
                gradient.addColorStop(0, '#6366f1');
                gradient.addColorStop(0.5, '#06b6d4');
                gradient.addColorStop(1, '#ef4444');

                ctx.fillStyle = gradient;
                // Mirrored wave from center
                const topY = (height / 2) - (barHeight / 2);
                ctx.fillRect(x, topY, barWidth - 1, barHeight);

                x += barWidth;
            }
        }
        drawLive();
    } catch (err) {
        console.warn('Audio visualizer mic setup:', err);
    }
}

function stopVisualizerMic() {
    if (state.visualizerAnimationId) {
        cancelAnimationFrame(state.visualizerAnimationId);
        state.visualizerAnimationId = null;
    }
}

// --- Editor Management & History Stack ---
function updateEditorContent(newVal, saveToHistory = true) {
    elements.editor.value = newVal;
    updateMetrics();

    if (saveToHistory) {
        if (state.historyIndex < state.history.length - 1) {
            state.history = state.history.slice(0, state.historyIndex + 1);
        }
        state.history.push(newVal);
        if (state.history.length > state.maxHistory) {
            state.history.shift();
        } else {
            state.historyIndex++;
        }
    }

    // Auto-save to LocalStorage
    localStorage.setItem('polyvox_transcript', newVal);
    showSaveIndicator();
}

function showSaveIndicator() {
    elements.saveStatus.textContent = 'Saved Locally';
    elements.saveStatus.style.opacity = '1';
}

function loadSavedContent() {
    const saved = localStorage.getItem('polyvox_transcript');
    if (saved) {
        updateEditorContent(saved, true);
    } else {
        state.history.push('');
        state.historyIndex = 0;
    }
}

function undo() {
    if (state.historyIndex > 0) {
        state.historyIndex--;
        elements.editor.value = state.history[state.historyIndex];
        updateMetrics();
        showToast('Undo', 'info');
    }
}

function redo() {
    if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        elements.editor.value = state.history[state.historyIndex];
        updateMetrics();
        showToast('Redo', 'info');
    }
}

function capitalizeSentences() {
    const text = elements.editor.value;
    if (!text.trim()) return;

    const capitalized = text.replace(/(^\s*|[.!?]\s+)([a-z\u00E0-\u00FC])/g, (match, prefix, char) => {
        return prefix + char.toUpperCase();
    });

    updateEditorContent(capitalized);
    showToast('Sentences capitalized', 'success');
}

function insertTimestamp() {
    const marker = ` [${getCurrentTimeString()}] `;
    const start = elements.editor.selectionStart;
    const end = elements.editor.selectionEnd;
    const text = elements.editor.value;
    const newVal = text.substring(0, start) + marker + text.substring(end);
    updateEditorContent(newVal);
    elements.editor.focus();
    elements.editor.setSelectionRange(start + marker.length, start + marker.length);
}

// --- Find & Replace ---
let findIndices = [];
let currentFindIdx = -1;

function findNext() {
    const query = elements.findInput.value;
    if (!query) return;

    const text = elements.editor.value;
    const index = text.toLowerCase().indexOf(query.toLowerCase(), elements.editor.selectionEnd);

    if (index !== -1) {
        elements.editor.focus();
        elements.editor.setSelectionRange(index, index + query.length);
    } else {
        // Wrap to top
        const wrapIndex = text.toLowerCase().indexOf(query.toLowerCase(), 0);
        if (wrapIndex !== -1) {
            elements.editor.focus();
            elements.editor.setSelectionRange(wrapIndex, wrapIndex + query.length);
        } else {
            showToast('Text not found', 'info');
        }
    }
}

function replaceOne() {
    const query = elements.findInput.value;
    const replaceWith = elements.replaceInput.value;
    if (!query) return;

    const start = elements.editor.selectionStart;
    const end = elements.editor.selectionEnd;
    const selectedText = elements.editor.value.substring(start, end);

    if (selectedText.toLowerCase() === query.toLowerCase()) {
        const text = elements.editor.value;
        const newVal = text.substring(0, start) + replaceWith + text.substring(end);
        updateEditorContent(newVal);
        findNext();
    } else {
        findNext();
    }
}

function replaceAll() {
    const query = elements.findInput.value;
    const replaceWith = elements.replaceInput.value;
    if (!query) return;

    const regex = new RegExp(escapeRegExp(query), 'gi');
    const text = elements.editor.value;
    const count = (text.match(regex) || []).length;
    const newVal = text.replace(regex, replaceWith);

    updateEditorContent(newVal);
    showToast(`Replaced ${count} occurrence(s)`, 'success');
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// --- Text-to-Speech (Listen Back) ---
function toggleTTS() {
    if (!('speechSynthesis' in window)) {
        showToast('Text-to-Speech not supported in this browser', 'error');
        return;
    }

    if (state.ttsPlaying) {
        window.speechSynthesis.cancel();
        state.ttsPlaying = false;
        elements.ttsLabel.textContent = 'Listen';
        showToast('Speech playback stopped', 'info');
    } else {
        const text = elements.editor.value.trim();
        if (!text) {
            showToast('No text in editor to read aloud', 'info');
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = state.currentLanguage;
        utterance.rate = 1.0;

        utterance.onend = () => {
            state.ttsPlaying = false;
            elements.ttsLabel.textContent = 'Listen';
        };

        utterance.onerror = () => {
            state.ttsPlaying = false;
            elements.ttsLabel.textContent = 'Listen';
        };

        window.speechSynthesis.speak(utterance);
        state.ttsPlaying = true;
        elements.ttsLabel.textContent = 'Stop';
        showToast(`Reading in ${getLanguageObj(state.currentLanguage).name}...`, 'info');
    }
}

// --- Translation Modal & Actions ---
function openTranslateModal() {
    const text = elements.editor.value.trim();
    if (!text) {
        showToast('Please dictate or enter some text first to translate', 'info');
        return;
    }

    // Set source language match
    const langObj = getLanguageObj(state.currentLanguage);
    const shortCode = state.currentLanguage.split('-')[0];
    if (elements.transSourceLang.querySelector(`option[value="${shortCode}"]`)) {
        elements.transSourceLang.value = shortCode;
    } else {
        elements.transSourceLang.value = 'auto';
    }

    elements.transResultText.textContent = 'Ready. Click "Translate Now" to translate the document.';
    elements.translateModal.classList.remove('hidden');
}

async function executeTranslation() {
    const text = elements.editor.value.trim();
    if (!text) return;

    const source = elements.transSourceLang.value;
    const target = elements.transTargetLang.value;

    elements.transSpinner.classList.remove('hidden');
    elements.transExecuteBtn.disabled = true;
    elements.transResultText.textContent = 'Translating... Please wait...';

    try {
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, source, target })
        });

        const data = await response.json();
        if (data.success && data.translated_text) {
            elements.transResultText.textContent = data.translated_text;
            showToast('Translation completed successfully!', 'success');
        } else {
            throw new Error(data.error || 'Translation failed');
        }
    } catch (err) {
        elements.transResultText.textContent = `Translation Error: ${err.message}. Please check connection.`;
        showToast('Translation error occurred', 'error');
    } finally {
        elements.transSpinner.classList.add('hidden');
        elements.transExecuteBtn.disabled = false;
    }
}

function copyTranslatedText() {
    const text = elements.transResultText.textContent;
    if (!text || text.startsWith('Ready') || text.startsWith('Translating')) return;
    navigator.clipboard.writeText(text).then(() => {
        showToast('Translated text copied to clipboard!', 'success');
    });
}

function replaceEditorWithTranslation() {
    const text = elements.transResultText.textContent;
    if (!text || text.startsWith('Ready') || text.startsWith('Translating')) return;
    updateEditorContent(text);
    elements.translateModal.classList.add('hidden');
    showToast('Editor updated with translated text!', 'success');
}

// --- Exporters ---
function exportAsTxt() {
    const text = elements.editor.value;
    if (!text.trim()) {
        showToast('Transcript is empty', 'info');
        return;
    }
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, `PolyVox_Transcript_${getDateStamp()}.txt`);
    showToast('Downloaded Plain Text (.txt)', 'success');
}

function exportAsDoc() {
    const text = elements.editor.value;
    if (!text.trim()) {
        showToast('Transcript is empty', 'info');
        return;
    }
    const htmlDoc = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Transcript</title></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; padding: 40px;">
            <h1 style="color: #4f46e5;">PolyVox Studio Transcript</h1>
            <p style="color: #64748b; font-size: 10pt;">Language: ${getLanguageObj(state.currentLanguage).name} | Date: ${new Date().toLocaleString()}</p>
            <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 20px 0;">
            <div style="font-size: 11pt; white-space: pre-wrap;">${escapeHtml(text)}</div>
        </body>
        </html>
    `;
    const blob = new Blob(['\ufeff', htmlDoc], { type: 'application/msword;charset=utf-8' });
    downloadBlob(blob, `PolyVox_Transcript_${getDateStamp()}.doc`);
    showToast('Downloaded Word Document (.doc)', 'success');
}

function exportAsSrt() {
    const text = elements.editor.value;
    if (!text.trim()) {
        showToast('Transcript is empty', 'info');
        return;
    }

    // Generate subtitle cues (5 seconds per sentence or split by line)
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    let srtContent = '';
    let currentTimeSec = 1;

    lines.forEach((line, index) => {
        const durationSec = Math.max(3, Math.min(8, Math.round(line.split(' ').length * 0.4)));
        const startTimeStr = formatSrtTime(currentTimeSec);
        const endTimeStr = formatSrtTime(currentTimeSec + durationSec);

        srtContent += `${index + 1}\n`;
        srtContent += `${startTimeStr} --> ${endTimeStr}\n`;
        srtContent += `${line.trim()}\n\n`;

        currentTimeSec += durationSec + 1;
    });

    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, `PolyVox_Subtitles_${getDateStamp()}.srt`);
    showToast('Downloaded Subtitles (.srt)', 'success');
}

function exportAsJson() {
    const text = elements.editor.value;
    const data = {
        app: "PolyVox Studio",
        version: "1.0",
        exportDate: new Date().toISOString(),
        language: getLanguageObj(state.currentLanguage),
        metrics: {
            wordCount: text ? text.split(/\s+/).filter(Boolean).length : 0,
            charCount: text.length
        },
        transcript: text
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `PolyVox_Data_${getDateStamp()}.json`);
    showToast('Downloaded JSON (.json)', 'success');
}

function formatSrtTime(seconds) {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s},000`;
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function getDateStamp() {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// --- Audio File Upload & Backend Transcription ---
function handleAudioFileSelect(file) {
    if (!file) return;
    state.selectedAudioFile = file;

    elements.fileNameLabel.textContent = file.name;
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    elements.fileSizeLabel.textContent = `${sizeMb} MB • Ready for AI Transcription`;

    const fileUrl = URL.createObjectURL(file);
    elements.audioPreviewPlayer.src = fileUrl;

    elements.fileDropzone.classList.add('hidden');
    elements.filePreviewCard.classList.remove('hidden');
}

function removeAudioFile() {
    state.selectedAudioFile = null;
    elements.audioPreviewPlayer.src = '';
    elements.audioFileInput.value = '';
    elements.filePreviewCard.classList.add('hidden');
    elements.fileDropzone.classList.remove('hidden');
    elements.fileProgressContainer.classList.add('hidden');
}

async function transcribeUploadedFile() {
    if (!state.selectedAudioFile) {
        showToast('Please select an audio file first', 'info');
        return;
    }

    const file = state.selectedAudioFile;
    const lang = state.currentLanguage;

    elements.transcribeSpinner.classList.remove('hidden');
    elements.transcribeActionBtn.disabled = true;
    elements.fileProgressContainer.classList.remove('hidden');
    elements.fileProgressStatus.textContent = `Uploading & Analyzing in ${getLanguageObj(lang).name}...`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', lang);

    try {
        const response = await fetch('/api/transcribe-file', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (data.success && data.text) {
            const currentVal = elements.editor.value;
            const separator = (currentVal.length === 0 || currentVal.endsWith('\n')) ? '' : '\n\n';
            const appendText = `[File: ${file.name} | ${getLanguageObj(lang).name}]\n${data.text}`;
            updateEditorContent(currentVal + separator + appendText);

            showToast(`Transcription complete (${data.duration || '0'}s audio processed)!`, 'success');
            elements.fileProgressStatus.textContent = 'Transcription Completed Successfully!';
        } else {
            throw new Error(data.error || 'Server could not recognize speech');
        }
    } catch (err) {
        console.error('File transcribe error:', err);
        showToast(err.message, 'error');
        elements.fileProgressStatus.textContent = `Error: ${err.message}`;
    } finally {
        elements.transcribeSpinner.classList.add('hidden');
        elements.transcribeActionBtn.disabled = false;
    }
}

// --- Language Modal & Catalog ---
function initLanguageCatalog() {
    renderLanguageGrid(LANGUAGES);
    updateActiveLanguageDisplay(state.currentLanguage);
}

function getLanguageObj(code) {
    return LANGUAGES.find(l => l.code === code) || LANGUAGES[0];
}

function updateActiveLanguageDisplay(code) {
    state.currentLanguage = code;
    const lang = getLanguageObj(code);

    elements.activeFlag.textContent = lang.flag;
    elements.activeName.textContent = lang.name.split(' (')[0];
    elements.activeCode.textContent = lang.code;
    elements.currentLangHint.textContent = lang.name.split(' (')[0];
    elements.fileLangName.textContent = lang.name.split(' (')[0];

    // Update quick chips active state
    document.querySelectorAll('.quick-chip').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.code === code);
    });

    // Update speech recognition language if active
    if (state.recognition) {
        state.recognition.lang = code;
    }
}

function renderLanguageGrid(list) {
    elements.langGridContainer.innerHTML = '';
    list.forEach(lang => {
        const card = document.createElement('div');
        card.className = `lang-card ${lang.code === state.currentLanguage ? 'selected' : ''}`;
        card.innerHTML = `
            <div class="lang-card-flag">${lang.flag}</div>
            <div class="lang-card-info">
                <div class="lang-card-name">${lang.name}</div>
                <div class="lang-card-native">${lang.native}</div>
            </div>
            <div class="lang-card-code">${lang.code}</div>
        `;
        card.addEventListener('click', () => {
            updateActiveLanguageDisplay(lang.code);
            elements.langModal.classList.add('hidden');
            showToast(`Dictation language set to ${lang.name}`, 'success');
        });
        elements.langGridContainer.appendChild(card);
    });
}

function filterLanguages() {
    const query = elements.langSearchInput.value.toLowerCase().trim();
    const activeGroupBtn = elements.langGroupTabs.querySelector('.group-tab.active');
    const group = activeGroupBtn ? activeGroupBtn.dataset.group : 'All';

    elements.clearSearchBtn.classList.toggle('hidden', query.length === 0);

    const filtered = LANGUAGES.filter(l => {
        const matchesGroup = group === 'All' || l.group === group;
        const matchesQuery = !query ||
            l.name.toLowerCase().includes(query) ||
            l.native.toLowerCase().includes(query) ||
            l.code.toLowerCase().includes(query);
        return matchesGroup && matchesQuery;
    });

    renderLanguageGrid(filtered);
}

// --- Toast Notifications ---
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 250);
    }, 3200);
}

// --- Event Listeners Binding ---
function bindEventListeners() {
    // Mode Switching (Live Dictation vs File Upload)
    elements.tabLive.addEventListener('click', () => {
        elements.tabLive.classList.add('active');
        elements.tabLive.setAttribute('aria-selected', 'true');
        elements.tabFile.classList.remove('active');
        elements.tabFile.setAttribute('aria-selected', 'false');
        elements.viewLive.classList.remove('hidden');
        elements.viewFile.classList.add('hidden');
    });

    elements.tabFile.addEventListener('click', () => {
        elements.tabFile.classList.add('active');
        elements.tabFile.setAttribute('aria-selected', 'true');
        elements.tabLive.classList.remove('active');
        elements.tabLive.setAttribute('aria-selected', 'false');
        elements.viewFile.classList.remove('hidden');
        elements.viewLive.classList.add('hidden');
    });

    // Theme & Help Modals
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.helpToggle.addEventListener('click', () => elements.helpModal.classList.remove('hidden'));
    elements.closeHelpModal.addEventListener('click', () => elements.helpModal.classList.add('hidden'));

    // Mic Button
    elements.micBtn.addEventListener('click', toggleRecording);

    // Language Quick Pills
    elements.quickLangPills.addEventListener('click', (e) => {
        const chip = e.target.closest('.quick-chip');
        if (!chip) return;
        if (chip.id === 'browse-all-langs-btn') {
            elements.langModal.classList.remove('hidden');
            return;
        }
        const code = chip.dataset.code;
        if (code) {
            updateActiveLanguageDisplay(code);
            showToast(`Switched to ${getLanguageObj(code).name}`, 'success');
        }
    });

    elements.openLangModal.addEventListener('click', () => elements.langModal.classList.remove('hidden'));
    elements.closeLangModal.addEventListener('click', () => elements.langModal.classList.add('hidden'));

    // Language Search & Group Tabs
    elements.langSearchInput.addEventListener('input', filterLanguages);
    elements.clearSearchBtn.addEventListener('click', () => {
        elements.langSearchInput.value = '';
        filterLanguages();
    });

    elements.langGroupTabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.group-tab');
        if (!tab) return;
        elements.langGroupTabs.querySelectorAll('.group-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        filterLanguages();
    });

    // File Drag and Drop
    elements.fileDropzone.addEventListener('click', () => elements.audioFileInput.click());
    elements.browseFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        elements.audioFileInput.click();
    });

    elements.audioFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleAudioFileSelect(e.target.files[0]);
        }
    });

    elements.fileDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.fileDropzone.classList.add('drag-active');
    });

    elements.fileDropzone.addEventListener('dragleave', () => {
        elements.fileDropzone.classList.remove('drag-active');
    });

    elements.fileDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.fileDropzone.classList.remove('drag-active');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleAudioFileSelect(e.dataTransfer.files[0]);
        }
    });

    elements.removeFileBtn.addEventListener('click', removeAudioFile);
    elements.transcribeFileBtn.addEventListener('click', transcribeUploadedFile);

    // Toolbar Buttons
    elements.toolUndo.addEventListener('click', undo);
    elements.toolRedo.addEventListener('click', redo);
    elements.toolCapitalize.addEventListener('click', capitalizeSentences);
    elements.toolTimestamp.addEventListener('click', insertTimestamp);
    elements.toolFindToggle.addEventListener('click', () => {
        elements.findReplaceDrawer.classList.toggle('hidden');
        if (!elements.findReplaceDrawer.classList.contains('hidden')) {
            elements.findInput.focus();
        }
    });

    elements.btnCloseFind.addEventListener('click', () => elements.findReplaceDrawer.classList.add('hidden'));
    elements.btnFindNext.addEventListener('click', findNext);
    elements.btnReplaceOne.addEventListener('click', replaceOne);
    elements.btnReplaceAll.addEventListener('click', replaceAll);

    elements.toolTts.addEventListener('click', toggleTTS);
    elements.toolTranslate.addEventListener('click', openTranslateModal);

    elements.toolCopy.addEventListener('click', () => {
        const text = elements.editor.value;
        if (!text) {
            showToast('No transcript to copy', 'info');
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            elements.toolCopy.querySelector('.copy-icon').classList.add('hidden');
            elements.toolCopy.querySelector('.check-icon').classList.remove('hidden');
            elements.copyBtnText.textContent = 'Copied!';
            showToast('Transcript copied to clipboard!', 'success');
            setTimeout(() => {
                elements.toolCopy.querySelector('.copy-icon').classList.remove('hidden');
                elements.toolCopy.querySelector('.check-icon').classList.add('hidden');
                elements.copyBtnText.textContent = 'Copy';
            }, 2000);
        });
    });

    elements.toolClear.addEventListener('click', () => {
        if (!elements.editor.value.trim()) return;
        if (confirm('Are you sure you want to clear the transcript?')) {
            updateEditorContent('');
            showToast('Transcript cleared', 'info');
        }
    });

    // Exporters
    elements.exportTxt.addEventListener('click', exportAsTxt);
    elements.exportDoc.addEventListener('click', exportAsDoc);
    elements.exportSrt.addEventListener('click', exportAsSrt);
    elements.exportJson.addEventListener('click', exportAsJson);
    elements.exportPrint.addEventListener('click', () => window.print());

    // Translation Modal Actions
    elements.closeTranslateModal.addEventListener('click', () => elements.translateModal.classList.add('hidden'));
    elements.transExecuteBtn.addEventListener('click', executeTranslation);
    elements.transCopyBtn.addEventListener('click', copyTranslatedText);
    elements.transReplaceEditorBtn.addEventListener('click', replaceEditorWithTranslation);

    // Modal Background Clicks
    [elements.langModal, elements.translateModal, elements.helpModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // Space to toggle mic when not typing in textarea or input
        if (e.code === 'Space' && document.activeElement !== elements.editor && !['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
            e.preventDefault();
            toggleRecording();
        }
        // Alt + M to toggle mic anytime
        if (e.altKey && (e.key === 'm' || e.key === 'M')) {
            e.preventDefault();
            toggleRecording();
        }
        // Ctrl + S to Quick Export as TXT
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            exportAsTxt();
        }
        // Ctrl + F to open find drawer
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            elements.findReplaceDrawer.classList.toggle('hidden');
            if (!elements.findReplaceDrawer.classList.contains('hidden')) {
                elements.findInput.focus();
            }
        }
        // Escape closes modals
        if (e.key === 'Escape') {
            elements.langModal.classList.add('hidden');
            elements.translateModal.classList.add('hidden');
            elements.helpModal.classList.add('hidden');
            elements.findReplaceDrawer.classList.add('hidden');
        }
    });
}

function initEditorEvents() {
    let debounceTimer;
    elements.editor.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            updateMetrics();
            localStorage.setItem('polyvox_transcript', elements.editor.value);
            showSaveIndicator();
        }, 300);
    });
}
