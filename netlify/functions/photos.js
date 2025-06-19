const serverless = require("serverless-http");
const express = require("express");
const multipart = require("lambda-multipart-parser");

// Create a simple handler that can parse multipart forms
const app = express();

app.post("/:activityId", async (req, res) => {
  try {
    // Lambda-specific parsing
    const result = await multipart.parse(req);
    req.file = result.files[0];
    req.body = result.body;
    
    // Then call your existing handler
    await require("../../server/routes/photos").handlePhotoUpload(req, res);
  } catch (error) {
    console.error("Photo upload error:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
});

exports.handler = serverless(app);