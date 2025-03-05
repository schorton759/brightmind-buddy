
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

interface CreateChildProfileRequest {
  username: string;
  age_group: string;
  parent_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      throw new Error("Server configuration error");
    }
    
    // This client will bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the request body
    const { username, age_group, parent_id } = await req.json() as CreateChildProfileRequest;
    
    if (!username || !age_group || !parent_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Creating child profile for ${username} with age group ${age_group}`);
    
    // Generate a UUID for the child
    const childId = crypto.randomUUID();
    console.log(`Generated child ID: ${childId}`);
    
    // Create the child profile with the admin client
    const { data: childProfileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: childId,
        username,
        user_type: 'child',
        age_group,
      })
      .select('*')
      .single();
      
    if (profileError) {
      console.error('Error creating child profile:', profileError);
      return new Response(
        JSON.stringify({ error: `Failed to create child profile: ${profileError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log('Child profile created successfully:', childProfileData);
    
    // Create the family connection
    const { error: connectionError } = await supabaseAdmin
      .from('family_connections')
      .insert({
        parent_id,
        child_id: childId,
      });
      
    if (connectionError) {
      console.error('Error creating family connection:', connectionError);
      return new Response(
        JSON.stringify({ error: `Failed to create family connection: ${connectionError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log('Family connection created successfully');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        childProfile: childProfileData || null 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in create-child-profile function:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
