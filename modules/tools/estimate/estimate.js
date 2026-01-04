(function() {
    console.log("📄 Estimate Module Loaded");

    const Estimate = {
        init: function() {
            this.addQuoteItem();
        },

        addQuoteItem: function() {
            const tbody = document.getElementById('quote-items');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="border border-black p-1"><input type="text" class="w-full text-center outline-none" placeholder="품명"></td>
                <td class="border border-black p-1"><input type="number" class="w-full text-center outline-none qty" value="1" oninput="Estimate.calcRow(this)"></td>
                <td class="border border-black p-1"><input type="number" class="w-full text-right outline-none price" value="0" oninput="Estimate.calcRow(this)"></td>
                <td class="border border-black p-1 bg-gray-50 supply">0</td>
                <td class="border border-black p-1 bg-gray-50 tax">0</td>
                <td class="border border-black p-1 no-print"><button onclick="this.closest('tr').remove(); Estimate.calcTotal();" class="text-red-500">x</button></td>
            `;
            tbody.appendChild(tr);
        },

        calcRow: function(input) {
            const tr = input.closest('tr');
            const qty = parseInt(tr.querySelector('.qty').value) || 0;
            const price = parseInt(tr.querySelector('.price').value) || 0;
            
            const supply = qty * price;
            const tax = Math.floor(supply * 0.1);

            tr.querySelector('.supply').textContent = supply.toLocaleString();
            tr.querySelector('.tax').textContent = tax.toLocaleString();
            
            tr.dataset.supply = supply;
            tr.dataset.tax = tax;
            this.calcTotal();
        },

        calcTotal: function() {
            let totalSupply = 0;
            let totalTax = 0;
            document.querySelectorAll('#quote-items tr').forEach(tr => {
                totalSupply += parseInt(tr.dataset.supply || 0);
                totalTax += parseInt(tr.dataset.tax || 0);
            });
            document.getElementById('total-number').textContent = (totalSupply + totalTax).toLocaleString();
        }
    };

    window.Estimate = Estimate;
    Estimate.init();
})();