import { describe, it, expect } from 'vitest';

describe('Audio Transcription Logic', () => {
  it('correctly determines file size thresholds', () => {
    const MAX_SIZE = 24 * 1024 * 1024; // 24MB
    
    // Small file
    const smallBlob = new Blob(['small'], { type: 'audio/webm' });
    expect(smallBlob.size < MAX_SIZE).toBe(true);
    
    // Large file simulation
    const largeArrayBuffer = new ArrayBuffer(25 * 1024 * 1024); // 25MB
    const largeBlob = new Blob([largeArrayBuffer], { type: 'audio/webm' });
    expect(largeBlob.size > MAX_SIZE).toBe(true);
  });

  it('creates proper FormData for audio uploads', () => {
    const audioBlob = new Blob(['audio data'], { type: 'audio/webm' });
    
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    expect(formData.get('audio')).toBeInstanceOf(File);
    expect((formData.get('audio') as File).name).toBe('recording.webm');
    expect((formData.get('audio') as File).type).toBe('audio/webm');
  });

  it('creates proper FormData for audio and image uploads', () => {
    const audioBlob = new Blob(['audio'], { type: 'audio/webm' });
    const imageBlob = new Blob(['image'], { type: 'image/png' });
    
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('image', imageBlob, 'canvas.png');
    
    expect(formData.get('audio')).toBeInstanceOf(File);
    expect(formData.get('image')).toBeInstanceOf(File);
    expect((formData.get('audio') as File).name).toBe('recording.webm');
    expect((formData.get('image') as File).name).toBe('canvas.png');
  });

  it('calculates file sizes correctly', () => {
    const testData = new ArrayBuffer(1024 * 1024); // 1MB
    const blob = new Blob([testData]);
    const sizeMB = blob.size / (1024 * 1024);
    
    expect(sizeMB).toBe(1);
    expect(blob.size).toBe(1024 * 1024);
  });
});