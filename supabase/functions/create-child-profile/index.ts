
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
    
    // Create the auth user with more detailed error handling
    let authData;
    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: tempEmail,
        password: tempPassword,
        email_confirm: true, // Auto-confirm the email
        user_metadata: {
          username,
          user_type: 'child',
          age_group
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      authData = data;
      console.log("Auth user created successfully:", authData);
    } catch (error) {
      console.error('Error creating auth user:', error.message);
      return new Response(
        JSON.stringify({ error: `Failed to create auth user: ${error.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!authData || !authData.user || !authData.user.id) {
      console.error('Auth user data is incomplete or missing');
      return new Response(
        JSON.stringify({ error: "Failed to create auth user: User data is incomplete" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const childId = authData.user.id;
    console.log(`Auth user created with ID: ${childId}`);
    
    // Wait a moment to ensure the database trigger has time to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Explicit profile creation - we'll do this regardless of whether the trigger worked
    console.log("Explicitly creating profile for new user:", childId);
    try {
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: childId,
          username,
          user_type: 'child',
          age_group
        })
        .select('*')
        .single();
        
      if (profileError) {
        if (profileError.code === '23505') { // Duplicate key value violates unique constraint
          console.log('Profile already exists, this is likely due to the trigger. Proceeding...');
        } else {
          console.error('Error creating profile:', profileError);
          throw new Error(profileError.message);
        }
      } else {
        console.log('Profile created successfully:', profileData);
      }
    } catch (error) {
      // If there's an error but it's a duplicate key, we can proceed
      if (error.message && error.message.includes('duplicate key')) {
        console.log('Profile already exists due to trigger. Continuing to create family connection.');
      } else {
        console.error('Error in profile creation:', error.message);
        return new Response(
          JSON.stringify({ error: `Failed to create profile: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // Fetch the profile (either created by trigger or explicitly by us)
    const { data: fetchedProfile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', childId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      return new Response(
        JSON.stringify({ error: `Failed to verify profile: ${fetchError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!fetchedProfile) {
      console.error('Could not find profile after creation');
      return new Response(
        JSON.stringify({ error: "Profile creation verified but profile not found" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log('Profile verified:', fetchedProfile);
    
    // Create the family connection with better error handling
    try {
      const { error } = await supabaseAdmin
        .from('family_connections')
        .insert({
          parent_id,
          child_id: childId,
        });
        
      if (error) {
        throw new Error(error.message);
      }
      
      console.log('Family connection created successfully');
    } catch (error) {
      console.error('Error creating family connection:', error);
      return new Response(
        JSON.stringify({ error: `Failed to create family connection: ${error.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        childProfile: fetchedProfile || null 
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
