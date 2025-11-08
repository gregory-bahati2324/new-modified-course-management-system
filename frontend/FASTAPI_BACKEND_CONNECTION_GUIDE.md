# FastAPI Backend Connection Guide for Kids! 🚀

Hi there! Welcome to the super simple guide for connecting your MUST Learning Hub to a FastAPI backend. Don't worry - I'll explain everything like you're 12 years old!

## Table of Contents
1. [What is a Backend?](#what-is-a-backend)
2. [What You Need](#what-you-need)
3. [Setting Up Your FastAPI Backend](#setting-up-your-fastapi-backend)
4. [Connecting Frontend to Backend](#connecting-frontend-to-backend)
5. [Testing Your Connection](#testing-your-connection)
6. [Common Problems and Solutions](#common-problems-and-solutions)

---

## What is a Backend? 🤔

Imagine your app is like a restaurant:
- **Frontend** (what you see): This is like the dining area where customers sit and look at menus. It's the pretty part!
- **Backend** (behind the scenes): This is like the kitchen where the food is actually cooked. It does all the hard work!

The backend:
- Stores data in a database (like student names, courses, grades)
- Checks if passwords are correct
- Does calculations
- Keeps your data safe

---

## What You Need 📋

Before we start, make sure you have these things:

### 1. Python Installed
Python is the language FastAPI uses. Check if you have it:
```bash
python --version
```
You should see something like `Python 3.8.0` or higher.

Don't have Python? Download it from [python.org](https://www.python.org/downloads/)

### 2. A Code Editor
You need somewhere to write code. Popular choices:
- VS Code (recommended - it's free and easy!)
- PyCharm
- Any text editor you like

### 3. A Terminal/Command Prompt
This is where you type commands to make things happen. 
- On Windows: Search for "Command Prompt" or "PowerShell"
- On Mac: Search for "Terminal"

---

## Setting Up Your FastAPI Backend 🏗️

### Step 1: Create a Folder for Your Backend
Think of this as creating a new folder on your computer for all your backend files.

```bash
mkdir must-lms-backend
cd must-lms-backend
```

**What this does:**
- `mkdir` = "make directory" (create a folder)
- `cd` = "change directory" (go into that folder)

### Step 2: Install FastAPI and Other Tools

Now we need to install FastAPI and its friends. It's like downloading apps on your phone!

```bash
pip install fastapi uvicorn[standard] pydantic python-jose[cryptography] passlib[bcrypt] python-multipart
```

**What each thing does:**
- `fastapi`: The main tool that creates your backend
- `uvicorn`: A server that runs your FastAPI app (like pressing "play")
- `pydantic`: Helps check that data is correct
- `python-jose`: Helps with login security (JWT tokens)
- `passlib`: Makes passwords secure
- `python-multipart`: Helps upload files

**Note:** This might take a few minutes. Be patient! ⏳

### Step 3: Copy the Backend Files

Remember those files in your project?
- `backend_endpoints_example.py`
- `backend_schemas.py`
- `backend_auth_utilities.py`

Copy these three files into your new `must-lms-backend` folder.

You can rename them to be simpler:
- `backend_endpoints_example.py` → `main.py`
- `backend_schemas.py` → `schemas.py`
- `backend_auth_utilities.py` → `auth.py`

### Step 4: Create a Secret Key

Your backend needs a secret password to keep user logins safe. Let's create one!

Open your terminal and type:
```bash
python
```

Then type this:
```python
import secrets
print(secrets.token_hex(32))
```

You'll see something like: `a1b2c3d4e5f6...` - this is your secret key! Copy it.

Type `exit()` to leave Python.

### Step 5: Create Environment Variables

Create a file called `.env` in your backend folder:

```bash
# In your must-lms-backend folder
touch .env
```

Open the `.env` file and add this:
```
SECRET_KEY=paste_your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./must_lms.db
```

**What this means:**
- `SECRET_KEY`: Your secret password for security
- `ALGORITHM`: The method to encode passwords (HS256 is very secure)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: How long users stay logged in (30 minutes)
- `DATABASE_URL`: Where your data is stored

### Step 6: Update Your main.py File

Open `main.py` and at the very top, add this:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="MUST LMS API", version="1.0.0")

# Allow your frontend to talk to the backend (VERY IMPORTANT!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Your React app in development
        "http://localhost:3000",  # Alternative port
        "https://your-production-domain.com"  # Your real website
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)
```

**What is CORS?** 
Think of it like a security guard. By default, browsers don't let websites talk to servers from different addresses. CORS tells the security guard "It's okay, these websites are friends!"

### Step 7: Install One More Thing
We need dotenv to read that `.env` file:

```bash
pip install python-dotenv
```

### Step 8: Start Your Backend! 🎉

Now the exciting part - let's run it!

```bash
uvicorn main:app --reload
```

**What this command means:**
- `uvicorn`: The server that runs your app
- `main:app`: Run the `app` from `main.py`
- `--reload`: Automatically restart when you change code (super helpful!)

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

🎊 **Congratulations!** Your backend is now running!

### Step 9: Check If It Works

Open your web browser and go to:
```
http://localhost:8000/docs
```

You should see a cool page with all your API endpoints! This is called "Swagger UI" and it's like a playground where you can test your backend.

---

## Connecting Frontend to Backend 🔌

Now let's connect your React app (frontend) to your FastAPI backend!

### Step 1: Update Your .env File in Frontend

In your **frontend** folder (not backend), open or create a `.env` file:

```
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK_DATA=false
```

**What this does:**
- `VITE_API_BASE_URL`: Tells your frontend where the backend lives
- `VITE_USE_MOCK_DATA`: Set to `false` so it uses real backend (not fake data)

### Step 2: That's It! 

Your frontend is already set up to talk to the backend! All the code in the `services` folder will automatically use your FastAPI backend now.

---

## Testing Your Connection 🧪

Let's make sure everything works!

### Test 1: Check Backend is Running
1. Make sure your backend is running (you should see `Uvicorn running...` in terminal)
2. Go to `http://localhost:8000/docs`
3. You should see all the API endpoints listed

### Test 2: Try to Login
1. Start your frontend: Open a **new** terminal window (keep backend running!) and in your frontend folder:
   ```bash
   npm run dev
   ```
2. Open your frontend (usually `http://localhost:5173`)
3. Try to log in with the demo credentials
4. Check if it works!

### Test 3: Check Network Tab
1. Open your browser's Developer Tools (Press F12)
2. Click on "Network" tab
3. Try to log in
4. You should see requests going to `http://localhost:8000`
5. If they're green/200, it's working! 🎉

---

## Common Problems and Solutions 🔧

### Problem 1: "CORS Error" or "Access blocked"
**What it means:** Your frontend and backend can't talk to each other.

**Solution:**
1. Make sure you added the CORS middleware to `main.py` (Step 6 above)
2. Check that your frontend URL is in the `allow_origins` list
3. Restart your backend

### Problem 2: "Connection refused" or "Cannot connect"
**What it means:** Your backend isn't running.

**Solution:**
1. Make sure you started your backend: `uvicorn main:app --reload`
2. Check the backend terminal - you should see "Uvicorn running"
3. Make sure nothing else is using port 8000

### Problem 3: "Module not found" error
**What it means:** You're missing some Python packages.

**Solution:**
Install them:
```bash
pip install fastapi uvicorn pydantic python-jose passlib python-multipart python-dotenv
```

### Problem 4: Login doesn't work
**What it means:** The backend might not have any users yet!

**Solution:**
The backend has demo users built in, but make sure:
1. Your `auth.py` file has the authentication functions
2. Your `.env` has the correct SECRET_KEY
3. Try using the demo credentials:
   - Student: `student@must.ac.tz` / `student123`
   - Instructor: `instructor@must.ac.tz` / `instructor123`
   - Admin: `admin@must.ac.tz` / `admin123`

### Problem 5: "404 Not Found" for API calls
**What it means:** The API endpoint doesn't exist or the URL is wrong.

**Solution:**
1. Check your `main.py` - make sure all the endpoints from `backend_endpoints_example.py` are there
2. Go to `http://localhost:8000/docs` to see all available endpoints
3. Make sure your frontend `.env` has the correct `VITE_API_BASE_URL`

### Problem 6: Frontend still using mock data
**What it means:** Your frontend is using fake data instead of real backend.

**Solution:**
1. Check your frontend `.env` file
2. Make sure `VITE_USE_MOCK_DATA=false` (not true!)
3. Restart your frontend dev server

---

## Adding a Real Database 📊

Right now, your backend uses SQLite (a simple database file). For production, you might want something bigger!

### Option 1: Stay with SQLite (Easy!)
SQLite is perfect for learning and small projects. No extra setup needed!

### Option 2: Use PostgreSQL (Professional!)
PostgreSQL is what big websites use.

**Installation:**
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
2. Install it and remember your password
3. Create a database named `must_lms`
4. Update your `.env`:
   ```
   DATABASE_URL=postgresql://postgres:yourpassword@localhost/must_lms
   ```
5. Install the PostgreSQL driver:
   ```bash
   pip install psycopg2-binary sqlalchemy
   ```

### Option 3: Use MySQL (Also Popular!)
Similar to PostgreSQL.

**Installation:**
1. Download MySQL from [mysql.com](https://dev.mysql.com/downloads/)
2. Install it
3. Create a database named `must_lms`
4. Update your `.env`:
   ```
   DATABASE_URL=mysql://root:yourpassword@localhost/must_lms
   ```
5. Install the MySQL driver:
   ```bash
   pip install pymysql sqlalchemy
   ```

---

## Deployment (Putting it Online!) 🌍

When you're ready to show the world your project:

### Backend Deployment Options:

**1. Heroku (Easiest for beginners)**
- Free tier available
- Follow their FastAPI tutorial

**2. Railway (Very easy)**
- Great for FastAPI
- Free tier with 500 hours

**3. DigitalOcean (Professional)**
- $5/month
- Full control

**4. AWS/Google Cloud (Advanced)**
- More complex but powerful
- Free tier available

### Frontend Deployment:
Your frontend is already set up for deployment through Lovable!

**Important:** When deploying, update your:
1. Backend `.env` with production database URL
2. Backend CORS to include your production frontend URL
3. Frontend `.env` with production backend URL

---

## Quick Reference Cheat Sheet 📝

### Starting Your Backend:
```bash
cd must-lms-backend
uvicorn main:app --reload
```

### Starting Your Frontend:
```bash
cd must-lms-frontend  # or wherever your frontend is
npm run dev
```

### Checking if Backend Works:
Open: `http://localhost:8000/docs`

### Checking if Frontend Works:
Open: `http://localhost:5173`

### Installing Backend Dependencies:
```bash
pip install fastapi uvicorn pydantic python-jose passlib python-multipart python-dotenv
```

---

## Need More Help? 🆘

- **FastAPI Documentation:** [fastapi.tiangolo.com](https://fastapi.tiangolo.com/)
- **Python Tutorial:** [python.org/about/gettingstarted](https://www.python.org/about/gettingstarted/)
- **React Tutorial:** [react.dev/learn](https://react.dev/learn)

---

## Congratulations! 🎓

You now know how to:
✅ Set up a FastAPI backend
✅ Connect it to your frontend
✅ Test if it works
✅ Fix common problems
✅ Deploy your project

You're now a full-stack developer! Keep learning and building awesome things! 🚀

---

**Remember:** Learning to code is like learning to ride a bike. It's hard at first, but once you get it, it's super fun! Don't give up if something doesn't work the first time. Every developer (even the pros) looks things up and asks for help. That's normal! 💪

Happy coding! 👨‍💻👩‍💻
