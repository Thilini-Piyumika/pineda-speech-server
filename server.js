const express = require("express");

const app = express();

// TEST
app.get("/", (req, res) => {
  res.send("Server OK");
});

// 🔥 HARD-CODED RESPONSE
app.post("/upload", express.raw({ type: "*/*", limit: "10mb" }), (req, res) => {

  console.log("Audio received");

  // 🔥 Fake response for demo
  res.json({
    result: "correct",
    spoken: "bee"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Demo server running");
});
