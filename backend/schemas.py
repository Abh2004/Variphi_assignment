from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Union
from datetime import datetime
from models import UserRole, AssignmentStatus

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: UserRole

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    role: UserRole
    created_at: datetime

    class Config:
        orm_mode = True

# Subject Schemas
class SubjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class SubjectCreate(SubjectBase):
    pass

class SubjectResponse(SubjectBase):
    id: int

    class Config:
        orm_mode = True

# Assignment Schemas
class AssignmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    submission_text: Optional[str] = None

class AssignmentCreate(AssignmentBase):
    subject_id: int

class AssignmentAssign(BaseModel):
    tutor_id: int
    status: AssignmentStatus = AssignmentStatus.ASSIGNED

class AssignmentUpdate(BaseModel):
    status: Optional[AssignmentStatus] = None
    description: Optional[str] = None

class AssignmentResponse(AssignmentBase):
    id: int
    file_path: Optional[str] = None
    solution_file_path: Optional[str] = None
    status: AssignmentStatus
    student_id: int
    tutor_id: Optional[int] = None
    subject_id: int
    created_at: datetime
    updated_at: datetime
    returned_at: Optional[datetime] = None
    
    # Include related data
    student: UserResponse
    tutor: Optional[UserResponse] = None
    subject: SubjectResponse

    class Config:
        orm_mode = True

# Comment Schemas
class CommentBase(BaseModel):
    text: str

class CommentCreate(CommentBase):
    assignment_id: int

class CommentResponse(CommentBase):
    id: int
    user_id: int
    assignment_id: int
    created_at: datetime
    user: UserResponse

    class Config:
        orm_mode = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user_role: UserRole
    user_id: int

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[UserRole] = None