// Check for browser support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    alert('Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
}

// ========================================
// Demo 1: Basic Speech Recognition
// ========================================
let basicRecognition = null;
const mic1 = document.getElementById('mic1');
const transcript1 = document.getElementById('transcript1');

function initBasicRecognition() {
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        mic1.classList.add('listening');
        transcript1.textContent = 'Listening...';
    };

    recognition.onresult = (event) => {
        console.log(event.results)
        const transcript = event.results[0][0].transcript;
        transcript1.textContent = transcript;
    };

    recognition.onerror = (event) => {
        transcript1.textContent = `Error: ${event.error}`;
        mic1.classList.remove('listening');
    };

    recognition.onend = () => {
        mic1.classList.remove('listening');
    };

    return recognition;
}

document.getElementById('startBasic').addEventListener('click', () => {
    if (!SpeechRecognition) return;
    basicRecognition = initBasicRecognition();
    basicRecognition.start();
});

document.getElementById('stopBasic').addEventListener('click', () => {
    if (basicRecognition) {
        basicRecognition.stop();
    }
});

document.getElementById('clearBasic').addEventListener('click', () => {
    transcript1.textContent = 'Click the microphone to start speaking...';
});

// ========================================
// Demo 2: Continuous Recognition
// ========================================
let continuousRecognition = null;
let finalTranscript = '';
const liveIndicator = document.getElementById('liveIndicator');
const finalText2 = document.getElementById('finalText2');
const interimText2 = document.getElementById('interimText2');

function initContinuousRecognition() {
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        liveIndicator.classList.add('active');
        liveIndicator.querySelector('.status-text').textContent = 'Listening...';
    };

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

        finalText2.textContent = finalTranscript;
        interimText2.textContent = interimTranscript;
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        liveIndicator.classList.remove('active');
        liveIndicator.querySelector('.status-text').textContent = `Error: ${event.error}`;
    };

    recognition.onend = () => {
        liveIndicator.classList.remove('active');
        liveIndicator.querySelector('.status-text').textContent = 'Not listening';
    };

    return recognition;
}

document.getElementById('startContinuous').addEventListener('click', () => {
    if (!SpeechRecognition) return;
    if (!continuousRecognition) {
        continuousRecognition = initContinuousRecognition();
        continuousRecognition.start();
    }
});

document.getElementById('stopContinuous').addEventListener('click', () => {
    if (continuousRecognition) {
        continuousRecognition.stop();
        continuousRecognition = null;
    }
});

document.getElementById('clearContinuous').addEventListener('click', () => {
    finalTranscript = '';
    finalText2.textContent = '';
    interimText2.textContent = '';
});

// ========================================
// Demo 3: Language Selection
// ========================================
let languageRecognition = null;
const languageSelect = document.getElementById('languageSelect');
const transcript3 = document.getElementById('transcript3');
const currentLang = document.getElementById('currentLang');

const languageNames = {
    'en-US': 'English (US)',
    'en-GB': 'English (UK)',
    'es-ES': 'Spanish (Spain)',
    'fr-FR': 'French',
    'de-DE': 'German',
    'it-IT': 'Italian',
    'ja-JP': 'Japanese',
    'ko-KR': 'Korean',
    'zh-CN': 'Chinese (Simplified)',
    'ar-SA': 'Arabic'
};

languageSelect.addEventListener('change', () => {
    const selected = languageSelect.value;
    currentLang.textContent = languageNames[selected];
});

function initLanguageRecognition(lang) {
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = lang;
    recognition.interimResults = false;

    recognition.onstart = () => {
        transcript3.textContent = 'Listening...';
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        transcript3.textContent = transcript;
    };

    recognition.onerror = (event) => {
        transcript3.textContent = `Error: ${event.error}`;
    };

    return recognition;
}

document.getElementById('startLanguage').addEventListener('click', () => {
    if (!SpeechRecognition) return;
    const selectedLang = languageSelect.value;
    languageRecognition = initLanguageRecognition(selectedLang);
    languageRecognition.start();
});

document.getElementById('stopLanguage').addEventListener('click', () => {
    if (languageRecognition) {
        languageRecognition.stop();
    }
});

document.getElementById('clearLanguage').addEventListener('click', () => {
    transcript3.textContent = 'Select a language and start speaking...';
});

// ========================================
// Demo 4: Voice Commands
// ========================================
let commandRecognition = null;
const controlledElement = document.getElementById('controlledElement');
const commandOutput = document.getElementById('commandOutput');

function initCommandRecognition() {
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
        commandOutput.textContent = 'Voice control active. Say a command...';
        commandOutput.classList.add('listening');
    };

    recognition.onresult = (event) => {
        const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
        commandOutput.textContent = `You said: "${command}"`;

        processCommand(command);
    };

    recognition.onerror = (event) => {
        commandOutput.textContent = `Error: ${event.error}`;
        commandOutput.classList.remove('listening');
    };

    recognition.onend = () => {
        commandOutput.classList.remove('listening');
        if (commandRecognition) {
            // Restart for continuous listening
            setTimeout(() => {
                if (commandRecognition) {
                    commandRecognition.start();
                }
            }, 100);
        }
    };

    return recognition;
}

function processCommand(command) {
    // Color commands
    if (command.includes('red')) {
        controlledElement.style.backgroundColor = '#fc8181';
        commandOutput.textContent += ' → Changed color to red';
    } else if (command.includes('blue')) {
        controlledElement.style.backgroundColor = '#667eea';
        commandOutput.textContent += ' → Changed color to blue';
    } else if (command.includes('green')) {
        controlledElement.style.backgroundColor = '#68d391';
        commandOutput.textContent += ' → Changed color to green';
    }

    // Size commands
    else if (command.includes('bigger') || command.includes('larger')) {
        controlledElement.style.transform = 'scale(1.5)';
        commandOutput.textContent += ' → Made it bigger';
    } else if (command.includes('smaller')) {
        controlledElement.style.transform = 'scale(0.7)';
        commandOutput.textContent += ' → Made it smaller';
    }

    // Rotation commands
    else if (command.includes('rotate left')) {
        controlledElement.style.transform = 'rotate(-45deg)';
        commandOutput.textContent += ' → Rotated left';
    } else if (command.includes('rotate right') || command.includes('rotate')) {
        controlledElement.style.transform = 'rotate(45deg)';
        commandOutput.textContent += ' → Rotated right';
    }

    // Reset command
    else if (command.includes('reset')) {
        controlledElement.style.backgroundColor = '#667eea';
        controlledElement.style.transform = 'scale(1) rotate(0deg)';
        commandOutput.textContent += ' → Reset to default';
    }

    else {
        commandOutput.textContent += ' → Command not recognized';
    }
}

document.getElementById('startCommands').addEventListener('click', () => {
    if (!SpeechRecognition) return;
    if (!commandRecognition) {
        commandRecognition = initCommandRecognition();
        commandRecognition.start();
    }
});

document.getElementById('stopCommands').addEventListener('click', () => {
    if (commandRecognition) {
        commandRecognition.stop();
        commandRecognition = null;
        commandOutput.textContent = 'Voice control deactivated';
        commandOutput.classList.remove('listening');
    }
});

document.getElementById('resetCommands').addEventListener('click', () => {
    controlledElement.style.backgroundColor = '#667eea';
    controlledElement.style.transform = 'scale(1) rotate(0deg)';
    commandOutput.textContent = 'Reset complete';
});

// ========================================
// Demo 5: Voice Notes App
// ========================================
let notesRecognition = null;
let noteContent = '';
const noteTitle = document.getElementById('noteTitle');
const noteContentArea = document.getElementById('noteContent');
const wordCount = document.getElementById('wordCount');

function updateWordCount() {
    const words = noteContentArea.value.trim().split(/\s+/).filter(w => w.length > 0);
    wordCount.textContent = words.length;
}

function initNotesRecognition() {
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = true;

    recognition.onstart = () => {
        noteContentArea.placeholder = 'Listening... Speak now.';
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                noteContent += transcript + ' ';
                noteContentArea.value = noteContent;
                updateWordCount();
            } else {
                interimTranscript += transcript;
            }
        }
    };

    recognition.onerror = (event) => {
        console.error('Notes recognition error:', event.error);
    };

    recognition.onend = () => {
        noteContentArea.placeholder = 'Start speaking to add content...';
    };

    return recognition;
}

document.getElementById('startNotes').addEventListener('click', () => {
    if (!SpeechRecognition) return;
    if (!notesRecognition) {
        noteContent = noteContentArea.value;
        notesRecognition = initNotesRecognition();
        notesRecognition.start();
    }
});

document.getElementById('pauseNotes').addEventListener('click', () => {
    if (notesRecognition) {
        notesRecognition.stop();
        notesRecognition = null;
    }
});

document.getElementById('saveNote').addEventListener('click', () => {
    const title = noteTitle.value || 'Untitled Note';
    const content = noteContentArea.value;

    // Save to localStorage
    const notes = JSON.parse(localStorage.getItem('voiceNotes') || '[]');
    notes.push({
        title: title,
        content: content,
        date: new Date().toISOString()
    });
    localStorage.setItem('voiceNotes', JSON.stringify(notes));

    alert(`Note "${title}" saved successfully!`);
});

document.getElementById('clearNote').addEventListener('click', () => {
    noteContent = '';
    noteContentArea.value = '';
    noteTitle.value = '';
    updateWordCount();
});

document.getElementById('exportNote').addEventListener('click', () => {
    const title = noteTitle.value || 'note';
    const content = noteContentArea.value;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
});

noteContentArea.addEventListener('input', updateWordCount);

// ========================================
// Demo 6: Confidence & Alternatives
// ========================================
let analysisRecognition = null;
const mainTranscript6 = document.getElementById('mainTranscript6');
const confidenceFill = document.getElementById('confidenceFill');
const confidenceValue = document.getElementById('confidenceValue');
const alternativesList = document.getElementById('alternativesList');
const maxAlternativesCheckbox = document.getElementById('maxAlternatives');

function initAnalysisRecognition() {
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = maxAlternativesCheckbox.checked ? 5 : 1;

    recognition.onstart = () => {
        mainTranscript6.textContent = 'Listening...';
        alternativesList.innerHTML = '';
    };

    recognition.onresult = (event) => {
        const result = event.results[0];

        // Main result
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;

        mainTranscript6.textContent = transcript;

        // Update confidence meter
        const confidencePercent = (confidence * 100).toFixed(1);
        confidenceFill.style.width = `${confidencePercent}%`;
        confidenceValue.textContent = `${confidencePercent}%`;

        // Set color based on confidence
        if (confidence > 0.8) {
            confidenceFill.style.backgroundColor = '#68d391';
        } else if (confidence > 0.5) {
            confidenceFill.style.backgroundColor = '#f6ad55';
        } else {
            confidenceFill.style.backgroundColor = '#fc8181';
        }

        // Show alternatives
        alternativesList.innerHTML = '';
        for (let i = 0; i < result.length; i++) {
            const li = document.createElement('li');
            const altConfidence = (result[i].confidence * 100).toFixed(1);
            li.innerHTML = `
                <span class="alt-transcript">${result[i].transcript}</span>
                <span class="alt-confidence">${altConfidence}%</span>
            `;
            alternativesList.appendChild(li);
        }
    };

    recognition.onerror = (event) => {
        mainTranscript6.textContent = `Error: ${event.error}`;
    };

    return recognition;
}

document.getElementById('startAnalysis').addEventListener('click', () => {
    if (!SpeechRecognition) return;
    analysisRecognition = initAnalysisRecognition();
    analysisRecognition.start();
});

document.getElementById('stopAnalysis').addEventListener('click', () => {
    if (analysisRecognition) {
        analysisRecognition.stop();
    }
});

document.getElementById('clearAnalysis').addEventListener('click', () => {
    mainTranscript6.textContent = 'Speak to see results...';
    confidenceFill.style.width = '0%';
    confidenceValue.textContent = '0%';
    alternativesList.innerHTML = '';
});

// Update max alternatives when checkbox changes
maxAlternativesCheckbox.addEventListener('change', () => {
    if (analysisRecognition) {
        analysisRecognition.maxAlternatives = maxAlternativesCheckbox.checked ? 5 : 1;
    }
});
