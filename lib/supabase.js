import { createClient } from '@supabase/supabase-js'

// Use the URL from the previous 'Overview' tab
const supabaseUrl = 'https://qolbmjxtgjlmbclisdib.supabase.co' 

// Paste the 'anon' 'public' key you just copied here
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvbGJtanh0Z2psbWJjbGlzZGliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4Mzk2NzcsImV4cCI6MjA5MjQxNTY3N30.DRy0wNsQCU3khHGNmVMAU60m9CLRZGu3ec7mpqpyRpY'

export const supabase = createClient(supabaseUrl, supabaseKey)