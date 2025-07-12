import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  
  return new Response(
    JSON.stringify({
      hasOpenAIKey: !!openaiKey,
      keyPrefix: openaiKey ? openaiKey.substring(0, 7) + '...' : 'NOT SET',
      allEnvKeys: Object.keys(Deno.env.toObject()).sort()
    }),
    { 
      headers: { 'Content-Type': 'application/json' },
    }
  )
})