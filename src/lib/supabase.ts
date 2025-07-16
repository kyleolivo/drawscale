import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Function to call the transcribe edge function (supports chunking for large files)
export async function transcribeAudio(audioBlob: Blob): Promise<{ text: string }> {
  const MAX_SIZE = 24 * 1024 * 1024; // 24MB
  const sizeMB = audioBlob.size / (1024 * 1024);
  
  console.log('Transcribing audio...', {
    audioSize: audioBlob.size,
    audioSizeMB: sizeMB.toFixed(2),
    audioType: audioBlob.type,
    usingChunkedEndpoint: audioBlob.size > MAX_SIZE
  })
  
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.webm')
  
  try {
    // Use chunked endpoint for large files
    const endpoint = audioBlob.size > MAX_SIZE ? 'transcribe-chunked' : 'transcribe';
    
    const { data, error } = await supabase.functions.invoke(endpoint, {
      body: formData,
    })
    
    console.log('Supabase response:', { data, error })
    
    if (error) {
      console.error('Supabase function error:', error)
      throw new Error(error.message || 'Transcription failed')
    }
    
    if (!data || !data.text) {
      throw new Error('Invalid response from transcription service')
    }
    
    return data
  } catch (error) {
    console.error('Error calling Supabase function:', error)
    throw error
  }
}

// Function to call the transcribe and vision analysis edge function
export async function transcribeAudioWithImage(
  audioBlob: Blob, 
  imageBlob: Blob
): Promise<{ transcription: string; analysis: string }> {
  console.log('Transcribing audio and analyzing image...', {
    audioSize: audioBlob.size,
    audioType: audioBlob.type,
    imageSize: imageBlob.size,
    imageType: imageBlob.type,
    supabaseUrl: supabaseUrl
  })
  
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.webm')
  formData.append('image', imageBlob, 'canvas.png')
  
  try {
    const { data, error } = await supabase.functions.invoke('transcribe-with-vision', {
      body: formData,
    })
    
    console.log('Supabase response:', { data, error })
    
    if (error) {
      console.error('Supabase function error:', error)
      throw new Error(error.message || 'Transcription and vision analysis failed')
    }
    
    if (!data || !data.transcription || !data.analysis) {
      throw new Error('Invalid response from transcription and vision service')
    }
    
    return data
  } catch (error) {
    console.error('Error calling Supabase function:', error)
    throw error
  }
}