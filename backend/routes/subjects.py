from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Subject, User
from schemas import SubjectCreate, SubjectResponse
from auth import get_admin_user, get_current_user

router = APIRouter(
    prefix="/subjects",
    tags=["subjects"]
)

@router.post("/", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
def create_subject(
    subject: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    # Check if subject with same name already exists
    existing_subject = db.query(Subject).filter(Subject.name == subject.name).first()
    if existing_subject:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Subject with name '{subject.name}' already exists"
        )
    
    # Create new subject
    db_subject = Subject(**subject.dict())
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

@router.get("/", response_model=List[SubjectResponse])
def get_all_subjects(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subjects = db.query(Subject).offset(skip).limit(limit).all()
    return subjects

@router.get("/{subject_id}", response_model=SubjectResponse)
def get_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject with ID {subject_id} not found"
        )
    return subject

@router.put("/{subject_id}", response_model=SubjectResponse)
def update_subject(
    subject_id: int,
    subject_data: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    # Check if subject exists
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject with ID {subject_id} not found"
        )
    
    # Update subject data
    for key, value in subject_data.dict().items():
        setattr(subject, key, value)
    
    db.commit()
    db.refresh(subject)
    return subject

@router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    # Check if subject exists
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject with ID {subject_id} not found"
        )
    
    # Delete the subject
    db.delete(subject)
    db.commit()
    return None