(function() {
    console.log("🛠 Tools Hub Loaded");

    const Tools = {
        init: function() {
            // 초기화 시 특별한 작업 없음 (메뉴가 기본으로 보임)
        },

        loadTool: async function(toolName) {
            const menu = document.getElementById('tools-menu');
            const workspace = document.getElementById('tool-workspace');
            const container = document.getElementById('tool-container');

            // 로딩 표시
            container.innerHTML = '<div class="flex justify-center p-10"><i class="fa-solid fa-spinner fa-spin text-3xl text-blue-600"></i></div>';
            
            menu.classList.add('hidden');
            workspace.classList.remove('hidden');

            try {
                // HTML 로드
                const response = await fetch(`modules/tools/${toolName}/${toolName}.html`);
                if (!response.ok) throw new Error('Failed to load tool');
                const html = await response.text();
                container.innerHTML = `<div class="fade-in">${html}</div>`;

                // JS 로드
                const scriptId = `script-tool-${toolName}`;
                const oldScript = document.getElementById(scriptId);
                if (oldScript) oldScript.remove();

                const script = document.createElement('script');
                script.src = `modules/tools/${toolName}/${toolName}.js?t=${new Date().getTime()}`;
                script.id = scriptId;
                document.body.appendChild(script);

            } catch (error) {
                console.error(error);
                container.innerHTML = `<div class="text-red-500 text-center p-10">도구를 불러오는데 실패했습니다.<br>${error.message}</div>`;
            }
        },

        showMenu: function() {
            document.getElementById('tools-menu').classList.remove('hidden');
            document.getElementById('tool-workspace').classList.add('hidden');
            document.getElementById('tool-container').innerHTML = '';
        }
    };

    window.Tools = Tools;
    Tools.init();
})();