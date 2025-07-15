import { useState, useEffect, useCallback, useRef } from 'react';
import { Excalidraw, exportToCanvas } from "@excalidraw/excalidraw";
import type { ExcalidrawElement, AppState, BinaryFiles } from "@excalidraw/excalidraw/types/types";
import { useAuth } from '../hooks/useAuth';
import ProblemDrawer, { DrawerToggle } from './ProblemDrawer';
import RecordButton from './RecordButton';
import { DEFAULT_PROBLEM } from '../constants/problems';
import { transcribeAudioWithImage } from '../lib/supabase';
import { AnalysisResult } from '../types/problem';
import './DrawCanvas.css';

function DrawCanvas(): JSX.Element {
  const { user, signOut } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | undefined>(undefined);
  const [excalidrawElements, setExcalidrawElements] = useState<readonly ExcalidrawElement[]>([]);
  const [excalidrawAppState, setExcalidrawAppState] = useState<AppState | null>(null);
  const [excalidrawFiles, setExcalidrawFiles] = useState<BinaryFiles>({});
  const isInitializing = useRef(true);

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

  const captureCanvasImage = async (): Promise<Blob | null> => {
    if (!excalidrawElements || excalidrawElements.length === 0) {
      console.error('No Excalidraw elements available');
      return null;
    }

    try {
      const canvas = await exportToCanvas({
        elements: excalidrawElements,
        appState: excalidrawAppState || {
          viewBackgroundColor: "#ffffff",
          exportBackground: true
        },
        files: excalidrawFiles,
        getDimensions: () => ({ width: 800, height: 600 })
      });
      
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            console.error('Failed to create blob from canvas');
            reject(new Error('Failed to create blob from canvas'));
          }
        }, 'image/png');
      });
    } catch (error) {
      console.error('Error capturing canvas:', error);
      return null;
    }
  };


  const handleTranscriptionSubmit = async (audioBlob: Blob) => {
    try {
      // Capture the current canvas image
      const imageBlob = await captureCanvasImage();
      
      if (!imageBlob) {
        console.error('Canvas capture failed - unable to process recording');
        alert('Unable to capture canvas image. Please try recording again.');
        return;
      }

      const result = await transcribeAudioWithImage(audioBlob, imageBlob);
      
      // Set the analysis result to display in the problem drawer
      setAnalysisResult({
        transcription: result.transcription,
        analysis: result.analysis,
        timestamp: new Date()
      });
      
      // Ensure the drawer is open to show the results
      if (!isDrawerOpen && !isMobile) {
        setIsDrawerOpen(true);
      }
      
    } catch (error) {
      console.error('Transcription error:', error);
      alert('Failed to process audio and image. Please try again.');
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
      <div className={`canvas-container ${isDrawerOpen ? 'drawer-open' : 'drawer-closed'}`}>
        <ProblemDrawer
          problem={DEFAULT_PROBLEM}
          isOpen={isDrawerOpen}
          analysisResult={analysisResult}
          user={user || undefined}
          onSignOut={signOut}
        />
        <div className={`excalidraw-wrapper ${isDrawerOpen ? 'with-drawer' : ''}`}>
          <Excalidraw 
            initialData={{ 
              elements: createSmileyFace() as readonly ExcalidrawElement[],
              appState: { viewBackgroundColor: "#ffffff" }
            }}
            onChange={useCallback((elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
              // Skip the first few onChange calls during initialization
              if (isInitializing.current) {
                isInitializing.current = false;
                return;
              }
              
              setExcalidrawElements(elements);
              setExcalidrawAppState(appState);
              setExcalidrawFiles(files);
            }, [])}
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