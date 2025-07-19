import { useState, useCallback, useRef, useEffect } from 'react';
import { Excalidraw, exportToCanvas } from "@excalidraw/excalidraw";
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { useAuth } from '../hooks/useAuth';
import ProblemDrawer, { DrawerToggle } from './ProblemDrawer';
import RecordButton from './RecordButton';
import ProcessingIndicator from './ProcessingIndicator';
import { DEFAULT_PROBLEM } from '../constants/problems';
import { transcribeAudioWithImage } from '../lib/supabase';

import { ApplicationState, DrawCanvasAppState } from '../types/appState';
import { SystemDesignProblem } from '../types/problem';
import './DrawCanvas.css';

function DrawCanvas(): JSX.Element {
  const { user, signOut } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [drawerWidth, setDrawerWidth] = useState(() => Math.min(700, window.innerWidth * 0.65));
  const [isResizing, setIsResizing] = useState(false);
  const [excalidrawElements, setExcalidrawElements] = useState<readonly ExcalidrawElement[]>([]);
  const [excalidrawAppState, setExcalidrawAppState] = useState<AppState | null>(null);
  const [excalidrawFiles, setExcalidrawFiles] = useState<BinaryFiles>({});
  const [appState, setAppState] = useState<DrawCanvasAppState>({
    currentState: ApplicationState.PROBLEMS_DIRECTORY,
    currentProblem: DEFAULT_PROBLEM
  });
  const [isProcessingSubmission, setIsProcessingSubmission] = useState(false);
  const isInitializing = useRef(true);

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const newWidth = window.innerWidth - e.clientX;
    const minWidth = 250;
    const maxWidth = Math.min(700, window.innerWidth * 0.65);
    
    setDrawerWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)));
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add global mouse events for resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleProblemSelect = (problem: SystemDesignProblem) => {
    setAppState(prevState => ({
      ...prevState,
      currentState: ApplicationState.PROBLEM_PRESENTATION,
      currentProblem: problem
    }));
  };

  const handleBackToProblems = () => {
    setAppState(prevState => ({
      ...prevState,
      currentState: ApplicationState.PROBLEMS_DIRECTORY
    }));
  };

  const captureCanvasImage = async (): Promise<Blob | null> => {
    // If no elements are available yet, try to get the initial data
    let elementsToExport = excalidrawElements;
    
    if (!elementsToExport || elementsToExport.length === 0) {
      console.warn('No Excalidraw elements in state, using initial diagram');
      // Fall back to the initial diagram if no elements are captured yet
      elementsToExport = createBitlySystemDiagram() as readonly ExcalidrawElement[];
    }

    try {
      const canvas = await exportToCanvas({
        elements: elementsToExport,
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
      setIsProcessingSubmission(true);
      
      // Capture the current canvas image
      const imageBlob = await captureCanvasImage();
      
      if (!imageBlob) {
        console.error('Canvas capture failed - unable to process recording');
        alert('Unable to capture canvas image. Please try recording again.');
        setIsProcessingSubmission(false);
        return;
      }

      // Prepare problem context for evaluation
      const problemContext = {
        title: appState.currentProblem.title,
        description: appState.currentProblem.description,
        content: appState.currentProblem.content,
        judgementCriteria: appState.currentProblem.judgementCriteria
      };
      
      // Temporarily pass empty string for userEmail while whitelist is disabled
      const userEmail = user?.email || '';
      
      const result = await transcribeAudioWithImage(audioBlob, imageBlob, userEmail, problemContext);
      
      // Update the app state with the analysis result
      setAppState(prevState => ({
        ...prevState,
        analysisResult: {
          transcription: result.transcription,
          analysis: result.analysis,
          timestamp: new Date()
        }
      }));
      
      // Ensure the drawer is open to show the results
      if (!isDrawerOpen) {
        setIsDrawerOpen(true);
      }
      
    } catch (error) {
      console.error('Transcription error:', error);
      alert('Failed to process audio and image. Please try again.');
    } finally {
      setIsProcessingSubmission(false);
    }
  };

  // Create initial Bitly system diagram elements
  const createBitlySystemDiagram = () => {
    return [
      // User/Client
      {
        id: 'client',
        type: 'rectangle',
        x: 50,
        y: 150,
        width: 100,
        height: 60,
        angle: 0,
        strokeColor: '#1971c2',
        backgroundColor: '#e7f5ff',
        fillStyle: 'solid',
        strokeWidth: 2,
        strokeStyle: 'solid',
        roughness: 1,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: { type: 2, value: 8 },
        seed: 12345,
        versionNonce: 12345,
        isDeleted: false,
        boundElements: null,
        updated: 1,
        link: null,
        locked: false,
        version: 1
      },
      {
        id: 'client-text',
        type: 'text',
        x: 85,
        y: 175,
        width: 30,
        height: 25,
        angle: 0,
        strokeColor: '#1971c2',
        backgroundColor: 'transparent',
        fillStyle: 'solid',
        strokeWidth: 1,
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
        version: 1,
        text: 'Client',
        fontSize: 16,
        fontFamily: 1,
        textAlign: 'center',
        verticalAlign: 'middle',
        containerId: null,
        originalText: 'Client',
        lineHeight: 1.25,
        baseline: 18
      },
      // Load Balancer
      {
        id: 'load-balancer',
        type: 'rectangle',
        x: 250,
        y: 150,
        width: 100,
        height: 60,
        angle: 0,
        strokeColor: '#d6336c',
        backgroundColor: '#fff0f6',
        fillStyle: 'solid',
        strokeWidth: 2,
        strokeStyle: 'solid',
        roughness: 1,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: { type: 2, value: 8 },
        seed: 12347,
        versionNonce: 12347,
        isDeleted: false,
        boundElements: null,
        updated: 1,
        link: null,
        locked: false,
        version: 1
      },
      {
        id: 'load-balancer-text',
        type: 'text',
        x: 270,
        y: 170,
        width: 60,
        height: 40,
        angle: 0,
        strokeColor: '#d6336c',
        backgroundColor: 'transparent',
        fillStyle: 'solid',
        strokeWidth: 1,
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
        text: 'Load\nBalancer',
        fontSize: 14,
        fontFamily: 1,
        textAlign: 'center',
        verticalAlign: 'middle',
        containerId: null,
        originalText: 'Load\nBalancer',
        lineHeight: 1.25,
        baseline: 18
      },
      // Web Server 1
      {
        id: 'web-server-1',
        type: 'rectangle',
        x: 450,
        y: 100,
        width: 100,
        height: 60,
        angle: 0,
        strokeColor: '#2f9e44',
        backgroundColor: '#ebfbee',
        fillStyle: 'solid',
        strokeWidth: 2,
        strokeStyle: 'solid',
        roughness: 1,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: { type: 2, value: 8 },
        seed: 12349,
        versionNonce: 12349,
        isDeleted: false,
        boundElements: null,
        updated: 1,
        link: null,
        locked: false,
        version: 1
      },
      {
        id: 'web-server-1-text',
        type: 'text',
        x: 475,
        y: 120,
        width: 50,
        height: 40,
        angle: 0,
        strokeColor: '#2f9e44',
        backgroundColor: 'transparent',
        fillStyle: 'solid',
        strokeWidth: 1,
        strokeStyle: 'solid',
        roughness: 1,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: null,
        seed: 12350,
        versionNonce: 12350,
        isDeleted: false,
        boundElements: null,
        updated: 1,
        link: null,
        locked: false,
        version: 1,
        text: 'Web\nServer',
        fontSize: 14,
        fontFamily: 1,
        textAlign: 'center',
        verticalAlign: 'middle',
        containerId: null,
        originalText: 'Web\nServer',
        lineHeight: 1.25,
        baseline: 18
      },
      // Web Server 2
      {
        id: 'web-server-2',
        type: 'rectangle',
        x: 450,
        y: 200,
        width: 100,
        height: 60,
        angle: 0,
        strokeColor: '#2f9e44',
        backgroundColor: '#ebfbee',
        fillStyle: 'solid',
        strokeWidth: 2,
        strokeStyle: 'solid',
        roughness: 1,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: { type: 2, value: 8 },
        seed: 12351,
        versionNonce: 12351,
        isDeleted: false,
        boundElements: null,
        updated: 1,
        link: null,
        locked: false,
        version: 1
      },
      {
        id: 'web-server-2-text',
        type: 'text',
        x: 475,
        y: 220,
        width: 50,
        height: 40,
        angle: 0,
        strokeColor: '#2f9e44',
        backgroundColor: 'transparent',
        fillStyle: 'solid',
        strokeWidth: 1,
        strokeStyle: 'solid',
        roughness: 1,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: null,
        seed: 12352,
        versionNonce: 12352,
        isDeleted: false,
        boundElements: null,
        updated: 1,
        link: null,
        locked: false,
        version: 1,
        text: 'Web\nServer',
        fontSize: 14,
        fontFamily: 1,
        textAlign: 'center',
        verticalAlign: 'middle',
        containerId: null,
        originalText: 'Web\nServer',
        lineHeight: 1.25,
        baseline: 18
      },
      // Database
      {
        id: 'database',
        type: 'rectangle',
        x: 650,
        y: 150,
        width: 100,
        height: 60,
        angle: 0,
        strokeColor: '#f76707',
        backgroundColor: '#fff4e6',
        fillStyle: 'solid',
        strokeWidth: 2,
        strokeStyle: 'solid',
        roughness: 1,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: { type: 2, value: 8 },
        seed: 12353,
        versionNonce: 12353,
        isDeleted: false,
        boundElements: null,
        updated: 1,
        link: null,
        locked: false,
        version: 1
      },
      {
        id: 'database-text',
        type: 'text',
        x: 680,
        y: 175,
        width: 40,
        height: 25,
        angle: 0,
        strokeColor: '#f76707',
        backgroundColor: 'transparent',
        fillStyle: 'solid',
        strokeWidth: 1,
        strokeStyle: 'solid',
        roughness: 1,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: null,
        seed: 12354,
        versionNonce: 12354,
        isDeleted: false,
        boundElements: null,
        updated: 1,
        link: null,
        locked: false,
        version: 1,
        text: 'Database',
        fontSize: 14,
        fontFamily: 1,
        textAlign: 'center',
        verticalAlign: 'middle',
        containerId: null,
        originalText: 'Database',
        lineHeight: 1.25,
        baseline: 18
      },
      // Cache
      {
        id: 'cache',
        type: 'rectangle',
        x: 450,
        y: 320,
        width: 100,
        height: 60,
        angle: 0,
        strokeColor: '#7048e8',
        backgroundColor: '#f3f0ff',
        fillStyle: 'solid',
        strokeWidth: 2,
        strokeStyle: 'solid',
        roughness: 1,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: { type: 2, value: 8 },
        seed: 12355,
        versionNonce: 12355,
        isDeleted: false,
        boundElements: null,
        updated: 1,
        link: null,
        locked: false,
        version: 1
      },
      {
        id: 'cache-text',
        type: 'text',
        x: 485,
        y: 345,
        width: 30,
        height: 25,
        angle: 0,
        strokeColor: '#7048e8',
        backgroundColor: 'transparent',
        fillStyle: 'solid',
        strokeWidth: 1,
        strokeStyle: 'solid',
        roughness: 1,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: null,
        seed: 12356,
        versionNonce: 12356,
        isDeleted: false,
        boundElements: null,
        updated: 1,
        link: null,
        locked: false,
        version: 1,
        text: 'Cache',
        fontSize: 14,
        fontFamily: 1,
        textAlign: 'center',
        verticalAlign: 'middle',
        containerId: null,
        originalText: 'Cache',
        lineHeight: 1.25,
        baseline: 18
      },
      // Arrows
      // Client to Load Balancer
      {
        id: 'arrow-client-lb',
        type: 'arrow',
        x: 150,
        y: 180,
        width: 100,
        height: 0,
        angle: 0,
        strokeColor: '#495057',
        backgroundColor: 'transparent',
        fillStyle: 'solid',
        strokeWidth: 2,
        strokeStyle: 'solid',
        roughness: 1,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: { type: 2, value: 0 },
        seed: 12357,
        versionNonce: 12357,
        isDeleted: false,
        boundElements: null,
        updated: 1,
        link: null,
        locked: false,
        version: 1,
        points: [[0, 0], [100, 0]],
        lastCommittedPoint: [100, 0],
        startBinding: null,
        endBinding: null,
        startArrowhead: null,
        endArrowhead: 'arrow'
      },
      // Load Balancer to Web Servers
      {
        id: 'arrow-lb-ws1',
        type: 'arrow',
        x: 350,
        y: 170,
        width: 100,
        height: -40,
        angle: 0,
        strokeColor: '#495057',
        backgroundColor: 'transparent',
        fillStyle: 'solid',
        strokeWidth: 2,
        strokeStyle: 'solid',
        roughness: 1,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: { type: 2, value: 0 },
        seed: 12358,
        versionNonce: 12358,
        isDeleted: false,
        boundElements: null,
        updated: 1,
        link: null,
        locked: false,
        version: 1,
        points: [[0, 0], [100, -40]],
        lastCommittedPoint: [100, -40],
        startBinding: null,
        endBinding: null,
        startArrowhead: null,
        endArrowhead: 'arrow'
      },
      {
        id: 'arrow-lb-ws2',
        type: 'arrow',
        x: 350,
        y: 190,
        width: 100,
        height: 40,
        angle: 0,
        strokeColor: '#495057',
        backgroundColor: 'transparent',
        fillStyle: 'solid',
        strokeWidth: 2,
        strokeStyle: 'solid',
        roughness: 1,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: { type: 2, value: 0 },
        seed: 12359,
        versionNonce: 12359,
        isDeleted: false,
        boundElements: null,
        updated: 1,
        link: null,
        locked: false,
        version: 1,
        points: [[0, 0], [100, 40]],
        lastCommittedPoint: [100, 40],
        startBinding: null,
        endBinding: null,
        startArrowhead: null,
        endArrowhead: 'arrow'
      },
      // Web Servers to Database
      {
        id: 'arrow-ws-db',
        type: 'arrow',
        x: 550,
        y: 180,
        width: 100,
        height: 0,
        angle: 0,
        strokeColor: '#495057',
        backgroundColor: 'transparent',
        fillStyle: 'solid',
        strokeWidth: 2,
        strokeStyle: 'solid',
        roughness: 1,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: { type: 2, value: 0 },
        seed: 12360,
        versionNonce: 12360,
        isDeleted: false,
        boundElements: null,
        updated: 1,
        link: null,
        locked: false,
        version: 1,
        points: [[0, 0], [100, 0]],
        lastCommittedPoint: [100, 0],
        startBinding: null,
        endBinding: null,
        startArrowhead: null,
        endArrowhead: 'arrow'
      },
      // Web Servers to Cache
      {
        id: 'arrow-ws-cache',
        type: 'arrow',
        x: 500,
        y: 260,
        width: 0,
        height: 60,
        angle: 0,
        strokeColor: '#495057',
        backgroundColor: 'transparent',
        fillStyle: 'solid',
        strokeWidth: 2,
        strokeStyle: 'solid',
        roughness: 1,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: { type: 2, value: 0 },
        seed: 12361,
        versionNonce: 12361,
        isDeleted: false,
        boundElements: null,
        updated: 1,
        link: null,
        locked: false,
        version: 1,
        points: [[0, 0], [0, 60]],
        lastCommittedPoint: [0, 60],
        startBinding: null,
        endBinding: null,
        startArrowhead: null,
        endArrowhead: 'arrow'
      }
    ];
  };

  return (
    <div className="App">
      <div 
        className={`canvas-container ${isDrawerOpen ? 'drawer-open' : 'drawer-closed'}`}
        style={{ '--drawer-width': `${isDrawerOpen ? drawerWidth : 20}px` } as React.CSSProperties}
      >
        <div className={`excalidraw-wrapper ${isDrawerOpen ? 'with-drawer' : ''}`}>
          <Excalidraw 
            initialData={{ 
              elements: createBitlySystemDiagram() as readonly ExcalidrawElement[],
              appState: { viewBackgroundColor: "#ffffff" }
            }}
            onChange={useCallback((elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
              // Always update the state, even during initialization
              setExcalidrawElements(elements);
              setExcalidrawAppState(appState);
              setExcalidrawFiles(files);
              
              // Mark initialization as complete after first change
              if (isInitializing.current) {
                isInitializing.current = false;
              }
            }, [])}
          />
        </div>
        {isDrawerOpen && (
          <div 
            className="resize-handle"
            onMouseDown={handleMouseDown}
          />
        )}
        <ProblemDrawer
          appState={appState}
          isOpen={isDrawerOpen}
          user={user || undefined}
          onSignOut={signOut}
          onProblemSelect={handleProblemSelect}
          onBackToProblems={handleBackToProblems}
          style={{ width: isDrawerOpen ? `${drawerWidth}px` : '20px' }}
        />
        <DrawerToggle
          isOpen={isDrawerOpen}
          onToggle={handleDrawerToggle}
          isMobile={false}
        />
        <RecordButton 
          onTranscriptionSubmit={handleTranscriptionSubmit} 
          disabled={appState.currentState !== ApplicationState.PROBLEM_PRESENTATION}
        />
        
        {/* Show compact processing indicator when processing submission */}
        {isProcessingSubmission && (
          <ProcessingIndicator variant="compact" />
        )}
      </div>
    </div>
  );
}

export default DrawCanvas;