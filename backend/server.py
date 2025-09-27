from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class ExpenseCategory(str, Enum):
    FOOD = "food"
    TRAVEL = "travel"
    ENTERTAINMENT = "entertainment"
    SHOPPING = "shopping"
    BILLS = "bills"
    HEALTH = "health"
    OTHER = "other"

# Models
class Expense(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    amount: float
    category: ExpenseCategory
    description: str
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ExpenseCreate(BaseModel):
    amount: float
    category: ExpenseCategory
    description: str
    date: Optional[datetime] = None

class SavingsGoal(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    target_amount: float
    current_amount: float = 0.0
    target_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SavingsGoalCreate(BaseModel):
    name: str
    target_amount: float
    target_date: Optional[datetime] = None

class SavingsGoalUpdate(BaseModel):
    current_amount: float

class Tip(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    category: str
    is_personalized: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Helper functions
def prepare_for_mongo(data):
    """Convert datetime objects to ISO strings for MongoDB storage"""
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
    return data

def parse_from_mongo(item):
    """Convert ISO strings back to datetime objects from MongoDB"""
    if isinstance(item, dict):
        for key, value in item.items():
            if isinstance(value, str) and 'T' in value and ('Z' in value or '+' in value or '-' in value[-6:]):
                try:
                    item[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                except ValueError:
                    pass  # Keep as string if not a valid datetime
    return item

# Routes
@api_router.get("/")
async def root():
    return {"message": "SpendWise API - Your Personal Budget Tracker"}

# Expense endpoints
@api_router.post("/expenses", response_model=Expense)
async def create_expense(expense_data: ExpenseCreate):
    expense_dict = expense_data.dict()
    if expense_dict.get('date') is None:
        expense_dict['date'] = datetime.now(timezone.utc)
    
    expense = Expense(**expense_dict)
    expense_mongo = prepare_for_mongo(expense.dict())
    
    await db.expenses.insert_one(expense_mongo)
    return expense

@api_router.get("/expenses", response_model=List[Expense])
async def get_expenses():
    expenses = await db.expenses.find().sort("date", -1).to_list(1000)
    return [Expense(**parse_from_mongo(expense)) for expense in expenses]

@api_router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str):
    result = await db.expenses.delete_one({"id": expense_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted successfully"}

# Savings Goal endpoints
@api_router.post("/savings-goals", response_model=SavingsGoal)
async def create_savings_goal(goal_data: SavingsGoalCreate):
    goal = SavingsGoal(**goal_data.dict())
    goal_mongo = prepare_for_mongo(goal.dict())
    
    await db.savings_goals.insert_one(goal_mongo)
    return goal

@api_router.get("/savings-goals", response_model=List[SavingsGoal])
async def get_savings_goals():
    goals = await db.savings_goals.find().sort("created_at", -1).to_list(1000)
    return [SavingsGoal(**parse_from_mongo(goal)) for goal in goals]

@api_router.put("/savings-goals/{goal_id}", response_model=SavingsGoal)
async def update_savings_goal(goal_id: str, update_data: SavingsGoalUpdate):
    result = await db.savings_goals.update_one(
        {"id": goal_id},
        {"$set": update_data.dict()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Savings goal not found")
    
    updated_goal = await db.savings_goals.find_one({"id": goal_id})
    return SavingsGoal(**parse_from_mongo(updated_goal))

@api_router.delete("/savings-goals/{goal_id}")
async def delete_savings_goal(goal_id: str):
    result = await db.savings_goals.delete_one({"id": goal_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Savings goal not found")
    return {"message": "Savings goal deleted successfully"}

# Budget endpoints
@api_router.get("/spending-summary")
async def get_spending_summary():
    """Get spending summary with analytics data"""
    expenses = await db.expenses.find().to_list(1000)
    
    if not expenses:
        return {
            "total_spent": 0,
            "categories": {},
            "monthly_data": {},
            "transaction_count": 0
        }
    
    # Calculate totals by category
    categories = {}
    monthly_data = {}
    total_spent = 0
    
    for expense in expenses:
        # Category totals
        category = expense.get('category', 'other')
        categories[category] = categories.get(category, 0) + expense.get('amount', 0)
        total_spent += expense.get('amount', 0)
        
        # Monthly totals
        if expense.get('date'):
            try:
                expense_date = datetime.fromisoformat(expense['date'].replace('Z', '+00:00'))
                month_key = expense_date.strftime('%Y-%m')
                monthly_data[month_key] = monthly_data.get(month_key, 0) + expense.get('amount', 0)
            except:
                pass
    
    return {
        "total_spent": total_spent,
        "categories": categories,
        "monthly_data": monthly_data,
        "transaction_count": len(expenses)
    }

# Tips endpoints
@api_router.get("/tips", response_model=List[Tip])
async def get_tips():
    # Get user's expenses to generate personalized tips
    expenses = await db.expenses.find().to_list(1000)
    
    # Generate smart tips based on spending patterns
    tips = []
    
    if expenses:
        # Calculate category spending
        category_spending = {}
        total_spending = 0
        
        for expense in expenses:
            category = expense.get('category', 'other')
            amount = expense.get('amount', 0)
            category_spending[category] = category_spending.get(category, 0) + amount
            total_spending += amount
        
        # Generate personalized tips based on spending patterns
        if category_spending.get('food', 0) > total_spending * 0.4:
            tips.append(Tip(
                title="🍽️ Food Spending Alert",
                content="You're spending over 40% on food! Try meal prepping or cooking at home more often to save money.",
                category="food",
                is_personalized=True
            ))
        
        if category_spending.get('entertainment', 0) > total_spending * 0.3:
            tips.append(Tip(
                title="🎬 Entertainment Budget",
                content="Consider free entertainment options like parks, free museums, or home movie nights to reduce entertainment costs.",
                category="entertainment",
                is_personalized=True
            ))
        
        if category_spending.get('shopping', 0) > total_spending * 0.25:
            tips.append(Tip(
                title="🛍️ Shopping Smart",
                content="Try the 24-hour rule: wait a day before making non-essential purchases to avoid impulse buying.",
                category="shopping",
                is_personalized=True
            ))
    
    # Add some general tips
    general_tips = [
        Tip(
            title="💡 Quick Save Tip",
            content="Save spare change in a jar. You'll be surprised how much it adds up over time!",
            category="general",
            is_personalized=False
        ),
        Tip(
            title="📱 Use Apps Wisely",
            content="Use cashback apps and compare prices before making purchases to get the best deals.",
            category="general",
            is_personalized=False
        ),
        Tip(
            title="🎯 Track Your Progress",
            content="Review your spending weekly to stay aware of your financial habits and adjust as needed.",
            category="general",
            is_personalized=False
        )
    ]
    
    tips.extend(general_tips)
    return tips[:6]  # Return top 6 tips

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
