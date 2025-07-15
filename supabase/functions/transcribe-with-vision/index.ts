import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    // Get the audio and image files from the form data
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const imageFile = formData.get('image') as File

    if (!audioFile || !imageFile) {
      return new Response(
        JSON.stringify({ error: 'Both audio and image files are required' }),
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
        JSON.stringify({ 
          error: 'OpenAI API key not configured',
          debug: {
            availableEnvVars: Object.keys(Deno.env.toObject()),
            lookingFor: 'OPENAI_API_KEY'
          }
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Step 1: Transcribe audio using Whisper API
    const audioFormData = new FormData()
    audioFormData.append('file', audioFile)
    audioFormData.append('model', 'whisper-1')
    audioFormData.append('response_format', 'json')

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: audioFormData,
    })

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text()
      console.error('OpenAI Transcription API error:', errorText)
      return new Response(
        JSON.stringify({ 
          error: 'Audio transcription failed',
          details: transcriptionResponse.status === 429 ? 'Rate limit exceeded' : 'Service error'
        }),
        { 
          status: transcriptionResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const transcription = await transcriptionResponse.json()
    const transcribedText = transcription.text

    // Step 2: Convert image to base64 for Vision API
    const imageBytes = await imageFile.arrayBuffer()
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBytes)))

    // Step 3: Analyze image with Vision API and combine with transcription
    const visionPayload = {
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `I'm sharing a system design diagram I've drawn along with audio commentary. Please analyze both and provide insightful feedback.

Audio Commentary: "${transcribedText}"

Please:
1. Describe what you see in the diagram
2. Analyze how the audio commentary relates to the visual elements
3. Provide constructive feedback on the system design
4. Suggest improvements or highlight potential issues
5. Rate the overall design approach (1-10) and explain why

Be specific, helpful, and encouraging in your analysis.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    }

    const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(visionPayload),
    })

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text()
      console.error('OpenAI Vision API error:', errorText)
      return new Response(
        JSON.stringify({ 
          error: 'Vision analysis failed',
          details: visionResponse.status === 429 ? 'Rate limit exceeded' : 'Service error'
        }),
        { 
          status: visionResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const visionResult = await visionResponse.json()
    const analysis = visionResult.choices[0]?.message?.content || 'No analysis available'

    return new Response(
      JSON.stringify({ 
        transcription: transcribedText,
        analysis: analysis,
        success: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in transcribe-with-vision function:', error)
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