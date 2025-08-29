# ExpenseTracker

## Overview

ExpenseTracker is a personal finance management web application built with Flask that helps users track expenses, create budgets, and analyze spending patterns. The application provides a comprehensive dashboard with visual analytics, category-based expense organization, and budget monitoring capabilities. Users can authenticate through Replit Auth and manage their financial data through an intuitive web interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Template Engine**: Jinja2 templates with Bootstrap 5 for responsive UI
- **Styling**: Custom CSS with dark theme support and Bootstrap components
- **JavaScript Libraries**: Chart.js for data visualization, Feather Icons for iconography
- **Client-side Features**: Interactive charts, form validation, modal dialogs, and AJAX-based data updates

### Backend Architecture
- **Web Framework**: Flask with modular route organization
- **Database ORM**: SQLAlchemy with Flask-SQLAlchemy extension
- **Authentication**: Flask-Login with Replit OAuth integration via Flask-Dance
- **Session Management**: Server-side sessions with permanent session support
- **Error Handling**: Custom error pages and logging configuration

### Data Storage
- **Database**: SQLite/PostgreSQL with SQLAlchemy ORM
- **Models**: User, Expense, Budget, Category, and OAuth entities
- **Relationships**: User-centric design with cascading deletions
- **Migrations**: Automatic table creation on app initialization

### Authentication & Authorization
- **OAuth Provider**: Replit Auth integration
- **Session Storage**: Custom UserSessionStorage for OAuth tokens
- **Login Management**: Flask-Login with user session persistence
- **Authorization**: Route-level protection with @require_login decorator

### Core Features
- **Expense Tracking**: Add, edit, delete expenses with category assignment
- **Budget Management**: Monthly and yearly budget creation with progress tracking
- **Analytics Dashboard**: Visual spending analysis with charts and statistics
- **Category System**: Color-coded expense categorization
- **Data Visualization**: Monthly spending trends and category breakdowns

## External Dependencies

### Authentication Services
- **Replit Auth**: OAuth2 provider for user authentication and authorization

### Frontend Libraries
- **Bootstrap 5**: UI framework with dark theme support
- **Chart.js**: JavaScript charting library for data visualization
- **Feather Icons**: Icon library for consistent UI elements

### Python Packages
- **Flask**: Core web framework
- **Flask-SQLAlchemy**: Database ORM integration
- **Flask-Login**: User session management
- **Flask-Dance**: OAuth integration framework
- **PyJWT**: JWT token handling for authentication
- **Werkzeug**: WSGI utilities and proxy fix middleware

### Database
- **SQLAlchemy**: Database abstraction layer
- **SQLite/PostgreSQL**: Database engines (configurable via DATABASE_URL)

### Development Tools
- **Python Logging**: Application logging and debugging
- **Werkzeug ProxyFix**: HTTPS URL generation support for deployed environments