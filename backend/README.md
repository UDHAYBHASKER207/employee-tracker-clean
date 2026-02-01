
# Employee Tracker Backend

This is the backend API for the Employee Tracker application.

## Setup Instructions

1. **Install dependencies**
   ```
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/employee-tracker
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   ```
   
   Update the MONGODB_URI with your MongoDB connection string.
   Generate a strong random string for JWT_SECRET.

3. **Start the server**
   - Development mode:
   ```
   npm run dev
   ```
   
   - Production mode:
   ```
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile (protected)

### Employees
- `GET /api/employees` - Get all employees (protected)
- `GET /api/employees/:id` - Get employee by ID (protected)
- `POST /api/employees` - Create a new employee (admin only)
- `PUT /api/employees/:id` - Update employee (admin only)
- `DELETE /api/employees/:id` - Delete employee (admin only)

## Authentication

The API uses JWT for authentication. Include the token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## File Uploads

Employee profile images can be uploaded using multipart/form-data:
- Field name: `image`
- Maximum file size: 1MB
- Allowed formats: JPEG, JPG, PNG, GIF
