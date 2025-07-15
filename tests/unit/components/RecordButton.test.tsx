import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecordButton from '../../../src/components/RecordButton';

// Mock MediaRecorder and related APIs
interface MockMediaRecorder {
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  ondataavailable: ((event: { data: Blob }) => void) | null;
  onstop: (() => void) | null;
}

const mockMediaRecorder: MockMediaRecorder = {
  start: vi.fn(),
  stop: vi.fn(),
  ondataavailable: null,
  onstop: null,
};

const mockTrack = { stop: vi.fn() };
const mockStream = {
  getTracks: vi.fn(() => [mockTrack]),
};

// Global mocks
Object.defineProperty(global, 'MediaRecorder', {
  writable: true,
  value: vi.fn().mockImplementation(() => mockMediaRecorder),
});

Object.defineProperty(global.navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn(),
  },
});

// Mock alert
Object.defineProperty(global, 'alert', {
  writable: true,
  value: vi.fn(),
});

describe('RecordButton', () => {
  const mockOnTranscriptionSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockTrack.stop.mockClear();
    mockStream.getTracks.mockClear();
    // Reset MediaRecorder mock
    (global.MediaRecorder as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockMediaRecorder);
    (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockResolvedValue(mockStream);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders record button with microphone icon', () => {
    render(<RecordButton onTranscriptionSubmit={mockOnTranscriptionSubmit} />);
    
    const button = screen.getByRole('button', { name: /start recording/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('record-button');
    
    // Check for SVG microphone icon
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has correct initial state', () => {
    render(<RecordButton onTranscriptionSubmit={mockOnTranscriptionSubmit} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Start recording');
    expect(button).not.toHaveClass('recording');
  });

  it('starts recording when clicked', async () => {
    render(<RecordButton onTranscriptionSubmit={mockOnTranscriptionSubmit} />);
    
    const button = screen.getByRole('button');
    
    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
      expect(global.MediaRecorder).toHaveBeenCalledWith(mockStream);
      expect(mockMediaRecorder.start).toHaveBeenCalled();
    });

    expect(button).toHaveClass('recording');
    expect(button).toHaveAttribute('aria-label', 'Stop recording');
  });

  it('stops recording when clicked while recording', async () => {
    render(<RecordButton onTranscriptionSubmit={mockOnTranscriptionSubmit} />);
    
    const button = screen.getByRole('button');
    
    // Start recording
    await act(async () => {
      fireEvent.click(button);
    });
    
    await waitFor(() => {
      expect(button).toHaveClass('recording');
    });

    // Stop recording
    await act(async () => {
      fireEvent.click(button);
    });
    
    expect(mockMediaRecorder.stop).toHaveBeenCalled();
    expect(button).not.toHaveClass('recording');
    expect(button).toHaveAttribute('aria-label', 'Start recording');
  });

  it('calls onTranscriptionSubmit when recording stops', async () => {
    render(<RecordButton onTranscriptionSubmit={mockOnTranscriptionSubmit} />);
    
    const button = screen.getByRole('button');
    
    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(mockMediaRecorder.start).toHaveBeenCalled();
    });

    // Simulate recording stop
    await act(async () => {
      if (mockMediaRecorder.onstop) {
        mockMediaRecorder.onstop();
      }
    });

    expect(mockOnTranscriptionSubmit).toHaveBeenCalledWith(expect.any(Blob));
    expect(mockTrack.stop).toHaveBeenCalled();
  });

  it('handles microphone access error gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Microphone access denied')
    );

    render(<RecordButton onTranscriptionSubmit={mockOnTranscriptionSubmit} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error accessing microphone:',
        expect.any(Error)
      );
      expect(global.alert).toHaveBeenCalledWith(
        'Unable to access microphone. Please check your permissions.'
      );
    });

    // Button should remain in non-recording state
    expect(button).not.toHaveClass('recording');
    expect(button).toHaveAttribute('aria-label', 'Start recording');

    consoleErrorSpy.mockRestore();
  });

  it('processes audio data correctly', async () => {
    render(<RecordButton onTranscriptionSubmit={mockOnTranscriptionSubmit} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockMediaRecorder.start).toHaveBeenCalled();
    });

    // Simulate data available event
    const mockAudioData = new Blob(['chunk1'], { type: 'audio/webm' });
    const mockEvent = { data: mockAudioData };
    
    if (mockMediaRecorder.ondataavailable) {
      mockMediaRecorder.ondataavailable(mockEvent);
    }

    // Simulate recording stop
    if (mockMediaRecorder.onstop) {
      mockMediaRecorder.onstop();
    }

    expect(mockOnTranscriptionSubmit).toHaveBeenCalledWith(expect.any(Blob));
  });

  it('ignores empty audio chunks', async () => {
    render(<RecordButton onTranscriptionSubmit={mockOnTranscriptionSubmit} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockMediaRecorder.start).toHaveBeenCalled();
    });

    // Simulate empty data event  
    const mockEvent = { data: new Blob([], { type: 'audio/webm' }) };
    
    if (mockMediaRecorder.ondataavailable) {
      mockMediaRecorder.ondataavailable(mockEvent);
    }

    // Simulate recording stop
    if (mockMediaRecorder.onstop) {
      mockMediaRecorder.onstop();
    }

    // Should still call onTranscriptionSubmit with blob (even if empty)
    expect(mockOnTranscriptionSubmit).toHaveBeenCalledWith(expect.any(Blob));
  });

  it('does not stop recording if not currently recording', async () => {
    render(<RecordButton onTranscriptionSubmit={mockOnTranscriptionSubmit} />);
    
    const button = screen.getByRole('button');
    
    // Start recording
    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(mockMediaRecorder.start).toHaveBeenCalled();
    });

    // Stop recording
    await act(async () => {
      fireEvent.click(button);
    });

    expect(mockMediaRecorder.stop).toHaveBeenCalledTimes(1);

    // Try to stop again when not recording - should not call stop again
    await act(async () => {
      fireEvent.click(button); // This should start again, not stop
    });

    // The stop method should still only be called once
    expect(mockMediaRecorder.stop).toHaveBeenCalledTimes(1);
  });
});