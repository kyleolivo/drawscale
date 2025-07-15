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

  // Create initial smiley face elements
  const createSmileyFace = () => {
    const centerX = 400;
    const centerY = 300;
    const faceRadius = 80;
    
    return [
      // Face circle
      {
        id: 'smiley-face',
        type: 'ellipse',
        x: centerX - faceRadius,
        y: centerY - faceRadius,
        width: faceRadius * 2,
        height: faceRadius * 2,
        angle: 0,
        strokeColor: '#1e1e1e',
        backgroundColor: '#ffec99',
        fillStyle: 'solid',
        strokeWidth: 3,
        strokeStyle: 'solid',
        roughness: 1,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: null,
        seed: 12345,
        versionNonce: 12345,
        isDeleted: false,
        boundElements: null,
        updated: 1,
        link: null,
        locked: false,
        version: 1
      },
      // Left eye
      {
        id: 'smiley-left-eye',
        type: 'ellipse',
        x: centerX - 30,
        y: centerY - 30,
        width: 15,
        height: 15,
        angle: 0,
        strokeColor: '#1e1e1e',
        backgroundColor: '#1e1e1e',
        fillStyle: 'solid',
        strokeWidth: 2,
        strokeStyle: 'solid',
        roughness: 1,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: null,
        seed: 12346,
        versionNonce: 12346,
        isDeleted: false,
        boundElements: null,
        updated: 1,
        link: null,
        locked: false,
        version: 1
      },
      // Right eye
      {
        id: 'smiley-right-eye',
        type: 'ellipse',
        x: centerX + 15,
        y: centerY - 30,
        width: 15,
        height: 15,
        angle: 0,
        strokeColor: '#1e1e1e',
        backgroundColor: '#1e1e1e',
        fillStyle: 'solid',
        strokeWidth: 2,
        strokeStyle: 'solid',
        roughness: 1,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: null,
        seed: 12347,
        versionNonce: 12347,
        isDeleted: false,
        boundElements: null,
        updated: 1,
        link: null,
        locked: false,
        version: 1
      },
      // Smile - curved line
      {
        id: 'smiley-mouth',
        type: 'line',
        x: centerX - 35,
        y: centerY + 20,
        width: 70,
        height: 30,
        angle: 0,
        strokeColor: '#1e1e1e',
        backgroundColor: 'transparent',
        fillStyle: 'solid',
        strokeWidth: 3,
        strokeStyle: 'solid',
        roughness: 1,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: null,
        seed: 12348,
        versionNonce: 12348,
        isDeleted: false,
        boundElements: null,
        updated: 1,
        link: null,
        locked: false,
        version: 1,
        points: [[0, 0], [17, 15], [35, 20], [53, 15], [70, 0]],
        lastCommittedPoint: [70, 0],
        startBinding: null,
        endBinding: null,
        startArrowhead: null,
        endArrowhead: null
      }
    ];
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
          <Excalidraw 
            initialData={{ 
              elements: createSmileyFace() as readonly unknown[],
              appState: { viewBackgroundColor: "#ffffff" }
            }}
          />
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