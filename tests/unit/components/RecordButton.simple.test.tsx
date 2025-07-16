import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecordButton from '../../../src/components/RecordButton';

// Simple mock implementation
const mockGetUserMedia = vi.fn();

describe('RecordButton Core Functionality', () => {
  const mockOnTranscriptionSubmit = vi.fn();
  
  beforeEach(() => {
    // Setup basic mocks
    global.navigator.mediaDevices = {
      getUserMedia: mockGetUserMedia,
    } as MediaDevices;
    
    global.MediaRecorder = class {
      state = 'inactive';
      ondataavailable: ((event: { data: Blob }) => void) | null = null;
      onstop: (() => void) | null = null;
      
      constructor(public stream: MediaStream, public options?: MediaRecorderOptions) {}
      
      start() {
        this.state = 'recording';
      }
      
      stop() {
        this.state = 'inactive';
        if (this.onstop) {
          this.onstop();
        }
      }
    } as unknown as typeof MediaRecorder;
    
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [{
        stop: vi.fn()
      }]
    });
    
    mockOnTranscriptionSubmit.mockClear();
  });

  it('renders record button correctly', () => {
    render(<RecordButton onTranscriptionSubmit={mockOnTranscriptionSubmit} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('record-button');
    expect(button).toHaveAttribute('aria-label', 'Start recording');
  });

  it('changes state when clicked', async () => {
    render(<RecordButton onTranscriptionSubmit={mockOnTranscriptionSubmit} />);
    
    const button = screen.getByRole('button');
    
    // Click to start recording
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledWith({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
    });
  });

  it('uses correct MediaRecorder options', async () => {
    let capturedOptions: MediaRecorderOptions | undefined;
    
    global.MediaRecorder = class {
      constructor(stream: MediaStream, options?: MediaRecorderOptions) {
        capturedOptions = options;
      }
      start() {}
      stop() {}
    } as unknown as typeof MediaRecorder;
    
    render(<RecordButton onTranscriptionSubmit={mockOnTranscriptionSubmit} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(capturedOptions).toEqual({
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 16000
      });
    });
  });

  it('handles microphone permission errors', async () => {
    mockGetUserMedia.mockRejectedValueOnce(new Error('Permission denied'));
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<RecordButton onTranscriptionSubmit={mockOnTranscriptionSubmit} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Unable to access microphone. Please check your permissions.'
      );
    });
    
    alertSpy.mockRestore();
  });
});