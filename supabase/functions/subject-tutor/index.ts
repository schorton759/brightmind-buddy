
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { corsHeaders } from "../_shared/cors.ts"

interface TutorRequest {
  userId: string;
  message: string;
  subject: string;
  ageGroup: string;
  apiKey?: string; // Optional OpenAI API key provided by parent
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId, message, subject, ageGroup, apiKey } = await req.json() as TutorRequest
    
    console.log(`Processing ${subject} tutor request for user ${userId}, age group ${ageGroup}`)
    
    // Determine which API key to use
    const OPENAI_API_KEY = apiKey || Deno.env.get('OPENAI_API_KEY')
    
    // Validate the API key format (basic check)
    if (!OPENAI_API_KEY) {
      console.log('Missing OpenAI API key for user:', userId);
      return new Response(
        JSON.stringify({ error: 'Missing API key. Please add your OpenAI API key in the parent settings.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Create system prompt based on subject and age group
    let systemPrompt = `You are a helpful ${subject} tutor for students in the ${ageGroup} age group. `
    
    if (subject === 'math') {
      systemPrompt += `You help with math concepts, problem-solving, and explaining mathematical ideas in a clear, 
      age-appropriate way. You can work through problems step-by-step and provide guidance without giving away answers immediately.
      Always encourage critical thinking and provide praise for effort.`
    } else if (subject === 'language') {
      systemPrompt += `You help with reading comprehension, writing, vocabulary, grammar, and language skills 
      appropriate for the ${ageGroup} age group. You provide explanations, examples, and constructive feedback 
      that helps the student improve their language abilities.`
    } else if (subject === 'science') {
      systemPrompt += `You help explain scientific concepts, theories, and experiments in an engaging and 
      age-appropriate way for ${ageGroup} students. You make complex ideas understandable and encourage 
      curiosity and critical thinking.`
    } else {
      systemPrompt += `You provide helpful, educational guidance on ${subject} topics appropriate for ${ageGroup} students.
      You're encouraging, patient, and focus on making learning engaging and fun.`
    }

    // Log the request details (excluding API key)
    console.log(`Sending ${subject} tutor request to OpenAI for user ${userId}`)

    try {
      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('OpenAI API error:', errorData)
        
        // Check for common API key errors
        if (errorData.error && errorData.error.message) {
          const errorMessage = errorData.error.message
          
          if (errorMessage.includes('API key')) {
            return new Response(
              JSON.stringify({ error: 'Invalid OpenAI API key. Please update your API key in the parent settings.' }),
              { 
                status: 401, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            )
          } else if (errorMessage.includes('rate limit')) {
            return new Response(
              JSON.stringify({ error: 'Rate limit exceeded. Please try again in a few moments.' }),
              { 
                status: 429, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            )
          }
          
          return new Response(
            JSON.stringify({ error: errorMessage }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }
        
        throw new Error('Failed to connect to OpenAI API')
      }

      const data = await response.json()
      const tutorResponse = data.choices[0].message.content
      console.log(`Successfully generated response for user ${userId}`)
      
      return new Response(
        JSON.stringify({ response: tutorResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (apiError) {
      console.error('Error calling OpenAI API:', apiError)
      return new Response(
        JSON.stringify({ error: 'Failed to connect to OpenAI. Please check your API key or try again later.' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  } catch (error) {
    console.error('Error processing tutor request:', error)
    
    return new Response(
      JSON.stringify({ error: 'Failed to process your request. Please try again.' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
