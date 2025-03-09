from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Database connection parameters with SQLite fallback for local development
db_path = os.path.join(BASE_DIR, "assignment_app.db")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{db_path}")

# Create the SQLAlchemy engine
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(DATABASE_URL)


# Create a session factory bound to the engine
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()