// [0. 유틸리티 함수 - 최상단 배치]
// 스크립트 중간에 에러가 있어도 모달 기능은 작동하도록 맨 위에 정의합니다.
window.openModal = function() { 
    const modal = document.getElementById('modal-add');
    if(modal) modal.classList.remove('hidden'); 
};

window.closeModal = function() {
    const modal = document.getElementById('modal-add');
    if(modal) {
        modal.classList.add('hidden');
        const form = document.getElementById('form-add-item');
        if(form) form.reset();
    }
};

// [1. Supabase 설정]
// TODO: Supabase 프로젝트 설정값으로 변경해주세요.
// Supabase 웹사이트 -> Settings -> API 메뉴에서 복사해오세요.
const SUPABASE_URL = 'https://sjrvigfoztllubjpwnoz.supabase.co';
// 주의: Supabase의 새로운 키 형식은 보통 'sb_publishable_' (언더바 1개)로 시작합니다.
// 현재 입력된 값은 언더바가 2개('__')이므로, 만약 작동하지 않는다면 확인이 필요합니다.
const SUPABASE_KEY = 'sb_publishable__45yxFL18jgN7gUy2YQzIA_Wl2i9-gz';
// Supabase 클라이언트 생성 (라이브러리 로드 확인)
let db;
try {
    if (typeof window.supabase !== 'undefined') {
        db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
        console.error('Supabase 라이브러리가 로드되지 않았습니다.');
    }
} catch (error) {
    console.error('Supabase 초기화 오류:', error);
}

// [3. 기능 구현: 재고 관리 (Supabase 버전)]

// 목록 조회 (Read)
async function loadInventory() {
    const tbody = document.getElementById('inventory-table-body');
    if(!tbody) return;

    // 로딩 표시
    tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">⏳ 데이터 불러오는 중...</td></tr>';

    try {
        // Supabase 데이터 조회 ('inventory' 테이블)
        const { data, error } = await db
            .from('inventory')
            .select('*')
            .order('created_at', { ascending: false }); // 최신순 정렬

        if (error) throw error;

        tbody.innerHTML = '';

        // 데이터가 없을 경우
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">등록된 재고가 없습니다. [신규 등록] 버튼으로 추가해보세요.</td></tr>';
            return;
        }

        // 데이터가 있을 경우 테이블에 그리기
        data.forEach(doc => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50 transition-colors';
            
            // 카테고리별 배지 색상 (선택사항)
            let badgeColor = 'bg-gray-100 text-gray-800';
            if(doc.category === '소모품') badgeColor = 'bg-blue-100 text-blue-800';
            if(doc.category === '복합기') badgeColor = 'bg-purple-100 text-purple-800';
            if(doc.category === '부품') badgeColor = 'bg-orange-100 text-orange-800';

            tr.innerHTML = `
                <td class="px-6 py-4 font-medium text-gray-900">${doc.name}</td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${badgeColor}">${doc.category}</span>
                </td>
                <td class="px-6 py-4 text-center">
                    <div class="flex items-center justify-center gap-3">
                        <button onclick="updateStock(${doc.id}, ${doc.stock}, -1)" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors">
                            <i class="fa-solid fa-minus text-xs"></i>
                        </button>
                        <span class="font-bold w-8 text-center text-lg">${doc.stock}</span>
                        <button onclick="updateStock(${doc.id}, ${doc.stock}, 1)" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors">
                            <i class="fa-solid fa-plus text-xs"></i>
                        </button>
                    </div>
                </td>
                <td class="px-6 py-4 text-center">
                    <button onclick="deleteItem(${doc.id})" class="text-red-500 hover:text-red-700 transition-colors text-sm font-medium">
                        <i class="fa-solid fa-trash-can mr-1"></i> 삭제
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("데이터 로드 에러:", error);
        let errorMsg = error.message;
        
        // 친절한 에러 메시지 처리
        if(error.message.includes('relation "inventory" does not exist')) {
            errorMsg = "Supabase에 'inventory' 테이블을 아직 안 만드신 것 같아요!";
        } else if (error.code === 'PGRST301' || error.message.includes('API key')) {
            errorMsg = "Supabase API 키 인증 실패: 키 값을 확인해주세요.";
        }

        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-4 text-center text-red-600 font-bold bg-red-50 border border-red-200">
                    ❌ 오류 발생: ${errorMsg}<br>
                    <span class="text-sm font-normal text-gray-600">Supabase URL/Key 설정과 테이블 이름을 확인해주세요.</span>
                </td>
            </tr>
        `;
    }
}

// 추가 (Create)
async function handleAddItem(event) {
    event.preventDefault(); // 폼 제출 시 새로고침 방지
    const formData = new FormData(event.target);
    
    const newItem = {
        name: formData.get('name'),
        category: formData.get('category'),
        stock: parseInt(formData.get('stock'))
    };

    try {
        const { error } = await db
            .from('inventory')
            .insert([newItem]);

        if (error) throw error;

        closeModal();
        loadInventory(); // 목록 새로고침
        // alert('등록되었습니다.'); // 필요 시 주석 해제
    } catch (error) {
        alert('추가 실패: ' + error.message);
    }
}
window.handleAddItem = handleAddItem;

// 수정 (Update) - 수량 변경
async function updateStock(docId, currentStock, change) {
    const newStock = currentStock + change;
    if (newStock < 0) return; // 0 미만으로 내려가지 않게 방지

    try {
        const { error } = await db
            .from('inventory')
            .update({ stock: newStock })
            .eq('id', docId);

        if (error) throw error;
        loadInventory(); // UI 갱신 (화면 깜빡임 없이 숫자만 바꾸려면 DOM 조작 필요하지만, 지금은 단순하게 목록 재로딩)
    } catch (error) {
        alert('수정 실패: ' + error.message);
    }
}
window.updateStock = updateStock;

// 삭제 (Delete)
async function deleteItem(docId) {
    if (!confirm('정말 이 항목을 삭제하시겠습니까?')) return;
    
    try {
        const { error } = await db
            .from('inventory')
            .delete()
            .eq('id', docId);

        if (error) throw error;
        loadInventory();
    } catch (error) {
        alert('삭제 실패: ' + error.message);
    }
}
window.deleteItem = deleteItem;

// 초기 실행
document.addEventListener('DOMContentLoaded', () => {
    // 라이브러리 로드 체크
    if (typeof window.supabase === 'undefined') {
        alert('🚨 Supabase 라이브러리가 로드되지 않았습니다.\nindex.html 파일의 <script> 태그를 확인해주세요.');
        return;
    }

    // [페이지 초기화 로직]
    // 현재 URL에 따라 네비게이션 활성화
    const path = window.location.pathname;
    let activeNavId = 'nav-dashboard'; // 기본값 (index.html)
    
    if (path.includes('inventory.html')) activeNavId = 'nav-inventory';
    if (path.includes('partners.html')) activeNavId = 'nav-partners';

    const navEl = document.getElementById(activeNavId);
    if (navEl) {
        navEl.classList.remove('text-gray-300');
        navEl.classList.add('bg-slate-800', 'text-white');
    }

    // 재고 관리 페이지라면 데이터 로드
    if (document.getElementById('inventory-table-body')) {
        loadInventory();
    }
});