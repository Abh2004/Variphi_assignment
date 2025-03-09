from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from models import User, UserRole
from schemas import UserResponse
from auth import get_current_user, get_admin_user

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/", response_model=List[UserResponse])
def get_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[UserRole] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    query = db.query(User)
    
    # Filter by role if provided
    if role:
        query = query.filter(User.role == role)
    
    # Get paginated results
    users = query.offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Regular users can only view their own info, admins can view any user
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this user's information"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )
    
    return user

@router.get("/tutors/list", response_model=List[UserResponse])
def get_all_tutors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    tutors = db.query(User).filter(User.role == UserRole.TUTOR).all()
    return tutors