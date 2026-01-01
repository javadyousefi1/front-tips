# Web Speech API - Speech Recognition

A comprehensive guide to the Web Speech API with 6 practical examples demonstrating how to convert speech to text in real-time.

## What is Web Speech API?

The **Web Speech API** enables web applications to incorporate voice data into web apps. The Speech Recognition interface provides the ability to recognize voice context from audio input and transcribe it to text.

## Key Concepts

### 1. Creating Recognition Instance

Create a speech recognition object to start listening.

```javascript
const recognition = new webkitSpeechRecognition();
// or
const recognition = new SpeechRecognition();
```

### 2. Configuration

Configure recognition behavior with properties.

```javascript
recognition.continuous = true;      // Keep listening
recognition.interimResults = true;  // Show partial results
recognition.lang = 'en-US';         // Language
recognition.maxAlternatives = 5;    // Number of alternatives
```

### 3. Starting Recognition

Start listening to user's voice.

```javascript
recognition.start();
```

### 4. Handling Results

Process transcribed text from speech.

```javascript
recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log('You said:', transcript);
};
```

### 5. Stopping Recognition

Stop listening when done.

```javascript
recognition.stop();
```

## Why Use Web Speech API?

### The Problem Without It

**Before Web Speech API**, adding voice input required:
- Third-party services (Google Cloud Speech, AWS Transcribe)
- Complex API integrations
- Server-side processing
- Costly subscriptions
- Network latency
- Privacy concerns (audio sent to servers)

### The Solution With Web Speech API

```javascript
// Simple and powerful!
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log('Transcribed:', transcript);
};

recognition.start();
```

**Benefits:**
- ✅ Built into the browser
- ✅ No server required
- ✅ Works offline (in some browsers)
- ✅ Real-time transcription
- ✅ Multiple languages supported
- ✅ Free to use
- ✅ Privacy-friendly (processing happens locally)

## Demos Included

### 1. Basic Speech Recognition

Simple voice-to-text conversion with start/stop controls.

**Use Case**: Quick voice input for search boxes or forms.

```javascript
const recognition = new webkitSpeechRecognition();
recognition.continuous = false;
recognition.lang = 'en-US';

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById('output').textContent = transcript;
};

recognition.start();
```

### 2. Continuous Recognition with Interim Results

Real-time transcription showing both final and interim results.

**Use Case**: Live captioning, real-time transcription.

```javascript
let finalTranscript = '';

recognition.continuous = true;
recognition.interimResults = true;

recognition.onresult = (event) => {
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
        } else {
            interimTranscript += transcript;
        }
    }

    // Display both
    document.getElementById('final').textContent = finalTranscript;
    document.getElementById('interim').textContent = interimTranscript;
};
```

### 3. Multi-Language Support

Recognize speech in different languages.

**Use Case**: Multilingual applications, language learning apps.

```javascript
const languages = {
    'en-US': 'English (US)',
    'es-ES': 'Spanish',
    'fr-FR': 'French',
    'de-DE': 'German',
    'ja-JP': 'Japanese'
};

// Change language dynamically
function setLanguage(langCode) {
    recognition.lang = langCode;
    recognition.start();
}

// Use it
setLanguage('es-ES'); // Spanish
setLanguage('ja-JP'); // Japanese
```

### 4. Voice Commands

Control your application with voice commands.

**Use Case**: Hands-free controls, accessibility features.

```javascript
recognition.continuous = true;

recognition.onresult = (event) => {
    const command = event.results[event.results.length - 1][0].transcript.toLowerCase();

    // Process commands
    if (command.includes('red')) {
        element.style.backgroundColor = 'red';
    } else if (command.includes('bigger')) {
        element.style.transform = 'scale(1.5)';
    } else if (command.includes('rotate')) {
        element.style.transform = 'rotate(45deg)';
    } else if (command.includes('reset')) {
        element.style = '';
    }
};
```

### 5. Voice Notes Application

Take notes using your voice with save/export functionality.

**Use Case**: Dictation, note-taking apps, productivity tools.

```javascript
let noteContent = '';
const textarea = document.getElementById('note');

recognition.continuous = true;
recognition.interimResults = true;

recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
            noteContent += event.results[i][0].transcript + ' ';
            textarea.value = noteContent;
        }
    }
};

// Save note
function saveNote() {
    const blob = new Blob([noteContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'note.txt';
    a.click();
}
```

### 6. Confidence Scores & Alternatives

View confidence scores and alternative transcriptions.

**Use Case**: Quality assurance, accuracy monitoring.

```javascript
recognition.maxAlternatives = 5;

recognition.onresult = (event) => {
    const result = event.results[0];

    // Best result
    const transcript = result[0].transcript;
    const confidence = result[0].confidence;

    console.log(`Best: ${transcript} (${(confidence * 100).toFixed(1)}%)`);

    // All alternatives
    for (let i = 0; i < result.length; i++) {
        console.log(`Alt ${i}: ${result[i].transcript} (${(result[i].confidence * 100).toFixed(1)}%)`);
    }
};
```

## Real-World Use Cases

### 1. Voice Search

```javascript
const searchRecognition = new webkitSpeechRecognition();
searchRecognition.continuous = false;

function voiceSearch() {
    searchRecognition.onresult = (event) => {
        const query = event.results[0][0].transcript;
        // Perform search
        window.location.href = `/search?q=${encodeURIComponent(query)}`;
    };

    searchRecognition.start();
}
```

### 2. Accessibility - Voice Navigation

```javascript
const navRecognition = new webkitSpeechRecognition();
navRecognition.continuous = true;

navRecognition.onresult = (event) => {
    const command = event.results[event.results.length - 1][0].transcript.toLowerCase();

    const routes = {
        'home': '/',
        'about': '/about',
        'contact': '/contact',
        'settings': '/settings'
    };

    for (const [keyword, route] of Object.entries(routes)) {
        if (command.includes(keyword)) {
            window.location.href = route;
            break;
        }
    }
};
```

### 3. Voice-Controlled Forms

```javascript
class VoiceForm {
    constructor(formElement) {
        this.form = formElement;
        this.recognition = new webkitSpeechRecognition();
        this.recognition.continuous = true;
        this.currentField = null;
    }

    startField(fieldName) {
        this.currentField = this.form.querySelector(`[name="${fieldName}"]`);

        this.recognition.onresult = (event) => {
            const text = event.results[event.results.length - 1][0].transcript;

            if (this.currentField) {
                this.currentField.value = text;
            }
        };

        this.recognition.start();
    }

    stop() {
        this.recognition.stop();
    }
}

// Usage
const voiceForm = new VoiceForm(document.getElementById('myForm'));
voiceForm.startField('name');
```

### 4. Live Captioning

```javascript
class LiveCaptioning {
    constructor(outputElement) {
        this.output = outputElement;
        this.recognition = new webkitSpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.finalTranscript = '';

        this.recognition.onresult = (event) => {
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    this.finalTranscript += transcript + ' ';
                    this.addCaption(transcript, true);
                } else {
                    interimTranscript += transcript;
                }
            }

            this.updateInterim(interimTranscript);
        };
    }

    addCaption(text, isFinal) {
        const caption = document.createElement('p');
        caption.textContent = text;
        caption.className = isFinal ? 'final-caption' : 'interim-caption';
        this.output.appendChild(caption);
    }

    updateInterim(text) {
        let interim = this.output.querySelector('.interim-caption');
        if (!interim) {
            interim = document.createElement('p');
            interim.className = 'interim-caption';
            this.output.appendChild(interim);
        }
        interim.textContent = text;
    }

    start() {
        this.recognition.start();
    }

    stop() {
        this.recognition.stop();
    }
}
```

### 5. Voice-Controlled Music Player

```javascript
class VoiceMusicPlayer {
    constructor(audioElement) {
        this.audio = audioElement;
        this.recognition = new webkitSpeechRecognition();
        this.recognition.continuous = true;

        this.recognition.onresult = (event) => {
            const command = event.results[event.results.length - 1][0].transcript.toLowerCase();

            if (command.includes('play')) {
                this.audio.play();
            } else if (command.includes('pause') || command.includes('stop')) {
                this.audio.pause();
            } else if (command.includes('louder') || command.includes('volume up')) {
                this.audio.volume = Math.min(1, this.audio.volume + 0.1);
            } else if (command.includes('quieter') || command.includes('volume down')) {
                this.audio.volume = Math.max(0, this.audio.volume - 0.1);
            } else if (command.includes('mute')) {
                this.audio.muted = true;
            } else if (command.includes('unmute')) {
                this.audio.muted = false;
            }
        };
    }

    activate() {
        this.recognition.start();
    }

    deactivate() {
        this.recognition.stop();
    }
}
```

### 6. Language Learning App

```javascript
class PronunciationChecker {
    constructor(targetPhrase, targetLang) {
        this.targetPhrase = targetPhrase.toLowerCase();
        this.recognition = new webkitSpeechRecognition();
        this.recognition.lang = targetLang;
        this.recognition.maxAlternatives = 3;
    }

    check(callback) {
        this.recognition.onresult = (event) => {
            const result = event.results[0][0];
            const transcript = result.transcript.toLowerCase();
            const confidence = result.confidence;

            // Calculate similarity
            const similarity = this.calculateSimilarity(this.targetPhrase, transcript);

            callback({
                spoken: transcript,
                target: this.targetPhrase,
                confidence: confidence,
                similarity: similarity,
                score: (confidence * 0.5 + similarity * 0.5) * 100
            });
        };

        this.recognition.start();
    }

    calculateSimilarity(str1, str2) {
        // Simple Levenshtein distance implementation
        const len1 = str1.length;
        const len2 = str2.length;
        const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));

        for (let i = 0; i <= len1; i++) matrix[i][0] = i;
        for (let j = 0; j <= len2; j++) matrix[0][j] = j;

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }

        const distance = matrix[len1][len2];
        const maxLen = Math.max(len1, len2);
        return 1 - (distance / maxLen);
    }
}

// Usage
const checker = new PronunciationChecker('Bonjour, comment allez-vous?', 'fr-FR');
checker.check((result) => {
    console.log(`Score: ${result.score.toFixed(1)}%`);
    console.log(`You said: ${result.spoken}`);
    console.log(`Target: ${result.target}`);
});
```

## Advanced Patterns

### Command Pattern with Fuzzy Matching

```javascript
class VoiceCommandSystem {
    constructor() {
        this.recognition = new webkitSpeechRecognition();
        this.recognition.continuous = true;
        this.commands = new Map();

        this.recognition.onresult = (event) => {
            const text = event.results[event.results.length - 1][0].transcript.toLowerCase();
            this.processCommand(text);
        };
    }

    addCommand(pattern, callback) {
        this.commands.set(pattern, callback);
    }

    processCommand(text) {
        for (const [pattern, callback] of this.commands) {
            if (typeof pattern === 'string' && text.includes(pattern)) {
                callback(text);
                return;
            } else if (pattern instanceof RegExp && pattern.test(text)) {
                const match = text.match(pattern);
                callback(text, match);
                return;
            }
        }
    }

    start() {
        this.recognition.start();
    }

    stop() {
        this.recognition.stop();
    }
}

// Usage
const voiceCommands = new VoiceCommandSystem();

voiceCommands.addCommand('hello', () => {
    console.log('Hello to you too!');
});

voiceCommands.addCommand(/set timer (\d+) (minute|second)s?/, (text, match) => {
    const duration = parseInt(match[1]);
    const unit = match[2];
    console.log(`Setting timer for ${duration} ${unit}s`);
});

voiceCommands.addCommand(/navigate to (.+)/, (text, match) => {
    const destination = match[1];
    console.log(`Navigating to ${destination}`);
});

voiceCommands.start();
```

### Auto-Restart on End

```javascript
class PersistentRecognition {
    constructor(config = {}) {
        this.recognition = new webkitSpeechRecognition();
        Object.assign(this.recognition, config);
        this.isActive = false;

        this.recognition.onend = () => {
            if (this.isActive) {
                // Auto-restart
                setTimeout(() => {
                    this.recognition.start();
                }, 100);
            }
        };
    }

    start() {
        this.isActive = true;
        this.recognition.start();
    }

    stop() {
        this.isActive = false;
        this.recognition.stop();
    }

    onResult(callback) {
        this.recognition.onresult = callback;
    }
}

// Usage
const persistent = new PersistentRecognition({
    continuous: true,
    interimResults: true,
    lang: 'en-US'
});

persistent.onResult((event) => {
    // Handle results
});

persistent.start(); // Will keep listening even after recognition ends
```

### Timeout Handler

```javascript
class TimeoutRecognition {
    constructor(timeout = 5000) {
        this.recognition = new webkitSpeechRecognition();
        this.timeout = timeout;
        this.timeoutId = null;

        this.recognition.onspeechstart = () => {
            this.clearTimer();
        };

        this.recognition.onspeechend = () => {
            this.startTimer();
        };

        this.recognition.onstart = () => {
            this.startTimer();
        };
    }

    startTimer() {
        this.clearTimer();
        this.timeoutId = setTimeout(() => {
            this.recognition.stop();
            this.onTimeout && this.onTimeout();
        }, this.timeout);
    }

    clearTimer() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    start() {
        this.recognition.start();
    }

    stop() {
        this.clearTimer();
        this.recognition.stop();
    }
}
```

## Browser Support

| Browser | Desktop | Mobile | Notes |
|---------|---------|--------|-------|
| Chrome  | ✅ 25+ | ✅ Android | Full support |
| Edge    | ✅ 79+ | ❌ | Full support |
| Safari  | ✅ 14.1+ | ✅ iOS 14.5+ | webkit prefix required |
| Firefox | ❌ | ❌ | Not supported |
| Opera   | ✅ 27+ | ❌ | Full support |

**Support:** ~70% of users globally

**Important Notes:**
- Requires HTTPS in production (or localhost for development)
- Some browsers require webkit prefix: `webkitSpeechRecognition`
- Mobile support varies by platform and browser

### Feature Detection

```javascript
function checkSpeechRecognitionSupport() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.warn('Speech Recognition not supported');
        return false;
    }

    return true;
}

// Usage
if (checkSpeechRecognitionSupport()) {
    // Initialize speech recognition
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
} else {
    // Show fallback UI
    showTextInputFallback();
}
```

## Best Practices

### 1. Always Check Browser Support

```javascript
// ✓ Good
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    alert('Speech recognition not supported. Please use Chrome or Safari.');
    return;
}

const recognition = new SpeechRecognition();

// ✗ Bad - Will crash in unsupported browsers
const recognition = new SpeechRecognition();
```

### 2. Handle Errors Gracefully

```javascript
// ✓ Good
recognition.onerror = (event) => {
    switch(event.error) {
        case 'no-speech':
            console.log('No speech detected. Please try again.');
            break;
        case 'audio-capture':
            console.log('No microphone found.');
            break;
        case 'not-allowed':
            console.log('Microphone permission denied.');
            break;
        case 'network':
            console.log('Network error occurred.');
            break;
        default:
            console.log('Error occurred:', event.error);
    }
};

// ✗ Bad - No error handling
recognition.start();
```

### 3. Provide Visual Feedback

```javascript
// ✓ Good - Show when listening
recognition.onstart = () => {
    microphoneIcon.classList.add('listening');
    statusText.textContent = 'Listening...';
};

recognition.onend = () => {
    microphoneIcon.classList.remove('listening');
    statusText.textContent = 'Click to speak';
};

// ✗ Bad - No visual indication
recognition.start();
```

### 4. Use Interim Results for Better UX

```javascript
// ✓ Good - Show results as user speaks
recognition.interimResults = true;

recognition.onresult = (event) => {
    let finalText = '';
    let interimText = '';

    for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript;
        } else {
            interimText += event.results[i][0].transcript;
        }
    }

    displayFinal(finalText);
    displayInterim(interimText);
};

// ✗ Bad - Only show final results (slower UX)
recognition.interimResults = false;
```

### 5. Request Permission Early

```javascript
// ✓ Good - Request on user interaction
button.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        // Now start recognition
        recognition.start();
    } catch (error) {
        console.error('Microphone access denied');
    }
});

// ✗ Bad - Sudden permission request
window.onload = () => {
    recognition.start(); // Unexpected permission prompt
};
```

### 6. Clean Up Resources

```javascript
// ✓ Good
class VoiceInput {
    constructor() {
        this.recognition = new webkitSpeechRecognition();
    }

    destroy() {
        this.recognition.stop();
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition = null;
    }
}

// Usage in React/Vue
useEffect(() => {
    const voiceInput = new VoiceInput();
    return () => voiceInput.destroy(); // Cleanup
}, []);
```

## Common Pitfalls

### 1. Not Handling Auto-Stop

```javascript
// ✗ Problem: Recognition stops after a few seconds
recognition.continuous = false; // Stops after one result

// ✓ Solution: Use continuous mode
recognition.continuous = true; // Keeps listening
```

### 2. HTTPS Requirement

```javascript
// ✗ Won't work in production
// http://mysite.com - Speech Recognition blocked

// ✓ Works
// https://mysite.com - Speech Recognition allowed
// http://localhost - Allowed for development
```

### 3. Not Prefixing for Safari

```javascript
// ✗ Breaks in Safari
const recognition = new SpeechRecognition();

// ✓ Works in all browsers
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
```

### 4. Forgetting Language Setting

```javascript
// ✗ May default to system language
const recognition = new webkitSpeechRecognition();
recognition.start();

// ✓ Explicitly set language
const recognition = new webkitSpeechRecognition();
recognition.lang = 'en-US';
recognition.start();
```

### 5. Not Handling "no-speech" Error

```javascript
// ✓ Good
recognition.onerror = (event) => {
    if (event.error === 'no-speech') {
        // Auto-restart or prompt user
        setTimeout(() => recognition.start(), 1000);
    }
};
```

## Error Codes Reference

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `no-speech` | No speech detected | Ask user to speak louder or try again |
| `aborted` | Recognition aborted | User canceled or called `stop()` |
| `audio-capture` | No microphone access | Check microphone connection |
| `network` | Network error | Check internet connection |
| `not-allowed` | Permission denied | Request microphone permission |
| `service-not-allowed` | Service not allowed | Check browser/OS settings |
| `bad-grammar` | Grammar compilation failed | Fix grammar configuration |
| `language-not-supported` | Language not supported | Use supported language code |

## Testing Speech Recognition

### Manual Testing Checklist

```javascript
// Test different scenarios
const testCases = [
    'Short phrase',
    'This is a much longer sentence to test continuous recognition',
    'Testing numbers: 1, 2, 3, 100, 1000',
    'Testing punctuation: Hello! How are you?',
    'Testing special words: email, www, dot, com'
];
```

### Automated Testing (Mock)

```javascript
// Create a mock for testing
class MockSpeechRecognition {
    constructor() {
        this.continuous = false;
        this.interimResults = false;
        this.lang = 'en-US';
    }

    start() {
        this.onstart && this.onstart();
    }

    stop() {
        this.onend && this.onend();
    }

    // Simulate result
    simulateResult(transcript, isFinal = true) {
        const event = {
            results: [[{
                transcript: transcript,
                confidence: 0.95,
                isFinal: isFinal
            }]],
            resultIndex: 0
        };

        this.onresult && this.onresult(event);
    }

    simulateError(error) {
        this.onerror && this.onerror({ error });
    }
}

// Usage in tests
describe('Voice Input', () => {
    it('should transcribe speech', () => {
        const mock = new MockSpeechRecognition();
        const results = [];

        mock.onresult = (event) => {
            results.push(event.results[0][0].transcript);
        };

        mock.start();
        mock.simulateResult('Hello world');

        expect(results).toContain('Hello world');
    });
});
```

## Performance Optimization

### 1. Debounce Processing

```javascript
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

const processTranscript = debounce((text) => {
    // Process heavy operations
    analyzeText(text);
    updateUI(text);
}, 300);

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    processTranscript(transcript);
};
```

### 2. Lazy Loading

```javascript
// Only load when needed
async function initVoiceInput() {
    if (!window.voiceRecognition) {
        // Import or initialize heavy dependencies
        const { VoiceProcessor } = await import('./voice-processor.js');
        window.voiceRecognition = new VoiceProcessor();
    }

    return window.voiceRecognition;
}
```

## Resources

- [MDN Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [W3C Speech API Specification](https://wicg.github.io/speech-api/)
- [Can I Use - Speech Recognition](https://caniuse.com/speech-recognition)
- [Google Developers - Voice Driven Web Apps](https://developers.google.com/web/updates/2013/01/Voice-Driven-Web-Apps-Introduction-to-the-Web-Speech-API)

## Files

- **index.html** - Interactive demos page with 6 examples
- **style.css** - Comprehensive styling for all demos
- **script.js** - Complete implementations of all 6 demos
- **README.md** - This documentation

## Running the Examples

1. Open `index.html` in a **modern browser** (Chrome, Edge, or Safari)
2. **Allow microphone access** when prompted
3. Click buttons to start different demos
4. **Speak clearly** into your microphone
5. See real-time transcription results

**Note:** Speech Recognition requires HTTPS in production. For local development, you can use `http://localhost` or a local file.

## License

Free to use for learning and projects.
