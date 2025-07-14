import { useState } from 'react';
import { transcribeAudio } from '../lib/supabase';
import './VoiceNotesPage.css';

interface Transcription {
  id: string;
  text: string;
  timestamp: Date;
  audioUrl?: string;
}

function VoiceNotesPage(): JSX.Element {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Try different audio formats for better compatibility
      let options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options = { mimeType: 'audio/webm;codecs=opus' };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
      } else if (MediaRecorder.isTypeSupported('audio/wav')) {
        options = { mimeType: 'audio/wav' };
      }
      
      const recorder = new MediaRecorder(stream, options);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        // Use the same MIME type that was used for recording
        const mimeType = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(chunks, { type: mimeType });
        setCurrentAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      const id = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setIntervalId(id);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }
  };

  const handleTranscribeAudio = async () => {
    if (!currentAudio) return;

    setIsTranscribing(true);
    try {
      const result = await transcribeAudio(currentAudio);
      
      const newTranscription: Transcription = {
        id: Date.now().toString(),
        text: result.text,
        timestamp: new Date(),
        audioUrl: URL.createObjectURL(currentAudio)
      };

      setTranscriptions(prev => [newTranscription, ...prev]);
      setCurrentAudio(null);
      setRecordingTime(0);

    } catch (error) {
      console.error('Error transcribing audio:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', {
        message: errorMessage,
        error: error
      });
      alert(`Transcription failed: ${errorMessage}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const deleteTranscription = (id: string) => {
    setTranscriptions(prev => {
      const transcriptionToDelete = prev.find(t => t.id === id);
      if (transcriptionToDelete?.audioUrl) {
        // Clean up the blob URL to prevent memory leaks
        URL.revokeObjectURL(transcriptionToDelete.audioUrl);
      }
      return prev.filter(t => t.id !== id);
    });
  };

  return (
    <div className="voice-notes-page">
      <header className="voice-notes-header">
        <h1>🎤 Voice Notes</h1>
        <p>Record audio and get AI-powered transcriptions</p>
      </header>

      <div className="recording-section">
        <div className="recording-controls">
          {!isRecording && !currentAudio && (
            <button 
              className="record-button start"
              onClick={startRecording}
              disabled={isTranscribing}
            >
              🎤 Start Recording
            </button>
          )}

          {isRecording && (
            <div className="recording-active">
              <button 
                className="record-button stop"
                onClick={stopRecording}
              >
                ⏹️ Stop Recording
              </button>
              <div className="recording-timer">
                {formatTime(recordingTime)}
              </div>
              <div className="recording-indicator">
                <span className="pulse-dot"></span>
                Recording...
              </div>
            </div>
          )}

          {currentAudio && !isRecording && (
            <div className="audio-preview">
              <p>Audio recorded: {currentAudio.type} ({(currentAudio.size / 1024).toFixed(1)} KB)</p>
              <audio 
                controls 
                src={URL.createObjectURL(currentAudio)}
                onError={(e) => {
                  console.error('Audio playback error:', e);
                  console.error('Audio blob details:', {
                    type: currentAudio.type,
                    size: currentAudio.size
                  });
                }}
                onCanPlay={() => console.log('Audio can play')}
              />
              <div className="audio-actions">
                <button 
                  className="transcribe-button"
                  onClick={handleTranscribeAudio}
                  disabled={isTranscribing}
                >
                  {isTranscribing ? '⏳ Transcribing...' : '📝 Transcribe'}
                </button>
                <button 
                  className="discard-button"
                  onClick={() => setCurrentAudio(null)}
                  disabled={isTranscribing}
                >
                  🗑️ Discard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="transcriptions-section">
        <h2>Transcriptions</h2>
        {transcriptions.length === 0 ? (
          <div className="empty-state">
            <p>No transcriptions yet. Record some audio to get started!</p>
          </div>
        ) : (
          <div className="transcriptions-list">
            {transcriptions.map((transcription) => (
              <div key={transcription.id} className="transcription-item">
                <div className="transcription-header">
                  <span className="transcription-time">
                    {transcription.timestamp.toLocaleString()}
                  </span>
                  <button 
                    className="delete-button"
                    onClick={() => deleteTranscription(transcription.id)}
                  >
                    🗑️
                  </button>
                </div>
                <div className="transcription-text">
                  {transcription.text}
                </div>
                {transcription.audioUrl && (
                  <audio 
                    controls 
                    src={transcription.audioUrl}
                    className="transcription-audio"
                    onError={(e) => {
                      console.error('Transcription audio playback error:', e);
                    }}
                    onCanPlay={() => console.log('Transcription audio can play')}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VoiceNotesPage;