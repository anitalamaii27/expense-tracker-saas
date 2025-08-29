from flask import render_template, request, redirect, url_for, flash, jsonify, session
from flask_login import current_user
from datetime import datetime, date
from decimal import Decimal
import calendar
from sqlalchemy import extract, func

from app import app, db
from models import User, Expense, Budget, Category
from auth import require_login  # Import from our new auth system

# Make session permanent
@app.before_request
def make_session_permanent():
    session.permanent = True

@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route('/dashboard')
@require_login
def dashboard():
    # Get current month/year stats
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    # Total expenses this month
    monthly_expenses = db.session.query(func.sum(Expense.amount)).filter(
        Expense.user_id == current_user.id,
        extract('month', Expense.date) == current_month,
        extract('year', Expense.date) == current_year
    ).scalar() or 0
    
    # Total budget this month
    monthly_budget = db.session.query(func.sum(Budget.amount)).filter(
        Budget.user_id == current_user.id,
        Budget.month == current_month,
        Budget.year == current_year,
        Budget.period == 'monthly'
    ).scalar() or 0
    
    # Recent expenses
    recent_expenses = Expense.query.filter_by(user_id=current_user.id).order_by(Expense.date.desc()).limit(5).all()
    
    # Categories with spending
    categories_spending = db.session.query(
        Category.name,
        Category.color,
        func.sum(Expense.amount).label('total')
    ).join(Expense).filter(
        Expense.user_id == current_user.id,
        extract('month', Expense.date) == current_month,
        extract('year', Expense.date) == current_year
    ).group_by(Category.id).all()
    
    return render_template('dashboard.html', 
                         monthly_expenses=monthly_expenses,
                         monthly_budget=monthly_budget,
                         recent_expenses=recent_expenses,
                         categories_spending=categories_spending)

@app.route('/expenses')
@require_login
def expenses():
    page = request.args.get('page', 1, type=int)
    expenses_list = Expense.query.filter_by(user_id=current_user.id).order_by(Expense.date.desc()).paginate(
        page=page, per_page=20, error_out=False)
    categories = Category.query.filter_by(user_id=current_user.id).all()
    return render_template('expenses.html', expenses=expenses_list, categories=categories)

@app.route('/expenses/add', methods=['POST'])
@require_login
def add_expense():
    try:
        amount = Decimal(request.form['amount'])
        description = request.form['description']
        expense_date = datetime.strptime(request.form['date'], '%Y-%m-%d').date()
        category_id = int(request.form['category_id'])
        
        # Verify category belongs to user
        category = Category.query.filter_by(id=category_id, user_id=current_user.id).first()
        if not category:
            flash('Invalid category selected.', 'error')
            return redirect(url_for('expenses'))
        
        expense = Expense(
            amount=amount,
            description=description,
            date=expense_date,
            user_id=current_user.id,
            category_id=category_id
        )
        
        db.session.add(expense)
        db.session.commit()
        flash('Expense added successfully!', 'success')
        
    except Exception as e:
        flash('Error adding expense. Please check your input.', 'error')
        db.session.rollback()
    
    return redirect(url_for('expenses'))

@app.route('/expenses/<int:expense_id>/delete', methods=['POST'])
@require_login
def delete_expense(expense_id):
    expense = Expense.query.filter_by(id=expense_id, user_id=current_user.id).first()
    if expense:
        db.session.delete(expense)
        db.session.commit()
        flash('Expense deleted successfully!', 'success')
    else:
        flash('Expense not found.', 'error')
    return redirect(url_for('expenses'))

@app.route('/budgets')
@require_login
def budgets():
    current_year = datetime.now().year
    year = request.args.get('year', current_year, type=int)
    
    budgets_list = Budget.query.filter_by(user_id=current_user.id, year=year).order_by(Budget.month).all()
    categories = Category.query.filter_by(user_id=current_user.id).all()
    
    # Calculate actual spending for each budget
    budget_data = []
    for budget in budgets_list:
        if budget.period == 'monthly':
            actual_spending = db.session.query(func.sum(Expense.amount)).filter(
                Expense.user_id == current_user.id,
                Expense.category_id == budget.category_id,
                extract('month', Expense.date) == budget.month,
                extract('year', Expense.date) == budget.year
            ).scalar() or 0
        else:  # yearly
            actual_spending = db.session.query(func.sum(Expense.amount)).filter(
                Expense.user_id == current_user.id,
                Expense.category_id == budget.category_id,
                extract('year', Expense.date) == budget.year
            ).scalar() or 0
        
        budget_data.append({
            'budget': budget,
            'actual': actual_spending,
            'percentage': (actual_spending / budget.amount * 100) if budget.amount > 0 else 0
        })
    
    return render_template('budgets.html', budget_data=budget_data, categories=categories, current_year=year)

@app.route('/budgets/add', methods=['POST'])
@require_login
def add_budget():
    try:
        name = request.form['name']
        amount = Decimal(request.form['amount'])
        period = request.form['period']
        year = int(request.form['year'])
        month = int(request.form['month']) if period == 'monthly' else None
        category_id = int(request.form['category_id'])
        
        # Verify category belongs to user
        category = Category.query.filter_by(id=category_id, user_id=current_user.id).first()
        if not category:
            flash('Invalid category selected.', 'error')
            return redirect(url_for('budgets'))
        
        budget = Budget(
            name=name,
            amount=amount,
            period=period,
            month=month,
            year=year,
            user_id=current_user.id,
            category_id=category_id
        )
        
        db.session.add(budget)
        db.session.commit()
        flash('Budget added successfully!', 'success')
        
    except Exception as e:
        flash('Error adding budget. Please check your input.', 'error')
        db.session.rollback()
    
    return redirect(url_for('budgets'))

@app.route('/budgets/<int:budget_id>/delete', methods=['POST'])
@require_login
def delete_budget(budget_id):
    budget = Budget.query.filter_by(id=budget_id, user_id=current_user.id).first()
    if budget:
        db.session.delete(budget)
        db.session.commit()
        flash('Budget deleted successfully!', 'success')
    else:
        flash('Budget not found.', 'error')
    return redirect(url_for('budgets'))

@app.route('/analytics')
@require_login
def analytics():
    return render_template('analytics.html')

@app.route('/api/analytics/monthly-spending')
@require_login
def api_monthly_spending():
    year = request.args.get('year', datetime.now().year, type=int)
    
    monthly_data = []
    for month in range(1, 13):
        total = db.session.query(func.sum(Expense.amount)).filter(
            Expense.user_id == current_user.id,
            extract('month', Expense.date) == month,
            extract('year', Expense.date) == year
        ).scalar() or 0
        monthly_data.append({
            'month': calendar.month_abbr[month],
            'amount': float(total)
        })
    
    return jsonify(monthly_data)

@app.route('/api/analytics/category-breakdown')
@require_login
def api_category_breakdown():
    year = request.args.get('year', datetime.now().year, type=int)
    month = request.args.get('month', datetime.now().month, type=int)
    
    category_data = db.session.query(
        Category.name,
        Category.color,
        func.sum(Expense.amount).label('total')
    ).join(Expense).filter(
        Expense.user_id == current_user.id,
        extract('month', Expense.date) == month,
        extract('year', Expense.date) == year
    ).group_by(Category.id).all()
    
    data = [{
        'category': item.name,
        'color': item.color,
        'amount': float(item.total)
    } for item in category_data]
    
    return jsonify(data)

@app.route('/categories/add', methods=['POST'])
@require_login
def add_category():
    try:
        name = request.form['name']
        color = request.form['color']
        
        category = Category(
            name=name,
            color=color,
            user_id=current_user.id
        )
        
        db.session.add(category)
        db.session.commit()
        flash('Category added successfully!', 'success')
        
    except Exception as e:
        flash('Error adding category. Please check your input.', 'error')
        db.session.rollback()
    
    return redirect(request.referrer or url_for('expenses'))

# Initialize default categories for new users
@app.before_request
def init_default_categories():
    if current_user.is_authenticated:
        if not Category.query.filter_by(user_id=current_user.id).first():
            default_categories = [
                ('Food & Dining', '#e74c3c'),
                ('Transportation', '#3498db'),
                ('Shopping', '#9b59b6'),
                ('Entertainment', '#f39c12'),
                ('Bills & Utilities', '#1abc9c'),
                ('Healthcare', '#e67e22'),
                ('Education', '#34495e'),
                ('Other', '#95a5a6')
            ]
            
            for name, color in default_categories:
                category = Category(name=name, color=color, user_id=current_user.id)
                db.session.add(category)
            
            try:
                db.session.commit()
            except:
                db.session.rollback()
