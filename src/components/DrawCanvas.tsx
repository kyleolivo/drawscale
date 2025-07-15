import { useState, useEffect } from 'react';
import { Excalidraw } from "@excalidraw/excalidraw";
import { useAuth } from '../hooks/useAuth';
import ProblemDrawer, { DrawerToggle } from './ProblemDrawer';
import RecordButton from './RecordButton';
import { DEFAULT_PROBLEM } from '../constants/problems';
import { transcribeAudio } from '../lib/supabase';
import './DrawCanvas.css';

function DrawCanvas(): JSX.Element {
  const { user, signOut } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.matchMedia('(max-width: 768px)').matches;
      setIsMobile(mobile);
      if (mobile) setIsDrawerOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDrawerToggle = () => {
    if (!isMobile) setIsDrawerOpen(!isDrawerOpen);
  };

  const handleTranscriptionSubmit = async (audioBlob: Blob) => {
    try {
      const result = await transcribeAudio(audioBlob);
      console.log('Transcription result:', result.text);
      // TODO: Add logic to handle the transcribed text
      alert(`Transcription: ${result.text}`);
    } catch (error) {
      console.error('Transcription error:', error);
      alert('Failed to transcribe audio. Please try again.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="header-title">
            <h1>DrawScale</h1>
            <p>System Design Interview Prep Tool</p>
          </div>
          <div className="header-user">
            <span>Welcome, {user?.name || user?.email || 'User'}</span>
            <button onClick={signOut} className="logout-button">
              Sign Out
            </button>
          </div>
        </div>
      </header>
      <div className={`canvas-container ${isDrawerOpen ? 'drawer-open' : 'drawer-closed'}`}>
        <ProblemDrawer
          problem={DEFAULT_PROBLEM}
          isOpen={isDrawerOpen}
        />
        <div className={`excalidraw-wrapper ${isDrawerOpen ? 'with-drawer' : ''}`}>
          <Excalidraw />
        </div>
        <DrawerToggle
          isOpen={isDrawerOpen}
          onToggle={handleDrawerToggle}
          isMobile={isMobile}
        />
        <RecordButton onTranscriptionSubmit={handleTranscriptionSubmit} />
      </div>
    </div>
  );
}

export default DrawCanvas;