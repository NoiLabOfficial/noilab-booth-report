import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const service = process.env.SUPABASE_SERVICE_ROLE!; // 서버에서만 사용

export const supabaseAdmin = createClient(url, service, {
  auth: { persistSession: false },
});
