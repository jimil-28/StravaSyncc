const fs = require('fs');
const path = require('path');

// Replace with your file path
const filePath = 'firebase-service-account.json';
const serviceAccount = fs.readFileSync(filePath, 'utf8');
const base64 = Buffer.from(serviceAccount).toString('base64');

console.log(base64);