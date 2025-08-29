// Dashboard JavaScript functionality

// Initialize category chart
function initCategoryChart(categoryData) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx || !categoryData || categoryData.length === 0) {
        return;
    }

    // Prepare chart data
    const labels = categoryData.map(item => item[0]); // category name
    const data = categoryData.map(item => parseFloat(item[2])); // total amount
    const colors = categoryData.map(item => item[1]); // category color

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: '#1f2937',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: {
                            size: 12
                        },
                        color: '#e5e7eb'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Animate numbers on page load
function animateNumbers() {
    const statValues = document.querySelectorAll('.stat-value');
    
    statValues.forEach(element => {
        const finalValue = element.textContent.replace('$', '').replace('%', '');
        const isPercentage = element.textContent.includes('%');
        const isCurrency = element.textContent.includes('$');
        
        if (!isNaN(finalValue)) {
            const increment = parseFloat(finalValue) / 50;
            let currentValue = 0;
            
            const timer = setInterval(() => {
                currentValue += increment;
                if (currentValue >= parseFloat(finalValue)) {
                    currentValue = parseFloat(finalValue);
                    clearInterval(timer);
                }
                
                let displayValue = currentValue.toFixed(isPercentage ? 1 : 2);
                if (isCurrency) {
                    displayValue = '$' + displayValue;
                } else if (isPercentage) {
                    displayValue = displayValue + '%';
                }
                
                element.textContent = displayValue;
            }, 20);
        }
    });
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Animate numbers
    animateNumbers();
    
    // Add hover effects to stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Refresh dashboard data
function refreshDashboard() {
    // Add loading state
    const container = document.querySelector('.container');
    container.classList.add('loading');
    
    // Simulate API call and refresh
    setTimeout(() => {
        container.classList.remove('loading');
        // In a real app, you would fetch new data here
        location.reload();
    }, 1000);
}

// Update budget progress bars
function updateBudgetProgress() {
    const progressBars = document.querySelectorAll('.progress-bar');
    
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        
        setTimeout(() => {
            bar.style.width = width;
        }, 100);
    });
}

// Export dashboard data (placeholder)
function exportDashboardData() {
    // This would implement CSV/PDF export functionality
    console.log('Exporting dashboard data...');
    
    // Create a simple CSV export
    const data = [
        ['Metric', 'Value'],
        ['Monthly Spending', document.querySelector('.stat-value').textContent],
        // Add more data as needed
    ];
    
    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}
