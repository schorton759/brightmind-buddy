
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChildCredentialsRequest {
  childId: string;
  username: string;
  ageGroup?: string | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Create child credentials function started");
    
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
      requestData = await req.json() as ChildCredentialsRequest;
      console.log("Request data:", JSON.stringify(requestData));
    } catch (error) {
      console.error("Error parsing request JSON:", error.message);
      return new Response(
        JSON.stringify({ error: "Invalid request format - could not parse JSON" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { childId, username, ageGroup } = requestData;
    
    if (!childId || !username) {
      console.error("Missing required fields:", { childId, username });
      return new Response(
        JSON.stringify({ error: "Missing required fields: childId or username" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Creating credentials for child: ${username} (${childId})`);
    
    // Generate a random password
    const randomPassword = crypto.randomUUID().substring(0, 8);
    
    // Get the current user's email and details from ID - no need to create a new auth user
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(childId);
    
    if (userError) {
      console.error("Error getting user:", userError);
      return new Response(
        JSON.stringify({ error: `Error getting user: ${userError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!userData || !userData.user) {
      console.error("User not found:", childId);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For child accounts, we're using their existing auth user (created by the create-child-profile function)
    // We'll update the password to the random one we generated
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      childId,
      { password: randomPassword }
    );
    
    if (updateError) {
      console.error("Error updating user password:", updateError);
      return new Response(
        JSON.stringify({ error: `Error updating user password: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get the email to return - this will be the temporary one created in the create-child-profile function
    const email = userData.user.email;
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        credentials: {
          username: username,
          email: email,
          password: randomPassword
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in create-child-credentials function:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
