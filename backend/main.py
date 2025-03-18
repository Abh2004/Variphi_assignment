from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from fastapi.responses import JSONResponse
from routes import auth, users, subjects, assignments, comments
from models import Base
from database import engine
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create all tables in the database
# In production on Render, we'll always need to ensure tables exist
Base.metadata.create_all(bind=engine)

# Create uploads directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Initialize FastAPI app
app = FastAPI(
    title="Assignment Management System",
    description="API for managing student assignments with tutors and admins",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:80",
    "http://localhost:3000",
    "http://frontend",
]

# Add production domain if available
if os.getenv("FRONTEND_URL"):
    origins.append(os.getenv("FRONTEND_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for file uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(subjects.router)
app.include_router(assignments.router)
app.include_router(comments.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Assignment Management System API"}

@app.get("/health")
def health_check():
    # You could add DB connection check here
    try:
        # Just to check database connection
        from sqlalchemy import text
        from database import SessionLocal
        
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "database": db_status,
        "version": "1.0.0"
    }

# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    # In production, you might want to log the exception here
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=int(os.getenv("PORT", "8000")), 
        reload=os.getenv("DEBUG", "False").lower() in ("true", "1", "t")
    )