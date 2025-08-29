// Expenses page JavaScript functionality

// Set today's date as default in the expense form
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
    
    // Initialize form validation
    initializeFormValidation();
    
    // Add expense form modal event listeners
    const addExpenseModal = document.getElementById('addExpenseModal');
    if (addExpenseModal) {
        addExpenseModal.addEventListener('shown.bs.modal', function() {
            document.getElementById('amount').focus();
        });
        
        addExpenseModal.addEventListener('hidden.bs.modal', function() {
            resetExpenseForm();
        });
    }
    
    // Initialize category management
    initializeCategoryManagement();
});

// Initialize form validation
function initializeFormValidation() {
    const form = document.querySelector('#addExpenseModal form');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            
            if (validateExpenseForm()) {
                this.submit();
            }
        });
    }
}

// Validate expense form
function validateExpenseForm() {
    let isValid = true;
    
    // Validate amount
    const amount = document.getElementById('amount');
    if (!amount.value || parseFloat(amount.value) <= 0) {
        showFieldError(amount, 'Please enter a valid amount greater than 0');
        isValid = false;
    } else {
        clearFieldError(amount);
    }
    
    // Validate description
    const description = document.getElementById('description');
    if (!description.value.trim()) {
        showFieldError(description, 'Please enter a description');
        isValid = false;
    } else {
        clearFieldError(description);
    }
    
    // Validate category
    const category = document.getElementById('category_id');
    if (!category.value) {
        showFieldError(category, 'Please select a category');
        isValid = false;
    } else {
        clearFieldError(category);
    }
    
    // Validate date
    const date = document.getElementById('date');
    if (!date.value) {
        showFieldError(date, 'Please select a date');
        isValid = false;
    } else {
        clearFieldError(date);
    }
    
    return isValid;
}

// Show field error
function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('is-invalid');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

// Clear field error
function clearFieldError(field) {
    field.classList.remove('is-invalid');
    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Reset expense form
function resetExpenseForm() {
    const form = document.querySelector('#addExpenseModal form');
    if (form) {
        form.reset();
        
        // Clear all validation errors
        const invalidFields = form.querySelectorAll('.is-invalid');
        invalidFields.forEach(field => clearFieldError(field));
        
        // Reset date to today
        const dateInput = document.getElementById('date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
    }
}

// Initialize category management
function initializeCategoryManagement() {
    // Add "Add Category" option to category select
    const categorySelect = document.getElementById('category_id');
    if (categorySelect) {
        const addCategoryOption = document.createElement('option');
        addCategoryOption.value = 'add_new';
        addCategoryOption.textContent = '+ Add New Category';
        addCategoryOption.style.fontStyle = 'italic';
        categorySelect.appendChild(addCategoryOption);
        
        categorySelect.addEventListener('change', function() {
            if (this.value === 'add_new') {
                // Reset selection and show category modal
                this.value = '';
                const categoryModal = new bootstrap.Modal(document.getElementById('addCategoryModal'));
                categoryModal.show();
            }
        });
    }
    
    // Handle category form submission
    const categoryForm = document.querySelector('#addCategoryModal form');
    if (categoryForm) {
        categoryForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            if (validateCategoryForm()) {
                this.submit();
            }
        });
    }
}

// Validate category form
function validateCategoryForm() {
    let isValid = true;
    
    const categoryName = document.getElementById('category_name');
    if (!categoryName.value.trim()) {
        showFieldError(categoryName, 'Please enter a category name');
        isValid = false;
    } else {
        clearFieldError(categoryName);
    }
    
    return isValid;
}

// Format amount input
function formatAmountInput(input) {
    let value = input.value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    input.value = value;
}

// Add event listener for amount formatting
document.addEventListener('DOMContentLoaded', function() {
    const amountInput = document.getElementById('amount');
    if (amountInput) {
        amountInput.addEventListener('input', function() {
            formatAmountInput(this);
        });
    }
});

// Quick expense shortcuts
function addQuickExpense(amount, description, category) {
    // Fill the form with quick expense data
    document.getElementById('amount').value = amount;
    document.getElementById('description').value = description;
    document.getElementById('category_id').value = category;
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('addExpenseModal'));
    modal.show();
}

// Export expenses data
function exportExpenses() {
    // Create CSV data from the expenses table
    const table = document.querySelector('.table');
    if (!table) return;
    
    const rows = table.querySelectorAll('tr');
    const csvData = [];
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('th, td');
        const rowData = [];
        
        cells.forEach((cell, index) => {
            // Skip the actions column
            if (index < cells.length - 1) {
                let text = cell.textContent.trim();
                // Clean up badge text
                if (cell.querySelector('.badge')) {
                    text = cell.querySelector('.badge').textContent.trim();
                }
                rowData.push(text);
            }
        });
        
        if (rowData.length > 0) {
            csvData.push(rowData);
        }
    });
    
    if (csvData.length === 0) return;
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Search and filter functionality
function initializeSearch() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'form-control mb-3';
    searchInput.placeholder = 'Search expenses...';
    
    const table = document.querySelector('.table');
    if (table) {
        table.parentNode.insertBefore(searchInput, table);
        
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = table.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
}

// Initialize search if expenses exist
document.addEventListener('DOMContentLoaded', function() {
    const expensesTable = document.querySelector('.table');
    if (expensesTable && expensesTable.querySelectorAll('tbody tr').length > 0) {
        initializeSearch();
    }
});
