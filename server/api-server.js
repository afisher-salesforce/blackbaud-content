import express from "express";

const app = express();
const PORT = Number(process.env.API_PORT || 8080);
const ALLOWED_DOMAINS = new Set(["blackbaud.com", "salesforce.com"]);

function parseEmail(req) {
  const raw = req.headers["x-replit-user-email"];
  if (Array.isArray(raw)) return raw[0] || "";
  if (typeof raw === "string") return raw;
  if (process.env.NODE_ENV !== "production" && process.env.DEV_AUTH_EMAIL) {
    return process.env.DEV_AUTH_EMAIL;
  }
  return "";
}

function parseUser(req) {
  const email = parseEmail(req).toLowerCase().trim();
  const userId = req.headers["x-replit-user-id"] || "";
  const name = req.headers["x-replit-user-name"] || "";
  const domain = email.includes("@") ? email.split("@")[1] : "";
  const allowed = Boolean(email) && ALLOWED_DOMAINS.has(domain);
  return {
    authenticated: Boolean(email),
    allowed,
    domain,
    email,
    userId: String(Array.isArray(userId) ? userId[0] : userId || ""),
    name: String(Array.isArray(name) ? name[0] : name || "")
  };
}

app.get("/api/auth/session", (req, res) => {
  const user = parseUser(req);
  if (!user.authenticated) {
    return res.status(401).json({
      authenticated: false,
      allowed: false,
      message: "Login required through Replit Auth."
    });
  }

  if (!user.allowed) {
    return res.status(403).json({
      authenticated: true,
      allowed: false,
      email: user.email,
      message: "Access is restricted to blackbaud.com or salesforce.com domains."
    });
  }

  return res.json({
    authenticated: true,
    allowed: true,
    email: user.email,
    name: user.name,
    domain: user.domain
  });
});

app.get("/api/auth/allowed-domains", (_req, res) => {
  res.json({ domains: Array.from(ALLOWED_DOMAINS) });
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
