-- Database schema for Neighborhood Library System

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    available_copies INTEGER DEFAULT 1 CHECK (available_copies >= 0)
);

CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20)
);

CREATE TABLE borrowing_records (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    borrow_date DATE NOT NULL DEFAULT CURRENT_DATE,
    return_date DATE,
    CONSTRAINT chk_return_date CHECK (return_date IS NULL OR return_date >= borrow_date)
);

CREATE INDEX idx_borrowing_book ON borrowing_records(book_id);
CREATE INDEX idx_borrowing_member ON borrowing_records(member_id);
CREATE INDEX idx_borrowing_active ON borrowing_records(return_date) WHERE return_date IS NULL;
