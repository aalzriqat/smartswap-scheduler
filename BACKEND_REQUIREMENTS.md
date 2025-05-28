
# SmartSwap Backend Requirements

This document outlines the backend API requirements for the SmartSwap scheduling system. The frontend is already prepared to work with these endpoints.

## Technology Stack
- **Database**: MongoDB
- **Recommended Backend**: Node.js + Express.js + Mongoose
- **Authentication**: JWT tokens

## Required API Endpoints

### Authentication Routes

#### POST /api/auth/login
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "60d0fe4f5311236168a109ca",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "Employee",
      "skills": ["PhoneMU", "Email"],
      "marketplace": "AE"
    },
    "token": "jwt_token_here"
  }
}
```

#### POST /api/auth/register
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "Employee",
  "skills": ["PhoneMU", "Email"],
  "marketplace": "AE"
}
```

#### GET /api/auth/me
**Headers:** `Authorization: Bearer <token>`
**Response:** User object

### User Management Routes

#### GET /api/users
**Headers:** `Authorization: Bearer <token>`
**Response:** Array of user objects

#### GET /api/users/:id
**Headers:** `Authorization: Bearer <token>`
**Response:** Single user object

#### PUT /api/users/:id
**Headers:** `Authorization: Bearer <token>`
**Request Body:** Partial user object
**Response:** Updated user object

### Schedule Management Routes

#### GET /api/schedules/user/:userId?weekStart=YYYY-MM-DD
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "schedule_id",
    "userId": "user_id",
    "weekStart": "2023-12-18",
    "shifts": [
      {
        "_id": "shift_id",
        "userId": "user_id",
        "date": "2023-12-18",
        "startTime": "09:00",
        "endTime": "17:00",
        "type": "Day Shift",
        "skills": ["PhoneMU", "Email"],
        "marketplace": "AE",
        "status": "confirmed"
      }
    ],
    "totalHours": 40
  }
}
```

#### POST /api/shifts
**Headers:** `Authorization: Bearer <token>`
**Request Body:** Shift object
**Response:** Created shift object

#### PUT /api/shifts/:id
**Headers:** `Authorization: Bearer <token>`
**Request Body:** Partial shift object
**Response:** Updated shift object

#### DELETE /api/shifts/:id
**Headers:** `Authorization: Bearer <token>`
**Response:** Success confirmation

### Swap Request Routes

#### GET /api/swaps?userId=:userId
**Headers:** `Authorization: Bearer <token>`
**Response:** Array of swap request objects

#### POST /api/swaps
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "requesterId": "user_id",
  "requesterShiftId": "shift_id",
  "targetUserId": "target_user_id",
  "targetShiftId": "target_shift_id",
  "message": "Would like to swap this shift"
}
```

#### PUT /api/swaps/:id/accept
**Headers:** `Authorization: Bearer <token>`
**Response:** Updated swap request

#### PUT /api/swaps/:id/reject
**Headers:** `Authorization: Bearer <token>`
**Response:** Updated swap request

### Analytics Routes

#### GET /api/analytics
**Headers:** `Authorization: Bearer <token>`
**Response:**
```json
{
  "success": true,
  "data": {
    "swapTrends": [...],
    "skillDistribution": [...],
    "marketplaceData": [...],
    "systemMetrics": {
      "activeUsers": 247,
      "swapSuccessRate": 94.2,
      "avgMatchTime": 4.2,
      "systemEfficiency": 99.1
    }
  }
}
```

## MongoDB Collections

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  role: String (enum: ['Employee', 'Manager', 'Admin', 'Developer']),
  skills: [String],
  marketplace: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Shifts Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  date: String (YYYY-MM-DD),
  startTime: String (HH:mm),
  endTime: String (HH:mm),
  type: String (enum: ['Day Shift', 'Evening Shift', 'Morning Shift']),
  skills: [String],
  marketplace: String,
  status: String (enum: ['confirmed', 'pending', 'swap-requested', 'cancelled']),
  createdAt: Date,
  updatedAt: Date
}
```

### SwapRequests Collection
```javascript
{
  _id: ObjectId,
  requesterId: ObjectId (ref: 'User'),
  requesterShiftId: ObjectId (ref: 'Shift'),
  targetUserId: ObjectId (ref: 'User'),
  targetShiftId: ObjectId (ref: 'Shift'),
  status: String (enum: ['pending', 'accepted', 'rejected', 'cancelled']),
  message: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Environment Variables

Your backend should use these environment variables:
```
MONGODB_URI=mongodb://localhost:27017/smartswap
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
PORT=3001
```

## Getting Started

1. Create a new Node.js project with Express and Mongoose
2. Implement the above API endpoints
3. Set up MongoDB connection
4. Add JWT authentication middleware
5. Test with the frontend by updating `REACT_APP_API_URL` to point to your backend

The frontend is already configured to work with these endpoints and will automatically handle authentication, error states, and loading states.
