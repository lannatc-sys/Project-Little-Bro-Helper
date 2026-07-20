import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://owdgklljykiisbdodjap.supabase.co").trim();
const supabaseKey = (
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  "sb_publishable_jK19wxCzN2DASe9_7GZBlQ_FkmEmlOU"
).trim();

// Fail-fast validation check for missing or invalid Supabase credentials
if (!supabaseUrl || !supabaseUrl.startsWith("http")) {
  throw new Error("🚨 [Supabase Error] Invalid or missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
}

if (!supabaseKey || supabaseKey.includes("placeholder")) {
  throw new Error("🚨 [Supabase Error] Invalid or missing Supabase API Key (NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY).");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`
    }
  }
});
