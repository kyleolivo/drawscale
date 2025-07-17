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

    // Get the audio, image files, and problem context from the form data
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const imageFile = formData.get('image') as File
    const problemContextJson = formData.get('problemContext') as string

    if (!audioFile || !imageFile) {
      return new Response(
        JSON.stringify({ error: 'Both audio and image files are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse problem context (required)
    if (!problemContextJson) {
      return new Response(
        JSON.stringify({ error: 'Problem context is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let problemContext
    try {
      problemContext = JSON.parse(problemContextJson)
    } catch (parseError) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid problem context format',
          details: parseError.message 
        }),
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

    // Step 3: Create comprehensive evaluation prompt
    const createEvaluationPrompt = (transcribedText: string, problemContext: {
      title: string;
      description: string;
      content: string;
      judgementCriteria: string;
    }) => {
      return `You are an expert software architect and senior technical interviewer evaluating a system design solution.

**Problem Context:**
Problem: ${problemContext.title}
Description: ${problemContext.description}
Requirements: ${problemContext.content}
Judgment Criteria: ${problemContext.judgementCriteria}

**Candidate Submission:**
- Visual Diagram: [Attached image of their system design]
- Audio Commentary: "${transcribedText}"

**Evaluation Framework:**
As a senior-level assessment, provide comprehensive analysis across these dimensions:

**1. Problem Comprehension & Requirements**
- Assess understanding of the core problem and business context
- Identify which functional requirements were addressed and which were missed
- Evaluate consideration of scale, constraints, and edge cases
- Detail any non-functional requirements that should have been considered

**2. System Architecture & Design**
- Analyze the overall architecture structure and soundness
- Examine system boundaries and component responsibilities
- Review adherence to established architectural patterns
- Assess separation of concerns and abstraction layers
- Evaluate how well the design handles expected scale and load

**3. Technical Depth & Accuracy**
- Review technical soundness of proposed solutions
- Assess depth of understanding of chosen components
- Analyze data flows, APIs, and interface designs
- Evaluate database design appropriateness
- Review caching, queuing, and storage strategies

**4. Scalability & Performance**
- Examine growth handling capabilities for users, data, and traffic
- Identify bottlenecks and their mitigation strategies
- Assess load balancing and distribution approaches
- Review horizontal scaling considerations
- Analyze performance optimization strategies

**5. Commentary-Design Alignment**
- Evaluate how comprehensively the verbal commentary describes the visual diagram
- Identify components, connections, and data flows missing from the audio explanation
- Assess consistency between drawn elements and verbal explanations
- Analyze whether the candidate walked through their system architecture as depicted

**6. Reliability & Fault Tolerance**
- Identify single points of failure and their mitigation strategies
- Assess redundancy and failover mechanisms
- Review handling of partial failures and degraded states
- Evaluate monitoring, alerting, and observability considerations

**7. Communication & Reasoning**
- Assess clarity of design decision explanations
- Review articulation of trade-offs and alternative approaches
- Evaluate logical structure and reasoning quality
- Assess awareness of complexity and implementation challenges

**Analysis Approach:**
For each dimension, provide thorough analysis that identifies both strengths and gaps. When elements are missing or inadequately addressed, explain in detail:
- What specifically should have been included
- Why these elements are important for this type of system
- How their absence impacts the overall design
- Concrete examples of what a senior-level approach would include

**Detailed Feedback Areas:**

**1. Visual Design Analysis**
- Comprehensively describe what is shown in the diagram
- Identify all components, connections, and data flows depicted
- Note any missing critical components that should be present
- Assess the clarity and completeness of the visual representation

**2. Commentary Completeness Assessment**
- Compare the verbal explanation against the visual elements
- Identify specific diagram components not mentioned in the audio
- Highlight inconsistencies between visual and verbal descriptions
- Assess the depth and technical accuracy of the explanations provided

**3. Missing Critical Elements**
For each missing element, provide detailed explanation including:
- **What was missed**: Specific component, pattern, or consideration
- **Why it matters**: Technical and business importance
- **Impact of omission**: How this affects system reliability, scalability, or functionality
- **Senior-level expectation**: What a experienced architect would have included
- **Implementation guidance**: Concrete suggestions for addressing the gap

**4. Technical Depth Analysis**
- Evaluate the sophistication of proposed solutions
- Identify areas where deeper technical understanding should be demonstrated
- Highlight opportunities for more advanced architectural patterns
- Assess consideration of real-world implementation challenges

**5. Problem-Specific Evaluation**
- Analyze how well the solution addresses the unique challenges of this specific problem
- Identify domain-specific considerations that were missed
- Evaluate understanding of the business context and user needs
- Assess scalability requirements specific to this use case

**Response Format:**
Provide a comprehensive analysis that serves as both evaluation and learning opportunity. Focus on detailed explanations that help the candidate understand not just what was missing, but why it matters and how to improve. Use specific examples and technical details to illustrate points.`
    }

    // Step 4: Analyze image with Vision API and combine with transcription
    const visionPayload = {
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: createEvaluationPrompt(transcribedText, problemContext)
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
      max_tokens: 2000
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