const express = require("express");
const path = require("path");
const player = require("play-sound")();

const app = express();

// 🔥 ROOT TEST
app.get("/", (req, res) => {
  res.send("Server OK");
});

// 🔥 AUDIO ROUTE
app.post("/upload", express.raw({ type: "*/*", limit: "10mb" }), (req, res) => {

  console.log("📥 ESP32 request received");

  // 🔊 FULL PATH (IMPORTANT)
  const filePath = path.join(__dirname, "goodjob.mp3");

  // 🔊 PLAY AUDIO ON LAPTOP
  player.play(filePath, function(err){
    if (err) {
      console.log("❌ Audio play error:", err);
    } else {
      console.log("🔊 Playing Good Job sound");
    }
  });

  // 🔁 SEND RESPONSE BACK TO ESP32
  res.json({
    result: "correct",
    spoken: "bee"
  });
});

// 🔥 START SERVER
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
