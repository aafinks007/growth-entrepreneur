import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cbewypnoboyaknagckpq.supabase.co'
const supabaseAnonKey = 'sb_publishable_KbKBwROxnhqUpauBF_CYVQ_NlJG5dov'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
