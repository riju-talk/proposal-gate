import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with service role key for admin operations
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const users = [
      {
        email: 'admin@university.edu',
        password: 'admin123',
        username: 'admin',
        full_name: 'System Administrator'
      },
      {
        email: 'coordinator@university.edu', 
        password: 'coord123',
        username: 'coordinator',
        full_name: 'Event Coordinator'
      }
    ];

    const results = [];

    for (const user of users) {
      // Create auth user
      const { data: authUser, error: authError } = await supabaseServiceRole.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true
      });

      if (authError) {
        console.error(`Error creating auth user for ${user.email}:`, authError);
        results.push({ email: user.email, error: authError.message });
        continue;
      }

      // Update profile with auth user ID
      const { error: profileError } = await supabaseServiceRole
        .from('profiles')
        .update({ id: authUser.user.id })
        .eq('email', user.email);

      if (profileError) {
        console.error(`Error updating profile for ${user.email}:`, profileError);
        results.push({ email: user.email, error: profileError.message });
        continue;
      }

      results.push({ email: user.email, success: true, user_id: authUser.user.id });
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});