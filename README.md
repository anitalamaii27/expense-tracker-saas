# 💰 ExpenseTracker - SaaS Expense & Budget Management Platform

A modern, full-stack web application for tracking expenses, managing budgets, and analyzing spending patterns. Built with Flask, PostgreSQL, and Bootstrap with a professional dark theme.

## 🚀 Live Demo

**[View Live Application →](https://9e7c9be4-0b1f-4f98-977c-30106bafc744-00-bjnvh0yciwzu.worf.replit.dev)**

## ✨ Features

### 🔐 **User Authentication**
- Secure login/logout with Replit Auth integration
- User session management
- Protected routes and data isolation

### 📊 **Dashboard Analytics**
- Real-time spending overview
- Monthly budget progress tracking
- Visual charts with Chart.js
- Category breakdown with color-coded spending

### 💳 **Expense Management**
- Add, edit, and delete expenses
- Category-based organization
- Date-based filtering
- Pagination for large datasets

### 🎯 **Budget Planning**
- Create monthly and yearly budgets
- Real-time budget vs. actual spending comparison
- Visual progress indicators
- Budget alerts and notifications

### 📈 **Advanced Analytics**
- Interactive spending trend charts
- Category breakdown visualizations
- Monthly/yearly spending reports
- Export functionality for data analysis

### 🎨 **Modern UI/UX**
- Responsive Bootstrap 5 design
- Professional dark theme
- Mobile-first approach
- Intuitive navigation and user experience

## 🛠️ Technology Stack

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - Database ORM
- **PostgreSQL** - Primary database
- **Flask-Login** - User session management
- **Flask-Dance** - OAuth integration

### Frontend
- **Bootstrap 5** - UI framework with custom dark theme
- **Chart.js** - Interactive data visualization
- **Feather Icons** - Consistent iconography
- **Vanilla JavaScript** - Dynamic interactions

### Authentication
- **Replit Auth** - OAuth2 provider
- **JWT** - Secure token handling

## 🗄️ Database Schema

### User Model
- User profiles with OAuth integration
- Secure session management
- Relationship management for expenses and budgets

### Expense Model
- Amount, description, date tracking
- Category association
- User isolation

### Budget Model
- Monthly/yearly budget planning
- Category-specific budgeting
- Progress tracking

### Category Model
- Color-coded expense categories
- User-specific customization
- Default category initialization

## 📱 Key Functionality

### Dashboard
- Monthly spending vs. budget comparison
- Recent expenses overview
- Category spending breakdown
- Visual progress indicators

### Expense Tracking
- Quick expense entry with validation
- Category selection and management
- Date-based organization
- Bulk operations support

### Budget Management
- Flexible budget creation (monthly/yearly)
- Real-time progress monitoring
- Visual budget health indicators
- Overspending alerts

### Analytics & Reporting
- Monthly spending trends
- Category analysis
- Comparative spending reports
- Data export capabilities

## 🔧 Installation & Setup

### Prerequisites
- Python 3.11+
- PostgreSQL database
- Environment variables for authentication

### Local Development
```bash
# Clone the repository
git clone https://github.com/anitalamaii27/expense-tracker-saas.git

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
export DATABASE_URL="your_postgresql_url"
export SESSION_SECRET="your_session_secret"

# Run the application
python main.py
```

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Flask session secret key
- `REPL_ID` - Replit application ID (for OAuth)

## 🏗️ Project Structure

```
expense-tracker-saas/
├── app.py                 # Flask application configuration
├── main.py               # Application entry point
├── models.py             # Database models and relationships
├── routes.py             # API endpoints and view logic
├── replit_auth.py        # Authentication handling
├── static/
│   ├── css/
│   │   └── style.css     # Custom styling
│   └── js/
│       ├── dashboard.js  # Dashboard functionality
│       ├── expenses.js   # Expense management
│       └── analytics.js  # Analytics features
└── templates/
    ├── base.html         # Base template
    ├── dashboard.html    # Main dashboard
    ├── expenses.html     # Expense management
    ├── budgets.html      # Budget planning
    └── analytics.html    # Analytics dashboard
```

## 🎯 Core Features Implementation

### User Experience
- **Intuitive Design**: Clean, professional interface with logical navigation
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Real-time Updates**: Dynamic content updates without page refreshes
- **Data Visualization**: Interactive charts for better financial insights

### Security
- **OAuth Integration**: Secure authentication through Replit Auth
- **Data Isolation**: User-specific data protection
- **Session Management**: Secure session handling with automatic cleanup
- **Input Validation**: Comprehensive form validation and sanitization

### Performance
- **Database Optimization**: Efficient queries with proper indexing
- **Frontend Optimization**: Minimized asset loading and caching
- **Responsive Design**: Fast loading across all device types

## 📊 Business Logic

### Budget Calculation
- Real-time budget vs. actual spending comparison
- Percentage-based progress tracking
- Overspending detection and alerts

### Analytics Engine
- Monthly spending trend analysis
- Category-based spending insights
- Year-over-year comparison capabilities

### Data Management
- Automated category creation for new users
- Expense categorization and organization
- Historical data preservation

## 🚀 Deployment

This application is deployed on Replit with:
- **Automatic scaling** and load balancing
- **PostgreSQL database** with backup and recovery
- **SSL/TLS encryption** for secure connections
- **Environment variable management** for configuration

## 👨‍💻 Developer

**Anita Lamai** - [GitHub](https://github.com/anitalamaii27)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🌟 Acknowledgments

- **Bootstrap Team** for the excellent UI framework
- **Chart.js** for powerful data visualization
- **Flask Community** for the robust web framework
- **Replit** for deployment and hosting platform

---

⭐ **Star this repository if you found it helpful!**