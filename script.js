document.addEventListener('DOMContentLoaded', () => {
    // Input Elements
    const loanAmountInput = document.getElementById('loanAmountInput');
    const loanAmountSlider = document.getElementById('loanAmountSlider');
    const interestRateInput = document.getElementById('interestRateInput');
    const interestRateSlider = document.getElementById('interestRateSlider');
    const loanTenureInput = document.getElementById('loanTenureInput');
    const loanTenureSlider = document.getElementById('loanTenureSlider');

    // Button
    const calculateBtn = document.getElementById('calculateBtn');

    // Results Display
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

    // --- Sync Sliders and Input Fields ---
    const syncInputs = (slider, input, isCurrency) => {
        slider.addEventListener('input', (e) => {
            input.value = e.target.value;
        });
        input.addEventListener('input', (e) => {
            slider.value = e.target.value;
        });
    };

    syncInputs(loanAmountSlider, loanAmountInput);
    syncInputs(interestRateSlider, interestRateInput);
    syncInputs(loanTenureSlider, loanTenureInput);

    // --- Event Listeners ---
    calculateBtn.addEventListener('click', calculateAndDisplay);
    viewScheduleBtn.addEventListener('click', () => {
        generateAmortizationSchedule();
        modal.style.display = 'block';
    });
    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            modal.style.display = 'none';
        }
    });

    // --- Calculation and Display Logic ---
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

        // Display Results
        displayResults({ emi, totalInterest, totalAmount, principal });
    }

    function displayResults(data) {
        const formatCurrency = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(num);

        monthlyEmiEl.textContent = formatCurrency(data.emi);
        totalInterestEl.textContent = formatCurrency(data.totalInterest);
        totalAmountEl.textContent = formatCurrency(data.totalAmount);
        
        resultsContainer.classList.add('show');

        // Update Chart
        updateChart(data.principal, data.totalInterest);
    }
    
    // --- Chart.js Logic ---
    function updateChart(principal, interest) {
        if (emiChart) {
            emiChart.destroy();
        }
        
        emiChart = new Chart(emiChartEl, {
            type: 'doughnut',
            data: {
                labels: ['Principal Amount', 'Total Interest'],
                datasets: [{
                    label: 'Loan Breakdown',
                    data: [principal, interest],
                    backgroundColor: ['#007bff', '#28a745'],
                    borderColor: '#1e1e1e',
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
                            color: '#e0e0e0',
                            font: {
                                size: 14,
                                family: 'Poppins'
                            }
                        }
                    }
                }
            }
        });
    }

    // --- Amortization Schedule Logic ---
    function generateAmortizationSchedule() {
        scheduleTableBody.innerHTML = ''; // Clear previous data
        
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
                <td>₹ ${formatCurrency(balance < 0 ? 0 : balance)}</td>
            `;
            scheduleTableBody.appendChild(row);
        }
    }
});
