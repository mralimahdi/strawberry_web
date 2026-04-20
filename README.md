# Strawberry Farm Management System

A full-stack web application for managing strawberry farm operations, including tour bookings, product orders, user management, and admin dashboard.

## Features

- User registration and authentication
- Tour booking system
- Product ordering and cart management
- Admin dashboard with analytics
- Message/contact system
- Email notifications
- File upload functionality

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Atlas for production)
- **Frontend**: HTML, CSS, JavaScript
- **Authentication**: JWT, Passport.js
- **Email**: Nodemailer with Gmail SMTP

## Local Development

1. Clone the repository
2. Install dependencies: `npm install` (in backend-api folder)
3. Set up MongoDB locally or use MongoDB Atlas
4. Update `.env` file with your database URI
5. Run the server: `npm run dev`

## Deployment

This application is configured for free deployment using:

- **Database**: MongoDB Atlas (Free tier)
- **Backend**: Railway (Free tier)
- **Frontend**: Served by backend (no separate hosting needed)

### Deployment Steps

1. **Set up MongoDB Atlas**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account and cluster
   - Get your connection string
   - Update `MONGODB_URI` in `.env` file

2. **Deploy to Railway**:
   - Go to [Railway.app](https://railway.app)
   - Connect your GitHub repository
   - Railway will automatically detect and deploy your Node.js app
   - Set environment variables in Railway dashboard

3. **Environment Variables for Railway**:
   ```
   MONGODB_URI=your_atlas_connection_string
   JWT_SECRET=your_secure_jwt_secret
   PORT=5000
   SMTP_USER=your_gmail
   SMTP_PASS=your_app_password
   NODE_ENV=production
   ```

## API Endpoints

- `/api/auth` - Authentication routes
- `/api/users` - User management
- `/api/tours` - Tour management
- `/api/orders` - Order management
- `/api/dashboard` - Admin dashboard
- `/api/messages` - Contact messages

## Project Structure

```
├── backend-api/          # Node.js backend
│   ├── config/          # Database and email config
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Authentication middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── utils/           # Helper utilities
│   └── server.js        # Main server file
├── frontend/            # Static HTML/CSS/JS files
└── README.md
```

## License

ISC