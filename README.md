# Expense Tracking System

A full-stack expense tracking application with a Node.js/Express backend and React Native mobile app.

## Project Structure

```
assignment/
├── backend/          # Node.js Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── server.js
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── mobile/           # Expo React Native App
│   ├── src/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── context/
│   │   └── config/
│   └── package.json
└── README.md
```

## Backend Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```
PORT=3000
JWT_SECRET=your-secret-key-change-this-in-production
DATABASE_URL="file:./dev.db"
```

5. Generate Prisma Client:
```bash
npm run prisma:generate
```

6. Run database migrations:
```bash
npm run prisma:migrate
```

7. Start the server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The backend API will be running on `http://localhost:3000`

### API Endpoints

#### Authentication
- `POST /auth/register` - Register a new user
  - Body: `{ email, password, name? }`
- `POST /auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: `{ user, token }`

#### Expenses (Protected - requires JWT token)
- `POST /expenses` - Create an expense
  - Body: `{ amount, category, date, note? }`
- `GET /expenses` - Get expenses with filters and pagination
  - Query params: `category?`, `startDate?`, `endDate?`, `page?`, `limit?`
- `GET /expenses/summary` - Get total spending grouped by category
- `PUT /expenses/:id` - Update an expense
  - Body: `{ amount?, category?, date?, note? }`
- `DELETE /expenses/:id` - Delete an expense

### Testing the API

You can test the API using tools like Postman or curl:

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get expenses (replace TOKEN with actual token)
curl -X GET http://localhost:3000/expenses \
  -H "Authorization: Bearer TOKEN"
```

## Mobile App Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (install globally: `npm install -g expo-cli`)
- Expo Go app on your mobile device (iOS/Android) OR iOS Simulator/Android Emulator

### Installation

1. Navigate to the mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Update API configuration:
   - Open `src/config/api.js`
   - Update `API_BASE_URL` based on your setup:
     - **iOS Simulator**: `http://localhost:3000`
     - **Android Emulator**: `http://10.0.2.2:3000`
     - **Physical Device**: `http://YOUR_COMPUTER_IP:3000` (find your IP with `ipconfig` on Windows or `ifconfig` on Mac/Linux)

4. Start the Expo development server:
```bash
npm start
```

5. Run on your device:
   - Scan the QR code with Expo Go app (iOS/Android)
   - Press `i` for iOS simulator
   - Press `a` for Android emulator

### Mobile App Features

- **Register Screen**: Create a new account
- **Login Screen**: Login with email and password
- **Home/Summary Screen**: View total spending and category-wise breakdown
- **Expenses List Screen**: View all expenses with pagination and filters
- **Add Expense Screen**: Add a new expense
- **Edit Expense Screen**: Edit an existing expense

## Development Notes

### Backend
- Uses Prisma ORM with SQLite database
- JWT authentication with 7-day token expiration
- Password hashing with bcryptjs
- Input validation with express-validator
- Clean architecture with controllers, routes, and middleware separation

### Mobile App
- Built with Expo React Native
- React Navigation for screen navigation
- Context API for state management
- AsyncStorage for token persistence
- Axios for API calls

## Troubleshooting

### Backend Issues
- **Database errors**: Make sure you've run `npm run prisma:migrate`
- **Port already in use**: Change the PORT in `.env` file
- **JWT errors**: Ensure JWT_SECRET is set in `.env`

### Mobile App Issues
- **Cannot connect to API**: 
  - Check that backend is running
  - Verify API_BASE_URL in `src/config/api.js`
  - For physical devices, ensure your phone and computer are on the same network
  - Check firewall settings
- **Expo errors**: Try clearing cache with `expo start -c`

## Production Deployment

### Backend
- Use a production database (PostgreSQL recommended)
- Set strong JWT_SECRET
- Use environment variables for all sensitive data
- Enable CORS for your mobile app domain
- Use HTTPS

### Mobile App
- Build standalone app with `expo build`
- Update API_BASE_URL to production backend URL
- Test thoroughly on physical devices

## License

This project is created for assessment purposes.

# RN-Expense-App-Demo
