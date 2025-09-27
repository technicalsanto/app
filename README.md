# 💰 SpendWise - Personal Budget Tracker

> **Your personal budget tracker for smarter spending**

SpendWise is a comprehensive full-stack budgeting application that helps users track daily expenses, set savings goals, and receive personalized financial advice. Built with a beautiful teal-themed design and professional data visualizations.

[![Live Demo](https://img.shields.io/badge/Live-Demo-teal?style=for-the-badge)](https://spend-wise-173.preview.emergentagent.com)
[![React](https://img.shields.io/badge/React-19.1.1-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.1-green?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.5.0-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

## ✨ Features

### 🍽️ **Expense Tracker**
- **Quick expense logging** with intuitive category selection
- **7 predefined categories**: Food, Travel, Entertainment, Shopping, Bills, Health, Other
- **Beautiful card-based display** with emoji icons and visual feedback
- **Real-time total calculation** and monthly summaries
- **Floating "+" button** for easy expense addition
- **Delete functionality** with confirmation

### 🎯 **Savings Goals**
- **Create multiple savings targets** with custom names and amounts
- **Visual progress bars** with percentage completion tracking
- **Target date setting** for goal deadlines
- **Add money functionality** with instant progress updates
- **Celebration animations** when goals are completed
- **Goal management** with delete options

### 📊 **Analytics Dashboard**
- **Professional data visualizations** using Chart.js
- **Summary statistics**: Total spent, monthly spending, transaction count
- **Interactive pie chart** showing spending breakdown by category
- **Monthly trend analysis** with smooth line charts
- **Detailed category breakdown** with percentages and transaction counts
- **Color-coded insights** matching the app's teal theme

### 💡 **Smart Tips**
- **Personalized financial advice** based on actual spending patterns
- **Intelligent analysis**: Detects overspending in categories (>40% food, >30% entertainment, etc.)
- **General money-saving tips** for broader financial wellness
- **Visual distinction** between personalized and general advice
- **Category-specific recommendations**

## 🎨 Design & UI/UX

- **Modern teal color scheme** throughout the application
- **Clean, intuitive interface** similar to premium calculator apps
- **Mobile-responsive design** with Tailwind CSS
- **Smooth animations** and hover effects
- **Professional typography** using Inter font
- **Accessibility features** with proper contrast and focus states
- **Loading states** and error handling

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - Modern UI library with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - High-quality component library
- **Chart.js + React-Chartjs-2** - Professional data visualizations
- **Lucide React** - Beautiful icon library
- **Axios** - HTTP client for API communication
- **React Router DOM** - Client-side routing
- **Date-fns** - Date manipulation utilities

### Backend
- **FastAPI 0.110.1** - Modern Python web framework
- **Python 3.x** - Backend language
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation and settings management
- **Python-dotenv** - Environment variable management
- **CORS middleware** - Cross-origin resource sharing

### Database
- **MongoDB** - NoSQL document database
- **Async operations** - Non-blocking database queries
- **Data validation** - Proper schema enforcement

### Development Tools
- **ESLint** - JavaScript linting
- **Craco** - Create React App configuration override
- **Supervisord** - Process management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and Yarn
- Python 3.8+
- MongoDB instance

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/spendwise.git
   cd spendwise
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your MongoDB URL and settings
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   yarn install
   cp .env.example .env
   # Edit .env with your backend URL
   ```

4. **Database Setup**
   - Ensure MongoDB is running
   - The app will automatically create collections on first use

### Running the Application

#### Development Mode
```bash
# Terminal 1 - Backend
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Terminal 2 - Frontend  
cd frontend
yarn start
```

#### Production Mode
```bash
# Build frontend
cd frontend
yarn build

# Start backend with production settings
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001
```

## 📱 Usage Guide

### Adding Expenses
1. Click the floating **"+"** button in the bottom-right corner
2. Enter the amount, select a category, and add a description
3. Click **"Add Expense"** to save

### Setting Savings Goals
1. Navigate to the **"Goals"** tab
2. Click the floating **"+"** button
3. Enter goal name, target amount, and optional target date
4. Use the input field to add money toward your goal

### Viewing Analytics
1. Navigate to the **"Analytics"** tab
2. View summary statistics, pie chart, and trend analysis
3. Scroll down for detailed category breakdowns

### Getting Smart Tips
1. Navigate to the **"Tips"** tab
2. View personalized tips based on your spending patterns
3. General financial advice is also provided

## 🔧 API Documentation

### Base URL
```
https://your-domain.com/api
```

### Endpoints

#### Expenses
```http
GET    /api/expenses          # Get all expenses
POST   /api/expenses          # Create new expense
DELETE /api/expenses/{id}     # Delete expense
```

#### Savings Goals
```http
GET    /api/savings-goals     # Get all savings goals
POST   /api/savings-goals     # Create new savings goal
PUT    /api/savings-goals/{id} # Update savings goal
DELETE /api/savings-goals/{id} # Delete savings goal
```

#### Analytics & Tips
```http
GET    /api/spending-summary  # Get spending analytics
GET    /api/tips             # Get personalized tips
```

### Request/Response Examples

#### Create Expense
```json
POST /api/expenses
{
  "amount": 25.50,
  "category": "food",
  "description": "Lunch at cafe"
}
```

#### Create Savings Goal
```json
POST /api/savings-goals
{
  "name": "Vacation Fund",
  "target_amount": 2000.00,
  "target_date": "2025-12-31"
}
```

## 🎯 Key Features Showcase

### Expense Categories
| Category | Icon | Color Theme |
|----------|------|-------------|
| Food | 🍽️ | Orange |
| Travel | ✈️ | Blue |
| Entertainment | 🎬 | Purple |
| Shopping | 🛍️ | Pink |
| Bills | 📄 | Red |
| Health | ⚕️ | Green |
| Other | 📦 | Gray |

### Smart Tip Examples
- **Food Spending Alert**: "You're spending over 40% on food! Try meal prepping..."
- **Entertainment Budget**: "Consider free entertainment options like parks..."
- **Shopping Smart**: "Try the 24-hour rule: wait a day before making non-essential purchases..."

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📝 Environment Variables

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=spendwise_db
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 🐛 Known Issues & Roadmap

### Current Limitations
- No user authentication (single-user mode)
- No data export functionality
- No budget limits/alerts

### Future Enhancements
- [ ] Multi-user support with authentication
- [ ] Budget setting and alerts
- [ ] Data export (CSV, PDF)
- [ ] Receipt photo upload
- [ ] Recurring expense tracking
- [ ] Mobile app (React Native)
- [ ] Integration with banking APIs
- [ ] Advanced analytics and forecasting

## 📊 Performance & Scalability

- **Frontend**: Optimized React components with proper key usage
- **Backend**: Async FastAPI with efficient database queries
- **Database**: Indexed MongoDB collections for fast retrieval
- **Caching**: Client-side caching for better user experience

## 🔒 Security Features

- CORS protection configured
- Input validation on both frontend and backend
- Secure MongoDB connections
- Environment variable management for sensitive data

## 📞 Support & Contact

- **Issues**: Please use GitHub Issues for bug reports
- **Feature Requests**: Open a GitHub Issue with the "enhancement" label
- **Documentation**: Check the wiki for additional documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Shadcn/UI** for the beautiful component library
- **Chart.js** for professional data visualizations
- **Tailwind CSS** for the utility-first styling approach
- **FastAPI** for the excellent Python web framework
- **MongoDB** for flexible document storage

---

<div align="center">
  <strong>Built with ❤️ for better financial management</strong>
  <br />
  <sub>Star ⭐ this repo if you find it helpful!</sub>
</div>
