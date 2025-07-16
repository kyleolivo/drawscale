import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MAX_CHUNK_SIZE = 24 * 1024 * 1024; // 24MB to be safe under 25MB limit

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the audio file from the form data
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: 'No audio file provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Processing audio file: ${audioFile.name}, size: ${audioFile.size} bytes`);

    // If file is small enough, process it directly
    if (audioFile.size <= MAX_CHUNK_SIZE) {
      const openaiFormData = new FormData()
      openaiFormData.append('file', audioFile)
      openaiFormData.append('model', 'whisper-1')
      openaiFormData.append('response_format', 'json')

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: openaiFormData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('OpenAI API error:', errorText)
        return new Response(
          JSON.stringify({ 
            error: 'Transcription failed',
            details: response.status === 429 ? 'Rate limit exceeded' : 'Service error'
          }),
          { 
            status: response.status, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const transcription = await response.json()
      return new Response(
        JSON.stringify({ 
          text: transcription.text,
          success: true 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // For large files, we need to split them into chunks
    // This is a simplified approach - for production, you'd want to use
    // audio processing libraries to split at proper boundaries
    console.log(`File too large (${(audioFile.size / 1024 / 1024).toFixed(2)}MB), splitting into chunks...`);
    
    const audioBuffer = await audioFile.arrayBuffer();
    const chunks = [];
    const chunkCount = Math.ceil(audioFile.size / MAX_CHUNK_SIZE);
    
    for (let i = 0; i < chunkCount; i++) {
      const start = i * MAX_CHUNK_SIZE;
      const end = Math.min(start + MAX_CHUNK_SIZE, audioFile.size);
      const chunkBuffer = audioBuffer.slice(start, end);
      
      const chunkBlob = new Blob([chunkBuffer], { type: audioFile.type });
      const chunkFile = new File([chunkBlob], `chunk_${i}.webm`, { type: audioFile.type });
      
      chunks.push(chunkFile);
    }

    console.log(`Split into ${chunks.length} chunks`);

    // Transcribe each chunk
    const transcriptions = [];
    for (let i = 0; i < chunks.length; i++) {
      console.log(`Transcribing chunk ${i + 1}/${chunks.length}...`);
      
      const openaiFormData = new FormData()
      openaiFormData.append('file', chunks[i])
      openaiFormData.append('model', 'whisper-1')
      openaiFormData.append('response_format', 'json')

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: openaiFormData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`OpenAI API error for chunk ${i}:`, errorText)
        return new Response(
          JSON.stringify({ 
            error: `Transcription failed for chunk ${i}`,
            details: response.status === 429 ? 'Rate limit exceeded' : 'Service error'
          }),
          { 
            status: response.status, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const transcription = await response.json()
      transcriptions.push(transcription.text);
      
      // Add a small delay between chunks to avoid rate limiting
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Combine all transcriptions
    const combinedText = transcriptions.join(' ');

    return new Response(
      JSON.stringify({ 
        text: combinedText,
        success: true,
        chunks_processed: chunks.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in transcribe-chunked function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})