import { useState, useRef } from 'react';
import './RecordButton.css';

interface RecordButtonProps {
  onTranscriptionSubmit: (audioBlob: Blob) => void;
}

function RecordButton({ onTranscriptionSubmit }: RecordButtonProps): JSX.Element {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1, // Mono audio to reduce file size
          sampleRate: 16000, // Lower sample rate for speech
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      // Use opus codec for better compression
      const options = {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 16000 // Low bitrate for speech
      };
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        stream.getTracks().forEach(track => track.stop());
        
        // Clear duration interval
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }
        
        // Check file size and warn if too large
        const sizeMB = blob.size / (1024 * 1024);
        console.log(`Recording size: ${sizeMB.toFixed(2)}MB, duration: ${recordingDuration}s`);
        
        if (sizeMB > 24) {
          alert(`Recording is ${sizeMB.toFixed(1)}MB, which exceeds the 25MB limit. The transcription may fail.`);
        }
        
        // Automatically submit the recording
        onTranscriptionSubmit(blob);
      };
      
      // Start duration timer
      durationIntervalRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setRecordingDuration(elapsed);
      }, 1000);

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingDuration(0);
    }
  };
  
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="record-button-container">
      <button
        className={`record-button ${isRecording ? 'recording' : ''}`}
        onClick={handleRecordClick}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
      </button>
      {isRecording && (
        <div className="recording-duration">
          {formatDuration(recordingDuration)}
        </div>
      )}
    </div>
  );
}

export default RecordButton;