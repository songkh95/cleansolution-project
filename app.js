document.addEventListener('DOMContentLoaded', () => {
    // 초기 날짜 설정
    const dateEl = document.getElementById('current-date');
    if(dateEl) dateEl.textContent = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

    // 네비게이션 이벤트 리스너
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const moduleName = btn.dataset.module;
            loadModule(moduleName);
            
            // 활성 버튼 스타일 변경
            navButtons.forEach(b => {
                b.classList.remove('bg-slate-800', 'text-white');
                b.classList.add('text-gray-400');
            });
            btn.classList.remove('text-gray-400');
            btn.classList.add('bg-slate-800', 'text-white');
        });
    });

    // 초기 로드 (대시보드)
    loadModule('home');
});

// 모듈 로더 (HTML + JS Injection)
async function loadModule(moduleName) {
    const contentDiv = document.getElementById('main-content');
    const pageTitle = document.getElementById('page-title');
    
    // 1. 제목 변경
    const titles = {
        'home': '대시보드',
        'inventory': '재고 관리',
        'client': '거래처 관리',
        'finance': '재무 관리',
        'tools': '업무 도구'
    };
    pageTitle.textContent = titles[moduleName] || 'CleanSolution';

    // 2. HTML 로드
    try {
        contentDiv.innerHTML = '<div class="flex justify-center items-center h-64"><i class="fa-solid fa-spinner fa-spin text-4xl text-blue-600"></i></div>';
        
        const response = await fetch(`${moduleName}.html`);
        if (!response.ok) throw new Error('Module load failed');
        
        const html = await response.text();
        contentDiv.innerHTML = `<div class="fade-in">${html}</div>`;

        // 3. JS 로드 (기존 스크립트 제거 후 새로 주입)
        const oldScript = document.getElementById('module-script');
        if (oldScript) oldScript.remove();

        const script = document.createElement('script');
        script.src = `${moduleName}.js?t=${new Date().getTime()}`; // 캐시 방지
        script.id = 'module-script';
        document.body.appendChild(script);

    } catch (error) {
        console.error('Error loading module:', error);
        contentDiv.innerHTML = `<div class="text-red-500 p-4">페이지를 불러오는 중 오류가 발생했습니다.<br>${error.message}</div>`;
    }
}