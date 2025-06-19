const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const path = require("path");
const admin = require("firebase-admin");

// Initialize app
const app = express();
app.use(cors());
app.use(express.json());

// Initialize Prisma
const prisma = new PrismaClient();

// Import routes and middleware
const verifyToken = require("../../server/middleware/auth");
const stravaRoutes = require("../../server/routes/strava");
const activitiesRoutes = require("../../server/routes/activities");
const photosRoutes = require("../../server/routes/photos");

// Mount routes with netlify function prefix
app.use("/.netlify/functions/api/strava", stravaRoutes);
app.use("/.netlify/functions/api/activities", activitiesRoutes);
app.use("/.netlify/functions/api/photos", photosRoutes);

// User verification endpoint
app.get("/.netlify/functions/api/me", verifyToken, async (req, res) => {
  const { uid, email } = req.user;
  
  try {
    // Check if user exists in DB
    let user = await prisma.user.findUnique({
      where: { firebaseUid: uid },
    });

    // If not, create one
    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid: uid,
          email,
        },
      });
    }

    res.json({ message: "Authenticated", user });
  } catch (error) {
    console.error("Error in /me endpoint:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Parse service account from environment variable
let serviceAccount;
try {
  serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString()
  );
} catch (e) {
  console.error("Failed to parse Firebase service account", e);
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Export handler for serverless
module.exports.handler = serverless(app);