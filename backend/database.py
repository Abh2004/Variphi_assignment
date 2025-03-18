# from sqlalchemy import create_engine
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker
# import os
# from dotenv import load_dotenv

# # Load environment variables
# load_dotenv()
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# # Database connection parameters with SQLite fallback for local development
# db_path = os.path.join(BASE_DIR, "assignment_app.db")
# DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{db_path}")

# # Create the SQLAlchemy engine
# if DATABASE_URL.startswith("sqlite"):
#     engine = create_engine(
#         DATABASE_URL, 
#         connect_args={"check_same_thread": False}
#     )
# else:
#     engine = create_engine(DATABASE_URL)


# # Create a session factory bound to the engine
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# # Base class for models
# Base = declarative_base()

# # Dependency to get DB session
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()




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

# Render provides the DATABASE_URL with the format: 
# postgres://username:password@host:port/database_name
# We need to modify it to work with SQLAlchemy
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{db_path}")

# For Render: if using postgres:// instead of postgresql://, we need to replace it
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Create the SQLAlchemy engine
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL engine configuration
    engine = create_engine(
        DATABASE_URL,
        pool_size=5,
        max_overflow=10,
        pool_timeout=30,
        pool_recycle=1800,  # Recycle connections after 30 minutes
    )

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