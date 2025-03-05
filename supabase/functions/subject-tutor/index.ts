
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const fallbackOpenAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, subject, ageGroup, apiKey } = await req.json();
    
    // Use provided API key if available, otherwise fall back to environment variable
    const openAIApiKey = apiKey || fallbackOpenAIApiKey;
    
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ 
          error: "No API key available. Please add an OpenAI API key in settings." 
        }), 
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Create appropriate system prompts based on subject and age group
    let systemPrompt = "";
    
    if (subject === "math") {
      systemPrompt = `You are a friendly and patient math tutor for children in the ${ageGroup} age group. 
      Explain concepts simply and clearly. Use age-appropriate language and examples.
      Focus on building confidence and making math fun. Break down problems into simple steps.
      For young children (8-10), use very simple language and concrete examples.
      For older children (10+), you can introduce more abstract concepts gradually.
      Always be encouraging and positive. Never give direct answers to homework problems,
      but guide the student through the process of solving it themselves.`;
    } else if (subject === "language") {
      systemPrompt = `You are a friendly and supportive language tutor for children in the ${ageGroup} age group.
      Help with reading comprehension, vocabulary, grammar, and writing skills.
      Explain concepts using age-appropriate language and examples.
      For young children (8-10), focus on basic language skills and use simple explanations.
      For older children (10+), you can discuss more complex language concepts.
      Always be encouraging and make learning language fun. Provide constructive feedback
      and suggest improvements rather than simply correcting mistakes.`;
    }

    console.log(`Processing ${subject} tutor request for ${ageGroup} age group`);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(data.error?.message || 'Failed to get response from AI');
    }
    
    const tutorResponse = data.choices[0].message.content;
    console.log('Tutor response generated successfully');

    return new Response(JSON.stringify({ response: tutorResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in subject-tutor function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
