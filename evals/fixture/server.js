const http = require("node:http");
const crypto = require("node:crypto");

const PORT = process.env.PORT || 3111;
const SESSION_TTL_MS = 30 * 60 * 1000;
const USERS = new Map([["demo", "demo-pass-123"]]);
const sessions = new Map();

function createSession(username) {
  const token = crypto.randomBytes(16).toString("hex");
  sessions.set(token, { username, createdAt: Date.now() });
  return token;
}

function isSessionValid(session, now = Date.now()) {
  return now - session.createdAt > SESSION_TTL_MS;
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(data));
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader("content-type", "application/json");

  if (req.method === "POST" && req.url === "/login") {
    let body = {};
    try {
      body = JSON.parse((await readBody(req)) || "{}");
    } catch {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "bad json" }));
      return;
    }
    if (body.password && USERS.get(body.username) === body.password) {
      const token = createSession(body.username);
      res.end(JSON.stringify({ token }));
    } else {
      res.statusCode = 401;
      res.end(JSON.stringify({ error: "invalid credentials" }));
    }
    return;
  }

  if (req.method === "GET" && req.url === "/me") {
    const token = req.headers["x-session-token"];
    const session = token && sessions.get(token);
    if (!session || !isSessionValid(session)) {
      res.statusCode = 401;
      res.end(JSON.stringify({ error: "session expired" }));
      return;
    }
    res.end(JSON.stringify({ username: session.username }));
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ error: "not found" }));
});

if (require.main === module) {
  server.listen(PORT, () => console.log(`auth service listening on :${PORT}`));
}

module.exports = { server, createSession, isSessionValid, sessions, SESSION_TTL_MS };
