from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
import shutil
import os
from pathlib import Path

from database import get_db
from models import Assignment, User, UserRole, AssignmentStatus, Subject
from schemas import AssignmentCreate, AssignmentResponse, AssignmentAssign, AssignmentUpdate
from auth import get_current_user, get_admin_user, get_tutor_user, get_student_user

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

router = APIRouter(
    prefix="/assignments",
    tags=["assignments"]
)

@router.post("/", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assignment(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    submission_text: Optional[str] = Form(None),
    subject_id: int = Form(...),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_student_user)
):
    # Make sure current_user is a valid User object
    if not isinstance(current_user, User):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
        
    # Check if subject exists
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject with ID {subject_id} not found"
        )
    
    # Create assignment object
    db_assignment = Assignment(
        title=title,
        description=description,
        submission_text=submission_text,
        student_id=current_user.id,
        subject_id=subject_id,
        status=AssignmentStatus.SUBMITTED
    )
    
    # Handle file upload if provided
    if file:
        # Create student directory if it doesn't exist
        student_dir = UPLOAD_DIR / f"student_{current_user.id}"
        student_dir.mkdir(exist_ok=True)
        
        # Save the file
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        file_path = student_dir / filename
        
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Save the file path in the database
        db_assignment.file_path = str(file_path)
    
    # Save assignment to database
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    
    # Load relationships for response
    db.refresh(db_assignment)
    return db_assignment

@router.get("/", response_model=List[AssignmentResponse])
def get_assignments(
    skip: int = 0,
    limit: int = 100,
    status: Optional[AssignmentStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Make sure current_user is a valid User object
    if not isinstance(current_user, User):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    # Filter assignments based on user role
    query = db.query(Assignment).options(
        joinedload(Assignment.student),
        joinedload(Assignment.tutor),
        joinedload(Assignment.subject)
    )
    
    if current_user.role == UserRole.STUDENT:
        # Students can only see their own assignments
        query = query.filter(Assignment.student_id == current_user.id)
    elif current_user.role == UserRole.TUTOR:
        # Tutors can see assignments assigned to them
        query = query.filter(Assignment.tutor_id == current_user.id)
    # Admins can see all assignments
    
    # Filter by status if provided
    if status:
        query = query.filter(Assignment.status == status)
    
    # Paginate results
    assignments = query.offset(skip).limit(limit).all()
    return assignments

@router.get("/{assignment_id}", response_model=AssignmentResponse)
def get_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Make sure current_user is a valid User object
    if not isinstance(current_user, User):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
        
    # Get assignment with relationships
    assignment = db.query(Assignment).options(
        joinedload(Assignment.student),
        joinedload(Assignment.tutor),
        joinedload(Assignment.subject)
    ).filter(Assignment.id == assignment_id).first()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Assignment with ID {assignment_id} not found"
        )
    
    # Check permissions
    if (current_user.role == UserRole.STUDENT and assignment.student_id != current_user.id) or \
       (current_user.role == UserRole.TUTOR and assignment.tutor_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this assignment"
        )
    
    return assignment

@router.put("/{assignment_id}/assign", response_model=AssignmentResponse)
def assign_tutor(
    assignment_id: int,
    assignment_data: AssignmentAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    # Make sure current_user is a valid User object
    if not isinstance(current_user, User):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
        
    # Check if assignment exists
    assignment = db.query(Assignment).options(
        joinedload(Assignment.student),
        joinedload(Assignment.tutor),
        joinedload(Assignment.subject)
    ).filter(Assignment.id == assignment_id).first()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Assignment with ID {assignment_id} not found"
        )
    
    # Check if tutor exists and has tutor role
    tutor = db.query(User).filter(
        User.id == assignment_data.tutor_id,
        User.role == UserRole.TUTOR
    ).first()
    
    if not tutor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tutor with ID {assignment_data.tutor_id} not found or is not a tutor"
        )
    
    # Update assignment
    assignment.tutor_id = assignment_data.tutor_id
    assignment.status = assignment_data.status
    
    db.commit()
    db.refresh(assignment)
    return assignment

@router.put("/{assignment_id}/status", response_model=AssignmentResponse)
def update_assignment_status(
    assignment_id: int,
    assignment_data: AssignmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tutor_user)
):
    # Make sure current_user is a valid User object
    if not isinstance(current_user, User):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
        
    # Check if assignment exists
    assignment = db.query(Assignment).options(
        joinedload(Assignment.student),
        joinedload(Assignment.tutor),
        joinedload(Assignment.subject)
    ).filter(Assignment.id == assignment_id).first()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Assignment with ID {assignment_id} not found"
        )
    
    # Check permissions (tutors can only update assignments assigned to them)
    if current_user.role == UserRole.TUTOR and assignment.tutor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this assignment"
        )
    
    # Update assignment status
    if assignment_data.status:
        assignment.status = assignment_data.status
        
        # Set returned_at timestamp if status is RETURNED
        if assignment_data.status == AssignmentStatus.RETURNED:
            assignment.returned_at = datetime.utcnow()
    
    # Update description if provided
    if assignment_data.description:
        assignment.description = assignment_data.description
    
    db.commit()
    db.refresh(assignment)
    return assignment

@router.put("/{assignment_id}/solution", response_model=AssignmentResponse)
async def upload_solution(
    assignment_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_tutor_user)
):
    # Make sure current_user is a valid User object
    if not isinstance(current_user, User):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
        
    # Check if assignment exists
    assignment = db.query(Assignment).options(
        joinedload(Assignment.student),
        joinedload(Assignment.tutor),
        joinedload(Assignment.subject)
    ).filter(Assignment.id == assignment_id).first()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Assignment with ID {assignment_id} not found"
        )
    
    # Check permissions (tutors can only update assignments assigned to them)
    if current_user.role == UserRole.TUTOR and assignment.tutor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this assignment"
        )
    
    # Create tutor directory if it doesn't exist
    tutor_dir = UPLOAD_DIR / f"tutor_{current_user.id}"
    tutor_dir.mkdir(exist_ok=True)
    
    # Save the solution file
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"solution_{timestamp}_{file.filename}"
    file_path = tutor_dir / filename
    
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update the assignment with solution file path
    assignment.solution_file_path = str(file_path)
    
    # Update status to COMPLETED if it's not already RETURNED
    if assignment.status != AssignmentStatus.RETURNED:
        assignment.status = AssignmentStatus.COMPLETED
    
    db.commit()
    db.refresh(assignment)
    return assignment