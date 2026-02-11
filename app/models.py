from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Book(Base):
    __tablename__ = "books"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    isbn = Column(String, unique=True)
    available_copies = Column(Integer, default=1)
    
    borrowing_records = relationship("BorrowingRecord", back_populates="book")

class Member(Base):
    __tablename__ = "members"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String)
    
    borrowing_records = relationship("BorrowingRecord", back_populates="member")

class BorrowingRecord(Base):
    __tablename__ = "borrowing_records"
    
    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    borrow_date = Column(Date, nullable=False)
    return_date = Column(Date, nullable=True)
    
    book = relationship("Book", back_populates="borrowing_records")
    member = relationship("Member", back_populates="borrowing_records")
