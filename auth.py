from flask import render_template, request, redirect, url_for, flash, session
from flask_login import LoginManager, login_user, logout_user, login_required
from email_validator import validate_email, EmailNotValidError
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from app import app, db
from models import User, PasswordResetToken

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Please log in to access this page.'
login_manager.login_message_category = 'info'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(str(user_id))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        first_name = request.form.get('first_name', '').strip()
        last_name = request.form.get('last_name', '').strip()
        
        # Validation
        errors = []
        
        # Email validation
        if not email:
            errors.append('Email is required.')
        else:
            try:
                validate_email(email)
            except EmailNotValidError:
                errors.append('Please enter a valid email address.')
            
            # Check if email already exists
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                errors.append('An account with this email already exists.')
        
        # Password validation
        if not password:
            errors.append('Password is required.')
        elif len(password) < 6:
            errors.append('Password must be at least 6 characters long.')
        
        if password != confirm_password:
            errors.append('Passwords do not match.')
        
        if errors:
            for error in errors:
                flash(error, 'error')
            return render_template('auth/register.html')
        
        # Create new user
        try:
            user = User(
                email=email,
                first_name=first_name if first_name else None,
                last_name=last_name if last_name else None,
                auth_type='local'
            )
            user.set_password(password)
            
            db.session.add(user)
            db.session.commit()
            
            flash('Account created successfully! Please log in.', 'success')
            return redirect(url_for('login'))
            
        except Exception as e:
            db.session.rollback()
            flash('An error occurred while creating your account. Please try again.', 'error')
            return render_template('auth/register.html')
    
    return render_template('auth/register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        remember_me = bool(request.form.get('remember_me'))
        
        if not email or not password:
            flash('Please enter both email and password.', 'error')
            return render_template('auth/login.html')
        
        # Find user by email
        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(password):
            login_user(user, remember=remember_me)
            
            # Redirect to next page if specified, otherwise dashboard
            next_page = request.args.get('next')
            if next_page:
                return redirect(next_page)
            
            flash(f'Welcome back, {user.full_name}!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid email or password.', 'error')
    
    return render_template('auth/login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out successfully.', 'info')
    return redirect(url_for('index'))

# Helper function to replace require_login decorator
def require_login(f):
    return login_required(f)

def send_password_reset_email(user, token):
    """Send password reset email using SendGrid"""
    try:
        # Check if SendGrid API key exists
        sendgrid_key = os.environ.get('SENDGRID_API_KEY')
        if not sendgrid_key:
            print("WARNING: SENDGRID_API_KEY not found. Email will not be sent.")
            return False
        
        # Create reset link
        reset_link = url_for('reset_password', token=token.token, _external=True)
        
        # Create email content
        message = Mail(
            from_email='noreply@expensetracker.com',
            to_emails=user.email,
            subject='Password Reset Request - ExpenseTracker',
            html_content=f'''
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #007bff;">Password Reset Request</h2>
                <p>Hello {user.full_name},</p>
                <p>You requested a password reset for your ExpenseTracker account.</p>
                <p>Click the button below to reset your password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_link}" 
                       style="background-color: #007bff; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p>Or copy and paste this link in your browser:</p>
                <p style="background-color: #f8f9fa; padding: 10px; border-radius: 5px; word-break: break-all;">
                    {reset_link}
                </p>
                <p><strong>This link will expire in 1 hour.</strong></p>
                <p>If you didn't request this password reset, please ignore this email.</p>
                <hr style="margin: 30px 0;">
                <p style="color: #666; font-size: 12px;">
                    This is an automated message from ExpenseTracker. Please do not reply to this email.
                </p>
            </div>
            '''
        )
        
        sg = SendGridAPIClient(api_key=sendgrid_key)
        response = sg.send(message)
        return response.status_code in [200, 202]
        
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False

@app.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        
        if not email:
            flash('Please enter your email address.', 'error')
            return render_template('auth/forgot_password.html')
        
        # Find user by email
        user = User.query.filter_by(email=email).first()
        
        if user:
            # Create password reset token
            token = PasswordResetToken.create_token(user.id)
            
            # Send email
            if send_password_reset_email(user, token):
                flash('Password reset link has been sent to your email address.', 'success')
            else:
                flash('Unable to send email at the moment. Please contact support.', 'error')
        else:
            # Don't reveal if email exists or not for security
            flash('If an account with this email exists, a password reset link has been sent.', 'info')
        
        return redirect(url_for('login'))
    
    return render_template('auth/forgot_password.html')

@app.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    # Verify token
    reset_token = PasswordResetToken.verify_token(token)
    
    if not reset_token:
        flash('Invalid or expired password reset link.', 'error')
        return redirect(url_for('forgot_password'))
    
    if request.method == 'POST':
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        # Validation
        errors = []
        
        if not password:
            errors.append('Password is required.')
        elif len(password) < 6:
            errors.append('Password must be at least 6 characters long.')
        
        if password != confirm_password:
            errors.append('Passwords do not match.')
        
        if errors:
            for error in errors:
                flash(error, 'error')
            return render_template('auth/reset_password.html', token=token)
        
        # Update user password
        try:
            user = User.query.get(reset_token.user_id)
            user.set_password(password)
            
            # Mark token as used
            reset_token.use_token()
            
            db.session.commit()
            
            flash('Your password has been successfully reset. You can now log in with your new password.', 'success')
            return redirect(url_for('login'))
            
        except Exception as e:
            db.session.rollback()
            flash('An error occurred while resetting your password. Please try again.', 'error')
    
    return render_template('auth/reset_password.html', token=token)