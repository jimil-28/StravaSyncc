const admin = require('firebase-admin');

// Parse service account from environment variable
let serviceAccount;
try {
  serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString()
  );
} catch (e) {
  console.error('Failed to parse Firebase service account', e);
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;