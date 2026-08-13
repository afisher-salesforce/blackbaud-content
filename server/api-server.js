import express from "express";

const app = express();
const PORT = Number(process.env.API_PORT || 8080);
const ALLOWED_DOMAINS = new Set(["blackbaud.com", "salesforce.com"]);

function firstHeaderValue(raw) {
  if (Array.isArray(raw)) return raw[0] || "";
  if (typeof raw === "string") return raw;
  return "";
}

function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseEmail(req) {
  const emailHeader = firstHeaderValue(req.headers["x-replit-user-email"]).trim();
  if (emailHeader) return emailHeader;

  const nameHeader = firstHeaderValue(req.headers["x-replit-user-name"]).trim();
  if (looksLikeEmail(nameHeader)) return nameHeader;

  if (process.env.NODE_ENV !== "production" && process.env.DEV_AUTH_EMAIL) {
    return process.env.DEV_AUTH_EMAIL;
  }
  return "";
}

function parseUser(req) {
  const email = parseEmail(req).toLowerCase().trim();
  const userId = firstHeaderValue(req.headers["x-replit-user-id"]);
  const name = firstHeaderValue(req.headers["x-replit-user-name"]);
  const domain = email.includes("@") ? email.split("@")[1] : "";
  const authenticated = Boolean(userId) || Boolean(email);
  const missingEmailScope = authenticated && !email;
  const allowed = Boolean(email) && ALLOWED_DOMAINS.has(domain);
  return {
    authenticated,
    allowed,
    missingEmailScope,
    domain,
    email,
    userId: String(userId || ""),
    name: String(name || "")
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
    if (user.missingEmailScope) {
      return res.status(403).json({
        authenticated: true,
        allowed: false,
        missingEmailScope: true,
        message:
          "Signed in to Replit, but no email claim was provided. Enable email scope in Replit Auth settings to enforce domain allowlisting."
      });
    }

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
