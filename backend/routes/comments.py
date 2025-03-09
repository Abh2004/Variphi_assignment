from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from database import get_db
from models import Comment, Assignment, User, UserRole
from schemas import CommentCreate, CommentResponse
from auth import get_current_user

router = APIRouter(
    prefix="/comments",
    tags=["comments"]
)

@router.post("/", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if assignment exists
    assignment = db.query(Assignment).filter(Assignment.id == comment_data.assignment_id).first()
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Assignment with ID {comment_data.assignment_id} not found"
        )
    
    # Check if user has permission to comment on this assignment
    if current_user.role == UserRole.STUDENT and assignment.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to comment on this assignment"
        )
    
    if current_user.role == UserRole.TUTOR and assignment.tutor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to comment on this assignment"
        )
    
    # Create new comment
    db_comment = Comment(
        text=comment_data.text,
        user_id=current_user.id,
        assignment_id=comment_data.assignment_id
    )
    
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    # Load user relationship for response
    comment_with_user = db.query(Comment).options(
        joinedload(Comment.user)
    ).filter(Comment.id == db_comment.id).first()
    
    return comment_with_user

@router.get("/assignment/{assignment_id}", response_model=List[CommentResponse])
def get_assignment_comments(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if assignment exists
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Assignment with ID {assignment_id} not found"
        )
    
    # Check if user has permission to view comments for this assignment
    if current_user.role == UserRole.STUDENT and assignment.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view comments for this assignment"
        )
    
    if current_user.role == UserRole.TUTOR and assignment.tutor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view comments for this assignment"
        )
    
    # Get comments with user information
    comments = db.query(Comment).options(
        joinedload(Comment.user)
    ).filter(Comment.assignment_id == assignment_id).order_by(Comment.created_at).all()
    
    return comments

@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if comment exists
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Comment with ID {comment_id} not found"
        )
    
    # Check if user is the owner of the comment or an admin
    if comment.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this comment"
        )
    
    # Delete the comment
    db.delete(comment)
    db.commit()
    return None