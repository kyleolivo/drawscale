import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Function to call the transcribe edge function
export async function transcribeAudio(audioBlob: Blob): Promise<{ text: string }> {
  console.log('Transcribing audio...', {
    size: audioBlob.size,
    type: audioBlob.type,
    supabaseUrl: supabaseUrl
  })
  
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.webm')
  
  try {
    const { data, error } = await supabase.functions.invoke('transcribe', {
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