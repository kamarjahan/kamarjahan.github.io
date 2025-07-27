document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const body = document.body;
    // Inputs
    const loanAmountInput = document.getElementById('loanAmountInput');
    const loanAmountSlider = document.getElementById('loanAmountSlider');
    const interestRateInput = document.getElementById('interestRateInput');
    const interestRateSlider = document.getElementById('interestRateSlider');
    const loanTenureInput = document.getElementById('loanTenureInput');
    const loanTenureSlider = document.getElementById('loanTenureSlider');
    const extraPaymentInput = document.getElementById('extraPaymentInput');
    // Buttons & Menu
    const calculateBtn = document.getElementById('calculateBtn');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const sidebar = document.getElementById('sidebar');
    const menu = document.getElementById('menu');
    // Header & Results
    const mainHeaderTitle = document.getElementById('main-header-title');
    const resultsContainer = document.getElementById('results');
    const monthlyEmiEl = document.getElementById('monthlyEmi');
    const totalInterestEl = document.getElementById('totalInterest');
    const totalAmountEl = document.getElementById('totalAmount');
    // Chart
    const emiChartEl = document.getElementById('emiChart');
    let emiChart;
    // Modal
    const modal = document.getElementById('scheduleModal');
    const viewScheduleBtn = document.getElementById('viewScheduleBtn');
    const closeModalBtn = document.querySelector('.close-button');
    const scheduleTableBody = document.querySelector('#scheduleTable tbody');
    // Theme Switcher
    const themeToggle = document.getElementById('theme-toggle');
    // Print Button
    const printBtn = document.getElementById('printBtn');
    // Prepayment Results
    const prepaymentResultsEl = document.getElementById('prepaymentResults');
    const newTenureEl = document.getElementById('newTenure');
    const interestSavedEl = document.getElementById('interestSaved');
    // Comparison Tool
    const comparisonToggleBtn = document.getElementById('comparisonToggleBtn');
    const mainCalculatorSection = document.getElementById('mainCalculator');
    const comparisonSection = document.getElementById('comparisonSection');
    const calculateCompBtn = document.getElementById('calculateCompBtn');
    const comparisonResultsEl = document.getElementById('comparisonResults');

    // --- INITIALIZATION ---
    setupEventListeners();
    applySavedTheme();

    // --- EVENT LISTENERS SETUP ---
    function setupEventListeners() {
        syncInputs(loanAmountSlider, loanAmountInput);
        syncInputs(interestRateSlider, interestRateInput);
        syncInputs(loanTenureSlider, loanTenureInput);

        calculateBtn.addEventListener('click', calculateAndDisplay);
        hamburgerMenu.addEventListener('click', toggleSidebar);
        menu.addEventListener('click', handleMenuClick);
        themeToggle.addEventListener('change', toggleTheme);
        printBtn.addEventListener('click', printResults);
        
        comparisonToggleBtn.addEventListener('click', toggleComparisonView);
        calculateCompBtn.addEventListener('click', calculateAndDisplayComparison);

        viewScheduleBtn.addEventListener('click', openScheduleModal);
        closeModalBtn.addEventListener('click', closeScheduleModal);
        window.addEventListener('click', (e) => {
            if (e.target == modal) closeScheduleModal();
        });
    }

    // --- CORE CALCULATION LOGIC ---
    function calculateEMI(principal, annualRate, tenureYears) {
        if (isNaN(principal) || isNaN(annualRate) || isNaN(tenureYears) || principal <= 0 || annualRate <= 0 || tenureYears <= 0) {
            return null;
        }
        const monthlyRate = annualRate / 12 / 100;
        const tenureMonths = tenureYears * 12;
        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
        const totalAmount = emi * tenureMonths;
        const totalInterest = totalAmount - principal;
        return { emi, totalInterest, totalAmount, principal, tenureMonths };
    }
    
    // --- MAIN CALCULATOR FUNCTIONS ---
    function calculateAndDisplay() {
        const principal = parseFloat(loanAmountInput.value);
        const annualRate = parseFloat(interestRateInput.value);
        const tenureYears = parseInt(loanTenureInput.value);
        const extraPayment = parseFloat(extraPaymentInput.value) || 0;

        const loanData = calculateEMI(principal, annualRate, tenureYears);
        if (!loanData) {
            alert("Please enter valid loan details.");
            return;
        }
        
        displayResults(loanData);
        
        if (extraPayment > 0) {
            calculateAndDisplayPrepayment(loanData, extraPayment);
        } else {
            prepaymentResultsEl.style.display = 'none';
        }
    }

    function displayResults(data) {
        const formatCurrency = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(num);
        monthlyEmiEl.textContent = formatCurrency(data.emi);
        totalInterestEl.textContent = formatCurrency(data.totalInterest);
        totalAmountEl.textContent = formatCurrency(data.totalAmount);
        resultsContainer.classList.add('show');
        updateChart(data.principal, data.totalInterest);
        printBtn.style.display = 'block';
    }

    // --- PREPAYMENT FUNCTIONS ---
    function calculateAndDisplayPrepayment(loanData, extraPayment) {
        const { principal, emi, tenureMonths, totalInterest } = loanData;
        const monthlyRate = parseFloat(interestRateInput.value) / 12 / 100;
        
        let balance = principal;
        let months = 0;
        let totalInterestPaidWithPrepayment = 0;

        while (balance > 0 && months < tenureMonths * 2) { // Safety break
            const interest = balance * monthlyRate;
            const principalPaid = (emi + extraPayment) - interest;
            balance -= principalPaid;
            totalInterestPaidWithPrepayment += interest;
            months++;
        }
        
        const newTenureYears = Math.floor(months / 12);
        const newTenureMonths = months % 12;
        const interestSaved = totalInterest - totalInterestPaidWithPrepayment;

        newTenureEl.textContent = `${newTenureYears} years, ${newTenureMonths} months`;
        interestSavedEl.textContent = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(interestSaved);
        prepaymentResultsEl.style.display = 'block';
    }


    // --- LOAN COMPARISON FUNCTIONS ---
    function toggleComparisonView() {
        const isComparing = mainCalculatorSection.style.display === 'none';
        if (isComparing) {
            mainCalculatorSection.style.display = 'grid';
            comparisonSection.style.display = 'none';
            comparisonToggleBtn.textContent = 'Compare Loans';
        } else {
            mainCalculatorSection.style.display = 'none';
            comparisonSection.style.display = 'block';
            comparisonToggleBtn.textContent = 'Back to Calculator';
        }
    }

    function calculateAndDisplayComparison() {
        const loan1Inputs = document.querySelectorAll('#loan1Calculator input');
        const loan2Inputs = document.querySelectorAll('#loan2Calculator input');

        const loan1Data = calculateEMI(
            parseFloat(loan1Inputs[0].value),
            parseFloat(loan1Inputs[1].value),
            parseInt(loan1Inputs[2].value)
        );

        const loan2Data = calculateEMI(
            parseFloat(loan2Inputs[0].value),
            parseFloat(loan2Inputs[1].value),
            parseInt(loan2Inputs[2].value)
        );

        if (!loan1Data || !loan2Data) {
            alert("Please enter valid details for both loans.");
            return;
        }

        const formatCurrency = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num);
        
        // Populate table
        document.getElementById('compEmi1').textContent = formatCurrency(loan1Data.emi);
        document.getElementById('compEmi2').textContent = formatCurrency(loan2Data.emi);
        document.getElementById('compEmiDiff').textContent = formatCurrency(loan1Data.emi - loan2Data.emi);

        document.getElementById('compInterest1').textContent = formatCurrency(loan1Data.totalInterest);
        document.getElementById('compInterest2').textContent = formatCurrency(loan2Data.totalInterest);
        document.getElementById('compInterestDiff').textContent = formatCurrency(loan1Data.totalInterest - loan2Data.totalInterest);

        document.getElementById('compTotal1').textContent = formatCurrency(loan1Data.totalAmount);
        document.getElementById('compTotal2').textContent = formatCurrency(loan2Data.totalAmount);
        document.getElementById('compTotalDiff').textContent = formatCurrency(loan1Data.totalAmount - loan2Data.totalAmount);
        
        comparisonResultsEl.style.display = 'block';
    }


    // --- UI, THEME, AND OTHER HELPERS ---
    function applySavedTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') {
            body.classList.add('light-mode');
            themeToggle.checked = true;
        } else {
            body.classList.remove('light-mode');
            themeToggle.checked = false;
        }
    }

    function toggleTheme() {
        body.classList.toggle('light-mode');
        localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : 'dark');
        if (resultsContainer.classList.contains('show')) {
            calculateAndDisplay();
        }
    }

    function syncInputs(slider, input) {
        slider.addEventListener('input', (e) => { input.value = e.target.value; });
        input.addEventListener('input', (e) => { slider.value = e.target.value; });
    }
    
    function toggleSidebar() { sidebar.classList.toggle('open'); }

    function handleMenuClick(e) {
        e.preventDefault();
        const target = e.target.closest('.menu-item');
        if (!target) return;
        document.querySelector('.menu-item.active').classList.remove('active');
        target.classList.add('active');
        mainHeaderTitle.textContent = `${target.dataset.loanType} EMI Calculator`;
        if (window.innerWidth <= 992) {
            sidebar.classList.remove('open');
        }
    }

    function openScheduleModal() {
        generateAmortizationSchedule(scheduleTableBody);
        modal.style.display = 'block';
    }

    function closeScheduleModal() { modal.style.display = 'none'; }
    
    function updateChart(principal, interest) {
        if (emiChart) emiChart.destroy();
        const isLightMode = body.classList.contains('light-mode');
        const chartTextColor = isLightMode ? '#1c1c1c' : '#e0e0e0';
        const chartBorderColor = isLightMode ? '#ffffff' : '#1e1e1e';
        emiChart = new Chart(emiChartEl, {
            type: 'doughnut',
            data: {
                labels: ['Principal Amount', 'Total Interest'],
                datasets: [{
                    label: 'Loan Breakdown',
                    data: [principal, interest],
                    backgroundColor: ['#007bff', '#28a745'],
                    borderColor: chartBorderColor,
                    borderWidth: 4,
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '70%',
                plugins: { legend: { position: 'bottom', labels: { color: chartTextColor, font: { size: 14, family: 'Poppins' } } } }
            }
        });
    }

    function generateAmortizationSchedule(tableBodyElement) {
        tableBodyElement.innerHTML = '';
        const principal = parseFloat(loanAmountInput.value);
        const annualRate = parseFloat(interestRateInput.value);
        const tenureYears = parseInt(loanTenureInput.value);
        const extraPayment = parseFloat(extraPaymentInput.value) || 0;
        const loanData = calculateEMI(principal, annualRate, tenureYears);
        if (!loanData) return;

        let balance = principal;
        const formatCurrency = (num) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(num);

        for (let i = 1; balance > 0.01; i++) {
            const interestPaid = balance * (annualRate / 12 / 100);
            const principalPaid = (loanData.emi + extraPayment) - interestPaid;
            const totalPayment = loanData.emi + extraPayment;
            balance -= principalPaid;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${i}</td>
                <td>₹ ${formatCurrency(principalPaid > balance + principalPaid ? balance + principalPaid : principalPaid)}</td>
                <td>₹ ${formatCurrency(interestPaid)}</td>
                <td>₹ ${formatCurrency(totalPayment)}</td>
                <td>₹ ${formatCurrency(balance < 0 ? 0 : balance)}</td>
            `;
            tableBodyElement.appendChild(row);
             if (i > (tenureYears * 12) + 120) break; // Safety break
        }
    }

    function printResults() {
        const loanType = document.querySelector('.menu-item.active').dataset.loanType;
        const summaryClone = document.querySelector('.results-summary').cloneNode(true);
        const chartImage = emiChart.toBase64Image();
        const scheduleTable = document.createElement('table');
        scheduleTable.innerHTML = document.getElementById('scheduleTable').querySelector('thead').outerHTML;
        const scheduleBodyForPrint = document.createElement('tbody');
        generateAmortizationSchedule(scheduleBodyForPrint);
        scheduleTable.appendChild(scheduleBodyForPrint);

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html><head><title>${loanType} Details</title>
            <style>
                body { font-family: 'Poppins', sans-serif; background: #fff; color: #000; } .printable-area { padding: 25px; } h1, h2 { text-align: center; margin-bottom: 20px; } .results-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center; margin-bottom: 2rem; } .result-item { background: #f4f4f4; padding: 1rem; border-radius: 8px; border: 1px solid #ddd; } .result-item p { color: #555; margin-bottom: 0.5rem; } .result-item h3 { font-size: 1.5rem; color: #007bff; } .chart-container { text-align: center; margin: 2rem 0; } img { max-width: 400px; margin: auto; } table { width: 100%; border-collapse: collapse; margin-top: 2rem; font-size: 9pt; } th, td { border: 1px solid #ccc; padding: 8px; text-align: right; } th { background-color: #e9ecef; font-weight: 600; }
                .prepayment-results { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9; }
            </style>
            </head><body>
            <div class="printable-area">
                <h1>${loanType} Repayment Details</h1><h2>Summary</h2>${summaryClone.outerHTML}
                ${prepaymentResultsEl.style.display === 'block' ? prepaymentResultsEl.outerHTML : ''}
                <h2>Loan Breakdown</h2><div class="chart-container"><img src="${chartImage}"></div>
                <h2>Amortization Schedule</h2>${scheduleTable.outerHTML}
            </div>
            <script>window.onload = () => { window.print(); window.close(); }</script>
            </body></html>`);
        printWindow.document.close();
    }
});
