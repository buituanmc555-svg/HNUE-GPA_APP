import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tiomntwfcjzcckmjcbib.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpb21udHdmY2p6Y2NrbWpjYmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2ODc2MDIsImV4cCI6MjA5NDI2MzYwMn0.mwnEaCXdRw3wWW5QZlnsawrOMBR4d246BB1FubqIMic'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
