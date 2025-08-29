// Analytics page JavaScript functionality

let monthlyChart = null;
let categoryChart = null;

// Update all charts based on selected filters
async function updateCharts() {
    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    
    try {
        // Show loading state
        showLoadingState();
        
        // Update monthly chart
        await updateMonthlyChart(year);
        
        // Update category chart
        await updateCategoryChart(year, month);
        
        // Update summary cards
        await updateSummaryCards(year, month);
        
    } catch (error) {
        console.error('Error updating charts:', error);
        showErrorMessage('Failed to load analytics data. Please try again.');
    } finally {
        // Hide loading state
        hideLoadingState();
    }
}

// Update monthly spending chart
async function updateMonthlyChart(year) {
    try {
        const response = await fetch(`/api/analytics/monthly-spending?year=${year}`);
        const data = await response.json();
        
        const ctx = document.getElementById('monthlyChart');
        
        // Destroy existing chart
        if (monthlyChart) {
            monthlyChart.destroy();
        }
        
        monthlyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => item.month),
                datasets: [{
                    label: 'Monthly Spending',
                    data: data.map(item => item.amount),
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#007bff',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `Spending: $${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#374151'
                        },
                        ticks: {
                            color: '#e5e7eb',
                            callback: function(value) {
                                return '$' + value.toFixed(0);
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: '#374151'
                        },
                        ticks: {
                            color: '#e5e7eb'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
        
    } catch (error) {
        console.error('Error updating monthly chart:', error);
    }
}

// Update category breakdown chart
async function updateCategoryChart(year, month) {
    try {
        const response = await fetch(`/api/analytics/category-breakdown?year=${year}&month=${month}`);
        const data = await response.json();
        
        const ctx = document.getElementById('categoryChart');
        
        // Destroy existing chart
        if (categoryChart) {
            categoryChart.destroy();
        }
        
        if (data.length === 0) {
            // Show empty state
            showEmptyChart(ctx, 'No expenses for selected period');
            return;
        }
        
        categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(item => item.category),
                datasets: [{
                    data: data.map(item => item.amount),
                    backgroundColor: data.map(item => item.color),
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
                                size: 11
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
        
    } catch (error) {
        console.error('Error updating category chart:', error);
    }
}

// Update summary cards
async function updateSummaryCards(year, month) {
    try {
        // Fetch data for summary calculations
        const [monthlyResponse, categoryResponse] = await Promise.all([
            fetch(`/api/analytics/monthly-spending?year=${year}`),
            fetch(`/api/analytics/category-breakdown?year=${year}&month=${month}`)
        ]);
        
        const monthlyData = await monthlyResponse.json();
        const categoryData = await categoryResponse.json();
        
        // Calculate summary statistics
        const totalYearlySpending = monthlyData.reduce((sum, item) => sum + item.amount, 0);
        const averageMonthlySpending = totalYearlySpending / 12;
        const selectedMonthSpending = monthlyData.find(item => 
            item.month === new Date(year, month - 1).toLocaleString('default', { month: 'short' })
        )?.amount || 0;
        
        const topCategory = categoryData.reduce((max, item) => 
            item.amount > (max?.amount || 0) ? item : max, null
        );
        
        // Update summary cards
        const summaryContainer = document.getElementById('summaryCards');
        summaryContainer.innerHTML = `
            <div class="col-md-3 mb-3">
                <div class="card stat-card">
                    <div class="card-body text-center">
                        <i data-feather="calendar" class="text-primary mb-2" style="width: 32px; height: 32px;"></i>
                        <h5 class="text-primary">$${totalYearlySpending.toFixed(2)}</h5>
                        <small class="text-muted">Total Yearly Spending</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card stat-card">
                    <div class="card-body text-center">
                        <i data-feather="trending-up" class="text-success mb-2" style="width: 32px; height: 32px;"></i>
                        <h5 class="text-success">$${averageMonthlySpending.toFixed(2)}</h5>
                        <small class="text-muted">Average Monthly</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card stat-card">
                    <div class="card-body text-center">
                        <i data-feather="dollar-sign" class="text-info mb-2" style="width: 32px; height: 32px;"></i>
                        <h5 class="text-info">$${selectedMonthSpending.toFixed(2)}</h5>
                        <small class="text-muted">Selected Month</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card stat-card">
                    <div class="card-body text-center">
                        <i data-feather="award" class="text-warning mb-2" style="width: 32px; height: 32px;"></i>
                        <h5 class="text-warning">${topCategory?.category || 'N/A'}</h5>
                        <small class="text-muted">Top Category</small>
                    </div>
                </div>
            </div>
        `;
        
        // Re-initialize feather icons
        feather.replace();
        
    } catch (error) {
        console.error('Error updating summary cards:', error);
    }
}

// Show empty chart state
function showEmptyChart(ctx, message) {
    const parent = ctx.parentElement;
    parent.innerHTML = `
        <div class="text-center py-4">
            <i data-feather="pie-chart" class="text-muted mb-3" style="width: 48px; height: 48px;"></i>
            <p class="text-muted">${message}</p>
        </div>
    `;
    feather.replace();
}

// Show loading state
function showLoadingState() {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loadingOverlay';
    loadingOverlay.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center';
    loadingOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    loadingOverlay.style.zIndex = '9999';
    loadingOverlay.innerHTML = `
        <div class="text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-white mt-2">Loading analytics...</p>
        </div>
    `;
    document.body.appendChild(loadingOverlay);
}

// Hide loading state
function hideLoadingState() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

// Show error message
function showErrorMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Export analytics data
function exportAnalytics() {
    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    
    // Create CSV export
    Promise.all([
        fetch(`/api/analytics/monthly-spending?year=${year}`).then(r => r.json()),
        fetch(`/api/analytics/category-breakdown?year=${year}&month=${month}`).then(r => r.json())
    ]).then(([monthlyData, categoryData]) => {
        const csvData = [
            ['Analytics Export'],
            ['Year:', year],
            ['Month:', month],
            [''],
            ['Monthly Spending'],
            ['Month', 'Amount'],
            ...monthlyData.map(item => [item.month, item.amount.toFixed(2)]),
            [''],
            ['Category Breakdown'],
            ['Category', 'Amount'],
            ...categoryData.map(item => [item.category, item.amount.toFixed(2)])
        ];
        
        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${year}-${month}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }).catch(error => {
        console.error('Error exporting analytics:', error);
        showErrorMessage('Failed to export analytics data.');
    });
}

// Initialize analytics page
document.addEventListener('DOMContentLoaded', function() {
    // Set current year and month as defaults
    const now = new Date();
    document.getElementById('yearSelect').value = now.getFullYear();
    document.getElementById('monthSelect').value = now.getMonth() + 1;
    
    // Add event listeners
    document.getElementById('yearSelect').addEventListener('change', updateCharts);
    document.getElementById('monthSelect').addEventListener('change', updateCharts);
    
    // Add export button
    const title = document.querySelector('h1');
    if (title) {
        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn btn-outline-primary btn-sm ms-3';
        exportBtn.innerHTML = '<i data-feather="download" class="me-1"></i>Export';
        exportBtn.onclick = exportAnalytics;
        title.appendChild(exportBtn);
    }
});
