import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const service = process.env.SUPABASE_SERVICE_ROLE!; // 서버 전용 키

export const supabaseAdmin = createClient(url, service, {
  auth: { persistSession: false },
  db: { schema: 'v2' } // ★ 여기서 v2 스키마로 고정
});
