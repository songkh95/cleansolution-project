// Supabase Configuration
const SUPABASE_URL = 'https://sjrvigfoztllubjpwnoz.supabase.co';
// 제공된 키 사용 (언더바 2개 포함)
const SUPABASE_KEY = 'sb_publishable__45yxFL18jgN7gUy2YQzIA_Wl2i9-gz';

// 전역 객체로 초기화
window.supabaseClient = null;

if (typeof supabase !== 'undefined') {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✅ Supabase Client Initialized');
} else {
    console.error('❌ Supabase SDK not loaded');
}