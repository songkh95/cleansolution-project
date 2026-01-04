(async function() {
    console.log("🏠 Home Module Loaded");

    // 1. Supabase에서 재고 부족 데이터 가져오기 (예시)
    if (window.supabaseClient) {
        const { count, error } = await window.supabaseClient
            .from('inventory')
            .select('*', { count: 'exact', head: true })
            .lt('stock', 3); // 재고 3개 미만
        
        if (!error) {
            const kpiStock = document.getElementById('kpi-stock');
            if(kpiStock) kpiStock.innerHTML = `${count} <span class="text-sm font-normal text-gray-400">건</span>`;
        }
    }
})();