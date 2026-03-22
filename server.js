require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");
const admin = require("firebase-admin");

const app = express();

// 🔐 OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 🔐 Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://project-pineda-21-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

const db = admin.database();

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Server OK");
});

// 🎤 AUDIO ROUTE
app.post("/upload", express.raw({ type: "*/*", limit: "10mb" }), async (req, res) => {

  console.log("🎤 Audio received");

  const filePath = path.join(__dirname, "audio.wav");

  try {
    // 💾 Save audio file
    fs.writeFileSync(filePath, req.body);
    console.log("💾 File saved:", filePath);

    // 🧠 TRANSCRIBE
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "gpt-4o-transcribe"
    });

    const spoken = (transcription.text || "").toLowerCase();
    console.log("🧠 Spoken:", spoken);

    // 🎯 EXPECTED LETTER
    const expected = "b";

    let result = "wrong";
    if (spoken.includes(expected)) {
      result = "correct";
    }

    console.log("✅ Result:", result);

    // ☁️ SAVE TO FIREBASE
    await db.ref(`children/child1/consonants/${expected}`).set({
      result,
      spoken,
      timestamp: new Date().toISOString()
    });

    console.log("☁️ Saved to Firebase");

    // 📤 RESPONSE TO ESP32
    res.send(result);

  } catch (err) {
    console.error("❌ ERROR DETAILS:");
    console.error(err.message);
    console.error(err);

    res.status(500).send("error");
  } finally {
    // 🧹 Clean up file (important for Render)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

// 🚀 START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port", PORT);
});
