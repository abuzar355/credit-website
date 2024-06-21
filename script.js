document.addEventListener('DOMContentLoaded', () => {
    // Check if on the Credit Score Simulator page and set up the event listener
    const calculateScoreButton = document.getElementById('calculateScore');
    if (calculateScoreButton) {
        calculateScoreButton.addEventListener('click', handleCreditScoreCalculation);
    }

    // Check if on the Loan Calculator page and set up the event listener
    const calculateLoanButton = document.getElementById('calculateButton');
    if (calculateLoanButton) {
        calculateLoanButton.addEventListener('click', handleLoanCalculation);
    }
});

function handleCreditScoreCalculation() {
    const totalCreditUtilization = parseFloat(document.getElementById('totalCreditUtilization').value);
    const numberOfAccounts = parseInt(document.getElementById('numberOfAccounts').value);
    const positiveAccounts = parseInt(document.getElementById('positiveAccounts').value);
    const bankruptcyStatus = document.getElementById('bankruptcyStatus').value;
    const repoStatus = document.getElementById('repoStatus').value;
    const annualIncome = parseFloat(document.getElementById('annualIncome').value);
    const hasMortgage = document.getElementById('hasMortgage').value;
    const missedPayments = parseInt(document.getElementById('missedPayments').value);
    const recentCreditBehavior = parseInt(document.getElementById('recentCreditBehavior').value);
    const autoLoanHistory = parseInt(document.getElementById('autoLoanHistory').value);
    const autoLoanUtilization = parseFloat(document.getElementById('autoLoanUtilization').value);
    const autoCreditInquiries = parseInt(document.getElementById('autoCreditInquiries').value);
    const autoLoanDiversity = document.getElementById('autoLoanDiversity').value;

    const score = calculateCreditScore(totalCreditUtilization, numberOfAccounts, positiveAccounts, bankruptcyStatus,
        repoStatus, annualIncome, hasMortgage, missedPayments, recentCreditBehavior, autoLoanHistory, autoLoanUtilization, autoCreditInquiries, autoLoanDiversity);
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<strong>Estimated Credit Score:</strong> ${score}<br>
                           <p><b>Score Explanation:</b> ${generateScoreExplanation(score)}</p>`;
}

function handleLoanCalculation() {
    const loanAmount = parseFloat(document.getElementById('loanAmount').value);
    const loanTerm = parseInt(document.getElementById('loanTerm').value);
    const interestRate = parseFloat(document.getElementById('interestRate').value);
    const extraPayment = parseFloat(document.getElementById('extraPayment').value);

    const { monthlyPayment, totalInterest, reducedTerm } = calculateLoan(loanAmount, loanTerm, interestRate, extraPayment);

    document.getElementById('reducedTerm').textContent = reducedTerm.toFixed(2);
    document.getElementById('totalInterestPaid').textContent = totalInterest.toFixed(2);
    // Optionally update the amortization schedule here if needed
}

function calculateCreditScore(utilization, accounts, positiveAccounts, bankruptcy, repo, income, mortgage, missedPayments, recentBehavior, autoHistory, autoUtilization, autoInquiries, autoDiversity) {
    let score = 600; // Starting score

    // Calculation logic as previously defined
    // Simplified example:
    score += utilization > 0 && utilization <= 20 ? 30 : utilization > 20 && utilization < 80 ? 10 : -25;
    score += (accounts > 1) ? 30 : -20;
    score += ((positiveAccounts / accounts) * 100) - 50;
    score += bankruptcy === 'discharged' ? 40 : -100;
    score += repo === 'yes' ? -150 : 20;
    score += income > 50000 ? 50 : -50;
    score += mortgage === 'yes' ? 30 : -20;
    score -= missedPayments * 20;
    score += recentBehavior > 0 ? recentBehavior * 10 : -20;
    score += autoHistory > 1 && repo === 'no' ? 40 : -20;
    score -= autoInquiries * 20;
    score += autoDiversity === 'both' ? 25 : 0;

    return Math.max(300, Math.min(score, 850));
}

function generateScoreExplanation(score) {
    if (score >= 720) {
        return "Excellent (A): High creditworthiness. Ideal for auto loan approval.";
    } else if (score >= 680) {
        return "Good (B): Solid credit standing. Likely favorable loan terms.";
    } else if (score >= 660) {
        return "Fair (C): Moderate credit. Loan approval possible with average terms.";
    } else if (score >= 620) {
        return "Below Average (D+ to B-): Approaching subprime. Terms and interest rates less favorable.";
    } else {
        return "Subprime (Below 620): Credit items matter more than score. Well-paid auto or mortgage accounts can positively impact.";
    }
}

function calculateLoan(amount, term, rate, extraPayment) {
    rate = rate / 100 / 12; // Convert annual rate to monthly and percentage to decimal
    const monthlyPaymentWithoutExtra = amount * rate / (1 - (Math.pow(1/(1 + rate), term)));
    let balance = amount;
    let totalInterest = 0;
    let monthlyPayment = monthlyPaymentWithoutExtra + extraPayment;
    let paymentNumber = 0;

    while (balance > 0) {
        paymentNumber++;
        let interestPayment = balance * rate;
        totalInterest += interestPayment;
        let principalPayment = monthlyPayment - interestPayment;
        balance -= principalPayment;
        if (balance < 0) {
            // Last payment adjustment
            monthlyPayment += balance;
            balance = 0;
        }
    }

    // The new term will be the number of payments that were actually made
    const reducedTerm = paymentNumber;

    return {
        monthlyPayment: monthlyPaymentWithoutExtra,
        totalInterest,
        reducedTerm,
        totalPayment: monthlyPayment,
        amountFinanced: amount
    };
}

function handleLoanCalculation() {
    const loanAmount = parseFloat(document.getElementById('loanAmount').value);
    const loanTerm = parseInt(document.getElementById('loanTerm').value);
    const interestRate = parseFloat(document.getElementById('interestRate').value);
    const extraPayment = parseFloat(document.getElementById('extraPayment').value);

    const { monthlyPayment, totalInterest, reducedTerm, totalPayment, amountFinanced } = calculateLoan(loanAmount, loanTerm, interestRate, extraPayment);

    document.getElementById('monthlyPaymentDisplay').textContent = `$${monthlyPayment.toFixed(2)}`;
    document.getElementById('totalPaymentDisplay').textContent = `$${totalPayment.toFixed(2)}`;
    document.getElementById('amountFinancedDisplay').textContent = `$${amountFinanced.toFixed(2)}`;
    document.getElementById('interestRateDisplay').textContent = `${interestRate.toFixed(2)}%`;
    document.getElementById('reducedTerm').textContent = `${reducedTerm} months`;
    document.getElementById('totalInterestPaid').textContent = `$${totalInterest.toFixed(2)}`;

    // Update the amortization schedule
    updateAmortizationSchedule(loanAmount, reducedTerm, monthlyPayment, interestRate / 100 / 12, extraPayment);
}

function updateAmortizationSchedule(amount, term, monthlyPayment, rate, extraPayment) {
    const table = document.getElementById('amortizationTable');
    const tbody = table.getElementsByTagName('tbody')[0];
    tbody.innerHTML = ''; // Clear existing rows

    let balance = amount;
    let totalInterest = 0;

    for (let i = 1; i <= term; i++) {
        const interestPayment = balance * rate;
        const principalPayment = monthlyPayment - interestPayment;
        const extraPrincipalPayment = i === term ? balance : extraPayment;
        const newBalance = balance - principalPayment - extraPrincipalPayment;

        totalInterest += interestPayment;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${i}</td>
            <td>$${monthlyPayment.toFixed(2)}</td>
            <td>$${interestPayment.toFixed(2)}</td>
            <td>$${principalPayment.toFixed(2)}</td>
            <td>$${newBalance.toFixed(2)}</td>
            <td>$${extraPrincipalPayment.toFixed(2)}</td>
        `;
        tbody.appendChild(row);

        balance = newBalance;
    }
}

