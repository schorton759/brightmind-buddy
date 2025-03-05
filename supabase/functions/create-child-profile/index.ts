
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
    console.log("Create child profile function started");
    
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({ error: "Server configuration error - missing environment variables" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // This client will bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the request body
    let requestData;
    try {
      requestData = await req.json() as CreateChildProfileRequest;
      console.log("Request data:", JSON.stringify(requestData));
    } catch (error) {
      console.error("Error parsing request JSON:", error.message);
      return new Response(
        JSON.stringify({ error: "Invalid request format - could not parse JSON" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { username, age_group, parent_id } = requestData;
    
    if (!username || !age_group || !parent_id) {
      console.error("Missing required fields:", { username, age_group, parent_id });
      return new Response(
        JSON.stringify({ error: "Missing required fields: username, age_group, or parent_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Creating child profile for ${username} with age group ${age_group}`);
    
    // First, create a temporary auth user for the child
    // Generate a random email that won't be used (it's just for the database)
    const randomId = crypto.randomUUID();
    const tempEmail = `temp-${randomId}@example.com`;
    const tempPassword = crypto.randomUUID(); // This won't be used either
    
    console.log(`Creating temporary auth user with email: ${tempEmail}`);
    
    // Create the auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: tempEmail,
      password: tempPassword,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        username,
        user_type: 'child',
        age_group
      }
    });
    
    if (authError) {
      console.error('Error creating auth user:', authError);
      return new Response(
        JSON.stringify({ error: `Failed to create auth user: ${authError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const childId = authData.user.id;
    console.log(`Auth user created with ID: ${childId}`);
    
    // The profile should be created automatically via trigger, but let's verify it exists
    const { data: profileData, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', childId)
      .single();
      
    if (profileCheckError) {
      console.error('Error verifying profile:', profileCheckError);
      return new Response(
        JSON.stringify({ error: `Failed to verify profile: ${profileCheckError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!profileData) {
      console.error('Profile not created automatically, attempting manual creation');
      
      // If the profile doesn't exist for some reason, create it manually
      const { data: manualProfileData, error: manualProfileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: childId,
          username,
          user_type: 'child',
          age_group,
        })
        .select('*')
        .single();
        
      if (manualProfileError) {
        console.error('Error creating profile manually:', manualProfileError);
        return new Response(
          JSON.stringify({ error: `Failed to create profile: ${manualProfileError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.log('Profile created manually:', manualProfileData);
    } else {
      console.log('Profile created automatically:', profileData);
    }
    
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
        childProfile: profileData || null 
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
