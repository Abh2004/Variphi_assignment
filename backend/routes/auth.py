from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import timedelta
from typing import Any
from fastapi.responses import JSONResponse
from database import get_db
from models import User, UserRole
from schemas import UserCreate, UserResponse, Token
from auth import authenticate_user, create_access_token, get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(tags=["authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    try:
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            name=user_data.name,
            email=user_data.email,
            hashed_password=hashed_password,
            role=user_data.role
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed. Please try again."
        )
@router.post("/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        # Return a Response object directly instead of raising an exception
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Incorrect email or password"},
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role, "user_id": user.id},
        expires_delta=access_token_expires
    )
    
    # Fixed return statement with opening curly brace
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_role": user.role,
        "user_id": user.id
    }
@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"detail": "Successfully logged out"}