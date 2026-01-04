(function() {
    console.log("🧮 Calculator Module Loaded");

    const Calculator = {
        init: function() {
            // 초기값 설정 (단가 * 수량 = 세트가격)
            const keys = ['drumCommon', 'tonerB', 'tonerColor', 'waste', 'fuser'];
            keys.forEach(key => {
                const costEl = document.getElementById('cost_' + key);
                const qtyEl = document.getElementById('qty_' + key);
                if (costEl && qtyEl) {
                    const unitPrice = this.getVal('cost_' + key); 
                    costEl.dataset.baseCost = unitPrice; // 초기값을 기준 단가로 저장
                    const qty = this.getQty('qty_' + key); 
                    const setPrice = unitPrice * qty; 
                    this.setVal('cost_' + key, setPrice); 
                }
            });
            this.calculate();
        },

        getVal: function(id) {
            const el = document.getElementById(id);
            if (!el) return 0;
            return parseFloat(el.value.replace(/,/g, '')) || 0;
        },
        
        getQty: function(id) {
            const el = document.getElementById(id);
            if (!el) return 1;
            let val = parseFloat(el.value);
            return (val > 0) ? val : 1;
        },

        setVal: function(id, val, isMoney = true) {
            const el = document.getElementById(id);
            if (!el) return;
            if (isMoney) {
                el.value = val.toLocaleString('ko-KR', { maximumFractionDigits: 0 });
            } else {
                el.value = val; 
            }
        },

        formatInput: function(el) {
            let val = el.value.replace(/[^0-9.]/g, ''); 
            if (!val) {
                el.value = '';
                return;
            }
            let parts = val.split('.');
            let intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            el.value = intPart + (parts.length > 1 ? '.' + parts[1] : '');
        },

        handleInput: function(el) {
            // 개수 변경 시 단가(세트가격) 자동 업데이트
            if (el.id.startsWith('qty_')) {
                const costId = el.id.replace('qty_', 'cost_');
                const costEl = document.getElementById(costId);
                if (costEl) {
                    const qty = this.getQty(el.id);
                    const baseCost = parseFloat(costEl.dataset.baseCost) || 0;
                    const newSetPrice = baseCost * qty;
                    this.setVal(costId, newSetPrice);
                }
            } 
            // 단가(세트가격) 직접 입력 시 1개당 단가 재계산
            else if (el.id.startsWith('cost_')) {
                const qtyId = el.id.replace('cost_', 'qty_');
                const qtyEl = document.getElementById(qtyId);
                if (qtyEl) { 
                    const qty = this.getQty(qtyId);
                    const currentSetPrice = this.getVal(el.id);
                    if (qty > 0) {
                        el.dataset.baseCost = currentSetPrice / qty;
                    }
                }
            }
            
            this.formatInput(el);
            this.calculate();
        },

        calculate: function() {
            const machineCost = this.getVal('machineCost');
            const term = this.getVal('term');
            const interestRate = this.getVal('interestRate');
            const rentalFee = this.getVal('rentalFee');
            const monthlyBW = this.getVal('monthlyBW');
            const monthlyColor = this.getVal('monthlyColor');

            // 1. 임대조건 계산
            const monthlyDepreciation = term > 0 ? machineCost / term : 0;
            this.setVal('monthlyDepreciation', monthlyDepreciation);

            const totalBW = monthlyBW * term;
            const totalColor = monthlyColor * term;
            const totalOutputAll = totalBW + totalColor;

            this.setVal('totalBW', totalBW);
            this.setVal('totalColor', totalColor);
            this.setVal('totalOutputAll', totalOutputAll);

            this.setVal('displayMonthlyFee', rentalFee);
            const totalRentalFee = rentalFee * term;
            this.setVal('displayTotalFee', totalRentalFee);

            // 2. 소모품 계산
            let sumConsumables = 0;
            const _this = this;

            function calcConsumableWithQty(lifeId, costId, qtyId, countId, totalId, totalSingleUnitsNeeded) {
                const life = _this.getVal(lifeId);
                const setPrice = _this.getVal(costId); 
                const qty = _this.getQty(qtyId);
                
                let exchangeCountSet = 0;
                if (life > 0) {
                    exchangeCountSet = totalSingleUnitsNeeded / qty;
                }
                const totalCost = setPrice * exchangeCountSet;
                document.getElementById(countId).value = exchangeCountSet.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                _this.setVal(totalId, totalCost);
                return totalCost;
            }
            
            function calcNormal(lifeId, costId, qtyId, countId, totalId, basisOutput) {
                const life = _this.getVal(lifeId);
                let totalUnits = 0;
                if(life > 0) totalUnits = basisOutput / life;
                return calcConsumableWithQty(lifeId, costId, qtyId, countId, totalId, totalUnits);
            }

            // 드럼, 토너, 폐토너통, Fuser 계산 (생략된 부분은 위 로직과 동일하게 작동)
            const lifeDrum = this.getVal('life_drumCommon');
            let totalDrumUnits = 0;
            if (lifeDrum > 0) totalDrumUnits = (totalOutputAll + (totalColor * 3)) / lifeDrum;
            sumConsumables += calcConsumableWithQty('life_drumCommon', 'cost_drumCommon', 'qty_drumCommon', 'count_drumCommon', 'total_drumCommon', totalDrumUnits);
            sumConsumables += calcNormal('life_tonerB', 'cost_tonerB', 'qty_tonerB', 'count_tonerB', 'total_tonerB', totalOutputAll);
            const lifeTonerColor = this.getVal('life_tonerColor');
            let totalTonerColorUnits = 0;
            if(lifeTonerColor > 0) totalTonerColorUnits = (totalColor / lifeTonerColor) * 3;
            sumConsumables += calcConsumableWithQty('life_tonerColor', 'cost_tonerColor', 'qty_tonerColor', 'count_tonerColor', 'total_tonerColor', totalTonerColorUnits);
            sumConsumables += calcNormal('life_waste', 'cost_waste', 'qty_waste', 'count_waste', 'total_waste', totalOutputAll);
            sumConsumables += calcNormal('life_fuser', 'cost_fuser', 'qty_fuser', 'count_fuser', 'total_fuser', totalOutputAll);

            this.setVal('grandTotalConsumables', sumConsumables);

            // 3. 이익 분석
            const monthlyInterest = (machineCost * (interestRate / 100)) / 12;
            const monthlyConsumableCost = term > 0 ? sumConsumables / term : 0;
            const totalMonthlyCost = monthlyDepreciation + monthlyInterest + monthlyConsumableCost;
            const monthlyProfit = rentalFee - totalMonthlyCost;
            const totalProfit = monthlyProfit * term;
            const marginRate = rentalFee > 0 ? (monthlyProfit / rentalFee) * 100 : 0;

            this.setVal('profit_machine', monthlyDepreciation);
            this.setVal('profit_interest', monthlyInterest);
            this.setVal('profit_consumable', monthlyConsumableCost);
            this.setVal('profit_cost_total', totalMonthlyCost);
            this.setVal('profit_rental_fee', rentalFee);
            this.setVal('profit_monthly', monthlyProfit);
            this.setVal('profit_total', totalProfit);
            
            const marginEl = document.getElementById('profit_margin_rate');
            marginEl.value = marginRate.toFixed(1) + " %";
            marginEl.style.color = marginRate >= 0 ? "blue" : "red";
            document.getElementById('profit_monthly').style.color = monthlyProfit >= 0 ? "blue" : "red";
        },

        // PDF 저장 및 모달 관련 함수는 생략 (필요시 추가)
        saveAsPDF: function() { alert('PDF 저장 기능은 html2pdf 라이브러리가 필요합니다.'); },
        openInfoModal: function(id) { document.getElementById('infoModal').classList.remove('hidden'); },
        closeInfoModal: function() { document.getElementById('infoModal').classList.add('hidden'); }
    };

    window.Calculator = Calculator;
    Calculator.init();
})();