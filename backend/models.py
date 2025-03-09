from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Enum, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum
from datetime import datetime

Base = declarative_base()

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    STUDENT = "student"
    TUTOR = "tutor"

class AssignmentStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    RETURNED = "returned"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(128), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    assignments_created = relationship("Assignment", back_populates="student", foreign_keys="Assignment.student_id")
    assignments_tutored = relationship("Assignment", back_populates="tutor", foreign_keys="Assignment.tutor_id")
    comments = relationship("Comment", back_populates="user")

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    
    # Relationships
    assignments = relationship("Assignment", back_populates="subject")

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    file_path = Column(String(255), nullable=True)  # Path to the uploaded assignment file
    submission_text = Column(Text, nullable=True)  # Text submitted with the assignment
    status = Column(Enum(AssignmentStatus), default=AssignmentStatus.SUBMITTED)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tutor_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Nullable until assigned by admin
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    returned_at = Column(DateTime, nullable=True)
    
    # Relationships
    student = relationship("User", back_populates="assignments_created", foreign_keys=[student_id])
    tutor = relationship("User", back_populates="assignments_tutored", foreign_keys=[tutor_id])
    subject = relationship("Subject", back_populates="assignments")
    comments = relationship("Comment", back_populates="assignment")
    solution_file_path = Column(String(255), nullable=True)  # Path to solution file uploaded by tutor

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="comments")
    assignment = relationship("Assignment", back_populates="comments")