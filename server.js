require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");

const app = express();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// TEST
app.get("/", (req, res) => {
  res.send("Server OK");
});

// AUDIO API
app.post("/upload", express.raw({ type: "*/*", limit: "10mb" }), async (req, res) => {

  const filePath = path.join(__dirname, "audio.wav");

  try {
    fs.writeFileSync(filePath, req.body);

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "gpt-4o-transcribe"
    });

    const spoken = (transcription.text || "").toLowerCase();
    console.log("Spoken:", spoken);

    // 🔥 ONLY B FOR DEMO
    const valid = ["b", "bee", "be"];

    let result = "wrong";

    for (let word of valid) {
      if (spoken.includes(word)) {
        result = "correct";
      }
    }

    res.json({
      result: result,
      spoken: spoken
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
