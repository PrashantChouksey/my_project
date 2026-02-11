from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import date
from typing import List, Optional
from pydantic import BaseModel
from . import models
from .database import get_db, engine

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Library Management API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic schemas
class BookBase(BaseModel):
    title: str
    author: str
    isbn: Optional[str] = None
    available_copies: int = 1

class BookCreate(BookBase):
    pass

class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    isbn: Optional[str] = None
    available_copies: Optional[int] = None

class Book(BookBase):
    id: int
    class Config:
        from_attributes = True

class MemberBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None

class MemberCreate(MemberBase):
    pass

class MemberUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class Member(MemberBase):
    id: int
    class Config:
        from_attributes = True

class BorrowRequest(BaseModel):
    book_id: int
    member_id: int

class BorrowingRecord(BaseModel):
    id: int
    book_id: int
    member_id: int
    borrow_date: date
    return_date: Optional[date]
    book: Book
    member: Member
    class Config:
        from_attributes = True

# Books endpoints
@app.post("/api/books", response_model=Book)
def create_book(book: BookCreate, db: Session = Depends(get_db)):
    db_book = models.Book(**book.dict())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

@app.get("/api/books", response_model=List[Book])
def get_books(db: Session = Depends(get_db)):
    return db.query(models.Book).all()

@app.get("/api/books/{book_id}", response_model=Book)
def get_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

@app.put("/api/books/{book_id}", response_model=Book)
def update_book(book_id: int, book: BookUpdate, db: Session = Depends(get_db)):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    for key, value in book.dict(exclude_unset=True).items():
        setattr(db_book, key, value)
    
    db.commit()
    db.refresh(db_book)
    return db_book

@app.delete("/api/books/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db)):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(db_book)
    db.commit()
    return {"message": "Book deleted successfully"}

# Members endpoints
@app.post("/api/members", response_model=Member)
def create_member(member: MemberCreate, db: Session = Depends(get_db)):
    db_member = models.Member(**member.dict())
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

@app.get("/api/members", response_model=List[Member])
def get_members(db: Session = Depends(get_db)):
    return db.query(models.Member).all()

@app.get("/api/members/{member_id}", response_model=Member)
def get_member(member_id: int, db: Session = Depends(get_db)):
    member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

@app.put("/api/members/{member_id}", response_model=Member)
def update_member(member_id: int, member: MemberUpdate, db: Session = Depends(get_db)):
    db_member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not db_member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    for key, value in member.dict(exclude_unset=True).items():
        setattr(db_member, key, value)
    
    db.commit()
    db.refresh(db_member)
    return db_member

@app.delete("/api/members/{member_id}")
def delete_member(member_id: int, db: Session = Depends(get_db)):
    db_member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not db_member:
        raise HTTPException(status_code=404, detail="Member not found")
    db.delete(db_member)
    db.commit()
    return {"message": "Member deleted successfully"}

# Borrowing endpoints
@app.post("/api/borrow", response_model=BorrowingRecord)
def borrow_book(request: BorrowRequest, db: Session = Depends(get_db)):
    # Check if book exists and is available
    book = db.query(models.Book).filter(models.Book.id == request.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    if book.available_copies <= 0:
        raise HTTPException(status_code=400, detail="Book not available")
    
    # Check if member exists
    member = db.query(models.Member).filter(models.Member.id == request.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Create borrowing record
    borrowing = models.BorrowingRecord(
        book_id=request.book_id,
        member_id=request.member_id,
        borrow_date=date.today()
    )
    db.add(borrowing)
    
    # Decrease available copies
    book.available_copies -= 1
    
    db.commit()
    db.refresh(borrowing)
    return borrowing

@app.post("/api/return/{record_id}", response_model=BorrowingRecord)
def return_book(record_id: int, db: Session = Depends(get_db)):
    # Find borrowing record
    borrowing = db.query(models.BorrowingRecord).filter(models.BorrowingRecord.id == record_id).first()
    if not borrowing:
        raise HTTPException(status_code=404, detail="Borrowing record not found")
    if borrowing.return_date:
        raise HTTPException(status_code=400, detail="Book already returned")
    
    # Update return date
    borrowing.return_date = date.today()
    
    # Increase available copies
    book = db.query(models.Book).filter(models.Book.id == borrowing.book_id).first()
    book.available_copies += 1
    
    db.commit()
    db.refresh(borrowing)
    return borrowing

@app.get("/api/borrowed-books", response_model=List[BorrowingRecord])
def get_borrowed_books(db: Session = Depends(get_db)):
    """Get all currently borrowed books (not yet returned)"""
    return db.query(models.BorrowingRecord).filter(
        models.BorrowingRecord.return_date.is_(None)
    ).all()

@app.get("/api/members/{member_id}/borrowed-books", response_model=List[BorrowingRecord])
def get_member_borrowed_books(member_id: int, db: Session = Depends(get_db)):
    """Get all books currently borrowed by a specific member"""
    return db.query(models.BorrowingRecord).filter(
        models.BorrowingRecord.member_id == member_id,
        models.BorrowingRecord.return_date.is_(None)
    ).all()

@app.get("/")
def root():
    return {"message": "Library Management API - Visit /docs for API documentation"}
