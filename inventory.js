(function() {
    console.log("📦 Inventory Module Loaded");

    const Inventory = {
        currentFilter: 'all',

        init: function() {
            this.loadData();
        },

        loadData: async function() {
            const tbody = document.getElementById('inventory-list');
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-500">데이터 로딩 중...</td></tr>';

            let query = window.supabaseClient.from('inventory').select('*').order('created_at', { ascending: false });
            
            if (this.currentFilter !== 'all') {
                query = query.eq('category', this.currentFilter);
            }

            const { data, error } = await query;

            if (error) {
                console.error(error);
                tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-red-500">에러: ${error.message}</td></tr>`;
                return;
            }

            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-500">등록된 데이터가 없습니다.</td></tr>';
                return;
            }

            tbody.innerHTML = '';
            data.forEach(item => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-gray-50 transition-colors';
                tr.innerHTML = `
                    <td class="px-6 py-4"><span class="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">${item.category}</span></td>
                    <td class="px-6 py-4 font-medium text-gray-900">${item.name}</td>
                    <td class="px-6 py-4 text-gray-500 text-xs">
                        ${item.serial_no ? `SN: ${item.serial_no}<br>` : ''}
                        ${item.status && item.status !== '-' ? `<span class="text-blue-600">${item.status}</span>` : ''}
                    </td>
                    <td class="px-6 py-4 text-center font-bold text-lg">${item.stock}</td>
                    <td class="px-6 py-4 text-center">
                        <button onclick="Inventory.deleteItem(${item.id})" class="text-red-500 hover:text-red-700 text-sm"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        },

        filterTab: function(category) {
            this.currentFilter = category;
            this.loadData();
        },

        openModal: function() {
            document.getElementById('inventory-modal').classList.remove('hidden');
        },
        closeModal: function() {
            document.getElementById('inventory-modal').classList.add('hidden');
            document.getElementById('inventory-form').reset();
        },

        saveItem: async function(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            const newItem = {
                category: formData.get('category'),
                name: formData.get('name'),
                stock: parseInt(formData.get('stock'))
            };

            const { error } = await window.supabaseClient.from('inventory').insert([newItem]);
            
            if (error) {
                alert('저장 실패: ' + error.message);
            } else {
                this.closeModal();
                this.loadData();
            }
        },

        deleteItem: async function(id) {
            if(!confirm('삭제하시겠습니까?')) return;
            const { error } = await window.supabaseClient.from('inventory').delete().eq('id', id);
            if(error) alert('삭제 실패');
            else this.loadData();
        }
    };
    window.Inventory = Inventory;
    Inventory.init();
})();