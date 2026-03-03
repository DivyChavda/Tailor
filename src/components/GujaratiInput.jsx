import { useState, useRef } from 'react';

export default function GujaratiInput({ value, onChange, placeholder = 'ડિઝાઇન વિશે નોંધ લખો...' }) {
    const [isListening, setIsListening] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [interim, setInterim] = useState('');
    const recognitionRef = useRef(null);

    const startListening = () => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setErrorMsg(
                'Speech recognition not supported. Please use Chrome on Android tablet or type using Gujarati keyboard.'
            );
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = 'gu-IN';
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        let finalText = value || '';

        recognitionRef.current.onresult = (event) => {
            let interimText = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalText += event.results[i][0].transcript + ' ';
                    onChange(finalText);
                    setInterim('');
                } else {
                    interimText += event.results[i][0].transcript;
                    setInterim(interimText);
                }
            }
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
            setInterim('');
        };

        recognitionRef.current.onerror = (event) => {
            if (event.error !== 'no-speech') {
                setErrorMsg(`Error: ${event.error}. Please try again.`);
            }
            setIsListening(false);
            setInterim('');
        };

        recognitionRef.current.start();
        setIsListening(true);
        setErrorMsg('');
    };

    const stopListening = () => {
        recognitionRef.current?.stop();
        setIsListening(false);
        setInterim('');
    };

    return (
        <div className="gujarati-input-wrapper">
            <div className="gujarati-header">
                <div className="gujarati-label-group">
                    <label className="field-label">
                        📝 Design Notes <span className="gujarati-sub">(ડિઝાઇન નોંધ)</span>
                    </label>
                </div>
                <button
                    type="button"
                    className={`mic-btn ${isListening ? 'listening' : ''}`}
                    onClick={isListening ? stopListening : startListening}
                >
                    {isListening ? (
                        <>
                            <span className="mic-pulse" /> ⏹ Stop
                        </>
                    ) : (
                        <>🎤 Speak Gujarati</>
                    )}
                </button>
            </div>

            {isListening && (
                <div className="listening-bar">
                    <div className="sound-waves">
                        <span /><span /><span /><span /><span />
                    </div>
                    <span>સાંભળી રહ્યો છું... (Listening...)</span>
                    {interim && <em className="interim-text">"{interim}"</em>}
                </div>
            )}

            {errorMsg && (
                <div className="input-error-msg">
                    ⚠️ {errorMsg}
                </div>
            )}

            <textarea
                className="gujarati-textarea"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={5}
                lang="gu"
                dir="auto"
                spellCheck={false}
            />

            <p className="gujarati-tip">
                💡 <strong>Tip:</strong> ટૅબ્લેટ keyboard ને Gujarati mode માં switch કરો, અથવા 🎤 button દ્વારા ગુજરાતીમાં બોલો
            </p>
        </div>
    );
}
