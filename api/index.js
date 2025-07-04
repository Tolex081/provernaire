// api/index.js
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
// const dotenv = require('dotenv'); // <--- REMOVED: Vercel injects env vars directly in production. Keep for local if you use .env
const connectDB = require('../config/db'); // Path: Assuming config/db.js is directly under the project root
const playerRoutes = require('../routes/players'); // Path: Assuming routes/players.js is directly under api/
const teamRoutes = require('../routes/teams');     // Path: Assuming routes/teams.js is directly under api/

// --- IMPORTANT: Environment Variables ---
// On Vercel, process.env variables are automatically available.
// The dotenv.config() line is typically for local development only if you use a .env file.
// If you rely solely on Vercel's dashboard for env vars, you can remove this line.
// dotenv.config(); // <--- You should remove or comment out this line for Vercel deployment


// --- Database Connection ---
// This function attempts to connect to MongoDB when the serverless function initializes.
// If process.env.MONGODB_URI is not set correctly on Vercel, this will likely cause a crash.
connectDB();

const app = express();

// --- CORS Configuration ---
// Crucial for allowing your frontend to make requests to your backend.
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Use Vercel env var or local fallback
  credentials: true, // Allow cookies/authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Explicitly allow all HTTP methods your API uses
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow common headers
}));

// --- Body Parsers ---
// For parsing JSON and URL-encoded data from incoming requests.
app.use(express.json()); // Parses JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded request bodies

// --- Route Mounting ---
// Mount your API routes. The /api prefix here, combined with vercel.json,
// ensures your frontend requests like /api/players work correctly.
app.use('/api/players', playerRoutes);
app.use('/api/teams', teamRoutes);

// --- Health Check Endpoint (Optional but Recommended) ---
// Useful for checking if your serverless function is alive.
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

// --- Global Error Handling Middleware ---
// This catches any unhandled errors that occur in your routes or other middleware.
// It's essential for preventing generic 500 errors and providing more insight.
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err.stack); // Log the full error stack for debugging
  res.status(500).json({
    message: 'A server error has occurred',
    error: err.message || 'Unknown error' // Provide a more specific message if available
  });
});

// --- Serverless Export ---
// This wraps your Express app for deployment as a Vercel Serverless Function.
module.exports.handler = serverless(app);

// For local development or other environments that directly run the app
// module.exports = app;
