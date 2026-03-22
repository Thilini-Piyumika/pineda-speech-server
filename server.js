require("dotenv").config();

const express = require("express");
const fs = require("fs");
const { OpenAI } = require("openai");
const admin = require("firebase-admin");

const app = express();

// 🔐 OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 🔐 Firebase (FROM ENV, NOT FILE)
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://project-pineda-21-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

const db = admin.database();

// Test route
app.get("/", (req, res) => {
  res.send("Server OK");
});

// Audio route
app.post("/upload", express.raw({ type: "*/*", limit: "10mb" }), async (req, res) => {

  console.log("Audio received");

  const filePath = "audio.wav";
  fs.writeFileSync(filePath, req.body);

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "gpt-4o-transcribe"
    });

    const spoken = transcription.text.toLowerCase();
    console.log("Spoken:", spoken);

    const expected = "b";

    let result = spoken.includes(expected) ? "correct" : "wrong";

    // Save to Firebase
    await db.ref(`children/child1/consonants/${expected}`).set({
      result,
      spoken,
      timestamp: new Date().toISOString()
    });

    res.send(result);

  } catch (err) {
    console.error(err);
    res.send("error");
  }
});

// Render uses dynamic port
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running");
});