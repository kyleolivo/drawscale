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

    // Parse problem context if provided
    let problemContext = null
    if (problemContextJson) {
      try {
        problemContext = JSON.parse(problemContextJson)
      } catch (error) {
        console.warn('Failed to parse problem context:', error)
      }
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
    } | null) => {
      if (!problemContext) {
        // Fallback to generic prompt if no problem context
        return `I'm sharing a system design diagram I've drawn along with audio commentary. Please analyze both and provide insightful feedback.

Audio Commentary: "${transcribedText}"

Please:
1. Describe what you see in the diagram
2. Analyze how the audio commentary relates to the visual elements
3. Provide constructive feedback on the system design
4. Suggest improvements or highlight potential issues
5. Rate the overall design approach (1-10) and explain why

Be specific, helpful, and encouraging in your analysis.`
      }

      return `You are an expert software architect and senior technical interviewer evaluating a system design solution.

**PROBLEM CONTEXT:**
Problem: ${problemContext.title}
Description: ${problemContext.description}
Requirements: ${problemContext.content}
Judgment Criteria: ${problemContext.judgementCriteria}

**CANDIDATE SUBMISSION:**
- Visual Diagram: [Attached image of their system design]
- Audio Commentary: "${transcribedText}"

**EVALUATION FRAMEWORK:**
As a senior-level assessment, evaluate the solution across these dimensions:

**1. PROBLEM COMPREHENSION & REQUIREMENTS (15%)**
- Does the candidate demonstrate clear understanding of the core problem?
- Have they identified and addressed the key functional requirements?
- Do they understand the scale, constraints, and business context?
- Are edge cases and non-functional requirements considered?

**2. SYSTEM ARCHITECTURE & DESIGN (20%)**
- Is the overall architecture sound and well-structured?
- Are system boundaries and component responsibilities clearly defined?
- Does the design follow established architectural patterns appropriately?
- Is there proper separation of concerns and abstraction layers?
- How well does the design handle the expected scale and load?

**3. TECHNICAL DEPTH & ACCURACY (15%)**
- Are the proposed technologies and solutions technically sound?
- Does the candidate demonstrate deep understanding of chosen components?
- Are data flows, APIs, and interfaces properly designed?
- Is the database design appropriate for the use case?
- Are caching, queuing, and storage strategies well-reasoned?

**4. SCALABILITY & PERFORMANCE (15%)**
- How does the system handle growth in users, data, and traffic?
- Are bottlenecks identified and addressed?
- Are load balancing and distribution strategies appropriate?
- Does the design support horizontal scaling where needed?
- Are performance optimization strategies discussed?

**5. COMMENTARY-DESIGN ALIGNMENT (15%)**
- Does the verbal commentary comprehensively describe what is shown in the visual diagram?
- Are all major components, connections, and data flows mentioned in the audio explanation?
- Does the candidate walk through the system architecture as depicted in their drawing?
- Is there consistency between what they drew and what they explain verbally?
- **CRITICAL**: If commentary is superficial, incomplete, or doesn't match the visual design, this significantly impacts the overall score.

**6. RELIABILITY & FAULT TOLERANCE (10%)**
- Are single points of failure identified and mitigated?
- Does the design include appropriate redundancy and failover?
- How does the system handle partial failures and degraded states?
- Are monitoring, alerting, and observability considered?

**7. COMMUNICATION & REASONING (10%)**
- How clearly does the candidate explain their design decisions?
- Do they articulate trade-offs and alternative approaches?
- Is their reasoning logical and well-structured?
- Do they demonstrate awareness of complexity and implementation challenges?

**SENIOR-LEVEL EXPECTATIONS:**
- Deep technical knowledge beyond surface-level solutions
- Proactive identification of potential issues and trade-offs
- Consideration of operational, security, and maintenance aspects
- Ability to reason about system evolution and future requirements
- Understanding of real-world implementation challenges
- **CRITICAL**: Comprehensive verbal explanation that matches and thoroughly describes the visual design

**SCORING GUIDANCE:**
- **Commentary-Design Mismatch Penalty**: If the audio commentary fails to comprehensively describe the visual design or contains significant inconsistencies, cap the overall score at 6/10 regardless of other strengths
- **Incomplete Commentary Penalty**: If the commentary is superficial and doesn't walk through major system components shown in the diagram, reduce the overall score by 2-3 points
- **Excellence Bonus**: Award higher scores (8-10) only when commentary demonstrates deep understanding and thoroughly explains all aspects of the visual design

**PROVIDE:**
1. **Overall Assessment**: Score from 1-10 with clear justification
2. **Commentary-Design Alignment Analysis**: Specific assessment of how well the verbal explanation matches and describes the visual design
3. **Strengths**: What the candidate did exceptionally well
4. **Areas for Improvement**: Specific gaps or weaknesses identified
5. **Missing Elements**: Critical components or considerations not addressed
6. **Technical Accuracy**: Correctness of proposed solutions and technologies
7. **Problem-Specific Evaluation**: How well the solution addresses this particular problem's unique challenges
8. **Senior-Level Readiness**: Assessment of whether this demonstrates senior-level system design capability

**TONE:** Be constructive but rigorous. This is a senior-level evaluation, so standards should be high. Pay special attention to the alignment between visual and verbal components - this is a critical indicator of the candidate's understanding and communication skills. Provide specific, actionable feedback that helps the candidate understand both what they did well and where they can improve.`
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