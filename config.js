// Thay thế bằng Project URL và Publishable/Anon Key từ dự án Supabase của thầy
window.SUPABASE_URL = "https://pazgsdhklzblkvrdewwz.supabase.co";
window.SUPABASE_KEY = "sb_publishable_8U7jYImsq89fZToxvNBg9g_ACGjrqQ1";

// Khởi tạo Supabase client
const { createClient } = supabase;
window.db = createClient(window.SUPABASE_URL, window.SUPABASE_KEY);