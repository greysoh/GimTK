import robot from "robotjs";
import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

robot.setMouseDelay(1);

app.get("/api/v1/ping", (req, res) => res.send({ success: true, ping: "Pong!" }));

app.post("/api/v1/mouse/click", (req, res) => {
  if (typeof req.body.x == "undefined" || typeof req.body.y == "undefined") {
    return res.status(400).send({
      success: false,
      error: "Missing mouse x or y"
    })
  }

  if (req.body.mouseDelay && typeof req.body.mouseDelay == "number") {
    robot.setMouseDelay(req.body.mouseDelay);
  }

  const mousePos = robot.getMousePos();
  if (!req.body.disableMouseMove) robot.moveMouse(req.body.x, req.body.y);

  robot.mouseClick(req.body.button ?? "left", req.body.doubleClick ?? false);
  if (!req.body.disableMouseMove) robot.moveMouse(mousePos.x, mousePos.y);

  res.send({
    success: true
  });

  return robot.setMouseDelay(1);
});

app.post("/api/v1/mouse/move", (req, res) => {
  if (typeof req.body.x == "undefined" || typeof req.body.y == "undefined") {
    return res.status(400).send({
      success: false,
      error: "Missing mouse x or y"
    })
  }

  if (req.body.mouseDelay && typeof req.body.mouseDelay == "number") {
    robot.setMouseDelay(req.body.mouseDelay);
  }

  robot.moveMouse(req.body.x, req.body.y);

  res.send({
    success: true
  });

  return robot.setMouseDelay(1);
});

app.post("/api/v1/keyboard/tap", (req, res) => {
  if (!req.body.key) return res.status(400).send({
    success: false,
    error: "Missing key"
  });

  robot.keyTap(req.body.key);

  return res.send({
    success: true
  });
});

app.post("/api/v1/keyboard/hold", async(req, res) => {
  if (!req.body.key || !req.body.ms) return res.status(400).send({
    success: false,
    error: "Missing key or milliseconds"
  });

  robot.keyToggle(req.body.key, "down");
  await new Promise((i) => setTimeout(i, req.body.ms));
  robot.keyToggle(req.body.key, "up");

  return res.send({
    success: true
  });
});

app.post("/api/v1/keyboard/type", (req, res) => {
  if (!req.body.string) return res.status(400).send({
    success: false,
    error: "Missing string"
  });

  robot.typeString(req.body.string);

  return res.send({
    success: true
  });
});

app.listen(8745, "127.0.0.1", () => {
  console.log("Listening on localhost:8745");
});