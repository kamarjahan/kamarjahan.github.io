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

    // --- INITIALIZATION ---
    setupEventListeners();
    applySavedTheme();

    // --- EVENT LISTENERS SETUP ---
    function setupEventListeners() {
        // Sync sliders and inputs
        syncInputs(loanAmountSlider, loanAmountInput);
        syncInputs(interestRateSlider, interestRateInput);
        syncInputs(loanTenureSlider, loanTenureInput);

        // Main Actions
        calculateBtn.addEventListener('click', calculateAndDisplay);
        hamburgerMenu.addEventListener('click', toggleSidebar);
        menu.addEventListener('click', handleMenuClick);
        themeToggle.addEventListener('change', toggleTheme);

        // Modal Actions
        viewScheduleBtn.addEventListener('click', openScheduleModal);
        closeModalBtn.addEventListener('click', closeScheduleModal);
        window.addEventListener('click', (e) => {
            if (e.target == modal) closeScheduleModal();
        });
    }
    
    // --- THEME MANAGEMENT ---
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
        if (themeToggle.checked) {
            body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        }
        // Redraw chart with new theme colors if it exists
        if (resultsContainer.classList.contains('show')) {
            calculateAndDisplay();
        }
    }

    // --- UI INTERACTION ---
    function syncInputs(slider, input) {
        slider.addEventListener('input', (e) => { input.value = e.target.value; });
        input.addEventListener('input', (e) => { slider.value = e.target.value; });
    }
    
    function toggleSidebar() {
        sidebar.classList.toggle('open');
    }

    function handleMenuClick(e) {
        e.preventDefault();
        const target = e.target.closest('.menu-item');
        if (!target) return;

        // Update active class
        document.querySelector('.menu-item.active').classList.remove('active');
        target.classList.add('active');

        // Update header title
        const loanType = target.dataset.loanType;
        mainHeaderTitle.textContent = `${loanType} EMI Calculator`;

        // Close sidebar on mobile after selection
        if (window.innerWidth <= 992) {
            sidebar.classList.remove('open');
        }
    }

    function openScheduleModal() {
        generateAmortizationSchedule();
        modal.style.display = 'block';
    }

    function closeScheduleModal() {
        modal.style.display = 'none';
    }

    // --- CORE CALCULATION ---
    function calculateAndDisplay() {
        const principal = parseFloat(loanAmountInput.value);
        const annualRate = parseFloat(interestRateInput.value);
        const tenureYears = parseInt(loanTenureInput.value);

        if (isNaN(principal) || isNaN(annualRate) || isNaN(tenureYears) || principal <= 0 || annualRate <= 0 || tenureYears <= 0) {
            alert("Please enter valid loan details.");
            return;
        }

        const monthlyRate = annualRate / 12 / 100;
        const tenureMonths = tenureYears * 12;
        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
        const totalAmount = emi * tenureMonths;
        const totalInterest = totalAmount - principal;

        displayResults({ emi, totalInterest, totalAmount, principal });
    }

    function displayResults(data) {
        const formatCurrency = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(num);
        monthlyEmiEl.textContent = formatCurrency(data.emi);
        totalInterestEl.textContent = formatCurrency(data.totalInterest);
        totalAmountEl.textContent = formatCurrency(data.totalAmount);
        resultsContainer.classList.add('show');
        updateChart(data.principal, data.totalInterest);
    }
    
    // --- CHART & SCHEDULE ---
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
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: chartTextColor,
                            font: { size: 14, family: 'Poppins' }
                        }
                    }
                }
            }
        });
    }

    function generateAmortizationSchedule() {
        scheduleTableBody.innerHTML = '';
        const principal = parseFloat(loanAmountInput.value);
        const annualRate = parseFloat(interestRateInput.value);
        const tenureYears = parseInt(loanTenureInput.value);
        const monthlyRate = annualRate / 12 / 100;
        const tenureMonths = tenureYears * 12;
        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
        let balance = principal;
        const formatCurrency = (num) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(num);

        for (let i = 1; i <= tenureMonths; i++) {
            const interestPaid = balance * monthlyRate;
            const principalPaid = emi - interestPaid;
            balance -= principalPaid;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${i}</td>
                <td>₹ ${formatCurrency(principalPaid)}</td>
                <td>₹ ${formatCurrency(interestPaid)}</td>
                <td>₹ ${formatCurrency(emi)}</td>
                <td>₹ ${formatCurrency(balance < 1 ? 0 : balance)}</td>
            `;
            scheduleTableBody.appendChild(row);
        }
    }
});
