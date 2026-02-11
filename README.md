# Neighborhood Library Management System

A simple library management application built with FastAPI (Python), PostgreSQL, and Next.js.

## Features

- **Books Management**: Create, read, update, and delete books
- **Members Management**: Manage library members
- **Borrowing System**: Track book borrowing and returns
- **Real-time Availability**: Automatically updates book availability

## Technology Stack

- **Backend**: Python 3.11 + FastAPI
- **Database**: PostgreSQL 15
- **Frontend**: Next.js 14 + React + TypeScript + Tailwind CSS
- **Deployment**: Docker + Docker Compose

## Project Structure

```
my_project/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI application with all endpoints
│   │   ├── models.py        # SQLAlchemy models
│   │   └── database.py      # Database connection
│   ├── database/
│   │   ├── schema.sql       # Database schema
│   │   └── init.sql         # Sample data
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── books/           # Books management page
│   │   ├── members/         # Members management page
│   │   ├── borrow/          # Borrow/return page
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── .env
```

## Quick Start with Docker

### Prerequisites

- Docker and Docker Compose installed
- Ports 3000, 5432, and 8000 available

### Steps

1. **Start all services**:
   ```bash
   docker-compose up --build
   ```

2. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

3. **Stop services**:
   ```bash
   docker-compose down
   ```

## Manual Setup (Without Docker)

> [!NOTE]
> These instructions are optimized for macOS users.

### 1. Database Setup (PostgreSQL)

First, make sure PostgreSQL is installed and running (`brew install postgresql` and `brew services start postgresql`).

1. **Create the `library_db` database**:
   ```bash
   createdb library_db
   ```

2. **Create the database user and grant permissions**:
   Since the app connects as user `library`, we need to create it.
   ```bash
   psql postgres -c "CREATE USER library WITH PASSWORD 'library123';"
   psql postgres -c "ALTER USER library WITH SUPERUSER;"
   ```
   *(Note: Superuser is used here for simplicity in local development/setup/teardown).*

3. **Initialize the schema and data**:
   Run the SQL scripts provided in the `backend/database` folder.
   ```bash
   psql -d library_db -f backend/database/schema.sql
   psql -d library_db -f backend/database/init.sql
   ```

### 2. Backend Setup (FastAPI)

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and Activate a Virtual Environment** (Recommended):
   This avoids "externally managed environment" errors on newer macOS versions.
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Server**:
   We use `postgresql+psycopg` for the connection string to support newer Python versions.
   ```bash
   # Set the database URL (if not using the default in code)
   export DATABASE_URL="postgresql+psycopg://library:library123@localhost:5432/library_db"

   # Start the app
   python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   The API will be available at [http://localhost:8000](http://localhost:8000) and docs at [http://localhost:8000/docs](http://localhost:8000/docs).

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Set environment variable**:
   ```bash
   export NEXT_PUBLIC_API_URL="http://localhost:8000"
   ```

3. **Run the frontend**:
   ```bash
   npm run dev
   ```

## API Endpoints

### Books
- `POST /api/books` - Create a new book
- `GET /api/books` - Get all books
- `GET /api/books/{id}` - Get a specific book
- `PUT /api/books/{id}` - Update a book
- `DELETE /api/books/{id}` - Delete a book

### Members
- `POST /api/members` - Create a new member
- `GET /api/members` - Get all members
- `GET /api/members/{id}` - Get a specific member
- `PUT /api/members/{id}` - Update a member
- `DELETE /api/members/{id}` - Delete a member

### Borrowing
- `POST /api/borrow` - Borrow a book
- `POST /api/return/{record_id}` - Return a borrowed book
- `GET /api/borrowed-books` - Get all currently borrowed books
- `GET /api/members/{member_id}/borrowed-books` - Get books borrowed by a member

## Database Schema

### Books Table
```sql
- id: Serial Primary Key
- title: String (required)
- author: String (required)
- isbn: String (unique, optional)
- available_copies: Integer (default: 1)
```

### Members Table
```sql
- id: Serial Primary Key
- name: String (required)
- email: String (unique, required)
- phone: String (optional)
```

### Borrowing Records Table
```sql
- id: Serial Primary Key
- book_id: Foreign Key -> books.id
- member_id: Foreign Key -> members.id
- borrow_date: Date (auto-set)
- return_date: Date (null until returned)
```

## Testing the Application

1. **Open frontend**: http://localhost:3000

2. **Test the workflow**:
   - Go to Books page → Add a new book
   - Go to Members page → Add a new member
   - Go to Borrow/Return page → Borrow the book
   - See the borrowed books list
   - Click "Return Book" to return it

3. **Test API with Swagger**: http://localhost:8000/docs
   - Interactive API documentation
   - Test all endpoints directly from the browser

## Error Handling

The application handles common errors:
- **Book unavailable**: Cannot borrow if no copies available
- **Book not found**: Returns 404 error
- **Member not found**: Returns 404 error
- **Already returned**: Cannot return a book twice

## Sample Data

The database is initialized with sample data:
- 5 books (including "The Great Gatsby", "1984", etc.)
- 3 members (John Doe, Jane Smith, Bob Johnson)

## Troubleshooting

### Database connection error
- Make sure PostgreSQL is running
- Check the DATABASE_URL environment variable

### Frontend can't connect to backend
- Ensure backend is running on port 8000
- Check NEXT_PUBLIC_API_URL is set correctly

### Port already in use
- Change ports in docker-compose.yml if needed

## License

This is a take-home test project for educational purposes.
