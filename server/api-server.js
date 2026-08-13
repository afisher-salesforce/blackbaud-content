/**
 * api-server.js — standalone API server for local/reference use.
 *
 * Auth: Replit OIDC (openid-client v6) with PKCE.
 * Sessions: in-memory Map for this reference implementation.
 * Production (Replit): sessions are stored in PostgreSQL via drizzle-orm
 * — see artifacts/api-server/src/lib/auth.ts in the Replit monorepo.
 *
 * Required env vars:
 *   REPL_ID          — Replit app ID (client_id for OIDC)
 *   ISSUER_URL       — defaults to https://replit.com/oidc
 *   API_PORT         — defaults to 8080
 */

import cookieParser from "cookie-parser";
import crypto from "crypto";
import express from "express";
import * as oidc from "openid-client";

const app = express();
const PORT = Number(process.env.API_PORT || 8080);
const ALLOWED_DOMAINS = new Set(["blackbaud.com", "salesforce.com"]);
const ISSUER_URL = process.env.ISSUER_URL ?? "https://replit.com/oidc";
const SESSION_COOKIE = "sid";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const OIDC_COOKIE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// In-memory session store. Production Replit uses PostgreSQL.
const sessions = new Map();

let oidcConfig = null;
async function getOidcConfig() {
  if (!oidcConfig) {
    oidcConfig = await oidc.discovery(new URL(ISSUER_URL), process.env.REPL_ID);
  }
  return oidcConfig;
}

app.use(cookieParser());
app.use(express.json());

function getOrigin(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers["host"] || "localhost";
  return `${proto}://${host}`;
}

function setSessionCookie(res, sid) {
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: SESSION_TTL_MS,
  });
}

function setOidcCookie(res, name, value) {
  res.cookie(name, value, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: OIDC_COOKIE_TTL_MS,
  });
}

function getSafeReturnTo(value) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

/** GET /api/auth/session — read session cookie; enforce domain allowlist */
app.get("/api/auth/session", (req, res) => {
  const sid = req.cookies?.[SESSION_COOKIE];
  const session = sid ? sessions.get(sid) : null;

  if (!session || session.expire < Date.now()) {
    if (session) sessions.delete(sid);
    return res.status(401).json({
      authenticated: false, allowed: false, message: "Login required.",
    });
  }

  const user = session.user;
  const email = (user.email || "").toLowerCase().trim();
  const domain = email.includes("@") ? email.split("@")[1] : "";
  const allowed = Boolean(email) && ALLOWED_DOMAINS.has(domain);

  if (!allowed) {
    if (!email) {
      return res.status(403).json({
        authenticated: true, allowed: false, missingEmailScope: true,
        message: "Signed in to Replit, but no email claim was provided. Contact the site owner.",
      });
    }
    return res.status(403).json({
      authenticated: true, allowed: false, email,
      message: "Access is restricted to blackbaud.com or salesforce.com domains.",
    });
  }

  return res.json({
    authenticated: true, allowed: true, email,
    name: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
    domain,
  });
});

/** GET /api/login — initiate OIDC flow */
app.get("/api/login", async (req, res) => {
  try {
    const config = await getOidcConfig();
    const callbackUrl = `${getOrigin(req)}/api/callback`;
    const returnTo = getSafeReturnTo(req.query.returnTo);

    const state = oidc.randomState();
    const nonce = oidc.randomNonce();
    const codeVerifier = oidc.randomPKCECodeVerifier();
    const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);

    const redirectTo = oidc.buildAuthorizationUrl(config, {
      redirect_uri: callbackUrl,
      scope: "openid email profile offline_access",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state,
      nonce,
    });

    setOidcCookie(res, "code_verifier", codeVerifier);
    setOidcCookie(res, "nonce", nonce);
    setOidcCookie(res, "state", state);
    setOidcCookie(res, "return_to", returnTo);
    res.redirect(redirectTo.href);
  } catch {
    res.status(500).json({ error: "Failed to initiate login." });
  }
});

/** GET /api/callback — OIDC callback */
app.get("/api/callback", async (req, res) => {
  const config = await getOidcConfig();
  const callbackUrl = `${getOrigin(req)}/api/callback`;
  const codeVerifier = req.cookies?.code_verifier;
  const nonce = req.cookies?.nonce;
  const expectedState = req.cookies?.state;

  if (!codeVerifier || !expectedState) {
    res.redirect("/api/login");
    return;
  }

  const currentUrl = new URL(
    `${callbackUrl}?${new URL(req.url, `http://${req.headers.host}`).searchParams}`,
  );

  let tokens;
  try {
    tokens = await oidc.authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: codeVerifier, expectedNonce: nonce, expectedState, idTokenExpected: true,
    });
  } catch {
    res.redirect("/api/login");
    return;
  }

  res.clearCookie("code_verifier", { path: "/" });
  res.clearCookie("nonce", { path: "/" });
  res.clearCookie("state", { path: "/" });
  const returnTo = getSafeReturnTo(req.cookies?.return_to);
  res.clearCookie("return_to", { path: "/" });

  const claims = tokens.claims();
  if (!claims) { res.redirect("/api/login"); return; }

  const now = Math.floor(Date.now() / 1000);
  const sid = crypto.randomBytes(32).toString("hex");
  sessions.set(sid, {
    user: {
      id: claims.sub,
      email: claims.email || null,
      firstName: claims.first_name || null,
      lastName: claims.last_name || null,
      profileImageUrl: claims.profile_image_url || claims.picture || null,
    },
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: tokens.expiresIn() ? now + tokens.expiresIn() : claims.exp,
    expire: Date.now() + SESSION_TTL_MS,
  });

  setSessionCookie(res, sid);
  res.redirect(returnTo);
});

/** GET /api/logout — clear session and end OIDC session */
app.get("/api/logout", async (req, res) => {
  try {
    const config = await getOidcConfig();
    const origin = getOrigin(req);
    const returnTo = getSafeReturnTo(req.query.returnTo);
    const postLogoutRedirectUrl = new URL(returnTo, `${origin}/`).href;

    const sid = req.cookies?.[SESSION_COOKIE];
    if (sid) sessions.delete(sid);
    res.clearCookie(SESSION_COOKIE, { path: "/" });

    const endSessionUrl = oidc.buildEndSessionUrl(config, {
      client_id: process.env.REPL_ID,
      post_logout_redirect_uri: postLogoutRedirectUrl,
    });
    res.redirect(endSessionUrl.href);
  } catch {
    res.redirect("/");
  }
});

/** GET /api/auth/allowed-domains */
app.get("/api/auth/allowed-domains", (_req, res) => {
  res.json({ domains: Array.from(ALLOWED_DOMAINS) });
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
